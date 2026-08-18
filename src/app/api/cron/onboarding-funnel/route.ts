// src/app/api/cron/onboarding-funnel/route.ts
// オンボーディング（レッスン slug: bono-onboarding）の完了ファネルを週次で集計し、
// Slack に通知する。週1の Vercel Cron から GET で叩かれる想定。
// storage-usage cron と同じ型を踏襲（Bearer 検証 / service role / Block Kit / force-dynamic）。
//
// 進捗は Sanity の slug ではなく _id で記録されるため、まず Sanity で
// lesson._id（lessonId）と配下記事 _id 群（articleIds）を解決してから Supabase を集計する。
//
// ★安全: ?preview=1 のときは Slack へ送信せず、計算した数値を JSON で返す（本番Slackを汚さない）。

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { client as getSanityClient } from "@/lib/sanity";

// オンボーディングレッスンの slug（進捗は _id 記録だが、解決の起点は slug）
const ONBOARDING_LESSON_SLUG = "bono-onboarding";

// 集計コホートの環境（user_subscriptions のみ environment 列を持つ）
const ENVIRONMENT = "live";

// 週次の増分・新規判定の窓（7日）
const WINDOW_DAYS = 7;

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface ArticleProgressRow {
  user_id: string;
  article_id: string;
  completed_at: string | null;
}

interface OnboardingLessonRef {
  _id: string | null;
  articleIds: (string | null)[] | null;
}

interface FunnelResult {
  lessonId: string | null;
  articleIds: string[];
  articleCount: number;
  totalMembers: number; // N: 有効メンバー総数（分母）
  newMembers: number; // 今週の新規メンバー数
  step2Started: number; // X: 1件以上完了した distinct user
  step3AllArticles: number; // Y: 全記事完了した distinct user
  step4LessonCompleted: number; // Z: レッスン完了した distinct user
  weeklyCompletions: number; // 今週の記事完了のべ件数（completed_at >= now-7d）
  rateStarted: number; // X/N (%)
  rateAllArticles: number; // Y/N (%)
  rateLessonCompleted: number; // Z/N (%)
}

// N=0 でのゼロ除算を回避しつつ % を返す
function pct(numerator: number, denominator: number): number {
  if (!denominator || denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10; // 小数第1位まで
}

function sendableWebhookUrl(): string | undefined {
  return process.env.SLACK_WEBHOOK_URL;
}

async function sendSlackFunnel(
  webhookUrl: string,
  result: FunnelResult
): Promise<void> {
  const message = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "📊 オンボーディング完了ファネル（週次）",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*有効メンバー総数:*\n${result.totalMembers} 名`,
          },
          {
            type: "mrkdwn",
            text: `*今週の新規メンバー:*\n${result.newMembers} 名`,
          },
          {
            type: "mrkdwn",
            text: `*1件以上完了:*\n${result.step2Started} 名 (${result.rateStarted}%)`,
          },
          {
            type: "mrkdwn",
            text: `*全記事完了:*\n${result.step3AllArticles} 名 (${result.rateAllArticles}%)`,
          },
          {
            type: "mrkdwn",
            text: `*レッスン完了:*\n${result.step4LessonCompleted} 名 (${result.rateLessonCompleted}%)`,
          },
          {
            type: "mrkdwn",
            text: `*今週の完了増分:*\n${result.weeklyCompletions} 件`,
          },
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `対象レッスン: \`${ONBOARDING_LESSON_SLUG}\`（記事 ${result.articleCount} 件）｜集計時刻: ${new Date().toLocaleString(
              "ja-JP",
              { timeZone: "Asia/Tokyo" }
            )}`,
          },
        ],
      },
    ],
  };

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
}

