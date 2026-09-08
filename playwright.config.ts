import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E 設定。
 *
 * baseURL は環境変数 E2E_BASE_URL で切替可能。
 * - 既定: 本番ベータ https://bono-training.vercel.app
 * - ドメイン移行後: E2E_BASE_URL=https://www.bo-no.design を渡せば同じスイートが回る
 *
 * 第1スイートは「書き込みの無い読み取り系」のみ（本番betaに対して副作用ゼロ）。
 * 認証が必要な会員フロー（投稿・課金・ai-chat 200系）は e2e/authenticated.spec.ts に
 * 骨子のみ置き、実行は次段（test.skip）。
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || "https://bono-training.vercel.app",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
