import "server-only";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

/**
 * 試作の記事ページ（/dev/ai-research-lesson/a/[number]）に出す、記事の下書き（#319・試作だけ）。
 * 下書きの正は rebono の「AIリサーチではじめるUIデザイン」フォルダ。毎回そこから読むので、下書きを直せばすぐ反映される。
 * 下書きは11/14時点の番号（0-1〜3-3）で書かれている。今の番号（01-1〜04-2）との対応は DRAFT_MAP。
 */

const DRAFT_ROOT = "/Users/kaitakumi/Documents/01_BONO事業/01_Docs/rebono/AIリサーチではじめるUIデザイン";

/** 今の番号 → 下書きの番号（複数あるときは、その順に続けて出す） */
export const DRAFT_MAP: Record<string, string[]> = {
  "01-1": ["0-1"],
  "01-2": [],
  "02-1": ["1-3"],
  "02-2": ["1-4"],
  "02-3": ["1-5", "1-6"],
  "02-4": ["1-7", "1-8"],
  "03-1": ["2-2"],
  "03-2": ["2-3"],
  "03-3": ["2-4"],
  "03-4": ["2-5"],
  "04-1": ["3-2"],
  "04-2": [],
};

/** チャレンジの回は、案によって 04-2 だったり 04-3 だったりするので、種類で決める */
const CHALLENGE_DRAFTS = ["3-1", "3-3"];

export interface Draft {
  number: string;
  title: string;
  file: string;
  videoUrl?: string;
  videoDuration?: string;
  body: string;
}

function parse(raw: string): { meta: Record<string, string>; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const meta: Record<string, string> = {};
  if (m) {
    for (const line of m[1].split("\n")) {
      const i = line.indexOf(":");
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
    }
  }
  // 記事タイトル（# 行）はページの h1 と重なるので外す
  const body = (m ? raw.slice(m[0].length) : raw).replace(/^\s*# .*\n/, "");
  return { meta, body };
}

async function findFile(draftNumber: string): Promise<string | undefined> {
  const quests = (await readdir(DRAFT_ROOT)).filter((d) => d.startsWith("クエスト"));
  for (const q of quests) {
    const hit = (await readdir(path.join(DRAFT_ROOT, q))).find(
      (f) => f.startsWith(`${draftNumber}_`) && f.endsWith(".md") && !f.includes("_案"),
    );
    if (hit) return path.join(q, hit);
  }
  return undefined;
}

/** 読めなかった下書きは飛ばす（ページは落とさない） */
export async function loadDrafts(number: string, type?: string, drafts?: string[]): Promise<Draft[]> {
  const out: Draft[] = [];
  for (const n of type === "challenge" ? CHALLENGE_DRAFTS : (drafts ?? DRAFT_MAP[number] ?? [])) {
    try {
      const file = await findFile(n);
      if (!file) continue;
      const { meta, body } = parse(await readFile(path.join(DRAFT_ROOT, file), "utf8"));
      out.push({
        number: n,
        title: meta.title ?? file,
        file,
        videoUrl: meta.video_url || undefined,
        videoDuration: meta.video_duration || undefined,
        body,
      });
    } catch (e) {
      console.error("[ai-research-lesson] 下書きを読めませんでした", n, e);
    }
  }
  return out;
}
