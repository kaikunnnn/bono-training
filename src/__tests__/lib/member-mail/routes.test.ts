// @vitest-environment node
// ワンクリック配信停止（RFC 8058）と Resend webhook の受け口。
import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("server-only", () => ({}));
import { Webhook } from "standardwebhooks";
import { NextRequest } from "next/server";
import { createUnsubscribeToken } from "@/lib/member-mail/unsubscribe-token";
import { handleResendEvent, sanitizeLinkPath } from "@/lib/member-mail/webhook";
import { verifyResendWebhook } from "@/lib/member-mail/webhook-verify";
import { MemStore, SECRET, uid } from "./helpers";

const store = new MemStore();
vi.mock("@/lib/member-mail/runtime", () => ({
  getMailStore: () => store,
  getUnsubscribeSecret: () => SECRET,
}));
vi.mock("@/lib/member-mail/ops-alert", () => ({ notifyMailOps: async () => {} }));

const WEBHOOK_SECRET = `whsec_${Buffer.from("0123456789abcdef0123456789abcdef").toString("base64")}`;

function signed(body: object, id = "msg_1") {
  const raw = JSON.stringify(body);
  const ts = new Date();
  const signature = new Webhook(WEBHOOK_SECRET).sign(id, ts, raw);
  return { raw, headers: { "svix-id": id, "svix-timestamp": String(Math.floor(ts.getTime() / 1000)), "svix-signature": signature } };
}

beforeEach(() => {
  store.unsubscribes.clear();
  store.suppressed.clear();
  store.webhookIds.clear();
  store.deliveries = [];
  store.settings.mode = "all";
  vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("POST /api/mail/unsubscribe（ワンクリック）", () => {
  it("ログインなしの POST ですぐ止まる（お知らせ系の全カテゴリ）", async () => {
    const { POST } = await import("@/app/api/mail/unsubscribe/route");
    const t = createUnsubscribeToken(SECRET, uid(1), "notice");
    const req = new NextRequest(`https://www.bo-no.design/api/mail/unsubscribe?t=${encodeURIComponent(t)}`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "List-Unsubscribe=One-Click",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(await store.listStoppedCategories(uid(1))).toEqual(["notice", "comeback", "signup", "winback"]);
    expect(store.unsubscribes.get(`${uid(1)}:notice`)?.method).toBe("one_click");
  });

  it("偽のトークンは 400 で何も止めない", async () => {
    const { POST } = await import("@/app/api/mail/unsubscribe/route");
    const t = createUnsubscribeToken(`${SECRET}-other`, uid(1), "notice");
    const res = await POST(
      new NextRequest(`https://www.bo-no.design/api/mail/unsubscribe?t=${encodeURIComponent(t)}`, { method: "POST" }),
    );
    expect(res.status).toBe(400);
    expect(store.unsubscribes.size).toBe(0);
  });

  it("GET の受け口は無い（GET では止めない）", async () => {
    const mod = (await import("@/app/api/mail/unsubscribe/route")) as Record<string, unknown>;
    expect(mod.GET).toBeUndefined();
  });
});

describe("Resend webhook", () => {
  it("正しい署名だけ通す", () => {
    const { raw, headers } = signed({ type: "email.opened", data: { email_id: "re_1" } });
    const h = { id: headers["svix-id"], timestamp: headers["svix-timestamp"], signature: headers["svix-signature"] };
    expect(verifyResendWebhook(raw, h, WEBHOOK_SECRET)).toMatchObject({ type: "email.opened" });
    expect(verifyResendWebhook(raw.replace("re_1", "re_2"), h, WEBHOOK_SECRET)).toBeNull();
    expect(verifyResendWebhook(raw, { ...h, signature: null }, WEBHOOK_SECRET)).toBeNull();
  });

  it("route: 署名が違えば 401。正しければ開いた・押したを記録し、同じ番号は2回数えない", async () => {
    process.env.RESEND_WEBHOOK_SECRET = WEBHOOK_SECRET;
    const { POST } = await import("@/app/api/mail/resend-webhook/route");
    await store.insertDeliveries([
      { campaignId: "c-1", userId: uid(1), kind: "weekly", category: "notice", audience: "all", contentVersion: 1 },
    ]);
    store.deliveries[0].resendEmailId = "re_1";

    const bad = await POST(
      new NextRequest("https://www.bo-no.design/api/mail/resend-webhook", {
        method: "POST",
        headers: { "svix-id": "x", "svix-timestamp": "1", "svix-signature": "v1,AAAA" },
        body: "{}",
      }),
    );
    expect(bad.status).toBe(401);

    const body = {
      type: "email.clicked",
      created_at: "2026-11-09T00:00:00Z",
      data: { email_id: "re_1", to: ["member1@example.invalid"], click: { link: "https://www.bo-no.design/a?from=email_weekly" } },
    };
    for (let i = 0; i < 2; i++) {
      const { raw, headers } = signed(body, "msg_click");
      const res = await POST(
        new NextRequest("https://www.bo-no.design/api/mail/resend-webhook", { method: "POST", headers, body: raw }),
      );
      expect(res.status).toBe(200);
    }
    expect(store.deliveries[0].clickCount).toBe(1);
  });

  it("迷惑メール報告で以後送らない＋全体のスイッチを止める。届かなかったも以後送らない", async () => {
    await store.insertDeliveries([
      { campaignId: "c-1", userId: uid(1), kind: "weekly", category: "notice", audience: "all", contentVersion: 1 },
      { campaignId: "c-1", userId: uid(2), kind: "weekly", category: "notice", audience: "all", contentVersion: 1 },
    ]);
    store.deliveries[0].resendEmailId = "re_a";
    store.deliveries[1].resendEmailId = "re_b";
    const deps = { store, notifyOps: async () => {}, now: () => new Date() };
    expect(await handleResendEvent(deps, "w1", { type: "email.bounced", data: { email_id: "re_a" } })).toBe("suppressed");
    expect(store.settings.mode).toBe("all");
    expect(await handleResendEvent(deps, "w2", { type: "email.complained", data: { email_id: "re_b" } })).toBe(
      "suppressed",
    );
    expect(store.settings.mode).toBe("off");
    expect([...store.suppressed.keys()].sort()).toEqual([uid(1), uid(2)]);
    expect(await handleResendEvent(deps, "w3", { type: "email.sent", data: { email_id: "re_a" } })).toBe("ignored");
  });

  it("押されたリンクはパスと from だけ残す", () => {
    expect(sanitizeLinkPath("https://www.bo-no.design/a/b?from=email_weekly&token=secret")).toBe(
      "www.bo-no.design/a/b?from=email_weekly",
    );
    expect(sanitizeLinkPath("https://www.bo-no.design/a?u=member1@example.invalid")).toBe("www.bo-no.design/a");
  });
});
