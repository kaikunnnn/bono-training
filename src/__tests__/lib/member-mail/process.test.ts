// @vitest-environment node
// 会員メール（#264 スライス1）の送る処理の受け入れ条件をインメモリで確かめる。
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
vi.mock("server-only", () => ({}));
import { effectiveMode, prepareCampaign, processDelivery, runSendBatch } from "@/lib/member-mail/process";
import { unsubscribeByToken } from "@/lib/member-mail/unsubscribe";
import { createUnsubscribeToken } from "@/lib/member-mail/unsubscribe-token";
import { approvedCampaign, FakeMail, makeDeps, member, MemStore, SECRET, uid } from "./helpers";

function seed(n = 3) {
  const store = new MemStore();
  const campaign = approvedCampaign();
  store.campaigns.set(campaign.id, campaign);
  for (let i = 1; i <= n; i++) {
    store.members.push(member(i));
    store.emails.set(uid(i), `member${i}@example.invalid`);
  }
  return { store, campaign };
}

let logSpy: ReturnType<typeof vi.spyOn>;
let errSpy: ReturnType<typeof vi.spyOn>;
let warnSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  // ログにメールアドレスが出ていない（受け入れ条件）
  const all = JSON.stringify([...logSpy.mock.calls, ...errSpy.mock.calls, ...warnSpy.mock.calls]);
  expect(all).not.toContain("@example.invalid");
  vi.restoreAllMocks();
});

describe("スイッチ", () => {
  it("全体と種類ごとの弱いほうが効く", () => {
    expect(effectiveMode("all", "count")).toBe("count");
    expect(effectiveMode("owner", "all")).toBe("owner");
    expect(effectiveMode("off", "all")).toBe("off");
  });

  it("off なら何もしない", async () => {
    const { store, campaign } = seed();
    store.settings.mode = "off";
    const mail = new FakeMail();
    expect((await prepareCampaign(makeDeps(store, mail), campaign)).outcome).toBe("off");
    const batch = await runSendBatch(makeDeps(store, mail));
    expect(batch.skippedReason).toBe("off");
    expect(store.deliveries).toHaveLength(0);
    expect(mail.sent).toHaveLength(0);
  });
});

describe("人数だけ出す", () => {
  it("人数と内訳だけが出る（名前・アドレス・user_id が出ない）。記録の行も作らず、送らない", async () => {
    const { store, campaign } = seed(3);
    store.members.push(member(4, { cancelAtPeriodEnd: true, duration: 3 }));
    store.emails.set(uid(4), "member4@example.invalid");
    store.settings.mode = "count";
    await unsubscribeByToken(store, SECRET, createUnsubscribeToken(SECRET, uid(1), "notice"), "link", new Date());
    const alerts: unknown[] = [];
    const mail = new FakeMail();
    const result = await prepareCampaign(makeDeps(store, mail, alerts), campaign);
    expect(result.outcome).toBe("counted");
    if (result.outcome !== "counted") return;
    expect(result.count).toMatchObject({
      candidates: 4,
      willSend: 3,
      excluded: { unsubscribed: 1 },
      cancelScheduled: 1,
      byPlan: { standard_1m: 2, standard_3m: 1 },
    });
    const json = JSON.stringify({ result, alerts, saved: store.counts.get(campaign.id) });
    expect(json).not.toContain("@");
    for (let i = 1; i <= 4; i++) expect(json).not.toContain(uid(i));
    expect(store.deliveries).toHaveLength(0);
    expect(mail.sent).toHaveLength(0);
  });

  it("承認されていない文面でも人数は出せる（送らないので）。結果に未承認と出る", async () => {
    const { store } = seed(2);
    store.settings.mode = "count";
    const draft = approvedCampaign({ approvedVersion: null });
    const result = await prepareCampaign(makeDeps(store, new FakeMail()), draft);
    expect(result.outcome === "counted" && result.count.approved).toBe(false);
  });
});

