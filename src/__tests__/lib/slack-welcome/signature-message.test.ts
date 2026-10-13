import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { signSlackRequest, verifySlackSignature } from "@/lib/slack-welcome/signature";
import {
  WELCOME_MESSAGE,
  allUrlsAreHttps,
  getApprovedMessage,
  getMessageBlockReason,
} from "@/lib/slack-welcome/message";

const SECRET = "8f742231b10e8888abcd99yyyzzz85a5";
const NOW_MS = Date.UTC(2026, 9, 12, 3, 0, 0);
const TS = String(Math.floor(NOW_MS / 1000));
const BODY = JSON.stringify({ type: "event_callback", team_id: "T0BONO" });

function verify(overrides: Partial<Parameters<typeof verifySlackSignature>[0]> = {}) {
  return verifySlackSignature({
    signingSecret: SECRET,
    timestampHeader: TS,
    signatureHeader: signSlackRequest(SECRET, TS, BODY),
    rawBody: Buffer.from(BODY),
    nowMs: NOW_MS,
    ...overrides,
  });
}

describe("verifySlackSignature", () => {
  it("正しい署名を受け入れる", () => {
    expect(verify()).toEqual({ ok: true });
  });

  it("別の secret で作った署名は拒否する", () => {
    expect(verify({ signatureHeader: signSlackRequest("other-secret", TS, BODY) })).toEqual({
      ok: false,
      reason: "bad_signature",
    });
  });

  it("本文が改変されていたら拒否する", () => {
    expect(verify({ rawBody: Buffer.from(BODY.replace("T0BONO", "T0EVIL")) })).toEqual({
      ok: false,
      reason: "bad_signature",
    });
  });

  it("タイムスタンプが5分超ずれていたら拒否する（リプレイ対策）", () => {
    const old = String(Number(TS) - 301);
    expect(verify({ timestampHeader: old, signatureHeader: signSlackRequest(SECRET, old, BODY) })).toEqual({
      ok: false,
      reason: "stale_timestamp",
    });
    const future = String(Number(TS) + 301);
    expect(
      verify({ timestampHeader: future, signatureHeader: signSlackRequest(SECRET, future, BODY) }).ok,
    ).toBe(false);
  });

  it("5分以内なら受け入れる", () => {
    const recent = String(Number(TS) - 299);
    expect(verify({ timestampHeader: recent, signatureHeader: signSlackRequest(SECRET, recent, BODY) }).ok).toBe(
      true,
    );
  });

  it("ヘッダー欠落・長さ違いの署名は拒否する", () => {
    expect(verify({ signatureHeader: null }).ok).toBe(false);
    expect(verify({ timestampHeader: null }).ok).toBe(false);
    expect(verify({ signatureHeader: "v0=abc" }).ok).toBe(false);
    expect(verify({ timestampHeader: "not-a-number" }).ok).toBe(false);
  });
});

describe("welcome message", () => {
  it("現在の本文は未承認なので送れない", () => {
    expect(WELCOME_MESSAGE.approved).toBe(false);
    expect(getApprovedMessage()).toBeNull();
  });

  it("未承認・空・TBD・https 以外のURLは送らない", () => {
    const ok = { version: 1, approved: true, text: "ようこそ <https://www.bo-no.design|BONO>" };
    expect(getMessageBlockReason(ok)).toBeNull();
    expect(getApprovedMessage(ok)).toEqual({ version: 1, text: ok.text });
    expect(getMessageBlockReason({ ...ok, approved: false })).toBe("message_not_approved");
    expect(getMessageBlockReason({ ...ok, text: "   " })).toBe("message_empty");
    expect(getMessageBlockReason({ ...ok, text: "ようこそ TBD" })).toBe("message_placeholder");
    expect(getMessageBlockReason({ ...ok, text: "見てね http://example.com" })).toBe("message_non_https_url");
    expect(getMessageBlockReason({ ...ok, text: "見てね <http://example.com|ガイド>" })).toBe(
      "message_non_https_url",
    );
    expect(getMessageBlockReason({ ...ok, version: 0 })).toBe("message_invalid_version");
  });

  it("ユーザー・チャンネル参照は URL として扱わない", () => {
    expect(allUrlsAreHttps("<#C0INTRO> で自己紹介してね <@U0KAI> より")).toBe(true);
    expect(allUrlsAreHttps("<javascript:alert(1)|x>")).toBe(false);
    expect(allUrlsAreHttps("<mailto:a@example.com|mail>")).toBe(false);
  });
});
