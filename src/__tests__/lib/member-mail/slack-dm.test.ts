// @vitest-environment node
// 常設の文面を Slack の DM でも送る（#327-H）をインメモリで確かめる。Slack は偽物（実際の Slack は呼ばない）。
// アドレスは example.invalid、Slack の ID・チーム ID は架空の値だけを使う。
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
vi.mock("server-only", () => ({}));
import { prepareCampaign, runSendBatch } from "@/lib/member-mail/process";
import { ONBOARDING_DAY2_COPY } from "@/lib/member-mail/standing-copy";
import {
  loadSlackDmSetting,
  readSlackDmMode,
  sendStandingSlackDm,
  slackCountLines,
  type NewSlackDm,
  type SlackDmClient,
  type SlackDmDeps,
  type SlackDmLink,
  type SlackDmPatch,
  type SlackDmStatus,
  type SlackDmStore,
} from "@/lib/member-mail/slack-dm";
import { escapeSlack, renderSlackDm } from "@/lib/member-mail/slack-mrkdwn";
import type { Campaign, MailMode } from "@/lib/member-mail/types";
import type { SlackCallResult } from "@/lib/slack-welcome/slack-api";
import { approvedCampaign, FakeMail, makeDeps, member, MemStore, SITE, uid } from "./helpers";

const TEAM = "T0TESTTEAM";

class MemSlackDmStore implements SlackDmStore {
  mode: MailMode = "off";
  modeError = false;
  links = new Map<string, SlackDmLink>();
  disabled = new Set<string>();
  dms: (NewSlackDm & { id: string; status: SlackDmStatus; reason: string | null; ts: string | null })[] = [];
  private seq = 0;
  async getSlackDmMode() {
    if (this.modeError) throw new Error("slack dm mode read failed: 42703");
    return this.mode;
  }
  async getSlackLink(userId: string) {
    return this.links.get(userId) ?? null;
  }
  async listSlackLinkedUserIds(userIds: readonly string[], teamId: string | null) {
    return new Set(userIds.filter((u) => this.links.has(u) && (!teamId || this.links.get(u)!.teamId === teamId)));
  }
  async isSlackDmEnabled(userId: string) {
    return !this.disabled.has(userId);
  }
  async listSlackDmDisabledUserIds(userIds: readonly string[]) {
    return new Set(userIds.filter((u) => this.disabled.has(u)));
  }
  async setSlackDmEnabled(userId: string, enabled: boolean) {
    if (enabled) this.disabled.delete(userId);
    else this.disabled.add(userId);
  }
  async insertSlackDm(row: NewSlackDm) {
    if (this.dms.some((d) => d.deliveryId === row.deliveryId)) return null;
    this.seq += 1;
    const id = `dm-${this.seq}`;
    this.dms.push({ ...row, id, status: "sending", reason: null, ts: null });
    return id;
  }
  async finishSlackDm(id: string, patch: SlackDmPatch) {
    const d = this.dms.find((x) => x.id === id);
    if (!d || d.status !== "sending") return;
    d.status = patch.status;
    if (patch.reason !== undefined) d.reason = patch.reason;
    if (patch.ts !== undefined) d.ts = patch.ts;
  }
}

class FakeSlack implements SlackDmClient {
  opened: string[] = [];
  posted: { channelId: string; text: string }[] = [];
  nextOpen: SlackCallResult<{ channelId: string }>[] = [];
  nextPost: SlackCallResult<{ channelId: string; ts: string }>[] = [];
  throwOnOpen = false;
  async openDm(userId: string) {
    if (this.throwOnOpen) throw new Error("boom");
    this.opened.push(userId);
    return this.nextOpen.shift() ?? { kind: "ok" as const, data: { channelId: `D-${userId}` } };
  }
  async postMessage(channelId: string, text: string) {
    this.posted.push({ channelId, text });
    return this.nextPost.shift() ?? { kind: "ok" as const, data: { channelId, ts: `1700000000.00000${this.posted.length}` } };
  }
}

function jst(dateTime: string): Date {
  return new Date(`${dateTime}+09:00`);
}
const ACTIVATED = jst("2026-11-20T12:00:00");
const MORNING = jst("2026-11-25T08:00:00");
const JOIN_DUE = "2026-11-23T10:00:00"; // 11/25 の朝が入会2日後

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
    ...over,
  });
}

