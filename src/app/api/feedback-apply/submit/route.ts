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

async function sendSlackNotification(data: {
  articleUrl: string;
  slackAccountName: string;
  lessonId: string;
  checkedItems: string[];
  userEmail: string;
  ogTitle?: string;
}): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOK_URL is not configured");
    return;
  }

  const checkedLabels = data.checkedItems.map((id) => {
    switch (id) {
      case "notice":
        return "気づきを言語化";
      case "before-after":
        return "Before/After";
      case "why":
        return "なぜを説明";
      default:
        return id;
    }
  });

  const message = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "15分フィードバック申請",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Slackアカウント:*\n${data.slackAccountName}`,
          },
          {
            type: "mrkdwn",
            text: `*メール:*\n${data.userEmail}`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*提出物:*\n<${data.articleUrl}|${data.ogTitle || data.articleUrl}>`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*確認項目:*\n${checkedLabels.join(", ")}`,
        },
      },
    ],
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
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
      lessonId: body.lessonId,
      checkedItems: body.checkedItems,
      userEmail: body.userEmail,
      ogTitle: ogData.title,
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
