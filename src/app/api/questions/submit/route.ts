import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SanityClient } from '@sanity/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { textToPortableBlocks } from '@/lib/questions/text-format';

// Sanity write client（遅延初期化：ビルド時のpage data収集でenv未設定エラーを防ぐ）
let sanityClient: SanityClient | null = null;

function getSanityClient(): SanityClient {
  if (!sanityClient) {
    sanityClient = createClient({
      projectId: process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2024-01-01',
      token: process.env.SANITY_WRITE_TOKEN,
      useCdn: false,
    });
  }
  return sanityClient;
}

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface SubmitQuestionPayload {
  title: string;
  categoryId: string;
  questionContent: string;
  figmaUrl?: string;
  referenceUrls?: Array<{ title?: string; url: string }>;
  imageUrl?: string;
}

interface UserInfo {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

// 入力検証ルール
const VALIDATION_RULES = {
  title: { minLength: 5, maxLength: 100 },
  questionContent: { minLength: 20, maxLength: 5000 },
};

// slugを生成（タイムスタンプ + ランダム文字列。タイトルには依存しない）
function generateSlug(): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `q-${timestamp}-${randomStr}`;
}

// http(s) のみ許可（javascript: 等のスキーム注入を防ぐ。<a href> にそのまま描画されるため）
function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Figma URL はホスト名で判定（includes だと https://evil.com/?figma.com が通る）
function isFigmaUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'figma.com' || url.hostname.endsWith('.figma.com'))
    );
  } catch {
    return false;
  }
}

// 添付画像URLは http/https かつ Supabase Storage（SUPABASE_URL のホスト）のみ許可。
// アップロードは自前の Server Action（question-attachments バケット）経由のため、
// ホストを固定して外部URLの持ち込み（不適切画像のホットリンク等）を防ぐ。
function isSupabaseImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    const base = supabaseUrl ? new URL(supabaseUrl) : null;
    return base !== null && url.hostname === base.hostname;
  } catch {
    return false;
  }
}

