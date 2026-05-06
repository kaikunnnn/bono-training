import { NextRequest, NextResponse } from "next/server";
import { createClient, type SanityClient } from "@sanity/client";

// Sanity write client（遅延初期化：ビルド時のpage data収集でenv未設定エラーを防ぐ）
let sanityWriteClient: SanityClient | null = null;

function getSanityWriteClient(): SanityClient {
  if (!sanityWriteClient) {
    sanityWriteClient = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
      token: process.env.SANITY_WRITE_TOKEN,
      useCdn: false,
    });
  }
  return sanityWriteClient;
}

interface SubmitRequestBody {
  articleUrl: string;
  slackAccountName: string;
  lessonId: string;
  lessonTitle?: string;
  checkedItems: string[];
  userId: string;
  userEmail: string;
}

interface OgData {
  title?: string;
  description?: string;
  image?: string;
}

async function fetchOgData(url: string): Promise<OgData> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BONOBot/1.0)",
      },
    });

    if (!response.ok) {
      return {};
    }

    const html = await response.text();

    // OGタグを抽出
    const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i)?.[1];
    const ogDescription = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i)?.[1];
    const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i)?.[1];

    // フォールバック: 通常のタイトルタグ
    const title = ogTitle || html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];

    return {
      title: title?.trim(),
      description: ogDescription?.trim(),
      image: ogImage?.trim(),
    };
  } catch {
    return {};
  }
}

// Slackに通知を送信（mainと同じフォーマット）
async function sendSlackNotification(payload: {
  articleUrl: string;
  slackAccountName: string;
  lessonTitle?: string;
  bonoContent?: string;
}): Promise<void> {
  const webhookUrl = process.env.SLACK_FEEDBACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("SLACK_FEEDBACK_WEBHOOK_URL / SLACK_WEBHOOK_URL is not configured");
    return;
  }

  const slackMessage = {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*【🔸15分フィードバック新規応募がきたよ】*",
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `👩‍💻Slackアカウント名:\n${payload.slackAccountName}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🗺️学んだBONOコンテンツ:\n${payload.lessonTitle || payload.bonoContent || "未選択"}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🔗アウトプットURL:\n<${payload.articleUrl}|${payload.articleUrl}>`,
        },
      },
      {
        type: "divider",
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `応募日時: ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}`,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      console.error("Slack notification failed:", response.status, response.statusText);
    } else {
      console.log("Slack notification sent successfully");
    }
  } catch (error) {
    console.error("Failed to send Slack notification:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SubmitRequestBody = await request.json();

    // バリデーション
    if (!body.articleUrl || !body.slackAccountName || !body.lessonId) {
      return NextResponse.json(
        { error: "必須項目が入力されていません" },
        { status: 400 }
      );
    }

    if (!body.checkedItems || body.checkedItems.length === 0) {
      return NextResponse.json(
        { error: "確認項目を1つ以上選択してください" },
        { status: 400 }
      );
    }

    // URL形式チェック
    try {
      new URL(body.articleUrl);
    } catch {
      return NextResponse.json(
        { error: "正しいURLを入力してください" },
        { status: 400 }
      );
    }

    // OGメタデータを取得
    const ogData = await fetchOgData(body.articleUrl);

    // Sanityに保存
    const userOutput = {
      _type: "userOutput",
      url: body.articleUrl,
      ogTitle: ogData.title,
      ogDescription: ogData.description,
      ogImage: ogData.image,
      lesson: {
        _type: "reference",
        _ref: body.lessonId,
      },
      author: {
        userId: body.userId,
        email: body.userEmail,
        slackAccountName: body.slackAccountName,
      },
      checkedItems: body.checkedItems,
      isPublished: false,
      submittedAt: new Date().toISOString(),
    };

    const result = await getSanityWriteClient().create(userOutput);

    // Slack通知を送信
    await sendSlackNotification({
      articleUrl: body.articleUrl,
      slackAccountName: body.slackAccountName,
      lessonTitle: body.lessonTitle,
    });

    return NextResponse.json({
      success: true,
      message: "フィードバック申請を受け付けました",
      outputId: result._id,
    });
  } catch (error) {
    console.error("Feedback submit error:", error);
    return NextResponse.json(
      { error: "送信に失敗しました。しばらく経ってから再度お試しください。" },
      { status: 500 }
    );
  }
}