export async function GET(request: NextRequest) {
  // Vercel Cron 規約: CRON_SECRET が設定されていれば Bearer で検証する
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const isPreview = request.nextUrl.searchParams.get("preview") === "1";

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Supabase の環境変数が設定されていません" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // ---- 1) Sanity で lessonId / articleIds を解決（進捗は _id 記録のため必須）----
  let lessonId: string | null = null;
  let articleIds: string[] = [];
  try {
    const lessonRef = await getSanityClient().fetch<OnboardingLessonRef | null>(
      `*[_type=="lesson" && slug.current==$slug][0]{
        _id,
        "articleIds": quests[]->articles[]->_id
      }`,
      { slug: ONBOARDING_LESSON_SLUG }
    );
    lessonId = lessonRef?._id ?? null;
    // quests[]->articles[]->_id は null を含みうるため除去（getAllLessonsWithArticleIds と同様）
    articleIds = (lessonRef?.articleIds ?? []).filter(
      (id): id is string => Boolean(id)
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Sanity レッスン解決に失敗しました: ${String(err)}` },
      { status: 500 }
    );
  }

  const windowStartIso = new Date(
    Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  // ---- 2) 分母コホート N（有効メンバー総数）----
  // user_subscriptions は UNIQUE(user_id, environment) のため、
  // is_active=true かつ environment=live の行数 = distinct user_id 数。
  const { count: totalMembers, error: nErr } = await supabase
    .from("user_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .eq("environment", ENVIRONMENT);
  if (nErr) {
    return NextResponse.json(
      { error: `メンバー総数の集計に失敗しました: ${nErr.message}` },
      { status: 500 }
    );
  }

  // 今週の新規メンバー数（created_at >= now-7d）
  const { count: newMembers, error: newErr } = await supabase
    .from("user_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .eq("environment", ENVIRONMENT)
    .gte("created_at", windowStartIso);
  if (newErr) {
    return NextResponse.json(
      { error: `新規メンバー数の集計に失敗しました: ${newErr.message}` },
      { status: 500 }
    );
  }

  // ---- 3) 記事完了行を取得して X / Y / 今週増分 を JS 集計 ----
  // article_progress は PK(user_id, article_id) で行が既に一意。
  // status=completed かつ lesson_id=lessonId かつ article_id in articleIds に限定。
  const completedByUser = new Map<string, number>(); // user_id -> distinct 完了記事数
  let weeklyCompletions = 0;

  if (lessonId && articleIds.length > 0) {
    const pageSize = 1000;
    let from = 0;
    for (;;) {
      const { data, error } = await supabase
        .from("article_progress")
        .select("user_id, article_id, completed_at")
        .eq("status", "completed")
        .eq("lesson_id", lessonId)
        .in("article_id", articleIds)
        .range(from, from + pageSize - 1);
      if (error) {
        return NextResponse.json(
          { error: `記事進捗の集計に失敗しました: ${error.message}` },
          { status: 500 }
        );
      }
      const rows = (data ?? []) as ArticleProgressRow[];
      for (const row of rows) {
        completedByUser.set(
          row.user_id,
          (completedByUser.get(row.user_id) ?? 0) + 1
        );
        if (row.completed_at && row.completed_at >= windowStartIso) {
          weeklyCompletions += 1;
        }
      }
      if (rows.length < pageSize) break;
      from += pageSize;
    }
  }

  const step2Started = completedByUser.size; // X: 1件以上完了
  let step3AllArticles = 0; // Y: 全記事完了
  for (const cnt of completedByUser.values()) {
    if (cnt >= articleIds.length) step3AllArticles += 1;
  }

  // ---- 4) レッスン完了 Z ----
  // lesson_progress は PK(user_id, lesson_id) のため行数 = distinct user_id 数。
  let step4LessonCompleted = 0;
  if (lessonId) {
    const { count: zCount, error: zErr } = await supabase
      .from("lesson_progress")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .eq("lesson_id", lessonId);
    if (zErr) {
      return NextResponse.json(
        { error: `レッスン完了の集計に失敗しました: ${zErr.message}` },
        { status: 500 }
      );
    }
    step4LessonCompleted = zCount ?? 0;
  }

  const N = totalMembers ?? 0;
  const result: FunnelResult = {
    lessonId,
    articleIds,
    articleCount: articleIds.length,
    totalMembers: N,
    newMembers: newMembers ?? 0,
    step2Started,
    step3AllArticles,
    step4LessonCompleted,
    weeklyCompletions,
    rateStarted: pct(step2Started, N),
    rateAllArticles: pct(step3AllArticles, N),
    rateLessonCompleted: pct(step4LessonCompleted, N),
  };

  // ---- preview: Slack へ送らず JSON で返す（本番Slackを汚さない安全モード）----
  if (isPreview) {
    return NextResponse.json({ preview: true, sent: false, ...result });
  }

  // ---- 通常時のみ Slack 送信 ----
  let sent = false;
  const webhookUrl = sendableWebhookUrl();
  if (webhookUrl) {
    try {
      await sendSlackFunnel(webhookUrl, result);
      sent = true;
    } catch (err) {
      console.error("Failed to send onboarding funnel Slack message:", err);
    }
  } else {
    console.log(
      "SLACK_WEBHOOK_URL not configured, skipping onboarding funnel Slack message"
    );
  }

  return NextResponse.json({ sent, ...result });
}
