import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * /dev/hanaso/slides.html — ハナソ動画（#296）のスライド（1枚 1920×1080）。
 * サイトのレイアウトを通さないため Route Handler で単体のHTMLを返す（rec/*.html と同じ）。
 * 中身は src/content/materials/ai-research-ui/hanaso-slides.html。← → で前後、G で一覧、F で全画面。
 * 本番では src/proxy.ts の DEV_ONLY_PATH_PREFIXES（"/dev"）で 404 になる。
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HTML_PATH = "src/content/materials/ai-research-ui/hanaso-slides.html";

export async function GET() {
  const html = await readFile(join(process.cwd(), HTML_PATH), "utf8");
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
