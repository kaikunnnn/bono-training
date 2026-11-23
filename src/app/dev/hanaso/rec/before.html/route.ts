import { buildRecHtml, REC_HEADERS } from "../_inject";

/**
 * /dev/hanaso/rec/before.html — ハナソ新規登録（ビフォー）の収録専用の画面（#296）。
 * 元HTMLは変えず、配信時に収録用のCSS・JSを差し込む（中身は ../_inject.ts）。
 * サイトのレイアウトを通さないため Route Handler で返す。書き方は /dev/hanaso-compare/before.html と同じ。
 * 本番では src/proxy.ts の DEV_ONLY_PATH_PREFIXES（"/dev"）で 404 になる。
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const html = await buildRecHtml("before");
  return new Response(html, { headers: REC_HEADERS });
}
