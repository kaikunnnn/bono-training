import { NextResponse, type NextRequest } from "next/server";
import {
  LEGACY_ONLY_CONTENT_SLUGS,
  GUIDE_REDIRECT_MAP,
} from "@/lib/migration/legacy-only-content-slugs";

/**
 * 軽量化された proxy（Next.js 16 で middleware.ts から改名。役割は同じ）
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

// /subscription は含めない: プラン紹介ページは未ログインでも見せる（権限モーダルの
// 「メンバー登録へ」の遷移先）。決済ボタン押下時は PlanCard 側が /login へ誘導する
//
// /feedback-apply, /how-to/feedback（旧 /feedback-apply/guide・使い方系へ移動）も含めない:
// フィードバック説明・応募案内ページは
// 未ログインでも見せる（プラン紹介ページと同じ理由）。実際の応募フォームである
// /feedback-apply/submit のみ保護する（page 側でも reauth=1 付きで /login へ誘導している）
const PROTECTED_PATH_PREFIXES = [
  "/mypage",
  "/account",
  "/profile",
  "/settings",
  "/feedback-apply/submit",
];

const AUTH_PAGE_PATHS = ["/login", "/signup"];

// --- サイト移行 #198 / 226本救済 -------------------------------------------
// 本番ドメイン判定。ポート付き host（開発時等）にも耐えるよう split(":")[0] で正規化。
// redirectMissingContent / next.config.ts の fallback rewrite と同じ条件に揃える。
const PRODUCTION_HOST_PATTERN = /^(www\.)?bo-no\.design$/;
const LEGACY_ORIGIN = "https://legacy.bo-no.design";

/**
 * 旧 Webflow の /contents/{slug}（新 Sanity 未移植の 226本）を救済する。
 * 該当すれば救済用の NextResponse を返し、非該当なら null（＝以降の通常処理へ委譲）。
 *
 * なぜ proxy 側で静的リストを持つか:
 * ページ側 redirectMissingContent は本番 sitemap を都度 fetch して判定するが、
 * ドメイン切替後は www.bo-no.design 自体がこの Next.js アプリになり、fetch 先が
 * 「自分自身の Sanity 限定 sitemap」となって 226本を拾えなくなる（自己参照で機能不全）。
 * そこでルーティングより前段の proxy で静的リストを判定して確実に救済する。
 *
 * 3分岐（いずれも host 条件が前提。実在 499本は全分岐に該当せず null で素通し）:
 *  ① GUIDE_REDIRECT_MAP に含まれる 5本
 *     → 新サイトの実在 /guide/{slug} へ 308 恒久リダイレクト（新サイト内へ誘導）
 *  ② LEGACY_ONLY_CONTENT_SLUGS に含まれる 221本
 *     → legacy.bo-no.design へ rewrite（プロキシ・URL 据え置きで SEO 一貫性維持）
 *  ③ それ以外 → null（実在 499本 or 未知 slug は素通し。未知は page 側で notFound）
 *
 * host 条件（(www.)?bo-no.design のみ発火）は必須。無いと beta ドメインでも発動し、
 * ①の /guide への恒久リダイレクトや②の legacy 経由 Webflow 遷移が本番切替前に暴発する。
 */
function rescueLegacyContent(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  const match = /^\/contents\/([^/]+)\/?$/.exec(pathname);
  if (!match) return null;

  const slug = decodeURIComponent(match[1]);

  // slug がどの救済対象でもなければ即素通し（Set/Map ルックアップのみで軽量）。
  const guideTarget = GUIDE_REDIRECT_MAP.get(slug);
  const isLegacy = LEGACY_ONLY_CONTENT_SLUGS.has(slug);
  if (!guideTarget && !isLegacy) return null;

  // ここから先は救済対象。host が本番ドメインのときのみ発火（切替前は素通し）。
  const host = (request.headers.get("host") ?? "").split(":")[0];
  if (!PRODUCTION_HOST_PATTERN.test(host)) return null;

  // ① 新サイトの /guide/{slug} へ 308 恒久リダイレクト。
  if (guideTarget) {
    return NextResponse.redirect(new URL(guideTarget, request.url), 308);
  }

  // ② legacy.bo-no.design へ rewrite（プロキシ）。
  const target = new URL(`${LEGACY_ORIGIN}${pathname}${request.nextUrl.search}`);
  return NextResponse.rewrite(target);
}

/**
 * Supabase auth cookie が存在するかチェック
 * @supabase/ssr が設定する `sb-{project-ref}-auth-token` を探す。
 * セッションが大きい場合は `...-auth-token.0` `...-auth-token.1` に分割保存される
 * ため、endsWith ではなく includes で判定する
 */
function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")
    );
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // サイト移行 #198: legacy 専用 226本の /contents/{slug} を最優先で救済（プロキシ）。
  // 認証判定より前に行う（/contents/* は認証状態で挙動が変わらないため副作用なし）。
  const rescued = rescueLegacyContent(request);
  if (rescued) return rescued;

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
  //
  // ただし `reauth=1` が付いている場合はリダイレクトしない。
  // ここは cookie の「存在」しか見ていないため、無効な cookie（ローカルDBリセットで
  // ユーザー消滅・refresh token 失効等）でも「ログイン済み」と判定してしまう。
  // その状態で保護ページ側（getCurrentUser = 本物の検証）が /login に差し戻すと、
  // /login → /mypage → /login … の無限リダイレクトループになる。
  // 保護ページからの差し戻しには reauth=1 を付け、ログイン画面を必ず表示させて
  // ループを構造的に断ち切る（ログイン画面側で stale cookie を signOut で掃除する）。
  const isAuthPage = AUTH_PAGE_PATHS.includes(pathname);
  const isReauth = request.nextUrl.searchParams.get("reauth") === "1";
  if (hasAuth && isAuthPage && !isReauth) {
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
    "/feedback-apply/submit",
    "/login",
    "/signup",
    // サイト移行 #198 / 226本救済: legacy 専用 /contents/{slug} をプロキシするため。
    // Set 非該当 slug は proxy 内で即 next() 相当（rescue が null → 通常処理）＝素通し。
    "/contents/:path*",
  ],
};