describe("承認の印", () => {
  it.each(["owner", "all"] as const)("承認の印が無い文面は %s モードでも送られない", async (mode) => {
    const { store } = seed(2);
    store.settings.mode = mode;
    store.kindModes.weekly = mode;
    store.settings.ownerUserIds = [uid(1)];
    const draft = approvedCampaign({ approvedVersion: null });
    store.campaigns.set(draft.id, draft);
    const mail = new FakeMail();
    const result = await prepareCampaign(makeDeps(store, mail), draft);
    expect(result).toEqual({ outcome: "blocked", reason: "message_not_approved" });
    await runSendBatch(makeDeps(store, mail));
    expect(mail.sent).toHaveLength(0);
  });

  it("書き出したあとに文面が変わって承認が外れたら、送る直前に止まる（待ち行列に戻る）", async () => {
    const { store, campaign } = seed(2);
    const mail = new FakeMail();
    await prepareCampaign(makeDeps(store, mail), campaign);
    store.campaigns.set(campaign.id, { ...campaign, body: "書き換えた本文", contentVersion: 2, approvedVersion: 1 });
    const batch = await runSendBatch(makeDeps(store, mail));
    expect(mail.sent).toHaveLength(0);
    expect(batch.outcomes.blocked).toBe(2);
    expect(store.deliveries.every((d) => d.status === "queued" && d.reason === "message_not_approved")).toBe(true);
  });

  it("TBD などの仮の文字・https 以外のリンクがあれば承認済みでも送らない", async () => {
    const { store } = seed(1);
    for (const body of ["TBD", "[見る](http://www.bo-no.design/x)"]) {
      const c = approvedCampaign({ id: `c-${body.length}`, body });
      const r = await prepareCampaign(makeDeps(store, new FakeMail()), c);
      expect(r.outcome).toBe("blocked");
    }
  });
});

