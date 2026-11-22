import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

import { isNextInternalError } from "@/lib/auth-client-error";
import { POST } from "@/app/api/auth/client-error/route";
import { NextRequest } from "next/server";

describe("isNextInternalError（#321 S5）", () => {
  it("redirect などの Next.js 内部エラーは失敗として扱わない", () => {
    expect(isNextInternalError({ digest: "NEXT_REDIRECT;replace;/subscription;307;" })).toBe(true);
    expect(isNextInternalError({ digest: "NEXT_NOT_FOUND" })).toBe(true);
  });
  it("通信エラーは失敗として扱う", () => {
    expect(isNextInternalError(new TypeError("Failed to fetch"))).toBe(false);
    expect(isNextInternalError(new Error("Server Action not found"))).toBe(false);
    expect(isNextInternalError(null)).toBe(false);
  });
});

describe("POST /api/auth/client-error", () => {
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  beforeEach(() => errorSpy.mockClear());

  const req = (body: unknown) =>
    new NextRequest("http://localhost/api/auth/client-error", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
    });

  it("登録の通信失敗をログに残し 204 を返す", async () => {
    const res = await POST(req({ type: "signup_request_failed", email: "a@example.com", message: "Failed to fetch" }));
    expect(res.status).toBe(204);
    const logged = JSON.parse(errorSpy.mock.calls[0][0] as string);
    expect(logged.type).toBe("signup_request_failed");
    expect(logged.path).toBe("/signup");
  });

  it("知らない種類は 400 で、ログに書かない", async () => {
    const res = await POST(req({ type: "anything", message: "x" }));
    expect(res.status).toBe(400);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("JSON でない本文は 400", async () => {
    const res = await POST(req("not-json"));
    expect(res.status).toBe(400);
  });

  it("長いメッセージは切り詰める", async () => {
    await POST(req({ type: "signup_request_failed", message: "x".repeat(5000) }));
    const logged = JSON.parse(errorSpy.mock.calls[0][0] as string);
    expect(logged.message.length).toBe(300);
  });
});
