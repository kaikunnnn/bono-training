import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@sanity/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Sanity client with write token
const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface SubmitArticlePayload {
  authorName: string;
  articleUrl: string;
  mainPoint: string;
  categories: string[];
  bonoContent?: string;
  userId: string;
}

// 入力検証ルール
const VALIDATION_RULES = {
  authorName: { minLength: 1, maxLength: 50 },
  articleUrl: { minLength: 10, maxLength: 500 },
  mainPoint: { minLength: 1, maxLength: 140 },
};

// OGP情報を取得
async function fetchOgpData(url: string): Promise<{ title?: string; image?: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BONOBot/1.0)',
      },
    });

    if (!response.ok) {
      console.log('Failed to fetch OGP:', response.status);
      return {};
    }

    const html = await response.text();

    // OGPタイトルを抽出
    const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);

    // OGP画像を抽出
    const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);

    return {
      title: titleMatch?.[1],
      image: imageMatch?.[1],
    };
  } catch (error) {
    console.error('OGP fetch error:', error);
    return {};
  }
}

// Slack通知を送信
async function sendSlackNotification(data: {
  authorName: string;
  articleUrl: string;
  articleTitle?: string;
  mainPoint: string;
  categories: string[];
  documentId: string;
}) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('SLACK_WEBHOOK_URL not configured, skipping notification');
    return;
  }

  const sanityStudioUrl = `https://bono-training.sanity.studio/structure/articleSubmission;${data.documentId}`;

  const categoryLabels = data.categories.map((cat) => {
    switch (cat) {
      case 'notice': return 'Notice（気づき）';
      case 'before-after': return 'Before/After';
      case 'why': return 'Why（なぜ）';
      default: return cat;
    }
  }).join(', ');

  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📝 新しい思考シェア記事が提出されました',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*投稿者:*\n${data.authorName}`,
          },
          {
            type: 'mrkdwn',
            text: `*該当項目:*\n${categoryLabels}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*記事タイトル:*\n<${data.articleUrl}|${data.articleTitle || '（タイトル未取得）'}>`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*伝えたいこと:*\n${data.mainPoint}`,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*判定手順:*\n1. 下のボタンでSanity Studioを開く\n2. 記事を確認して判定（承認/要改善/却下）\n3. Slackでユーザーにフィードバック',
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '🔗 Sanity Studioで確認する', emoji: true },
            url: sanityStudioUrl,
            style: 'primary',
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error('Slack notification failed:', response.status);
    }
  } catch (error) {
    console.error('Slack notification error:', error);
  }
}

// 入力検証
function validateInput(payload: SubmitArticlePayload): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 名前
  if (!payload.authorName || payload.authorName.length < VALIDATION_RULES.authorName.minLength) {
    errors.push('名前を入力してください');
  } else if (payload.authorName.length > VALIDATION_RULES.authorName.maxLength) {
    errors.push('名前は50文字以内で入力してください');
  }

  // URL
  if (!payload.articleUrl) {
    errors.push('記事URLを入力してください');
  } else if (!payload.articleUrl.match(/^https?:\/\/.+/)) {
    errors.push('有効なURLを入力してください');
  }

  // 伝えたいこと
  if (!payload.mainPoint || payload.mainPoint.length < VALIDATION_RULES.mainPoint.minLength) {
    errors.push('伝えたいことを入力してください');
  } else if (payload.mainPoint.length > VALIDATION_RULES.mainPoint.maxLength) {
    errors.push('伝えたいことは140文字以内で入力してください');
  }

  // カテゴリ
  if (!payload.categories || payload.categories.length === 0) {
    errors.push('少なくとも1つの項目を選択してください');
  }

  return { valid: errors.length === 0, errors };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body as SubmitArticlePayload;

    // 入力検証
    const validation = validateInput(payload);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }

    // Supabaseでユーザー認証を確認
    if (supabaseUrl && supabaseServiceKey) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // ユーザーIDの整合性チェック
      if (user.id !== payload.userId) {
        return res.status(403).json({ error: 'User ID mismatch' });
      }
    }

    // OGP情報を取得
    const ogpData = await fetchOgpData(payload.articleUrl);

    // Sanityにドキュメントを作成
    const document = {
      _type: 'articleSubmission',
      authorName: payload.authorName,
      articleUrl: payload.articleUrl,
      articleTitle: ogpData.title || null,
      // 注意: 画像はOGP URLを保存するのみ（Sanityにアップロードはしない）
      mainPoint: payload.mainPoint,
      categories: payload.categories,
      bonoContent: payload.bonoContent || null,
      status: 'pending',
      isPublic: false,
      submittedAt: new Date().toISOString(),
    };

    const result = await sanityClient.create(document);

    // Slack通知を送信
    await sendSlackNotification({
      authorName: payload.authorName,
      articleUrl: payload.articleUrl,
      articleTitle: ogpData.title,
      mainPoint: payload.mainPoint,
      categories: payload.categories,
      documentId: result._id,
    });

    return res.status(200).json({
      success: true,
      documentId: result._id,
    });
  } catch (error) {
    console.error('Submit error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
