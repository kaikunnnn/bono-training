// src/app/api/slack/welcome/events/route.ts
// Slack Events API の受け口（#238 Slack 新規参加者へのウェルカムDM）。
// team_join を受け取り、署名を確かめて Supabase に1行記録してからすぐ 200 を返す。
// DM の送信は応答後に after() で行う（Slack の3秒ルールに間に合わせるため）。
// 取りこぼしは /api/cron/slack-welcome が日次で拾い直す。

import { after, NextResponse, type NextRequest } from "next/server";
import { handleSlackWelcomeEvent, readLimitedBody } from "@/lib/slack-welcome/ingest";
import { processDeliveryByKey } from "@/lib/slack-welcome/process";
import { createWelcomeDeps, getWelcomeStore, loadIngestConfig } from "@/lib/slack-welcome/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const read = await readLimitedBody(request);
  if (!read.ok) {
    return NextResponse.json(
      { error: read.status === 413 ? "payload_too_large" : "bad_request" },
      { status: read.status },
    );
  }

  const store = getWelcomeStore();
  const result = await handleSlackWelcomeEvent({
    headers: request.headers,
    rawBody: read.body,
    config: loadIngestConfig(),
    store,
    now: new Date(),
  });

  if (result.enqueue) {
    const { teamId, slackUserId } = result.enqueue;
    after(async () => {
      const deps = createWelcomeDeps(store);
      if (!deps) {
        console.error("[slack-welcome] Slack tokens not configured; left queued for cron");
        return;
      }
      await processDeliveryByKey(deps, teamId, slackUserId);
    });
  }

  return NextResponse.json(result.body, { status: result.status });
}
