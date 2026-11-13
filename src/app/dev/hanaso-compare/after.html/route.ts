import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * /dev/hanaso-compare/after.html — ハナソ新規登録プロトのアフター版を、ログインなしで返す（localhost 専用・#296）。
 * 読み出し方は src/app/materials/ai-research-ui/hanaso-signup.html/route.ts と同じで、認証だけ外している。
 * 本番では src/proxy.ts の DEV_ONLY_PATH_PREFIXES（"/dev"）で 404 になる
 * （Route Handler には dev/layout.tsx の assertNotProduction が効かないため、遮断は proxy のみ）。
 */
const HTML_PATH = join(
  process.cwd(),
  "src/content/materials/ai-research-ui/hanaso-signup-after.html"
);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const html = await readFile(HTML_PATH, "utf8");
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
