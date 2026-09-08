import { test, expect } from "@playwright/test";

/**
 * 認証ゲート（DALパターン）の確認。
 *
 * 未認証で /mypage を開くと /login へ遷移する（getCurrentUser() が null → redirect）。
 * 実際のリダイレクト先は /login?reauth=1&redirectTo=/mypage だが、クエリ文字列は
 * 実装詳細なので /login への遷移だけを緩く assert する。
 */

test("unauthenticated /mypage redirects to /login", async ({ page }) => {
  await page.goto("/mypage");
  await expect(page).toHaveURL(/\/login/);
});