describe("二重送信の防止", () => {
  it("同じメールを同じ人に2回送ろうとしても1通だけ（書き出しを2回・送る処理を2回）", async () => {
    const { store, campaign } = seed(3);
    const mail = new FakeMail();
    const deps = makeDeps(store, mail);
    const first = await prepareCampaign(deps, campaign);
    expect(first).toMatchObject({ outcome: "enqueued", inserted: 3 });
    // 書き出し済みの印を外しても、一意制約で増えない
    store.campaigns.get(campaign.id)!.enqueuedAt = null;
    const second = await prepareCampaign(deps, store.campaigns.get(campaign.id)!);
    expect(second).toMatchObject({ outcome: "enqueued", inserted: 0 });

    await runSendBatch(deps);
    await runSendBatch(deps);
    expect(mail.sent).toHaveLength(3);
    expect(new Set(mail.sent.map((m) => m.to)).size).toBe(3);
  });

  it("同じ行を同時に処理しても送るのは1回だけ（確保できた処理だけが進む）", async () => {
    const { store, campaign } = seed(1);
    const mail = new FakeMail();
    const deps = makeDeps(store, mail);
    await prepareCampaign(deps, campaign);
    const id = store.deliveries[0].id;
    const outcomes = await Promise.all([processDelivery(deps, id), processDelivery(deps, id)]);
    expect(outcomes.sort()).toEqual(["not_claimed", "sent"]);
    expect(mail.sent).toHaveLength(1);
  });

  it("Idempotency-Key は送信記録の行ID。ワンクリック配信停止のヘッダーが付く", async () => {
    const { store, campaign } = seed(1);
    const mail = new FakeMail();
    const deps = makeDeps(store, mail);
    await prepareCampaign(deps, campaign);
    await runSendBatch(deps);
    const sent = mail.sent[0];
    expect(sent.idempotencyKey).toBe(`member-mail/${store.deliveries[0].id}`);
    expect(sent.headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
    expect(sent.headers["List-Unsubscribe"]).toMatch(/^<https:\/\/www\.bo-no\.design\/api\/mail\/unsubscribe\?t=v1\./);
    expect(sent.text).toContain("/mail/unsubscribe?t=v1.");
    expect(sent.text).toContain("送り主：カイクン（BONO）");
    expect(sent.text).toContain("https://www.bo-no.design/tokushoho");
    expect(sent.html).toContain("from=email_weekly");
    expect(store.deliveries[0]).toMatchObject({ status: "sent", resendEmailId: "re_1" });
  });

  it("送れたか分からないときは要確認にして、自動で送り直さない", async () => {
    const { store, campaign } = seed(1);
    const mail = new FakeMail();
    mail.next.push({ kind: "ambiguous", code: "network_error" });
    const alerts: { counts: Record<string, number> }[] = [];
    const deps = makeDeps(store, mail, alerts);
    await prepareCampaign(deps, campaign);
    await runSendBatch(deps);
    await runSendBatch(deps);
    expect(mail.sent).toHaveLength(1);
    expect(store.deliveries[0].status).toBe("needs_review");
    expect(alerts.some((a) => a.counts.needs_review === 1)).toBe(true);
  });

  it("送信中のまま止まった行は要確認にする", async () => {
    const { store, campaign } = seed(1);
    const deps = makeDeps(store, new FakeMail());
    await prepareCampaign(deps, campaign);
    Object.assign(store.deliveries[0], { status: "sending", updatedAt: new Date("2026-11-08T00:00:00Z") });
    const batch = await runSendBatch(deps);
    expect(batch.staleSending).toBe(1);
    expect(store.deliveries[0].status).toBe("needs_review");
  });
});

describe("配信停止・届かない・週の上限・契約", () => {
  it("配信停止した人は書き出しから外れ、書き出し後に止めた人にも送られない", async () => {
    const { store, campaign } = seed(3);
    const mail = new FakeMail();
    const deps = makeDeps(store, mail);
    await unsubscribeByToken(store, SECRET, createUnsubscribeToken(SECRET, uid(1), "notice"), "one_click", new Date());
    await prepareCampaign(deps, campaign);
    expect(store.deliveries.map((d) => d.userId)).toEqual([uid(2), uid(3)]);
    await unsubscribeByToken(store, SECRET, createUnsubscribeToken(SECRET, uid(2), "comeback"), "link", new Date());
    await runSendBatch(deps);
    expect(mail.sent.map((m) => m.to)).toEqual(["member3@example.invalid"]);
    expect(store.deliveries.find((d) => d.userId === uid(2))).toMatchObject({ status: "skipped", reason: "unsubscribed" });
  });

  it("届かなかった・迷惑報告の人には以後送らない", async () => {
    const { store, campaign } = seed(2);
    store.suppressed.set(uid(1), "bounced");
    const mail = new FakeMail();
    await prepareCampaign(makeDeps(store, mail), campaign);
    await runSendBatch(makeDeps(store, mail));
    expect(mail.sent.map((m) => m.to)).toEqual(["member2@example.invalid"]);
  });

  it("今週もう1通受け取った人には送らない（週1通まで）", async () => {
    const { store, campaign } = seed(2);
    const mail = new FakeMail();
    const deps = makeDeps(store, mail);
    // 同じ週に別のお知らせ系をすでに送った記録
    await store.insertDeliveries([
      { campaignId: "other", userId: uid(1), kind: "comeback", category: "comeback", audience: "all", contentVersion: 1 },
    ]);
    Object.assign(store.deliveries[0], { status: "sent", sendingAt: new Date("2026-11-08T16:00:00Z") });
    const prepared = await prepareCampaign(deps, campaign);
    expect(prepared.outcome === "enqueued" && prepared.count?.excluded).toEqual({ weekly_cap: 1 });
    await runSendBatch(deps);
    expect(mail.sent.map((m) => m.to)).toEqual(["member2@example.invalid"]);
  });

  it("契約が終わった人には送らない（送る直前に確かめる）", async () => {
    const { store, campaign } = seed(2);
    const mail = new FakeMail();
    const deps = makeDeps(store, mail);
    await prepareCampaign(deps, campaign);
    store.members = store.members.filter((m) => m.userId !== uid(1));
    await runSendBatch(deps);
    expect(mail.sent).toHaveLength(1);
    expect(store.deliveries.find((d) => d.userId === uid(1))).toMatchObject({ status: "skipped", reason: "not_eligible" });
  });
});

describe("オーナーだけに送る", () => {
  it("オーナーにだけ送り、全員分の行は書き出さない。全員に送る行は owner モードでは送らない", async () => {
    const { store, campaign } = seed(3);
    const ownerId = uid(99);
    store.emails.set(ownerId, "owner@example.invalid");
    store.settings.mode = "owner";
    store.settings.ownerUserIds = [ownerId];
    const mail = new FakeMail();
    const deps = makeDeps(store, mail);
    expect(await prepareCampaign(deps, campaign)).toMatchObject({ outcome: "enqueued", audience: "owner", inserted: 1 });
    // 何かの理由で全員分の行がある場合も、owner モードでは送らない
    await store.insertDeliveries([
      { campaignId: campaign.id, userId: uid(1), kind: "weekly", category: "notice", audience: "all", contentVersion: 1 },
    ]);
    await runSendBatch(deps);
    expect(mail.sent.map((m) => m.to)).toEqual(["owner@example.invalid"]);
    expect(store.deliveries.find((d) => d.audience === "all")?.status).toBe("queued");
  });
});

describe("1日の上限・時間帯", () => {
  it("1日の上限を超えて送らない", async () => {
    const { store, campaign } = seed(5);
    store.settings.dailyLimit = 2;
    const mail = new FakeMail();
    const deps = makeDeps(store, mail);
    await prepareCampaign(deps, campaign);
    await runSendBatch(deps);
    const second = await runSendBatch(deps);
    expect(mail.sent).toHaveLength(2);
    expect(second.skippedReason).toBe("daily_limit");
  });

  it("送ってよい時間帯（日本時間）の外では送らない", async () => {
    const { store, campaign } = seed(1);
    store.settings.sendHourStart = 10; // テストの時刻は 9:00 JST
    const mail = new FakeMail();
    await prepareCampaign(makeDeps(store, mail), campaign);
    expect((await runSendBatch(makeDeps(store, mail))).skippedReason).toBe("outside_window");
    expect(mail.sent).toHaveLength(0);
  });
});
