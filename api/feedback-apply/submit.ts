/**
 * 15分フィードバック応募 API
 * - 応募データを受け取る
 * - OG情報を取得
 * - Sanityに保存
 * - Slackに通知を送信
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@sanity/client';
import { fetchOgData } from '../lib/ogParser';

// Sanity client with write token
const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

// Slack Webhook URL（環境変数から取得）
const SLACK_WEBHOOK_URL = process.env.SLACK_FEEDBACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;

interface SubmitPayload {
  articleUrl: string;
  slackAccountName: string;
  bonoContent?: string; // 後方互換性のため残す（オプショナル）
  lessonTitle?: string; // 選択されたレッスンのタイトル
  checkedItems: string[];
  lessonId?: string; // フォームで選択されたレッスンID
  userId?: string;
  userEmail?: string;
}

// Slackに通知を送信
async function sendSlackNotification(
  payload: SubmitPayload,
  sanityDocId?: string
): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('Slack Webhook URL is not configured');
    return;
  }

  // Sanity Studio へのリンク（ドキュメントIDがある場合）
  const sanityLink = sanityDocId
    ? `\n<https://bono-training.sanity.studio/structure/userOutput;${sanityDocId}|📋 Sanity Studioで確認>`
    : '';

  // Slackメッセージを構築
  const slackMessage = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*【🔸15分フィードバック新規応募がきたよ】*',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `👩‍💻Slackアカウント名:\n${payload.slackAccountName}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🗺️学んだBONOコンテンツ:\n${payload.lessonTitle || payload.bonoContent || '未選択'}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🔗アウトプットURL:\n<${payload.articleUrl}|${payload.articleUrl}>`,
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
            text: `応募日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}${sanityLink}`,
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

  // lessonId または bonoContent のどちらかが必要（後方互換性）
  if (!payload.lessonId && (!payload.bonoContent || payload.bonoContent.trim() === '')) {
    return '学んだBONOコンテンツを選択してください';
  }

  if (!payload.checkedItems || payload.checkedItems.length === 0) {
    return '該当する項目を1つ以上選択してください';
  }

  return null;
}

// Sanityにユーザーアウトプットを保存
async function saveToSanity(
  payload: SubmitPayload,
  ogData: { title: string | null; image: string | null; description: string | null }
): Promise<string | null> {
  // SANITY_WRITE_TOKEN がない場合はスキップ（開発環境対応）
  if (!process.env.SANITY_WRITE_TOKEN) {
    console.warn('SANITY_WRITE_TOKEN not configured, skipping Sanity save');
    return null;
  }

  try {
    const doc = {
      _type: 'userOutput',
      articleUrl: payload.articleUrl,
      articleTitle: ogData.title || null,
      articleImage: ogData.image || null,
      articleDescription: ogData.description || null,
      // relatedLesson: ユーザーがフォームで選択したレッスンを紐付け
      ...(payload.lessonId && {
        relatedLesson: { _type: 'reference', _ref: payload.lessonId },
      }),
      author: {
        userId: payload.userId || null,
        displayName: payload.slackAccountName,
        slackAccountName: payload.slackAccountName,
        email: payload.userEmail || null,
      },
      bonoContent: payload.lessonTitle || payload.bonoContent || null,
      checkedItems: payload.checkedItems,
      source: 'user_submission',
      submittedAt: new Date().toISOString(),
      isPublished: false, // 承認制：管理者がStudioで公開
      displayOrder: 0,
    };

    const result = await sanityClient.create(doc);
    console.log('Saved to Sanity:', result._id);
    return result._id;
  } catch (error) {
    console.error('Failed to save to Sanity:', error);
    // Sanity保存に失敗しても、Slack通知は継続
    return null;
  }
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

    // OG情報を取得
    console.log('Fetching OG data from:', payload.articleUrl);
    const ogData = await fetchOgData(payload.articleUrl);
    console.log('OG data:', ogData);

    // Sanityに保存
    const sanityDocId = await saveToSanity(payload, ogData);

    // Slack通知を送信（Sanity DocIDをリンクに含める）
    await sendSlackNotification(payload, sanityDocId || undefined);

    // 成功レスポンス
    return res.status(200).json({
      success: true,
      message: '応募を受け付けました',
      outputId: sanityDocId,
    });
  } catch (error) {
    console.error('Error processing feedback application:', error);
    return res.status(500).json({
      error: '応募の処理中にエラーが発生しました',
    });
  }
}
