/**
 * 15分フィードバック応募 API
 * - 応募データを受け取る
 * - Slackに通知を送信
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Slack Webhook URL（環境変数から取得）
const SLACK_WEBHOOK_URL = process.env.SLACK_FEEDBACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;

// 該当項目のラベルマッピング
const CRITERIA_LABELS: Record<string, string> = {
  'notice': 'Notice（気づき・変化）',
  'before-after': 'Before/After（修正過程）',
  'why': 'Why（なぜそうしたか）',
};

interface SubmitPayload {
  articleUrl: string;
  slackAccountName: string;
  bonoContent: string;
  checkedItems: string[];
  userId?: string;
  userEmail?: string;
}

// Slackに通知を送信
async function sendSlackNotification(payload: SubmitPayload): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('Slack Webhook URL is not configured');
    return;
  }

  // 該当項目のラベルを取得
  const checkedLabels = payload.checkedItems
    .map((id) => CRITERIA_LABELS[id] || id)
    .join('\n• ');

  // Slackメッセージを構築
  const slackMessage = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📝 15分フィードバック新規応募',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*👤 Slackアカウント名:*\n${payload.slackAccountName}`,
          },
          {
            type: 'mrkdwn',
            text: `*📚 学んだBONOコンテンツ:*\n${payload.bonoContent}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*🔗 記事URL:*\n<${payload.articleUrl}|${payload.articleUrl}>`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*✅ 該当項目:*\n• ${checkedLabels}`,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `応募日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      console.error('Slack notification failed:', response.status, response.statusText);
    } else {
      console.log('Slack notification sent successfully');
    }
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
  }
}

// バリデーション
function validatePayload(payload: SubmitPayload): string | null {
  if (!payload.articleUrl || !/^https?:\/\/.+/.test(payload.articleUrl)) {
    return '有効な記事URLを入力してください';
  }

  if (!payload.slackAccountName || payload.slackAccountName.trim() === '') {
    return 'Slackアカウント名を入力してください';
  }

  if (!payload.bonoContent || payload.bonoContent.trim() === '') {
    return '学んだBONOコンテンツを入力してください';
  }

  if (!payload.checkedItems || payload.checkedItems.length === 0) {
    return '該当する項目を1つ以上選択してください';
  }

  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORSヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload: SubmitPayload = req.body;

    // バリデーション
    const validationError = validatePayload(payload);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Slack通知を送信
    await sendSlackNotification(payload);

    // 成功レスポンス
    return res.status(200).json({
      success: true,
      message: '応募を受け付けました',
    });
  } catch (error) {
    console.error('Error processing feedback application:', error);
    return res.status(500).json({
      error: '応募の処理中にエラーが発生しました',
    });
  }
}
