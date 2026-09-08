import { test, expect } from "@playwright/test";

/**
 * セキュリティ回帰テスト（最重要）。
 *
 * 先日入れた本番セキュリティ変更を守る回帰テスト:
 * - /api/ai-chat, /api/feedback-apply/submit … メンバー限定（無認証は 401）
 * - /api/cron/*                              … CRON_SECRET Bearer 検証（fail-closed）
 *
 * 全て「認証されていないリクエストは拒否される」ことの確認＝副作用ゼロ。
 */

test.describe("API auth gates (unauthenticated must be rejected)", () => {
  test("POST /api/ai-chat without auth → 401", async ({ request }) => {
    const res = await request.post("/api/ai-chat", {
      data: { messages: [{ role: "user", content: "hi" }] },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/feedback-apply/submit without auth → 401", async ({
    request,
  }) => {
    const res = await request.post("/api/feedback-apply/submit", {
      data: {},
    });
    expect(res.status()).toBe(401);
  });

  // cron 3 本: 認証なし & 誤った Bearer の両方で 401（fail-closed の検証）。
  const cronRoutes = [
    "/api/cron/sanity-health",
    "/api/cron/storage-usage",
    "/api/cron/onboarding-funnel",
  ];

  for (const route of cronRoutes) {
    test(`GET ${route} without auth → 401`, async ({ request }) => {
      const res = await request.get(route);
      expect(res.status()).toBe(401);
    });

    test(`GET ${route} with wrong Bearer → 401`, async ({ request }) => {
      const res = await request.get(route, {
        headers: { authorization: "Bearer wrong-secret" },
      });
      expect(res.status()).toBe(401);
    });
  }
});