/** 会員 1〜n を入会2日後の状態で入れる。Slack は既定で全員つながっている・DM のスイッチは all */
function seed(n: number, opts: { slackMode?: MailMode; linked?: number[] } = {}) {
  const store = new MemStore();
  store.kindModes.signup = "all";
  store.testEmailPrefixes = ["qa-fixture"];
  const campaign = standingCampaign();
  store.campaigns.set(campaign.id, campaign);
  const slackStore = new MemSlackDmStore();
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

async function morningRun(
  store: MemStore,
  mail: FakeMail,
  slackDm: SlackDmDeps | null,
  alerts: unknown[] = [],
  now: Date = MORNING,
) {
  const deps = makeDeps(store, mail, alerts, { now: () => now, slackDm });
  const results = [];
  for (const c of await store.listStandingCampaigns(now)) results.push(await prepareCampaign(deps, c));
  const batch = await runSendBatch(deps);
  return { results, batch, deps };
}

let logSpy: ReturnType<typeof vi.spyOn>;
let errSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
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
    expect(text.endsWith("Slackでのお知らせは、<https://www.bo-no.design/account/notifications|通知設定>からオフにできます。")).toBe(true);
    expect(text).not.toContain("配信停止");
    expect(text).not.toContain("特定商取引法");
  });

  it("リンクにメールの印（?from=email_）を付けない", () => {
    expect(text).not.toContain("from=email_");
  });

  it("&, <, > をエスケープする（リンクの外も中も）", () => {
    expect(escapeSlack("a < b & c > d")).toBe("a &lt; b &amp; c &gt; d");
    const t = renderSlackDm(
      { subject: "A&B", body: "1 < 2 & [x>y](https://www.bo-no.design/a)" },
      { siteUrl: SITE },
    );
    expect(t).toContain("*A&amp;B*");
    expect(t).toContain("1 &lt; 2 &amp; <https://www.bo-no.design/a|x&gt;y>");
  });

  it("行動で送り分けていることを書かない（本文にない言葉を足さない）", () => {
    expect(text).not.toMatch(/しばらく|来ていない|入会2日/);
  });
});

// =============================================================================
describe("スイッチ（slack_dm_mode）の既定は off", () => {
  it("マイグレーションの既定が off（入れても何も送られない）", () => {
    const dir = path.join(process.cwd(), "supabase/migrations");
    const file = readdirSync(dir).find((f) => f.endsWith("_member_mail_slack_dm.sql"));
    expect(file).toBeTruthy();
    const sql = readFileSync(path.join(dir, file!), "utf8");
    expect(sql).toMatch(/slack_dm_mode text NOT NULL DEFAULT 'off'/);
    // 本人のオン・オフは行が無ければオン
    expect(sql).toMatch(/enabled boolean NOT NULL DEFAULT true/);
    // 二重送信を防ぐ一意制約
    expect(sql).toMatch(/delivery_id uuid NOT NULL UNIQUE/);
  });

  it("スイッチが読めない（マイグレーション前）ときは off 扱いで、メールは送れる", async () => {
    const { store, slackStore, slack, slackDm } = seed(1);
    slackStore.modeError = true;
    expect(await readSlackDmMode(slackStore)).toBe("off");
    const mail = new FakeMail();
    await morningRun(store, mail, slackDm);
    expect(mail.sent).toHaveLength(1);
    expect(slack.posted).toHaveLength(0);
    expect(store.deliveries[0].status).toBe("sent");
  });

  it("Slack の依存が無い（slackDm 未設定）ときはメールだけ", async () => {
    const { store, slack } = seed(1);
    const mail = new FakeMail();
    await morningRun(store, mail, null);
    expect(mail.sent).toHaveLength(1);
    expect(slack.posted).toHaveLength(0);
  });
});

