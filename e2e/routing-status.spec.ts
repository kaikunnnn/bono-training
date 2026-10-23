import { test, expect, type APIResponse } from "@playwright/test";
import {
  ROUTE_EXPECTATIONS,
  REGION_EXPECTATION,
  HTML_MUST_NOT_CONTAIN,
  headersFor,
  type RouteExpectation,
} from "./fixtures/routing-expectations";

/**
 * 本番ルーティングの回帰テスト（#258）。
 *
 * - 期待値は e2e/fixtures/routing-expectations.json に集約（ここに URL を書き足さない）
 * - redirects.spec.ts の assertSingleHop と同じく maxRedirects: 0 で「最初の1ホップ」だけを見る。
 *   最終URLだけを見ると、偽のリダイレクトやクライアント側遷移でも合格してしまうため
 * - ダミー auth cookie は proxy の「cookie 名があるか」判定だけを通すためのもの。
 *   本物のセッションではないので、ページ側の認証では未ログイン扱いになる
 * - GET のみ。本番への書き込みは無い
 */

/** location ヘッダを「パス＋クエリ」に揃える（同一 origin の絶対URLは origin を落とす） */
function normalizeLocation(location: string, baseURL: string): string {
  const resolved = new URL(location, baseURL);
  if (resolved.origin !== new URL(baseURL).origin) return location;
  return `${resolved.pathname}${resolved.search}`;
}

function assertStatus(res: APIResponse, exp: RouteExpectation) {
  const status = res.status();
  const label = `${exp.path} (cookie=${exp.cookie})`;
  if (exp.expectStatus === "3xx") {
    expect(
      status >= 300 && status < 400,
      `${label} は 3xx であるべき（実際: ${status}）`
    ).toBe(true);
  } else {
    expect(status, `${label} のステータス`).toBe(exp.expectStatus);
  }
}

function isVercelTarget(baseURL: string): boolean {
  const host = new URL(baseURL).hostname;
  return /(^|\.)bo-no\.design$/.test(host) || host.endsWith(".vercel.app");
}

test.describe("routing status (1st hop)", () => {
  for (const exp of ROUTE_EXPECTATIONS) {
    const title = `${exp.id}: ${exp.path} cookie=${exp.cookie} → ${exp.expectStatus}${
      exp.expectLocation ? ` ${exp.expectLocation}` : ""
    }${exp.expectLocationPrefix ? ` ${exp.expectLocationPrefix}…` : ""}`;

    test(title, async ({ request, baseURL }) => {
      // 既知の問題: 今は失敗するのが正しい。直ると「想定外の成功」で赤になり知らせてくれる
      test.fail(!!exp.knownIssue, exp.knownIssue);

      const res = await request.get(exp.path, {
        maxRedirects: 0,
        headers: headersFor(exp.cookie),
      });
      assertStatus(res, exp);

      if (exp.expectLocation || exp.expectLocationPrefix) {
        const raw = res.headers()["location"];
        expect(raw, `${exp.path} の location ヘッダ`).toBeTruthy();
        const location = normalizeLocation(raw, baseURL!);
        if (exp.expectLocation) {
          expect(location, `${exp.path} の location`).toBe(exp.expectLocation);
        }
        if (exp.expectLocationPrefix) {
          expect(
            location.startsWith(exp.expectLocationPrefix),
            `${exp.path} の location は ${exp.expectLocationPrefix} で始まるべき（実際: ${location}）`
          ).toBe(true);
        }
      }
    });
  }
});

test(`region: ${REGION_EXPECTATION.path} は ${REGION_EXPECTATION.expectRegion} で処理される`, async ({
  request,
  baseURL,
}) => {
  test.skip(
    !isVercelTarget(baseURL!),
    "x-vercel-id は Vercel / bo-no.design 向けの実行時のみ"
  );

  const res = await request.get(REGION_EXPECTATION.path, {
    maxRedirects: 0,
    headers: headersFor(REGION_EXPECTATION.cookie),
  });
  expect(res.status(), `${REGION_EXPECTATION.path} のステータス`).toBe(200);
  const vercelId = res.headers()["x-vercel-id"] ?? "";
  expect(
    vercelId,
    `x-vercel-id に ::${REGION_EXPECTATION.expectRegion}:: が含まれるべき`
  ).toContain(`::${REGION_EXPECTATION.expectRegion}::`);
});

test.describe("HTML に含まれてはいけない文字列", () => {
  for (const item of HTML_MUST_NOT_CONTAIN) {
    test(`${item.path} (cookie=${item.cookie}) に ${item.text} が無い`, async ({
      request,
    }) => {
      const res = await request.get(item.path, {
        maxRedirects: 0,
        headers: headersFor(item.cookie),
      });
      expect(res.status(), `${item.path} のステータス`).toBe(200);
      const html = await res.text();
      expect(html, `${item.path} の HTML`).not.toContain(item.text);
    });
  }
});
