import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/subscription";

/**
 * #259 レッスン「AIリサーチではじめるUIデザイン」の題材プロト（語学交換SNSの想像版の新規登録）。
 * ログインしている人だけに見せるため、public/ ではなく Route Handler から HTML を返す。
 * 元の HTML は src/content/materials/ai-research-ui/hanaso-signup.html。
 */
const HTML_PATH = join(
  process.cwd(),
  "src/content/materials/ai-research-ui/hanaso-signup.html"
);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 認証の正は getCurrentUser（Supabase に問い合わせて検証する）。cookie の有無だけでは判定しない
  const user = await getCurrentUser();
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    // reauth=1: 無効な cookie が残っていても /login → /mypage へ飛ばされないようにする（proxy.ts 参照）
    url.searchParams.set("reauth", "1");
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const html = await readFile(HTML_PATH, "utf8");
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // ログインした人にだけ返すページなので、CDN やブラウザの共有キャッシュに残さない
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
