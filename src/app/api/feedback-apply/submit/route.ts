import { NextRequest, NextResponse } from "next/server";
import { createClient, type SanityClient } from "@sanity/client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { promises as dns } from "node:dns";
import net from "node:net";

// DNS解決を伴うSSRF対策のため Node ランタイムを明示（Edge では dns/net が使えない）
export const runtime = "nodejs";

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

// Supabase client（サービスロール。トークン検証とサブスク確認に使用）
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// userId / userEmail はボディで受け取らない（詐称防止のため検証済みトークンの user から取得）
interface SubmitRequestBody {
  articleUrl: string;
  slackAccountName: string;
  lessonId: string;
  lessonTitle?: string;
  checkedItems: string[];
}

interface OgData {
  title?: string;
  description?: string;
  image?: string;
}

// 入力検証ルール
const VALIDATION_RULES = {
  slackAccountName: { maxLength: 100 },
  lessonId: { maxLength: 200 },
  lessonTitle: { maxLength: 200 },
  checkedItems: { maxCount: 20 },
};

// http(s) のみ許可（javascript: 等のスキーム注入を防ぐ）
function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// ---- SSRF対策 -------------------------------------------------------------

// プライベート/リンクローカル/loopback IP を判定してブロックする。
// ホスト名はDNS解決後の実IPで判定する（IPリテラルはそのまま判定）。
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return true; // パースできない値は安全側でブロック
  }
  const [a, b] = parts;
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // 127.0.0.0/8 (loopback)
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 (link-local / cloud metadata)
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 (CGNAT)
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true; // loopback / unspecified
  // IPv4-mapped (::ffff:a.b.c.d) は埋め込みIPv4として再判定。
  // WHATWG URL は ::ffff:127.0.0.1 を ::ffff:7f00:1 のような16進形に正規化するため、
  // 「ドット表記」と「16進2グループ表記」の両方を受ける。
  const mapped = lower.match(/^::ffff:(.+)$/);
  if (mapped) {
    const rest = mapped[1];
    const dotted = rest.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
    if (dotted) return isPrivateIPv4(dotted[1]);
    const hex = rest.match(/^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (hex) {
      const hi = parseInt(hex[1], 16);
      const lo = parseInt(hex[2], 16);
      const v4 = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
      return isPrivateIPv4(v4);
    }
    return true; // 解釈不能な ::ffff: 形式は安全側でブロック
  }
  if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) {
    return true; // fe80::/10 (link-local)
  }
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // fc00::/7 (unique local)
  return false;
}

function isBlockedIp(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) return isPrivateIPv4(ip);
  if (family === 6) return isPrivateIPv6(ip);
  return true; // 判定不能は安全側でブロック
}

// URLが安全に取得可能か検証する（scheme + 解決IP）。安全なら true。
async function isSafeFetchTarget(rawUrl: string): Promise<boolean> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;

  // IPv6リテラルはブラケット付き（[::1]）で返るため除去してから判定
  const hostname = url.hostname.replace(/^\[|\]$/g, "");

  // ホスト名がIPリテラルならそのまま判定
  if (net.isIP(hostname)) {
    return !isBlockedIp(hostname);
  }

  // ホスト名はDNS解決して全レコードを検査（1つでもプライベートならブロック）
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    if (addresses.length === 0) return false;
    return addresses.every((addr) => !isBlockedIp(addr.address));
  } catch {
    return false; // 解決不能はブロック
  }
}

// リダイレクトを手動追従しつつ各ホップを再検証して取得する（SSRF＋タイムアウト）。
async function safeFetch(rawUrl: string): Promise<Response | null> {
  const MAX_HOPS = 3;
  const TIMEOUT_MS = 5000;
  let currentUrl = rawUrl;

  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    if (!(await isSafeFetchTarget(currentUrl))) {
      return null; // プライベート/不正ターゲットはブロック
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(currentUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; BONOBot/1.0)" },
        redirect: "manual",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    // リダイレクトは Location を再検証してから追従
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return null;
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }
    return response;
  }
  return null; // リダイレクト上限超過
}