// =============================================================================
describe("誰に送るか", () => {
  it("all: メールを送れた人のうち、つながっていてオンの人に1通ずつ", async () => {
    const { store, slackStore, slack, slackDm } = seed(3, { linked: [1, 2] });
    slackStore.disabled.add(uid(2));
    const mail = new FakeMail();
    await morningRun(store, mail, slackDm);
    expect(mail.sent).toHaveLength(3);
    expect(slack.opened).toEqual(["U-1"]);
    expect(slack.posted).toHaveLength(1);
    expect(slack.posted[0].channelId).toBe("D-U-1");
    expect(slack.posted[0].text).toBe(renderSlackDm(ONBOARDING_DAY2_COPY, { siteUrl: SITE }));
    expect(slackStore.dms).toHaveLength(1);
    expect(slackStore.dms[0]).toMatchObject({ userId: uid(1), status: "sent", audience: "all", slackUserId: "U-1" });
  });

  it("つながっていない人には送らない（メールは届く）", async () => {
    const { store, slack, slackDm } = seed(1, { linked: [] });
    const mail = new FakeMail();
    await morningRun(store, mail, slackDm);
    expect(mail.sent).toHaveLength(1);
    expect(slack.opened).toHaveLength(0);
  });

  it("本人がオフにしていたら送らない。オンに戻せば次の文面から届く", async () => {
    const { store, slackStore, slack, slackDm } = seed(1);
    await slackStore.setSlackDmEnabled(uid(1), false);
    const mail = new FakeMail();
    await morningRun(store, mail, slackDm);
    expect(mail.sent).toHaveLength(1);
    expect(slack.posted).toHaveLength(0);
    expect(slackStore.dms).toHaveLength(0);
  });

  it("ほかのワークスペースのつながりには送らない", async () => {
    const { store, slackStore, slack, slackDm } = seed(1);
    slackStore.links.set(uid(1), { teamId: "T0OTHER", slackUserId: "U-1" });
    await morningRun(store, new FakeMail(), slackDm);
    expect(slack.posted).toHaveLength(0);
  });

  it("off: 誰にも送らない", async () => {
    const { store, slack, slackDm } = seed(2, { slackMode: "off" });
    const mail = new FakeMail();
    await morningRun(store, mail, slackDm);
    expect(mail.sent).toHaveLength(2);
    expect(slack.opened).toHaveLength(0);
  });

  it("count: DM は送らず、運用 Slack の人数に Slack の行を足す", async () => {
    const { store, slackStore, slack, slackDm } = seed(3, { slackMode: "count", linked: [1, 2] });
    store.kindModes.signup = "count";
    slackStore.disabled.add(uid(2));
    const alerts: { title: string; counts: Record<string, number> }[] = [];
    const mail = new FakeMail();
    await morningRun(store, mail, slackDm, alerts);
    expect(mail.sent).toHaveLength(0);
    expect(slack.opened).toHaveLength(0);
    const counted = alerts.find((a) => a.title.startsWith("人数だけ出しました"));
    expect(counted?.counts).toMatchObject({ will_send: 3, slack_candidates: 2, slack_will_send: 1 });
  });

  it("メールが count のときも、Slack が off なら Slack の行は足さない", async () => {
    const { store, slackDm } = seed(2, { slackMode: "off" });
    store.kindModes.signup = "count";
    const alerts: { title: string; counts: Record<string, number> }[] = [];
    await morningRun(store, new FakeMail(), slackDm, alerts);
    const counted = alerts.find((a) => a.title.startsWith("人数だけ出しました"));
    expect(counted?.counts).not.toHaveProperty("slack_candidates");
    expect(counted?.counts).not.toHaveProperty("slack_will_send");
  });

  it("all のときの「送る準備をしました」にも Slack の行が付く", async () => {
    const { store, slackDm } = seed(2, { linked: [1] });
    const alerts: { title: string; counts: Record<string, number> }[] = [];
    await morningRun(store, new FakeMail(), slackDm, alerts);
    const queued = alerts.find((a) => a.title.startsWith("今日の対象を送る準備をしました"));
    expect(queued?.counts).toMatchObject({ queued: 2, slack_candidates: 1, slack_will_send: 1 });
  });

  it("owner: メールが全員でも、DM はオーナーだけ", async () => {
    const { store, slack, slackDm } = seed(3, { slackMode: "owner" });
    store.settings.ownerUserIds = [uid(2)];
    const mail = new FakeMail();
    const alerts: { title: string; counts: Record<string, number> }[] = [];
    await morningRun(store, mail, slackDm, alerts);
    expect(mail.sent).toHaveLength(3);
    expect(slack.opened).toEqual(["U-2"]);
    const queued = alerts.find((a) => a.title.startsWith("今日の対象を送る準備をしました"));
    expect(queued?.counts).toMatchObject({ slack_candidates: 3, slack_will_send: 1 });
  });

  it("owner: メールもオーナー確認のとき、オーナーにメールと DM が1通ずつ", async () => {
    const { store, slack, slackDm, slackStore } = seed(0, { slackMode: "owner" });
    store.kindModes.signup = "owner";
    store.settings.ownerUserIds = [uid(9)];
    store.emails.set(uid(9), "owner9@example.invalid");
    slackStore.links.set(uid(9), { teamId: TEAM, slackUserId: "U-9" });
    const mail = new FakeMail();
    await morningRun(store, mail, slackDm);
    expect(mail.sent).toHaveLength(1);
    expect(slack.opened).toEqual(["U-9"]);
    expect(slackStore.dms[0]).toMatchObject({ audience: "owner", status: "sent" });
  });

  it("メールを送れなかった人（配信停止）には DM も送らない", async () => {
    const { store, slack, slackDm } = seed(1);
    await store.unsubscribe(uid(1), ["signup"], "link");
    const mail = new FakeMail();
    await morningRun(store, mail, slackDm);
    expect(mail.sent).toHaveLength(0);
    expect(slack.opened).toHaveLength(0);
  });

  it("メールが断られた（rejected）人にも DM を送らない", async () => {
    const { store, slack, slackDm } = seed(1);
    const mail = new FakeMail();
    mail.next.push({ kind: "rejected", code: "validation_error", stopBatch: false });
    await morningRun(store, mail, slackDm);
    expect(slack.opened).toHaveLength(0);
  });

  it("週1回のメルマガ（weekly）は Slack で送らない", async () => {
    const store = new MemStore();
    const weekly = approvedCampaign();
    store.campaigns.set(weekly.id, weekly);
    store.members.push(member(1));
    store.emails.set(uid(1), "member1@example.invalid");
    const slackStore = new MemSlackDmStore();
    slackStore.mode = "all";
    slackStore.links.set(uid(1), { teamId: TEAM, slackUserId: "U-1" });
    const slack = new FakeSlack();
    const deps = makeDeps(store, new FakeMail(), [], { slackDm: { store: slackStore, slack, teamId: TEAM } });
    await prepareCampaign(deps, weekly);
    await runSendBatch(deps);
    expect(store.deliveries[0].status).toBe("sent");
    expect(slack.opened).toHaveLength(0);
  });

  it("トークンが無いときは送らず、メールは届く（人数には slack_not_configured）", async () => {
    const { store, slackStore } = seed(1);
    const slackDm: SlackDmDeps = { store: slackStore, slack: null, teamId: null };
    const mail = new FakeMail();
    const alerts: { title: string; counts: Record<string, number> }[] = [];
    await morningRun(store, mail, slackDm, alerts);
    expect(mail.sent).toHaveLength(1);
    expect(slackStore.dms).toHaveLength(0);
    const queued = alerts.find((a) => a.title.startsWith("今日の対象を送る準備をしました"));
    expect(queued?.counts.slack_not_configured).toBe(1);
  });
});

