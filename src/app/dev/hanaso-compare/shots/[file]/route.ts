import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * /dev/hanaso-compare/shots/[file] — 変更点一覧（/dev/hanaso-compare/changes）用のスクショを返す（localhost 専用・#296）。
 * 画像は public/ に置くと本番に出てしまうため src/content/materials/ai-research-ui/hanaso-shots/ に置き、ここから読む。
 * 読み出し方は before.html/route.ts と同じ。本番では src/proxy.ts の DEV_ONLY_PATH_PREFIXES（"/dev"）で 404 になる
 * （Route Handler には dev/layout.tsx の assertNotProduction が効かないため、遮断は proxy のみ）。
 */
const SHOTS_DIR = join(
  process.cwd(),
  "src/content/materials/ai-research-ui/hanaso-shots"
);

// before-01.png / after-08b.png のような名前だけ通す（パストラバーサル防止）
const FILE_NAME = /^[a-z0-9-]+\.png$/;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  if (!FILE_NAME.test(file)) {
    return new Response("Not Found", { status: 404 });
  }
  let body: Buffer;
  try {
    body = await readFile(join(SHOTS_DIR, file));
  } catch {
    return new Response("Not Found", { status: 404 });
  }
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
