// @vitest-environment node
// 常設の文面を Slack の DM でも送る（#327-H）をインメモリで確かめる。Slack は偽物（実際の Slack は呼ばない）。
// アドレスは example.invalid、Slack の ID・チーム ID は架空の値だけを使う。
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
vi.mock("server-only", () => ({}));
import { prepareCampaign, runSendBatch, type MailDeps } from "@/lib/member-mail/process";
import { ONBOARDING_DAY2_COPY } from "@/lib/member-mail/standing-copy";
import {
  loadSlackDmSetting,
  readSlackDmMode,
  runSlackDmBatch,
  sendSlackOwnerPreview,
  slackCountLines,
  SLACK_DM_STANDING_KEYS,
  type SlackDmDeps,
} from "@/lib/member-mail/slack-dm";
import { escapeSlack, renderSlackDm } from "@/lib/member-mail/slack-mrkdwn";
import type { Campaign, DeliveryPatch, DeliveryStatus, MailMode, StandingKey } from "@/lib/member-mail/types";
import { approvedCampaign, FakeMail, makeDeps, member, MemStore, SITE, uid } from "./helpers";
import { FakeSlack, MemSlackDmStore, slackUser, TEAM } from "./slack-dm-helpers";

function jst(dateTime: string): Date {
  return new Date(`${dateTime}+09:00`);
}
const ACTIVATED = jst("2026-11-20T12:00:00");
const MORNING = jst("2026-11-25T08:00:00");
const JOIN_DUE = "2026-11-23T10:00:00"; // 11/25 の朝が入会2日後
const BUDGET = 45_000;

type Alert = { title: string; counts: Record<string, number>; note?: string };

function standingCampaign(over: Partial<Campaign> = {}): Campaign {
  return approvedCampaign({
    id: "s-1",
    kind: "signup",
    label: ONBOARDING_DAY2_COPY.label,
    subject: ONBOARDING_DAY2_COPY.subject,
    preheader: ONBOARDING_DAY2_COPY.preheader,
    body: ONBOARDING_DAY2_COPY.body,
    standingKey: "onboarding_day2",
    scheduledAt: ACTIVATED,
    // PR #342 の文面ごとのスイッチ（standing_mode。未設定は count）を入れた後も、このテストではメールを全員に送る。
    // この枝の Campaign 型にはまだ無いので型を外して渡す（#342 が先に入れば普通に書ける）
    ...({ standingMode: "all" } as unknown as Partial<Campaign>),
    ...over,
  });
}

/** 会員 1〜n を入会2日後の状態で入れる。Slack は既定で全員つながっている・DM のスイッチは all */
function seed(n: number, opts: { slackMode?: MailMode; linked?: number[]; campaign?: Partial<Campaign> } = {}) {
  const store = new MemStore();
  store.kindModes.signup = "all";
  store.testEmailPrefixes = ["qa-fixture"];
  const campaign = standingCampaign(opts.campaign);
  store.campaigns.set(campaign.id, campaign);
  const slackStore = new MemSlackDmStore(store);
  slackStore.mode = opts.slackMode ?? "all";
  for (let i = 1; i <= n; i += 1) {
    store.members.push(member(i, { createdAt: new Date("2025-06-01T00:00:00Z") }));
    store.contracts.push({ subscriptionId: `sub_test_${i}`, start: jst(JOIN_DUE) });
    store.emails.set(uid(i), `member${i}@example.invalid`);
    if (!opts.linked || opts.linked.includes(i)) slackStore.links.set(uid(i), { teamId: TEAM, slackUserId: `U-${i}` });
  }
  const slack = new FakeSlack();
  const slackDm: SlackDmDeps = { store: slackStore, slack, teamId: TEAM };
  return { store, campaign, slackStore, slack, slackDm };
}

/** 毎朝の実行（cron の受け口と同じ順: 選ぶ → メールを送る → 最後に Slack の DM） */
async function morningRun(
  store: MemStore,
  mail: FakeMail,
  slackDm: SlackDmDeps | null,
  opts: { alerts?: Alert[]; now?: () => Date; budget?: number } = {},
) {
  const now = opts.now ?? (() => MORNING);
  const deps: MailDeps = makeDeps(store, mail, opts.alerts ?? [], { now, slackDm });
  for (const c of await store.listStandingCampaigns(now())) await prepareCampaign(deps, c);
  const batch = await runSendBatch(deps);
  const dm = await runSlackDmBatch(deps, { timeBudgetMs: opts.budget ?? BUDGET });
  return { batch, dm, deps };
}