// =============================================================================
describe("二重に送らない", () => {
  it("同じ朝に何度実行しても、次の日に実行しても DM は1通", async () => {
    const { store, slack, slackStore, slackDm } = seed(1);
    const mail = new FakeMail();
    await morningRun(store, mail, slackDm);
    await morningRun(store, mail, slackDm, [], new Date(MORNING.getTime() + 60 * 60 * 1000));
    await morningRun(store, mail, slackDm, [], jst("2026-11-26T08:00:00"));
    expect(mail.sent).toHaveLength(1);
    expect(slack.posted).toHaveLength(1);
    expect(slackStore.dms).toHaveLength(1);
  });

  it("同じ送信記録で2回呼ばれても（cron の再実行）2通目は送らない", async () => {
    const { store, campaign, slack, slackDm } = seed(1);
    await morningRun(store, new FakeMail(), slackDm);
    const row = store.deliveries[0];
    const deps = makeDeps(store, new FakeMail(), [], { now: () => MORNING, slackDm });
    expect(await sendStandingSlackDm(deps, row, campaign)).toBe("duplicate");
    expect(slack.posted).toHaveLength(1);
  });

  it("送れたか分からなかった行（needs_review）も送り直さない", async () => {
    const { store, campaign, slack, slackStore, slackDm } = seed(1);
    slack.nextPost.push({ kind: "timeout" });
    await morningRun(store, new FakeMail(), slackDm);
    expect(slackStore.dms[0].status).toBe("needs_review");
    const deps = makeDeps(store, new FakeMail(), [], { now: () => MORNING, slackDm });
    expect(await sendStandingSlackDm(deps, store.deliveries[0], campaign)).toBe("duplicate");
    expect(slack.posted).toHaveLength(1);
  });
});