async function fetchOgData(url: string): Promise<OgData> {
  try {
    const response = await safeFetch(url);
    if (!response || !response.ok) {
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
  // 認証チェック（questions/submit と同型）
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized: No token provided" },
      { status: 401 }
    );
  }

  const token = authHeader.replace("Bearer ", "");

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase configuration missing");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

  // トークンからユーザー情報を取得
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid token" },
      { status: 401 }
    );
  }

  // サブスクリプションチェック（環境に応じたフィルタ）
  const environment = process.env.NODE_ENV === "production" ? "live" : "test";
  const { data: subscription, error: subError } = await supabase
    .from("user_subscriptions")
    .select("is_active, plan_type")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .eq("environment", environment)
    .maybeSingle();

  if (subError || !subscription) {
    return NextResponse.json(
      { error: "Premium subscription required" },
      { status: 403 }
    );
  }

  try {
    // リクエストボディの取得（userId / userEmail はボディから受け取らない）
    let body: SubmitRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "リクエストの形式が不正です" },
        { status: 400 }
      );
    }

    // バリデーション
    if (!body.articleUrl || !body.slackAccountName || !body.lessonId) {
      return NextResponse.json(
        { error: "必須項目が入力されていません" },
        { status: 400 }
      );
    }

    if (typeof body.slackAccountName !== "string" || body.slackAccountName.length > VALIDATION_RULES.slackAccountName.maxLength) {
      return NextResponse.json(
        { error: `アカウント名は${VALIDATION_RULES.slackAccountName.maxLength}文字以内で入力してください` },
        { status: 400 }
      );
    }

    if (typeof body.lessonId !== "string" || body.lessonId.length > VALIDATION_RULES.lessonId.maxLength) {
      return NextResponse.json(
        { error: "学習コンテンツの指定が不正です" },
        { status: 400 }
      );
    }

    if (body.lessonTitle !== undefined && (typeof body.lessonTitle !== "string" || body.lessonTitle.length > VALIDATION_RULES.lessonTitle.maxLength)) {
      return NextResponse.json(
        { error: "学習コンテンツ名が不正です" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.checkedItems) || body.checkedItems.length === 0) {
      return NextResponse.json(
        { error: "確認項目を1つ以上選択してください" },
        { status: 400 }
      );
    }

    if (body.checkedItems.length > VALIDATION_RULES.checkedItems.maxCount || body.checkedItems.some((item) => typeof item !== "string")) {
      return NextResponse.json(
        { error: "確認項目の形式が不正です" },
        { status: 400 }
      );
    }

    // URL形式チェック（http/https 限定。javascript: 等を弾く）
    if (!isValidHttpUrl(body.articleUrl)) {
      return NextResponse.json(
        { error: "正しいURLを入力してください（http:// または https://）" },
        { status: 400 }
      );
    }

    // レート制限: 1ユーザーにつき1時間に5件まで（カウントはSanityの実データ）
    try {
      const RATE_LIMIT_PER_HOUR = 5;
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const recentCount = await getSanityWriteClient().fetch<number>(
        `count(*[_type == "userOutput" && author.userId == $uid && submittedAt > $since])`,
        { uid: user.id, since }
      );
      if (recentCount >= RATE_LIMIT_PER_HOUR) {
        return NextResponse.json(
          { error: "短時間に多くの応募がされています。しばらく時間をおいてから再度お試しください" },
          { status: 429 }
        );
      }
    } catch (e) {
      // カウント失敗時は投稿を止めない（レート制限は best-effort）
      console.error("Rate limit check failed:", e);
    }

    // OGメタデータを取得（SSRF対策済み。ブロック時は og をスキップして投稿は続行）
    const ogData = await fetchOgData(body.articleUrl);

    // Sanityに保存（author は検証済みトークンの user から取得）
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
        userId: user.id,
        email: user.email ?? "",
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
