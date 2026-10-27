// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createHash } from "node:crypto";
import { createSyncSlackClient, hashEmail } from "@/lib/slack-member-sync/slack-api";
import { getSyncMessageBlockReason, renderSyncMessage, escapeMrkdwn } from "@/lib/slack-member-sync/messages/common";
import { LINK_REQUEST_MESSAGE } from "@/lib/slack-member-sync/messages/link-request";
import { REMOVAL_NOTICE_MESSAGE } from "@/lib/slack-member-sync/messages/removal-notice";
import { OWNER_REPORT_MESSAGE } from "@/lib/slack-member-sync/messages/owner-report";
import { MYPAGE_CONFIRM_MESSAGE } from "@/lib/slack-member-sync/messages/mypage-confirm";
import { hashToken, isPlausibleToken, linkUrl, newRawToken } from "@/lib/slack-member-sync/tokens";

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" }, ...init });

function client(fetchImpl: typeof fetch) {
  return createSyncSlackClient({ botToken: "xoxb-test", userToken: "xoxp-test", fetchImpl, timeoutMs: 50 });
}

describe("hashEmail", () => {
  it("SQL 関数と同じ md5(lower(trim(email)))", () => {
    expect(hashEmail("  Foo@Example.COM ")).toBe(createHash("md5").update("foo@example.com").digest("hex"));
  });
});

describe("Slack API クライアント（#263）", () => {
  it("users.list はボットトークン・limit=200・cursor で呼び、メールはハッシュにして返す", async () => {
    const fetchMock = vi.fn(async () =>
      json({
        ok: true,
        members: [
          {
            id: "U1",
            team_id: "T1",
            is_admin: true,
            is_owner: false,
            is_primary_owner: false,
            real_name: "本名",
            profile: { email: "A@example.com", display_name: "表示名", phone: "090" },
          },
          { id: "U2", deleted: true, profile: {} },
          { foo: "no id" },
        ],
        response_metadata: { next_cursor: "dXNlcjpVMDYx" },
      }),
    );
    const result = await client(fetchMock as unknown as typeof fetch).usersListPage("abc");
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://slack.com/api/users.list");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer xoxb-test");
    const params = new URLSearchParams(init.body as string);
    expect(params.get("limit")).toBe("200");
    expect(params.get("cursor")).toBe("abc");
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;
    expect(result.data.nextCursor).toBe("dXNlcjpVMDYx");
    expect(result.data.members).toHaveLength(2);
    const [m1, m2] = result.data.members;
    expect(m1).toMatchObject({ id: "U1", teamId: "T1", isAdmin: true, displayName: "表示名", emailHash: hashEmail("a@example.com") });
    expect(JSON.stringify(m1)).not.toContain("example.com");
    expect(JSON.stringify(m1)).not.toContain("090");
    expect(m2).toMatchObject({ id: "U2", deleted: true, emailHash: null, displayName: "U2" });
  });

  it("最後のページは next_cursor が空", async () => {
    const fetchMock = vi.fn(async () => json({ ok: true, members: [], response_metadata: { next_cursor: "" } }));
    const result = await client(fetchMock as unknown as typeof fetch).usersListPage(null);
    expect(result).toEqual({ kind: "ok", data: { members: [], nextCursor: null } });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(new URLSearchParams(init.body as string).has("cursor")).toBe(false);
  });

  it("users.list の 429 は rate_limited と Retry-After を返す", async () => {
    const fetchMock = vi.fn(async () => new Response("", { status: 429, headers: { "retry-after": "20" } }));
    expect(await client(fetchMock as unknown as typeof fetch).usersListPage(null)).toEqual({
      kind: "rate_limited",
      retryAfterSec: 20,
    });
  });

  it("users.lookupByEmail はボットトークンで呼ぶ。見つからなければ users_not_found", async () => {
    const fetchMock = vi.fn(async () => json({ ok: false, error: "users_not_found" }));
    const result = await client(fetchMock as unknown as typeof fetch).lookupByEmail(" x@example.com ");
    expect(result).toEqual({ kind: "slack_error", error: "users_not_found" });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://slack.com/api/users.lookupByEmail");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer xoxb-test");
    expect(new URLSearchParams(init.body as string).get("email")).toBe("x@example.com");
  });

  it("auth.test はユーザートークンで呼び、user_id / team_id / url を返す", async () => {
    const fetchMock = vi.fn(async () =>
      json({ ok: true, user_id: "U0OWNER", team_id: "T1", url: "https://bono.slack.com/", user: "kaikun" }),
    );
    const result = await client(fetchMock as unknown as typeof fetch).authTest();
    expect(result).toEqual({ kind: "ok", data: { userId: "U0OWNER", teamId: "T1", url: "https://bono.slack.com/" } });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://slack.com/api/auth.test");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer xoxp-test");
  });
});