let logSpy: ReturnType<typeof vi.spyOn>;
let errSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  // ログに本文・メールアドレスが出ていない
  const all = JSON.stringify([...logSpy.mock.calls, ...errSpy.mock.calls]);
  expect(all).not.toContain("@example.invalid");
  expect(all).not.toContain("カイクンです");
  vi.restoreAllMocks();
});

// =============================================================================
describe("Slack の mrkdwn に直す", () => {
  const text = renderSlackDm(ONBOARDING_DAY2_COPY, { siteUrl: SITE });

  it("件名を太字で先頭に、見出しは太字の1行に、リンクは <url|文字> に、箇条書きは残す", () => {
    expect(text.startsWith(`*${ONBOARDING_DAY2_COPY.subject}*\n\n`)).toBe(true);
    expect(text).toContain("\n\n*デザインについて、30分相談できます*\n\n");
    expect(text).toContain("\n\n*会員どうしのコミュニティもあります*\n\n");
    expect(text).toContain("<https://cal.com/takumikai/30min|30分の相談を予約する>");
    expect(text).toContain("<https://www.bo-no.design/how-to/community|コミュニティの参加方法を見る>");
    expect(text).toContain("• 「仕事をしながら、どのくらいのペースで進めればいい？」\n• 「自分の目的だと");
    expect(text).not.toMatch(/^## /m);
    expect(text).not.toMatch(/^- /m);
    expect(text).not.toContain("](");
  });

  it("メールと同じ言葉（本文の文は全部入っている）", () => {
    expect(text).toContain("カイクンです。BONOに入ってくださって、ありがとうございます。");
    expect(text).toContain("相談もコミュニティも、使いたくなったときにいつでもどうぞ。\n\nBONO　カイクン");
  });

  it("配信停止の法定表示は付けず、最後の1行で通知設定から止められることを伝える", () => {
    expect(
      text.endsWith("Slackでのお知らせは、<https://www.bo-no.design/account/notifications|通知設定>からオフにできます。"),
    ).toBe(true);
    expect(text).not.toContain("配信停止");
    expect(text).not.toContain("特定商取引法");
  });

  it("リンクにメールの印（?from=email_）を付けない", () => {
    expect(text).not.toContain("from=email_");
  });

  it("&, <, > をエスケープする（リンクの外も中も）", () => {
    expect(escapeSlack("a < b & c > d")).toBe("a &lt; b &amp; c &gt; d");
    const t = renderSlackDm({ subject: "A&B", body: "1 < 2 & [x>y](https://www.bo-no.design/a)" }, { siteUrl: SITE });
    expect(t).toContain("*A&amp;B*");
    expect(t).toContain("1 &lt; 2 &amp; <https://www.bo-no.design/a|x&gt;y>");
  });

  it("行動で送り分けていることを書かない（本文にない言葉を足さない）", () => {
    expect(text).not.toMatch(/しばらく|来ていない|入会2日/);
  });
});

// =============================================================================
describe("スイッチの既定は off・DM で送る文面は onboarding_day2 だけ", () => {
  it("マイグレーションの既定が off（入れても何も送られない）", () => {
    const dir = path.join(process.cwd(), "supabase/migrations");
    const file = readdirSync(dir).find((f) => f.endsWith("_member_mail_slack_dm.sql"));
    expect(file).toBeTruthy();
    const sql = readFileSync(path.join(dir, file!), "utf8");
    expect(sql).toMatch(/slack_dm_mode text NOT NULL DEFAULT 'off'/);
    expect(sql).toMatch(/enabled boolean NOT NULL DEFAULT true/);
    expect(sql).toMatch(/delivery_id uuid NOT NULL UNIQUE/);
    expect(sql).toMatch(/'deferred'/);
    expect(sql).toMatch(/UNIQUE \(campaign_id, user_id, content_version\)/);
  });

  it("DM で送る文面の一覧は onboarding_day2 だけ", () => {
    expect([...SLACK_DM_STANDING_KEYS]).toEqual(["onboarding_day2"]);
  });

  it("一覧に無い常設の文面（例: 入会5日目）は、メールは届くが DM は送らず、人数の行も足さない", async () => {
    const { store, slack, slackDm } = seed(1, {
      campaign: { standingKey: "onboarding_day5" as StandingKey },
    });
    const mail = new FakeMail();
    // この枝の型には day5 が無いので、オーナー確認の行を直接入れてメールを送らせる
    const deps = makeDeps(store, mail, [], { now: () => MORNING, slackDm });
    store.deliveries.length = 0;
    await store.insertDeliveries([
      { campaignId: "s-1", userId: uid(1), kind: "signup", category: "signup", audience: "owner", contentVersion: 1 },
    ]);
    store.kindModes.signup = "owner";
    await runSendBatch(deps);
    expect(store.deliveries[0].status).toBe("sent");
    await runSlackDmBatch(deps, { timeBudgetMs: BUDGET });
    expect(slack.infoCalls).toHaveLength(0);
    expect(await slackCountLines({ slackDm }, "onboarding_day5", [uid(1)], [])).toEqual({});
    expect(await slackCountLines({ slackDm }, "onboarding_day2", [uid(1)], [])).toMatchObject({ slack_candidates: 1 });
  });

  it("スイッチが読めない（マイグレーション前）ときは off 扱いで、メールは送れる", async () => {
    const { store, slackStore, slack, slackDm } = seed(1);
    slackStore.modeError = true;
    expect(await readSlackDmMode(slackStore)).toBe("off");
    const mail = new FakeMail();
    const { dm } = await morningRun(store, mail, slackDm);
    expect(mail.sent).toHaveLength(1);
    expect(dm.skippedReason).toBe("mode_off");
    expect(slack.infoCalls).toHaveLength(0);
  });

  it("Slack の依存が無い（slackDm 未設定）ときはメールだけ", async () => {
    const { store, slack } = seed(1);
    const mail = new FakeMail();
    const { dm } = await morningRun(store, mail, null);
    expect(mail.sent).toHaveLength(1);
    expect(dm.skippedReason).toBe("not_configured");
    expect(slack.posted).toHaveLength(0);
  });
});

// =============================================================================
describe("誰に送るか", () => {
  it("all: メールを送れた人のうち、つながっていてオンの人に1通ずつ", async () => {
    const { store, slackStore, slack, slackDm } = seed(3, { linked: [1, 2] });
    slackStore.prefs.set(uid(2), false);
    const mail = new FakeMail();
    await morningRun(store, mail, slackDm);
    expect(mail.sent).toHaveLength(3);
    expect(slack.opened).toEqual(["U-1"]);
    expect(slack.posted).toHaveLength(1);
    expect(slack.posted[0].channelId).toBe("D-U-1");
    expect(slack.posted[0].text).toBe(renderSlackDm(ONBOARDING_DAY2_COPY, { siteUrl: SITE }));
    expect(slackStore.dms).toHaveLength(1);
    expect(slackStore.dms[0].status).toBe("sent");
    expect(slackStore.dms[0].row).toMatchObject({ userId: uid(1), audience: "all", slackUserId: "U-1" });
  });

  it("つながっていない人・ほかのワークスペースのつながりには送らない（記録も作らない）", async () => {
    const { store, slackStore, slack, slackDm } = seed(2, { linked: [2] });
    slackStore.links.set(uid(2), { teamId: "T0OTHER", slackUserId: "U-2" });
    const mail = new FakeMail();
    await morningRun(store, mail, slackDm);
    expect(mail.sent).toHaveLength(2);
    expect(slack.infoCalls).toHaveLength(0);
    expect(slackStore.dms).toHaveLength(0);
  });

  it("本人がオフにしていたら送らない", async () => {
    const { store, slackStore, slack, slackDm } = seed(1);
    await slackStore.setSlackDmEnabled(uid(1), false);
    await morningRun(store, new FakeMail(), slackDm);
    expect(slack.posted).toHaveLength(0);
    expect(slackStore.dms).toHaveLength(0);
  });

  it.each([
    ["退会した", { deleted: true }],
    ["ゲスト", { isRestricted: true }],
    ["シングルチャンネルゲスト", { isUltraRestricted: true }],
    ["ボット", { isBot: true }],
    ["ほかのワークスペース", { teamId: "T0OTHER" }],
    ["招待中", { isInvitedUser: true }],
  ])("Slack のアカウントが%sなら送らない（users.info・#238 と同じ判定）", async (_label, over) => {
    const { store, slackStore, slack, slackDm } = seed(1);
    slack.info.set("U-1", slackUser("U-1", over));
    const alerts: Alert[] = [];
    await morningRun(store, new FakeMail(), slackDm, { alerts });
    expect(slack.infoCalls).toEqual(["U-1"]);
    expect(slack.opened).toHaveLength(0);
    expect(slackStore.dms).toHaveLength(0);
    const summary = alerts.find((a) => a.title.startsWith("Slack の DM の結果"));
    expect(Object.keys(summary!.counts).some((k) => k.startsWith("skipped_"))).toBe(true);
  });

  it("off: 誰にも送らない", async () => {
    const { store, slack, slackDm } = seed(2, { slackMode: "off" });
    const mail = new FakeMail();
    await morningRun(store, mail, slackDm);
    expect(mail.sent).toHaveLength(2);
    expect(slack.infoCalls).toHaveLength(0);
  });

  it("count: DM は送らず、運用 Slack の人数に Slack の行を足す", async () => {
    const { store, slackStore, slack, slackDm } = seed(3, { slackMode: "count", linked: [1, 2] });
    store.kindModes.signup = "count";
    slackStore.prefs.set(uid(2), false);
    const alerts: Alert[] = [];
    await morningRun(store, new FakeMail(), slackDm, { alerts });
    expect(slack.infoCalls).toHaveLength(0);
    const counted = alerts.find((a) => a.title.startsWith("人数だけ出しました"));
    expect(counted?.counts).toMatchObject({ will_send: 3, slack_candidates: 2, slack_will_send: 1 });
  });

  it("メールが count でも、Slack が off なら Slack の行は足さない", async () => {
    const { store, slackDm } = seed(2, { slackMode: "off" });
    store.kindModes.signup = "count";
    const alerts: Alert[] = [];
    await morningRun(store, new FakeMail(), slackDm, { alerts });
    const counted = alerts.find((a) => a.title.startsWith("人数だけ出しました"));
    expect(counted?.counts).not.toHaveProperty("slack_candidates");
  });

  it("all のときの「送る準備をしました」にも Slack の行が付く", async () => {
    const { store, slackDm } = seed(2, { linked: [1] });
    const alerts: Alert[] = [];
    await morningRun(store, new FakeMail(), slackDm, { alerts });
    const queued = alerts.find((a) => a.title.startsWith("今日の対象を送る準備をしました"));
    expect(queued?.counts).toMatchObject({ queued: 2, slack_candidates: 1, slack_will_send: 1 });
  });

  it("owner: メールが全員でも、DM はオーナーだけ", async () => {
    const { store, slack, slackDm } = seed(3, { slackMode: "owner" });
    store.settings.ownerUserIds = [uid(2)];
    const mail = new FakeMail();
    await morningRun(store, mail, slackDm);
    expect(mail.sent).toHaveLength(3);
    expect(slack.opened).toEqual(["U-2"]);
  });

  it("メールを送れなかった人（配信停止・断られた）には DM も送らない", async () => {
    const { store, slack, slackDm } = seed(2);
    await store.unsubscribe(uid(1), ["signup"], "link");
    const mail = new FakeMail();
    mail.next.push({ kind: "rejected", code: "validation_error", stopBatch: false });
    await morningRun(store, mail, slackDm);
    expect(slack.infoCalls).toHaveLength(0);
  });

  it("メールの送れた記録を残せなかった（lost_claim）人には DM を送らない", async () => {
    const { store, slack, slackDm } = seed(1);
    const original = store.update.bind(store);
    store.update = async (id: string, token: string, expected: DeliveryStatus, patch: DeliveryPatch) =>
      patch.status === "sent" ? false : original(id, token, expected, patch);
    const mail = new FakeMail();
    const { batch } = await morningRun(store, mail, slackDm);
    expect(mail.sent).toHaveLength(1);
    expect(batch.outcomes.lost_claim).toBe(1);
    expect(store.deliveries[0].status).toBe("sending");
    expect(slack.infoCalls).toHaveLength(0);
  });

  it("メールの版と今の文面の版が違えば送らない", async () => {
    const { store, campaign, slack, slackDm } = seed(1, { slackMode: "off" });
    await morningRun(store, new FakeMail(), slackDm);
    store.campaigns.set(campaign.id, { ...campaign, contentVersion: 2, approvedVersion: 2 });
    (slackDm.store as MemSlackDmStore).mode = "all";
    const deps = makeDeps(store, new FakeMail(), [], { now: () => MORNING, slackDm });
    const dm = await runSlackDmBatch(deps, { timeBudgetMs: BUDGET });
    expect(dm.counts.skipped_content_changed).toBe(1);
    expect(slack.infoCalls).toHaveLength(0);
  });

  it("週1回のメルマガ（weekly）は Slack で送らない", async () => {
    const store = new MemStore();
    const weekly = approvedCampaign();
    store.campaigns.set(weekly.id, weekly);
    store.members.push(member(1));
    store.emails.set(uid(1), "member1@example.invalid");
    const slackStore = new MemSlackDmStore(store);
    slackStore.mode = "all";
    slackStore.links.set(uid(1), { teamId: TEAM, slackUserId: "U-1" });
    const slack = new FakeSlack();
    const deps = makeDeps(store, new FakeMail(), [], { slackDm: { store: slackStore, slack, teamId: TEAM } });
    await prepareCampaign(deps, weekly);
    await runSendBatch(deps);
    await runSlackDmBatch(deps, { timeBudgetMs: BUDGET });
    expect(store.deliveries[0].status).toBe("sent");
    expect(slack.infoCalls).toHaveLength(0);
  });

  it("トークンが無いときは送らず、メールは届く", async () => {
    const { store, slackStore } = seed(1);
    const slackDm: SlackDmDeps = { store: slackStore, slack: null, teamId: null };
    const mail = new FakeMail();
    const alerts: Alert[] = [];
    const { dm } = await morningRun(store, mail, slackDm, { alerts });
    expect(mail.sent).toHaveLength(1);
    expect(dm.skippedReason).toBe("not_configured");
    expect(slackStore.dms).toHaveLength(0);
    const queued = alerts.find((a) => a.title.startsWith("今日の対象を送る準備をしました"));
    expect(queued?.counts.slack_not_configured).toBe(1);
  });
});

// =============================================================================
describe("送る時機: メールを送り終えてから、残りの時間で", () => {
  it("メールを全員に送り終えてから DM を送る", async () => {
    const { store, slack, slackDm } = seed(3);
    const order: string[] = [];
    const mail = new FakeMail();
    const send = mail.send.bind(mail);
    mail.send = async (m) => {
      order.push("mail");
      return send(m);
    };
    slack.onCall = (method) => {
      if (method === "chat.postMessage") order.push("dm");
    };
    await morningRun(store, mail, slackDm);
    expect(order).toEqual(["mail", "mail", "mail", "dm", "dm", "dm"]);
  });

  it("残りが15秒未満なら始めず、次の実行で拾う（二重にならない）", async () => {
    const { store, slack, slackStore, slackDm } = seed(1);
    const { dm } = await morningRun(store, new FakeMail(), slackDm, { budget: 14_000 });
    expect(dm.skippedReason).toBe("no_time");
    expect(slack.infoCalls).toHaveLength(0);
    // 9時の回
    const deps = makeDeps(store, new FakeMail(), [], { now: () => new Date(MORNING.getTime() + 3600_000), slackDm });
    await runSlackDmBatch(deps, { timeBudgetMs: BUDGET });
    await runSlackDmBatch(deps, { timeBudgetMs: BUDGET });
    expect(slack.posted).toHaveLength(1);
    expect(slackStore.dms).toHaveLength(1);
  });

  it("途中で残りが15秒未満になったら、その先の人は記録を作らず次の実行へ回す", async () => {
    const { store, slack, slackStore, slackDm } = seed(3);
    let t = MORNING.getTime();
    const now = () => new Date(t);
    // 1通ごとに 4 秒進む（20秒の予算なら2通目のあと残り12秒）
    slack.onCall = (method) => {
      if (method === "chat.postMessage") t += 4_000;
    };
    const mail = new FakeMail();
    const deps = makeDeps(store, mail, [], { now, slackDm });
    for (const c of await store.listStandingCampaigns(now())) await prepareCampaign(deps, c);
    await runSendBatch(deps);
    const dm = await runSlackDmBatch(deps, { timeBudgetMs: 20_000 });
    expect(slack.posted).toHaveLength(2);
    expect(dm.counts.left_for_next_run).toBe(1);
    expect(slackStore.dms).toHaveLength(2);
    await runSlackDmBatch(deps, { timeBudgetMs: BUDGET });
    expect(slack.posted).toHaveLength(3);
  });

  it("36時間より前に送ったメールの分は、あとからスイッチを入れても送らない", async () => {
    const { store, slack, slackStore, slackDm } = seed(1, { slackMode: "off" });
    await morningRun(store, new FakeMail(), slackDm);
    slackStore.mode = "all";
    const later = new Date(MORNING.getTime() + 37 * 3600_000);
    const deps = makeDeps(store, new FakeMail(), [], { now: () => later, slackDm });
    await runSlackDmBatch(deps, { timeBudgetMs: BUDGET });
    expect(slack.infoCalls).toHaveLength(0);
  });

  it("失敗は1人ごとではなく、実行の最後に1つの通知にまとめる", async () => {
    const { store, slack, slackDm } = seed(3);
    slack.nextOpen.push({ kind: "slack_error", error: "user_not_found" }, { kind: "slack_error", error: "user_not_found" });
    const alerts: Alert[] = [];
    await morningRun(store, new FakeMail(), slackDm, { alerts });
    const dmAlerts = alerts.filter((a) => a.title.includes("Slack の DM"));
    expect(dmAlerts).toHaveLength(1);
    expect(dmAlerts[0].title).toContain("確認が必要");
    expect(dmAlerts[0].counts).toMatchObject({ failed_user_not_found: 2, sent: 1 });
  });
});

// =============================================================================
describe("速さの上限（429）", () => {
  it("投稿が 429 → その回の DM はそこで止め（deferred）、次の実行で残りの人も含めて送る", async () => {
    const { store, slack, slackStore, slackDm } = seed(3);
    slack.nextPost.push({ kind: "rate_limited", retryAfterSec: 30 });
    const { dm } = await morningRun(store, new FakeMail(), slackDm);
    expect(dm.counts.stopped_ratelimited).toBe(1);
    expect(slack.posted).toHaveLength(1);
    expect(slackStore.dms).toHaveLength(1);
    expect(slackStore.dms[0]).toMatchObject({ status: "deferred", reason: "ratelimited" });
    // まだ試していない人（2・3）は記録が無い
    const deps = makeDeps(store, new FakeMail(), [], { now: () => new Date(MORNING.getTime() + 3600_000), slackDm });
    await runSlackDmBatch(deps, { timeBudgetMs: BUDGET });
    expect(slack.posted).toHaveLength(4);
    expect(slackStore.dms.map((d) => d.status)).toEqual(["sent", "sent", "sent"]);
  });

  it("users.info が 429 → 記録を作らずに止め、次の実行で送る", async () => {
    const { store, slack, slackStore, slackDm } = seed(2);
    slack.nextInfo.push({ kind: "rate_limited", retryAfterSec: 5 });
    await morningRun(store, new FakeMail(), slackDm);
    expect(slack.infoCalls).toHaveLength(1);
    expect(slackStore.dms).toHaveLength(0);
    const deps = makeDeps(store, new FakeMail(), [], { now: () => MORNING, slackDm });
    await runSlackDmBatch(deps, { timeBudgetMs: BUDGET });
    expect(slack.posted).toHaveLength(2);
  });

  it("conversations.open が 429 → deferred で止める", async () => {
    const { store, slack, slackStore, slackDm } = seed(2);
    slack.nextOpen.push({ kind: "rate_limited", retryAfterSec: 5 });
    await morningRun(store, new FakeMail(), slackDm);
    expect(slack.opened).toHaveLength(1);
    expect(slack.posted).toHaveLength(0);
    expect(slackStore.dms[0]).toMatchObject({ status: "deferred", reason: "ratelimited" });
  });

  it("記録（sending）は Slack に投稿する直前にだけ作る", async () => {
    const { store, slack, slackStore, slackDm } = seed(1);
    const seen: Record<string, number> = {};
    slack.onCall = (method) => {
      seen[method] = slackStore.dms.filter((d) => d.status === "sending").length;
    };
    await morningRun(store, new FakeMail(), slackDm);
    expect(seen["users.info"]).toBe(0);
    expect(seen["conversations.open"]).toBe(1);
    expect(seen["chat.postMessage"]).toBe(1);
  });
});

// =============================================================================
describe("二重に送らない・止まった行", () => {
  it("同じ朝に何度実行しても、次の日に実行しても DM は1通", async () => {
    const { store, slack, slackStore, slackDm } = seed(1);
    const mail = new FakeMail();
    await morningRun(store, mail, slackDm);
    await morningRun(store, mail, slackDm, { now: () => new Date(MORNING.getTime() + 3600_000) });
    await morningRun(store, mail, slackDm, { now: () => jst("2026-11-26T08:00:00") });
    expect(mail.sent).toHaveLength(1);
    expect(slack.posted).toHaveLength(1);
    expect(slackStore.dms).toHaveLength(1);
  });

  it("送れたか分からなかった（needs_review）・断られた（failed）行は送り直さない", async () => {
    const { store, slack, slackStore, slackDm } = seed(2);
    slack.nextPost.push({ kind: "timeout" });
    slack.nextOpen.push({ kind: "ok", data: { channelId: "D-U-1" } }, { kind: "slack_error", error: "cannot_dm_bot" });
    await morningRun(store, new FakeMail(), slackDm);
    expect(slackStore.dms.map((d) => [d.status, d.reason])).toEqual([
      ["needs_review", "timeout"],
      ["failed", "cannot_dm_bot"],
    ]);
    const deps = makeDeps(store, new FakeMail(), [], { now: () => MORNING, slackDm });
    await runSlackDmBatch(deps, { timeBudgetMs: BUDGET });
    expect(slack.posted).toHaveLength(1);
  });

  it("10分より古い sending は needs_review にして知らせる（送り直さない）", async () => {
    const { store, slack, slackStore, slackDm } = seed(1);
    slack.throwOnOpen = true;
    await morningRun(store, new FakeMail(), slackDm);
    expect(slackStore.dms[0].status).toBe("sending");
    slack.throwOnOpen = false;
    const alerts: Alert[] = [];
    const deps = makeDeps(store, new FakeMail(), alerts, {
      now: () => new Date(MORNING.getTime() + 11 * 60_000),
      slackDm,
    });
    const dm = await runSlackDmBatch(deps, { timeBudgetMs: BUDGET });
    expect(dm.staleSending).toBe(1);
    expect(slackStore.dms[0]).toMatchObject({ status: "needs_review", reason: "stale_sending" });
    expect(slack.posted).toHaveLength(0);
    expect(alerts.find((a) => a.title.includes("Slack の DM"))?.counts.stale_sending).toBe(1);
  });

  it("スイッチが off でも、止まった sending は needs_review にする", async () => {
    const { slackStore, slackDm, store } = seed(0, { slackMode: "off" });
    await slackStore.claimSlackDm(
      { deliveryId: "d-x", campaignId: "s-1", userId: uid(1), audience: "all", contentVersion: 1, teamId: TEAM, slackUserId: "U-1" },
      new Date(MORNING.getTime() - 20 * 60_000),
    );
    const deps = makeDeps(store, new FakeMail(), [], { now: () => MORNING, slackDm });
    const dm = await runSlackDmBatch(deps, { timeBudgetMs: BUDGET });
    expect(dm.staleSending).toBe(1);
  });
});

// =============================================================================
describe("Slack の失敗でメールを止めない", () => {
  it("DM を開けない（slack_error）→ DM は failed、メールは sent", async () => {
    const { store, slack, slackStore, slackDm } = seed(1);
    slack.nextOpen.push({ kind: "slack_error", error: "user_not_found" });
    const { batch } = await morningRun(store, new FakeMail(), slackDm);
    expect(store.deliveries[0].status).toBe("sent");
    expect(batch.outcomes.sent).toBe(1);
    expect(slackStore.dms[0]).toMatchObject({ status: "failed", reason: "user_not_found" });
  });

  it("Slack のクライアントが例外を投げても、メールは全員 sent で、DM は続く人にも試す", async () => {
    const { store, slack, slackDm } = seed(2);
    slack.throwOnOpen = true;
    const mail = new FakeMail();
    const { batch, dm } = await morningRun(store, mail, slackDm);
    expect(mail.sent).toHaveLength(2);
    expect(batch.outcomes.sent).toBe(2);
    expect(dm.counts.error).toBe(2);
  });

  it("記録の読み書きが失敗しても、メールは sent", async () => {
    const { store, slackStore, slack, slackDm } = seed(1);
    slackStore.getSlackLink = async () => {
      throw new Error("slack link read failed: 500");
    };
    const { batch } = await morningRun(store, new FakeMail(), slackDm);
    expect(batch.outcomes.sent).toBe(1);
    expect(slack.infoCalls).toHaveLength(0);
  });
});

// =============================================================================
describe("オーナーだけに確認用の DM（sendSlackOwnerPreview）", () => {
  function setupPreview() {
    const { store, campaign, slackStore, slack, slackDm } = seed(2, { slackMode: "off" });
    store.kindModes.signup = "off";
    store.settings.ownerUserIds = [uid(9)];
    slackStore.links.set(uid(9), { teamId: TEAM, slackUserId: "U-9" });
    const deps = makeDeps(store, new FakeMail(), [], { now: () => MORNING, slackDm });
    return { store, campaign, slackStore, slack, deps };
  }

  it("スイッチが off でもオーナーにだけ送り、会員の記録には触れない", async () => {
    const { store, campaign, slackStore, slack, deps } = setupPreview();
    const r = await sendSlackOwnerPreview(deps, campaign.id);
    expect(r).toEqual({ outcome: "done", counts: { sent: 1 } });
    expect(slack.opened).toEqual(["U-9"]);
    expect(slack.posted[0].text).toBe(renderSlackDm(ONBOARDING_DAY2_COPY, { siteUrl: SITE }));
    expect(slackStore.previews).toHaveLength(1);
    expect(slackStore.dms).toHaveLength(0);
    expect(store.deliveries).toHaveLength(0);
  });

  it("同じ版にもう一度呼んでも送らない。本人がオフなら送らない（オフで届かないことを確かめられる）", async () => {
    const { campaign, slackStore, slack, deps } = setupPreview();
    await sendSlackOwnerPreview(deps, campaign.id);
    expect(await sendSlackOwnerPreview(deps, campaign.id)).toEqual({ outcome: "done", counts: { duplicate: 1 } });
    await slackStore.setSlackDmEnabled(uid(9), false);
    expect(await sendSlackOwnerPreview(deps, campaign.id)).toEqual({ outcome: "done", counts: { skipped_disabled: 1 } });
    expect(slack.posted).toHaveLength(1);
  });

  it("承認の前でも送れる。仮の文字が残る文面・DM で送らない文面・存在しない文面は送らない", async () => {
    const { store, campaign, slack, deps } = setupPreview();
    store.campaigns.set(campaign.id, { ...campaign, approvedVersion: null });
    expect((await sendSlackOwnerPreview(deps, campaign.id)).outcome).toBe("done");
    store.campaigns.set(campaign.id, { ...campaign, contentVersion: 2, body: "TBD" });
    expect(await sendSlackOwnerPreview(deps, campaign.id)).toEqual({ outcome: "blocked", reason: "message_placeholder" });
    store.campaigns.set("w-1", approvedCampaign({ id: "w-1" }));
    expect((await sendSlackOwnerPreview(deps, "w-1")).outcome).toBe("not_slack_dm_campaign");
    expect((await sendSlackOwnerPreview(deps, "nope")).outcome).toBe("campaign_missing");
    expect(slack.posted).toHaveLength(1);
  });

  it("オーナーが決まっていなければ送らない", async () => {
    const { store, campaign, deps } = setupPreview();
    store.settings.ownerUserIds = [];
    expect((await sendSlackOwnerPreview(deps, campaign.id)).outcome).toBe("no_owner");
  });
});

// =============================================================================
describe("通知設定の画面に Slack のカードを出すか（loadSlackDmSetting）", () => {
  function setup(mode: MailMode) {
    const store = new MemSlackDmStore(new MemStore());
    store.mode = mode;
    store.links.set(uid(1), { teamId: TEAM, slackUserId: "U-1" });
    store.links.set(uid(2), { teamId: "T0OTHER", slackUserId: "U-2" });
    return store;
  }

  it("つながっていても、まだ届きうる人でなければ（設定の行も DM も無く all でない）出さない", async () => {
    for (const mode of ["off", "count", "owner"] as const) {
      expect(await loadSlackDmSetting(setup(mode), TEAM, uid(1))).toBeNull();
    }
  });

  it("設定の行があれば、スイッチによらず出して今の値を返す", async () => {
    const store = setup("off");
    store.prefs.set(uid(1), false);
    expect(await loadSlackDmSetting(store, TEAM, uid(1))).toBe(false);
  });

  it("DM を受け取ったことがあれば、スイッチによらず出す", async () => {
    const store = setup("off");
    store.previews.push({
      id: "p-1",
      key: "k",
      row: { campaignId: "s-1", userId: uid(1), contentVersion: 1, teamId: TEAM, slackUserId: "U-1" },
      status: "sent",
      reason: null,
      ts: "1",
      updatedAt: MORNING,
    });
    expect(await loadSlackDmSetting(store, TEAM, uid(1))).toBe(true);
  });

  it("all のときはつながっている人に出す", async () => {
    expect(await loadSlackDmSetting(setup("all"), TEAM, uid(1))).toBe(true);
  });

  it("ほかのワークスペースのつながり・つながっていない人・ワークスペースが分からないときは出さない", async () => {
    const store = setup("all");
    store.prefs.set(uid(2), true);
    expect(await loadSlackDmSetting(store, TEAM, uid(2))).toBeNull();
    expect(await loadSlackDmSetting(store, TEAM, uid(3))).toBeNull();
    expect(await loadSlackDmSetting(store, null, uid(1))).toBeNull();
  });

  it("読めないときは出さない（画面は壊さない）", async () => {
    const store = setup("all");
    store.getSlackLink = async () => {
      throw new Error("x");
    };
    expect(await loadSlackDmSetting(store, TEAM, uid(1))).toBeNull();
  });
});
