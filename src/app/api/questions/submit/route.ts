import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Sanity client with write token
const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface SubmitQuestionPayload {
  title: string;
  categoryId: string;
  questionContent: string;
  figmaUrl?: string;
  referenceUrls?: Array<{ title?: string; url: string }>;
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

// slugを生成
function generateSlug(title: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `q-${timestamp}-${randomStr}`;
}

// プレーンテキストをPortable Textに変換
function textToPortableText(text: string) {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((paragraph, index) => {
    // 見出しの検出（## で始まる行）
    if (paragraph.startsWith('## ')) {
      return {
        _type: 'block',
        _key: `block-${index}`,
        style: 'h3',
        children: [
          {
            _type: 'span',
            _key: `span-${index}`,
            text: paragraph.replace(/^## /, ''),
            marks: [],
          },
        ],
        markDefs: [],
      };
    }

    // 通常の段落
    return {
      _type: 'block',
      _key: `block-${index}`,
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: `span-${index}`,
          text: paragraph.trim(),
          marks: [],
        },
      ],
      markDefs: [],
    };
  });
}

// Slack通知を送信
async function sendSlackNotification(data: {
  title: string;
  category: string;
  author: string;
  questionId: string;
}) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('SLACK_WEBHOOK_URL not configured, skipping notification');
    return;
  }

  const sanityStudioUrl = `https://bono-training.sanity.studio/structure/question;${data.questionId}`;

  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📝 新しい質問が投稿されました',
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
          text: '*回答手順:*\n1. 下のボタンでSanity Studioを開く\n2. 「コンテンツ」タブで回答を入力\n3. 「管理情報」タブでステータスを「回答済み」に\n4. 公開をONにして保存',
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '🔗 Sanity Studioで回答する', emoji: true },
            url: sanityStudioUrl,
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

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // 認証チェック
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized: No token provided' },
      { status: 401, headers }
    );
  }

  const token = authHeader.replace('Bearer ', '');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase configuration missing');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500, headers }
    );
  }

  const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

  // トークンからユーザー情報を取得
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid token' },
      { status: 401, headers }
    );
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
      { status: 403, headers }
    );
  }

  // リクエストボディの取得
  const payload: SubmitQuestionPayload = await request.json();

  // バリデーション
  if (!payload.title || payload.title.length < VALIDATION_RULES.title.minLength) {
    return NextResponse.json(
      { error: `タイトルは${VALIDATION_RULES.title.minLength}文字以上で入力してください` },
      { status: 400, headers }
    );
  }

  if (payload.title.length > VALIDATION_RULES.title.maxLength) {
    return NextResponse.json(
      { error: `タイトルは${VALIDATION_RULES.title.maxLength}文字以内で入力してください` },
      { status: 400, headers }
    );
  }

  if (!payload.questionContent || payload.questionContent.length < VALIDATION_RULES.questionContent.minLength) {
    return NextResponse.json(
      { error: `質問内容は${VALIDATION_RULES.questionContent.minLength}文字以上で入力してください` },
      { status: 400, headers }
    );
  }

  if (payload.questionContent.length > VALIDATION_RULES.questionContent.maxLength) {
    return NextResponse.json(
      { error: `質問内容は${VALIDATION_RULES.questionContent.maxLength}文字以内で入力してください` },
      { status: 400, headers }
    );
  }

  if (!payload.categoryId) {
    return NextResponse.json(
      { error: 'カテゴリを選択してください' },
      { status: 400, headers }
    );
  }

  // FigmaURLのバリデーション
  if (payload.figmaUrl && !payload.figmaUrl.includes('figma.com')) {
    return NextResponse.json(
      { error: 'FigmaのURLを入力してください' },
      { status: 400, headers }
    );
  }

  // ユーザー情報の準備
  const userInfo: UserInfo = {
    id: user.id,
    displayName: user.user_metadata?.name || user.email?.split('@')[0] || 'ユーザー',
    avatarUrl: user.user_metadata?.avatar_url,
  };

  // カテゴリ名を取得
  let categoryName = 'カテゴリ未設定';
  try {
    const category = await sanityClient.fetch(
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
    slug: { _type: 'slug', current: generateSlug(payload.title) },
    category: { _type: 'reference', _ref: payload.categoryId },
    questionContent: textToPortableText(payload.questionContent),
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
    status: 'pending',
    isPublic: false,
    submittedAt: new Date().toISOString(),
  };

  try {
    const result = await sanityClient.create(questionDoc);

    // Slack通知
    await sendSlackNotification({
      title: payload.title,
      category: categoryName,
      author: userInfo.displayName,
      questionId: result._id,
    });

    return NextResponse.json(
      {
        success: true,
        questionId: result._id,
        slug: questionDoc.slug.current,
      },
      { status: 201, headers }
    );
  } catch (error) {
    console.error('Failed to create question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500, headers }
    );
  }
}