// =============================================================================
describe("Slack の失敗でメールを止めない", () => {
  it("DM を開けない（slack_error）→ DM は failed、メールは sent", async () => {
    const { store, slack, slackStore, slackDm } = seed(1);
    slack.nextOpen.push({ kind: "slack_error", error: "user_not_found" });
    const alerts: { title: string; counts: Record<string, number> }[] = [];
    const { batch } = await morningRun(store, new FakeMail(), slackDm, alerts);
    expect(store.deliveries[0].status).toBe("sent");
    expect(batch.outcomes.sent).toBe(1);
    expect(slack.posted).toHaveLength(0);
    expect(slackStore.dms[0]).toMatchObject({ status: "failed", reason: "user_not_found" });
    expect(alerts.some((a) => a.title === "Slack の DM を送れませんでした" && a.counts.user_not_found === 1)).toBe(true);
  });

  it("投稿がタイムアウト → needs_review（自動で送り直さない）、メールは sent", async () => {
    const { store, slack, slackStore, slackDm } = seed(1);
    slack.nextPost.push({ kind: "timeout" });
    await morningRun(store, new FakeMail(), slackDm);
    expect(store.deliveries[0].status).toBe("sent");
    expect(slackStore.dms[0]).toMatchObject({ status: "needs_review", reason: "timeout" });
  });

  it("投稿が 429 → failed（送られていない）", async () => {
    const { store, slack, slackStore, slackDm } = seed(1);
    slack.nextPost.push({ kind: "rate_limited", retryAfterSec: 30 });
    await morningRun(store, new FakeMail(), slackDm);
    expect(slackStore.dms[0]).toMatchObject({ status: "failed", reason: "ratelimited" });
  });

  it("Slack のクライアントが例外を投げても、メールは sent で、続く人にも送る", async () => {
    const { store, slack, slackDm } = seed(2);
    slack.throwOnOpen = true;
    const mail = new FakeMail();
    const { batch } = await morningRun(store, mail, slackDm);
    expect(mail.sent).toHaveLength(2);
    expect(store.deliveries.every((d) => d.status === "sent")).toBe(true);
    expect(batch.outcomes.sent).toBe(2);
    expect(batch.outcomes.error).toBeUndefined();
  });

  it("記録の読み書きが失敗しても、メールは sent", async () => {
    const { store, slackStore, slack, slackDm } = seed(1);
    slackStore.getSlackLink = async () => {
      throw new Error("slack link read failed: 500");
    };
    const { batch } = await morningRun(store, new FakeMail(), slackDm);
    expect(batch.outcomes.sent).toBe(1);
    expect(slack.opened).toHaveLength(0);
  });
});

// =============================================================================
describe("通知設定の画面に Slack のカードを出すか（loadSlackDmSetting）", () => {
  function setup(mode: MailMode) {
    const mailStore = new MemStore();
    mailStore.settings.ownerUserIds = [uid(1)];
    const store = new MemSlackDmStore();
    store.mode = mode;
    store.links.set(uid(1), { teamId: TEAM, slackUserId: "U-1" });
    store.links.set(uid(2), { teamId: TEAM, slackUserId: "U-2" });
    return { mailStore, store };
  }

  it("off / count では出さない", async () => {
    for (const mode of ["off", "count"] as const) {
      const { mailStore, store } = setup(mode);
      expect(await loadSlackDmSetting(mailStore, store, uid(1))).toBeNull();
    }
  });

  it("owner ではオーナーだけに出す", async () => {
    const { mailStore, store } = setup("owner");
    expect(await loadSlackDmSetting(mailStore, store, uid(1))).toBe(true);
    expect(await loadSlackDmSetting(mailStore, store, uid(2))).toBeNull();
  });

  it("all ではつながっている人に出し、今のオン・オフを返す。つながっていない人には出さない", async () => {
    const { mailStore, store } = setup("all");
    store.disabled.add(uid(2));
    expect(await loadSlackDmSetting(mailStore, store, uid(1))).toBe(true);
    expect(await loadSlackDmSetting(mailStore, store, uid(2))).toBe(false);
    expect(await loadSlackDmSetting(mailStore, store, uid(3))).toBeNull();
  });

  it("読めないときは出さない（画面は壊さない）", async () => {
    const { mailStore, store } = setup("all");
    store.getSlackLink = async () => {
      throw new Error("x");
    };
    expect(await loadSlackDmSetting(mailStore, store, uid(1))).toBeNull();
  });

  it("slackCountLines: Slack の依存が無ければ何も足さない", async () => {
    expect(await slackCountLines({ slackDm: null }, [uid(1)], [])).toEqual({});
  });
});
