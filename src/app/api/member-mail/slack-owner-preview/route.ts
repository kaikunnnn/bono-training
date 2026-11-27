// src/app/api/member-mail/slack-owner-preview/route.ts
// 常設の文面の Slack DM を、オーナー（member_mail_settings.owner_user_ids）にだけ確認用に送る（#327-H）。
//
// 使い方（手動だけ。cron には入れない）:
//   curl -X POST -H "Authorization: Bearer $CRON_SECRET" "https://www.bo-no.design/api/member-mail/slack-owner-preview?campaign=<member_mail_campaigns.id>"
//
// - Slack の DM のスイッチ（slack_dm_mode）・メールのスイッチには関係なく送る。会員の送信記録・会員の DM の記録には触れない
//   （記録は member_mail_slack_dm_previews に別で残す。同じ文面の版・同じ人には1回だけ）
// - DM で送る文面（SLACK_DM_STANDING_KEYS）だけ。承認の前でも送れる（見た目の確認のため）
// - 本人のオン・オフは会員と同じように見る（オフにすると届かないことを確かめられる）
// 返す JSON は件数だけ（個人情報なし）。

import { NextRequest, NextResponse } from "next/server";
import { createMailDeps } from "@/lib/member-mail/runtime";
import { sendSlackOwnerPreview } from "@/lib/member-mail/slack-dm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const campaignId = request.nextUrl.searchParams.get("campaign") ?? "";
  if (!UUID_RE.test(campaignId)) return NextResponse.json({ error: "invalid_campaign" }, { status: 400 });

  const deps = createMailDeps();
  if (!deps) return NextResponse.json({ skipped: "not_configured" });
  try {
    return NextResponse.json(await sendSlackOwnerPreview(deps, campaignId));
  } catch (error) {
    console.error("[member-mail] slack owner preview failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "slack_owner_preview_failed" }, { status: 500 });
  }
}
