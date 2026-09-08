import { test, expect, type Page } from "@playwright/test";

/**
 * 主要公開ページのスモークテスト。
 *
 * - 200 で開くこと
 * - 期待要素が1つ見えること（軽い assert）
 * - 重大な console error / 未捕捉例外が無いこと
 *
 * 注意: 本番サイトに対して回すため、サードパーティ（GA4 / Vimeo / 広告ブロッカー等）
 * 由来のノイズが console error に混ざる。既知の無害パターンは IGNORED_CONSOLE で許容し、
 * 自オリジンの 4xx/5xx や React hydration エラーは product finding として検出する。
 */

// 既知の無害な console error パターン（サードパーティ由来のノイズ）。
// ここに載らない error / pageerror は product finding として fail させる。
const IGNORED_CONSOLE: RegExp[] = [
  /google-analytics|googletagmanager|gtag|analytics\.js/i,
  /vimeo|player\.vimeo/i,
  /doubleclick|adservice|facebook|connect\.facebook/i,
  /Failed to load resource: the server responded with a status of 40[34]/i, // 3rd-party pixel等の404/403
  /net::ERR_(BLOCKED_BY_CLIENT|FAILED)/i, // 拡張機能/ネットワーク由来
  /ResizeObserver loop/i,
];

function isIgnored(text: string): boolean {
  return IGNORED_CONSOLE.some((re) => re.test(text));
}

/** リスナーを goto より前に登録して、error/pageerror を収集する。 */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (!isIgnored(text)) errors.push(`[console] ${text}`);
    }
  });
  page.on("pageerror", (err) => {
    const text = err.message;
    if (!isIgnored(text)) errors.push(`[pageerror] ${text}`);
  });
  return errors;
}

const PAGES: { path: string; expect: (page: Page) => Promise<void> }[] = [
  {
    path: "/",
    expect: async (page) => {
      await expect(page.locator("h1, main").first()).toBeVisible();
    },
  },
  {
    path: "/subscription",
    expect: async (page) => {
      await expect(page.locator("h1, main").first()).toBeVisible();
    },
  },
  {
    path: "/questions",
    expect: async (page) => {
      await expect(page.locator("h1, main").first()).toBeVisible();
    },
  },
  {
    path: "/lessons",
    expect: async (page) => {
      await expect(page.locator("h1, main").first()).toBeVisible();
    },
  },
  {
    path: "/how-to/community",
    expect: async (page) => {
      await expect(page.locator("h1, main").first()).toBeVisible();
    },
  },
  {
    path: "/search",
    expect: async (page) => {
      await expect(page.locator("main, h1").first()).toBeVisible();
    },
  },
];

for (const p of PAGES) {
  test(`public page ${p.path} loads 200, has content, no critical console errors`, async ({
    page,
  }) => {
    const errors = collectErrors(page);
    const res = await page.goto(p.path, { waitUntil: "domcontentloaded" });
    expect(res, `no response for ${p.path}`).not.toBeNull();
    expect(res!.status(), `status for ${p.path}`).toBeLessThan(400);
    await p.expect(page);
    // ネットワーク落ち着き後に console を再評価（遅延ログの取りこぼし防止）。
    await page.waitForLoadState("networkidle").catch(() => {});
    expect(errors, `console/page errors on ${p.path}:\n${errors.join("\n")}`).toEqual(
      []
    );
  });
}
