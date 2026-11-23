/**
 * rebono 279-C 組1-4 AI時代の将来性の記事（/guide/ai-uiuxdesign-future）に3ブロックを足す（Sanity 本番データ）。
 * 既定は DRY RUN（読むだけ）。
 *
 *   npx tsx scripts/patch-279c-ai-future.ts            # DRY RUN（変更前→変更後を表示）
 *   npx tsx scripts/patch-279c-ai-future.ts --execute  # 本番に書き込む（オーナーが実行）
 *
 * 足す3か所（今ある文は変えない・消さない）
 *   1. 冒頭のあいさつの前に、答えの段落
 *   2. 「4. 磨くべきスキル」の指標の箇条書きのすぐ後に、Claude Code 入門・Cursor 入門へのリンク
 *   3. まとめの最後の段落の後（P.S の前）に、転職ロードマップへの案内
 * 目印にする段落が想定と違う場合は書き込まずに止まる（誰かが Studio で直していたら上書きしない）。
 */
import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });
// worktree に .env.local が無い場合は、メインのチェックアウトの .env.local を読む
config({ path: resolve(process.env.HOME ?? "", "Documents/bono-training/.env.local") });

const EXECUTE = process.argv.includes("--execute");
const DOC_ID = "webflow-guide-68c145a7ae3c378cc04f60b4"; // guide: ai-uiuxdesign-future
const SITE = "https://www.bo-no.design";

type Span = { text: string; href?: string };
type Insert = { label: string; position: "before" | "after"; anchorKey: string; anchorStarts: string; key: string; spans: Span[] };

const INSERTS: Insert[] = [
  {
    label: "1. 冒頭（あいさつの前）",
    position: "before",
    anchorKey: "0x4ql606c9y3",
    anchorStarts: "こんにちにんにんカイクンです。",
    key: "279c4answer",
    spans: [
      {
        text: "AIで作れるUIは増えていて、UIデザインのうちAIに任せられる部分は広がります。それでも、UI/UXデザイナーの仕事がなくなるわけではありません。AIをパートナーにして、人が喜ぶ体験をつくる部分は残ります。",
      },
    ],
  },
  {
    label: "2. 指標の箇条書きの後",
    position: "after",
    anchorKey: "gakxtyffosik",
    anchorStarts: "社会的責任：",
    key: "279c4ailessons",
    spans: [
      { text: "このうち「エンジニアリング」の、AIを使ったプロトタイプは、BONOのレッスン「" },
      { text: "デザイナーのためのClaude Code入門", href: `${SITE}/lessons/claudecode-ui-ai-design` },
      { text: "」と「" },
      { text: "デザイナーのためのCursor入門", href: `${SITE}/lessons/cursor-ui-ai-design` },
      { text: "」で試せます。" },
    ],
  },
  {
    label: "3. まとめの後（P.S の前）",
    position: "after",
    anchorKey: "iqzs495eztz4",
    anchorStarts: "AIに仕事を奪われるかを考えるよりも",
    key: "279c4roadmap",
    spans: [
      { text: "未経験からUI/UXデザイナーを目指すなら、何をどの順番で学ぶかを「" },
      { text: "UIUXデザイナー転職ロードマップ", href: `${SITE}/roadmap/uiux-career-change` },
      { text: "」にまとめています。" },
    ],
  },
];

const toBlock = (ins: Insert) => {
  const markDefs: Array<{ _key: string; _type: "link"; href: string }> = [];
  const children = ins.spans.map((s, i) => {
    const marks: string[] = [];
    if (s.href) {
      const linkKey = `${ins.key}-l${i}`;
      markDefs.push({ _key: linkKey, _type: "link", href: s.href });
      marks.push(linkKey);
    }
    return { _key: `${ins.key}-s${i}`, _type: "span", marks, text: s.text };
  });
  return { _key: ins.key, _type: "block", style: "normal", markDefs, children };
};

const preview = (ins: Insert) => ins.spans.map((s) => (s.href ? `[${s.text}](${s.href})` : s.text)).join("");

type Block = { _key: string; children?: Array<{ text?: string }> };
type Doc = { _id: string; _rev: string; content: Block[] };

if (EXECUTE && !process.env.SANITY_WRITE_TOKEN) {
  console.error("⚠️ SANITY_WRITE_TOKEN が必要です");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cqszh4up",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

async function main() {
  console.log(`dataset: ${client.config().dataset} / ${EXECUTE ? "EXECUTE（本番に書き込む）" : "DRY RUN"}\n`);

  // 公開版と、あれば下書き（drafts.）の両方を対象にする
  const docs = await client.fetch<Doc[]>(`*[_id in $ids]{_id,_rev,content}`, {
    ids: [DOC_ID, `drafts.${DOC_ID}`],
  });
  if (!docs.some((d) => d._id === DOC_ID)) {
    console.error("⚠️ 公開版のドキュメントが見つかりません");
    process.exit(1);
  }

  let mismatch = false;
  for (const doc of docs) {
    console.log(`■ ${doc._id}`);
    for (const ins of INSERTS) {
      const anchor = doc.content.find((b) => b._key === ins.anchorKey);
      const text = (anchor?.children ?? []).map((c) => c.text ?? "").join("");
      const ok = text.startsWith(ins.anchorStarts);
      if (!ok) mismatch = true;
      const done = doc.content.some((b) => b._key === ins.key);
      console.log(`  ${ins.label}${done ? "（足し済み）" : ""}${ok ? "" : "  ⚠️ 目印の段落が想定と違う"}`);
      console.log(`    目印: ${text.slice(0, 50)}…`);
      console.log(`    足す: ${preview(ins)}\n`);
    }
  }

  if (mismatch) {
    console.error("⚠️ 想定と違う値があるので止めました。Studio で誰かが直していないか確認してください");
    process.exit(1);
  }
  if (!EXECUTE) {
    console.log("DRY RUN のため書き込んでいません。--execute で本番に書き込みます");
    return;
  }

  // 1つの patch に insert を複数つなぐと最後の1つしか残らないので、1ブロックずつ書き込む
  // （2026-11-09 の1回目の実行では 3 だけが入った。足し済みのブロックは飛ばす）
  for (const doc of docs) {
    let rev = doc._rev;
    for (const ins of INSERTS) {
      if (doc.content.some((b) => b._key === ins.key)) continue;
      const res = await client
        .patch(doc._id)
        .ifRevisionId(rev)
        .insert(ins.position, `content[_key=="${ins.anchorKey}"]`, [toBlock(ins)])
        .commit();
      rev = res._rev;
      console.log(`✅ ${doc._id} に「${ins.label}」を足しました`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
