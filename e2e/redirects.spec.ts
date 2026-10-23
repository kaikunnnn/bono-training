import { test, expect, type APIRequestContext } from "@playwright/test";

/**
 * 恒久リダイレクト（next.config.ts redirects, permanent: true → 308）の回帰テスト。
 *
 * 「単一ホップ」の証明:
 *   1. maxRedirects:0 で旧URLを叩き、308 + location=新URL を確認
 *   2. 新URL自体を maxRedirects:0 で叩き、200 を確認（＝新URLはさらにリダイレクトしない）
 *
 * 第1ホップは config レベルなので slug の実在に依存しない。
 * 第2ホップ（destination が 200 か）でのみ実在 slug が効くため、
 * 既知 slug が 200 でなければ /lessons 等から実在 slug を1つ拾ってフォールバックする。
 */

async function assertSingleHop(
  request: APIRequestContext,
  from: string,
  to: string
) {
  const first = await request.get(from, { maxRedirects: 0 });
  expect(first.status(), `${from} should 308`).toBe(308);
  const location = first.headers()["location"];
  expect(location, `${from} location header`).toBe(to);
}

test("static redirect: /feedback-apply/guide → /how-to/feedback (single hop)", async ({
  request,
}) => {
  await assertSingleHop(request, "/feedback-apply/guide", "/how-to/feedback");
  // destination が自身でさらにリダイレクトしないこと（= 単一ホップ）
  const dest = await request.get("/how-to/feedback", { maxRedirects: 0 });
  expect(dest.status(), "/how-to/feedback should be 200").toBe(200);
});

test("dynamic redirect: /articles/:slug → /contents/:slug (single hop)", async ({
  request,
}) => {
  // 第1ホップは config レベルなので任意 slug で 308 する。
  // 実在 slug 候補を順に試し、destination が 200 になるものを検証に使う。
  const candidateSlugs = ["portfolima-basic", "ui-visual-basic", "figma-basic"];

  // まず第1ホップ（slug 非依存）を既知候補で確認。
  await assertSingleHop(
    request,
    `/articles/${candidateSlugs[0]}`,
    `/contents/${candidateSlugs[0]}`
  );

  // destination が 200 になる実在 slug を探す。
  let verified = false;
  for (const slug of candidateSlugs) {
    const dest = await request.get(`/contents/${slug}`, { maxRedirects: 0 });
    if (dest.status() === 200) {
      // 単一ホップ確認: /articles/<slug> → 308 → /contents/<slug> (200)
      await assertSingleHop(request, `/articles/${slug}`, `/contents/${slug}`);
      verified = true;
      break;
    }
  }

  // 既知候補が全滅した場合、公開ページから実在の /contents/ リンクを拾ってフォールバック。
  if (!verified) {
    const lessons = await request.get("/lessons");
    const html = await lessons.text();
    const match = html.match(/\/contents\/([a-z0-9-]+)/i);
    if (match) {
      const slug = match[1];
      const dest = await request.get(`/contents/${slug}`, { maxRedirects: 0 });
      expect(dest.status(), `/contents/${slug} should be 200`).toBe(200);
      await assertSingleHop(request, `/articles/${slug}`, `/contents/${slug}`);
      verified = true;
    }
  }

  expect(
    verified,
    "実在する /contents/:slug を1つも 200 で解決できなかった"
  ).toBe(true);
});
