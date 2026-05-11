import { NextResponse, type NextRequest } from "next/server";

/**
 * 軽量化された middleware
 *
 * BON-325 で改修。 旧実装は全ページに対して `supabase.auth.getUser()` を呼んでおり
 * Supabase API 往復で TTFB に ~200-300ms 上乗せしていた。
 *
 * 改善:
 * 1. matcher を「認証状態で挙動が変わるページ」のみに限定 → 公開ページは middleware を通らない
 * 2. middleware では Supabase の auth cookie の存在確認のみ → API 呼び出しゼロ
 *
 * セキュリティ:
 * - 真の認証検証は page level の `getCurrentUser()` で行われるため、middleware で
 *   token を厳密検証しなくても安全（偽 token は page level で弾かれる）
 * - middleware は「未ログインなら /login にリダイレクト」「ログイン済みなら /login → /mypage」
 *   というルーティング判定のみを担当
 *
 * 注意:
 * - 旧 middleware は `supabase.auth.getUser()` 呼び出しで token の自動 refresh も行っていた
 * - 新実装ではこれを行わないため、token expire 後は page level の getCurrentUser で再ログイン誘導
 * - 通常 token は数日有効なので、定期アクセスがあるユーザーには影響軽微
 */

const PROTECTED_PATH_PREFIXES = [
  "/mypage",
  "/account",
  "/profile",
  "/settings",
  "/subscription",
  "/feedback-apply",
];

const AUTH_PAGE_PATHS = ["/login", "/signup"];

/**
 * Supabase auth cookie が存在するかチェック
 * @supabase/ssr が設定する `sb-{project-ref}-auth-token` を探す
 */
function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")
    );
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasAuth = hasSupabaseAuthCookie(request);

  // 1. 未ログインで保護されたページ → /login へ
  const isProtectedRoute = PROTECTED_PATH_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (!hasAuth && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // 2. ログイン済みで認証ページ → /mypage (or redirectTo) へ
  const isAuthPage = AUTH_PAGE_PATHS.includes(pathname);
  if (hasAuth && isAuthPage) {
    const redirectTo =
      request.nextUrl.searchParams.get("redirectTo") || "/mypage";
    const url = request.nextUrl.clone();
    url.pathname = redirectTo;
    url.searchParams.delete("redirectTo");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  /**
   * matcher で指定したパスのみ middleware を実行
   * 公開ページ (/lessons, /blog, /roadmap 等) は middleware を通らない → TTFB 短縮
   */
  matcher: [
    "/mypage/:path*",
    "/account/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/subscription/:path*",
    "/feedback-apply/:path*",
    "/login",
    "/signup",
  ],
};
