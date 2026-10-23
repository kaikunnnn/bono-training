import { test, expect } from "@playwright/test";

/**
 * 認証ゲートの確認。
 *
 * 未認証で /mypage を開くと proxy が 307 で /login へ飛ばす
 * （実際の location は /login?redirectTo=%2Fmypage）。
 *
 * maxRedirects: 0 で「最初の1ホップ」を見る。最終URLだけを見ると、
 * 200 のページがクライアント側で /login へ遷移するような偽のリダイレクトでも合格してしまうため。
 * ログイン後に元のページへ戻れるよう、パスが /login で redirectTo=/mypage であることを見る。
 */

test("unauthenticated /mypage → 307 /login (1st hop)", async ({
  request,
  baseURL,
}) => {
  const res = await request.get("/mypage", { maxRedirects: 0 });
  expect(res.status(), "/mypage は 307 であるべき").toBe(307);

  const raw = res.headers()["location"];
  expect(raw, "/mypage の location ヘッダ").toBeTruthy();
  const location = new URL(raw, baseURL!);
  expect(location.origin, "location は同一 origin").toBe(
    new URL(baseURL!).origin
  );
  expect(location.pathname, "location のパス").toBe("/login");
  expect(location.searchParams.get("redirectTo"), "redirectTo").toBe("/mypage");
});
