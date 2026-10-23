import { test, expect } from "@playwright/test";
import { MEMBER_STORAGE_STATE } from "./helpers/auth";

/**
 * 認証フロー E2E（骨子のみ・次段で実行）。
 *
 * ⚠️ 全て test.skip。第1スイートは読み取り系のみ（副作用ゼロ）のため、
 *    投稿・ai-chat 実行を伴うこれらは次段で有効化する。
 *
 * 前提（次段で用意する）:
 *   - env: E2E_MEMBER_EMAIL / E2E_MEMBER_PASSWORD
 *       … 課金アクティブ（is_active=true, 対象 environment）なテスト会員
 *   - グローバルセットアップで helpers/auth.ts の loginAsMember を実行し、
 *     セッションを e2e/.auth/member.json（= MEMBER_STORAGE_STATE）に保存する
 *   - 本 spec は test.use({ storageState: MEMBER_STORAGE_STATE }) で
 *     ログイン済みセッションを読み込む
 *
 * 注意（副作用）:
 *   - feedback 投稿は Slack 通知 & DB 書き込みを伴う。
 *     本番betaでは実行しない or テスト用の隔離先を用意すること。
 *   - ai-chat は Groq/Sanity の従量課金を消費する（レート制限あり: 30/h）。
 */

test.use({ storageState: MEMBER_STORAGE_STATE });

test.describe("authenticated member flows (次段で有効化)", () => {
  test.skip(true, "次段: テスト会員セッション・書き込み隔離が整うまで skip");

  test("ai-chat: 課金メンバーは 403 にならず 200 で応答が返る", async ({
    request,
  }) => {
    // 骨子:
    //   1. storageState から Supabase アクセストークンを取り出し Bearer に載せる
    //      （/api/ai-chat は Authorization: Bearer <supabase access_token> を要求）
    //   2. POST /api/ai-chat { messages:[{role:"user",content:"UIの基礎を教えて"}] }
    //   3. status が 401/403 でないこと（= メンバー限定ゲートを通過）
    const res = await request.post("/api/ai-chat", {
      data: { messages: [{ role: "user", content: "hi" }] },
      // headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(res.status()).not.toBe(403);
    expect(res.status()).not.toBe(401);
  });

  test("feedback: 課金メンバーはフィードバック投稿が通る", async ({ page }) => {
    // 骨子:
    //   1. ログイン済みで応募/投稿ページを開く
    //   2. 必須項目を入力して送信
    //   3. 成功表示（完了トースト / 完了画面）を assert
    //   ※ 本番betaでは書き込み隔離が前提。実行環境を分けること。
    await page.goto("/feedback-apply");
    await expect(page.locator("main").first()).toBeVisible();
  });
});