describe("DM 本文", () => {
  it("すべて承認待ち（approved: false）で、承認されるまで送らない", () => {
    for (const m of [LINK_REQUEST_MESSAGE, REMOVAL_NOTICE_MESSAGE, OWNER_REPORT_MESSAGE, MYPAGE_CONFIRM_MESSAGE]) {
      expect(m.approved).toBe(false);
      expect(getSyncMessageBlockReason(m)).toBe("message_not_approved");
      // 承認すれば送れる形になっている（差し込みが本文にある）
      expect(getSyncMessageBlockReason({ ...m, approved: true })).toBeNull();
    }
  });

  it("差し込んで送る本文を作る", () => {
    const r = renderSyncMessage(
      { ...LINK_REQUEST_MESSAGE, approved: true },
      { link: "https://www.bo-no.design/slack/link?t=abc", deadline: "11月10日" },
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.text).toContain("<https://www.bo-no.design/slack/link?t=abc|BONOとつなぐ>");
    expect(r.text).toContain("11月10日までに");
  });

  it("差し込みが足りない・本文に差し込みが無い・https 以外のURLなら送らない", () => {
    const m = { ...LINK_REQUEST_MESSAGE, approved: true };
    expect(renderSyncMessage(m, { link: "https://x" })).toEqual({ ok: false, reason: "message_missing_value" });
    expect(getSyncMessageBlockReason({ ...m, text: "リンクなし {{deadline}}" })).toBe("message_missing_placeholder");
    expect(renderSyncMessage(m, { link: "http://localhost:3000/slack/link?t=a", deadline: "1月1日" })).toEqual({
      ok: false,
      reason: "message_non_https_url",
    });
    expect(getSyncMessageBlockReason({ ...m, text: "TBD {{link}} {{deadline}}" })).toBe("message_placeholder");
  });

  it("差し込む値に {{…}} があっても誤判定しない", () => {
    const r = renderSyncMessage(
      { ...OWNER_REPORT_MESSAGE, approved: true },
      { summary: "{{x}}", due_list: "a", review: "", admin_url: "https://bono.slack.com/admin" },
    );
    expect(r.ok).toBe(true);
  });

  it("escapeMrkdwn は & < > をエスケープする", () => {
    expect(escapeMrkdwn("<@U1> & co")).toBe("&lt;@U1&gt; &amp; co");
  });
});

describe("使い捨てリンク", () => {
  it("値は推測できない長さで、保存するのは sha256 のハッシュ", () => {
    const raw = newRawToken();
    expect(isPlausibleToken(raw)).toBe(true);
    expect(newRawToken()).not.toBe(raw);
    expect(hashToken(raw)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(raw)).toBe(createHash("sha256").update(raw).digest("hex"));
    expect(linkUrl("https://www.bo-no.design", raw)).toBe(`https://www.bo-no.design/slack/link?t=${raw}`);
  });

  it("形の違う値は弾く", () => {
    expect(isPlausibleToken("short")).toBe(false);
    expect(isPlausibleToken("a".repeat(43) + "/")).toBe(false);
    expect(isPlausibleToken(undefined)).toBe(false);
  });
});