// 本文プレビュー用に前後空白を除去して指定長でtruncate（末尾に … を付与）
function truncateForPreview(text: string, maxLength = 300): string {
  const normalized = text.trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength)}…`;
}

// Slack通知を送信
async function sendSlackNotification(data: {
  title: string;
  category: string;
  author: string;
  content: string;
  slug: string;
  imageUrl?: string;
}) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('SLACK_WEBHOOK_URL not configured, skipping notification');
    return;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.bo-no.design';
  const questionPageUrl = `${siteUrl}/questions/${data.slug}`;

  const imageBlocks = data.imageUrl
    ? [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*画像添付あり:*\n${data.imageUrl}`,
          },
        },
      ]
    : [];

  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📝 新しい投稿がありました',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*タイトル:*\n${data.title}`,
          },
          {
            type: 'mrkdwn',
            text: `*カテゴリ:*\n${data.category}`,
          },
          {
            type: 'mrkdwn',
            text: `*投稿者:*\n${data.author}`,
          },
        ],
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*投稿内容:*\n${truncateForPreview(data.content)}`,
        },
      },
      ...imageBlocks,
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '💬 詳細ページを開く', emoji: true },
            url: questionPageUrl,
            style: 'primary',
          },
        ],
      },
    ],
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
  }
}

// CORSヘッダーは付けない（同一オリジンのフォームからのみ呼ばれる想定。
// 以前の Access-Control-Allow-Origin: * は不要な外部オリジン許可だったため撤去）
export async function POST(request: NextRequest) {
  // 認証チェック
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized: No token provided' },
      { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase configuration missing');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 });
  }

  const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

  // トークンからユーザー情報を取得
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid token' },
      { status: 401 });
  }

  // サブスクリプションチェック（環境に応じたフィルタ）
  const environment = process.env.NODE_ENV === 'production' ? 'live' : 'test';
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('is_active, plan_type')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .eq('environment', environment)
    .maybeSingle();

  if (subError || !subscription) {
    return NextResponse.json(
      { error: 'Premium subscription required' },
      { status: 403 });
  }

  // リクエストボディの取得
  let payload: SubmitQuestionPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'リクエストの形式が不正です' },
      { status: 400 });
  }

  // バリデーション
  if (!payload.title || payload.title.length < VALIDATION_RULES.title.minLength) {
    return NextResponse.json(
      { error: `タイトルは${VALIDATION_RULES.title.minLength}文字以上で入力してください` },
      { status: 400 });
  }

  if (payload.title.length > VALIDATION_RULES.title.maxLength) {
    return NextResponse.json(
      { error: `タイトルは${VALIDATION_RULES.title.maxLength}文字以内で入力してください` },
      { status: 400 });
  }

  if (!payload.questionContent || payload.questionContent.length < VALIDATION_RULES.questionContent.minLength) {
    return NextResponse.json(
      { error: `内容は${VALIDATION_RULES.questionContent.minLength}文字以上で入力してください` },
      { status: 400 });
  }

  if (payload.questionContent.length > VALIDATION_RULES.questionContent.maxLength) {
    return NextResponse.json(
      { error: `内容は${VALIDATION_RULES.questionContent.maxLength}文字以内で入力してください` },
      { status: 400 });
  }

  if (!payload.categoryId) {
    return NextResponse.json(
      { error: 'カテゴリを選択してください' },
      { status: 400 });
  }

  // FigmaURLのバリデーション
  if (payload.figmaUrl && !isFigmaUrl(payload.figmaUrl)) {
    return NextResponse.json(
      { error: 'FigmaのURL（https://www.figma.com/...）を入力してください' },
      { status: 400 });
  }

  // 参考URLのバリデーション（http/https のみ許可）
  if (payload.referenceUrls) {
    if (!Array.isArray(payload.referenceUrls) || payload.referenceUrls.length > 10) {
      return NextResponse.json(
        { error: '参考URLの形式が不正です' },
        { status: 400 });
    }
    for (const ref of payload.referenceUrls) {
      if (!ref?.url || typeof ref.url !== 'string' || !isValidHttpUrl(ref.url)) {
        return NextResponse.json(
          { error: '参考URLは http:// または https:// で始まるURLを入力してください' },
          { status: 400 });
      }
    }
  }

  // 添付画像URLのバリデーション（Supabase Storage のホストのみ許可）
  if (payload.imageUrl && !isSupabaseImageUrl(payload.imageUrl)) {
    return NextResponse.json(
      { error: '添付画像の形式が不正です' },
      { status: 400 });
  }

  // レート制限: 1ユーザーにつき1時間に5件まで（#131-C。カウントはSanityの実データ）
  try {
    const RATE_LIMIT_PER_HOUR = 5;
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recentCount = await getSanityClient().fetch<number>(
      `count(*[_type == "question" && author.userId == $uid && publishedAt > $since])`,
      { uid: user.id, since }
    );
    if (recentCount >= RATE_LIMIT_PER_HOUR) {
      return NextResponse.json(
        { error: '短時間に多くの投稿がされています。しばらく時間をおいてから再度お試しください' },
        { status: 429 });
    }
  } catch (e) {
    // カウント失敗時は投稿を止めない（レート制限は best-effort）
    console.error('Rate limit check failed:', e);
  }

  // ユーザー情報の準備
  const userInfo: UserInfo = {
    id: user.id,
    displayName: user.user_metadata?.display_name || user.user_metadata?.name || user.email?.split('@')[0] || 'ユーザー',
    avatarUrl: user.user_metadata?.avatar_url,
  };

  // カテゴリ名を取得
  let categoryName = 'カテゴリ未設定';
  try {
    const category = await getSanityClient().fetch(
      `*[_type == "questionCategory" && _id == $id][0]{title}`,
      { id: payload.categoryId }
    );
    if (category?.title) {
      categoryName = category.title;
    }
  } catch (e) {
    console.error('Failed to fetch category:', e);
  }

  // Sanityドキュメントの作成
  const questionDoc = {
    _type: 'question',
    title: payload.title,
    slug: { _type: 'slug', current: generateSlug() },
    category: { _type: 'reference', _ref: payload.categoryId },
    questionContent: textToPortableBlocks(payload.questionContent),
    author: {
      userId: userInfo.id,
      displayName: userInfo.displayName,
      avatarUrl: userInfo.avatarUrl || null,
    },
    figmaUrl: payload.figmaUrl || null,
    referenceUrls: payload.referenceUrls?.map((ref, index) => ({
      _key: `ref-${index}`,
      title: ref.title || null,
      url: ref.url,
    })) || null,
    // 添付画像（imageUrl がある時のみ object を持たせる。本文とは独立したブロック）
    ...(payload.imageUrl
      ? { attachedImage: { url: payload.imageUrl } }
      : {}),
    publishedAt: new Date().toISOString(),
  };

  try {
    const result = await getSanityClient().create(questionDoc);

    // Slack通知
    await sendSlackNotification({
      title: payload.title,
      category: categoryName,
      author: userInfo.displayName,
      content: payload.questionContent,
      slug: questionDoc.slug.current,
      imageUrl: payload.imageUrl,
    });

    return NextResponse.json(
      {
        success: true,
        questionId: result._id,
        slug: questionDoc.slug.current,
      },
      { status: 201 });
  } catch (error) {
    console.error('Failed to create question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 });
  }
}
