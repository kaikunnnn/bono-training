/**
 * rebono 279-C 組1-2 年収と将来の記事（/contents/become-uiux-designer-beginner-guide）を直す（Sanity 本番データ）。
 * 直すのは /contents 側の article 文書だけ（2026-11-10 オーナー決定 B。/guide 版の guide 文書は触らない）。
 * 既定は DRY RUN（読むだけ）。
 *
 *   npx tsx scripts/patch-279c-salary.ts            # DRY RUN（変更前→変更後を表示）
 *   npx tsx scripts/patch-279c-salary.ts --execute  # 本番に書き込む（オーナーが実行）
 *
 * 変える4か所（本文の今ある文は変えない・消さない）
 *   1. title（h1・ページのtitle・レッスン内の記事名）
 *   2. 本文のいちばん上に、年収の答えの段落を足す（検索結果の説明文も本文の先頭から作られるので変わる）
 *   3. 「未経験からでも目指せる？」の節の終わりに、なるには記事へのリンクを足す
 *   4. 「おわりに」の2つのリンクを直す（URL末尾に ** が付いて404。転送前の古いURLも新しいURLへ）
 * 1回の patch に insert は1つしか入らないので、1か所ずつ書き込む。
 * 今の値が想定と違う場合は書き込まずに止まる（誰かが Studio で直していたら上書きしない）。
 */
import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });
// worktree に .env.local が無い場合は、メインのチェックアウトの .env.local を読む
config({ path: resolve(process.env.HOME ?? "", "Documents/bono-training/.env.local") });

const EXECUTE = process.argv.includes("--execute");
const DOC_ID = "g4rl1HmkpTXIsvYhaJvqLq"; // article: become-uiux-designer-beginner-guide
const SITE = "https://www.bo-no.design";

const TITLE_BEFORE = "UI/UXデザイナーは未経験から転職できるのか？年収と将来についても";
const TITLE_AFTER = "UI/UXデザイナーの年収と将来性｜仕事の役割とキャリアの広げ方";

type Span = { text: string; href?: string };
type Insert = { label: string; position: "before" | "after"; anchorKey: string; anchorStarts: string; key: string; spans: Span[] };

const INSERTS: Insert[] = [
  {
    label: "2. 本文のいちばん上（答え）",
    position: "before",
    anchorKey: "21f194969668",
    anchorStarts: "UI/UXデザイナーってどんな仕事？",
    key: "279c2answer",
    spans: [
      {
        text: "UI/UXデザイナーの年収の目安は、ジュニアで400万円台、経験2〜5年で500〜600万円台、チームをリードする立場で600〜800万円台です。同じスキルでも会社によって差があり、どれだけ事業に貢献できるかで変わります。",
      },
    ],
  },
  {
    label: "3. 「未経験からでも目指せる？」の節の終わり",
    position: "after",
    anchorKey: "61a510284fcc",
    anchorStarts: "未経験でも採用される会社がある一方で",
    key: "279c2howtobe",
    spans: [
      { text: "未経験からなるために必要なスキルと、書類で落ちないための条件は「" },
      { text: "未経験からUI/UXデザイナーになるには？", href: `${SITE}/guide/rdm-howtobeadesigner` },
      { text: "」にまとめています。" },
    ],
  },
];

// 4. 「おわりに」のリンク。href と、画面に出ている URL の文字を一緒に直す
const LINK_FIXES = [
  {
    label: "4a. コースへのリンク",
    blockKey: "512b17ed773e",
    markKey: "2030c0cf2214",
    spanKey: "231e5a71f5b5",
    hrefBefore: `${SITE}/rdm/roadmap-uiuxdesigner**`,
    textBefore: `${SITE}/rdm/roadmap-uiuxdesigner**`,
    after: `${SITE}/roadmap/uiux-career-change`,
  },
  {
    label: "4b. 料金プランへのリンク",
    blockKey: "440ac06720c5",
    markKey: "82f719fc72fd",
    spanKey: "5b84199fb05e",
    hrefBefore: `${SITE}/plan**`,
    textBefore: `${SITE}/plan`,
    after: `${SITE}/subscription`,
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

type Block = {
  _key: string;
  children?: Array<{ _key: string; text?: string }>;
  markDefs?: Array<{ _key: string; href?: string }>;
};
type Doc = { _id: string; _rev: string; title: string; content: Block[] };

const blockText = (doc: Doc, key: string) =>
  (doc.content.find((b) => b._key === key)?.children ?? []).map((c) => c.text ?? "").join("");

const linkState = (doc: Doc, fix: (typeof LINK_FIXES)[number]) => {
  const block = doc.content.find((b) => b._key === fix.blockKey);
  const href = block?.markDefs?.find((m) => m._key === fix.markKey)?.href;
  const text = block?.children?.find((c) => c._key === fix.spanKey)?.text;
  return { href, text, before: href === fix.hrefBefore && text === fix.textBefore, done: href === fix.after && text === fix.after };
};

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
  const docs = await client.fetch<Doc[]>(`*[_id in $ids]{_id,_rev,title,content}`, {
    ids: [DOC_ID, `drafts.${DOC_ID}`],
  });
  if (!docs.some((d) => d._id === DOC_ID)) {
    console.error("⚠️ 公開版のドキュメントが見つかりません");
    process.exit(1);
  }

  let mismatch = false;
  for (const doc of docs) {
    console.log(`■ ${doc._id}`);

    const titleOk = doc.title === TITLE_BEFORE || doc.title === TITLE_AFTER;
    if (!titleOk) mismatch = true;
    console.log(`  1. title${doc.title === TITLE_AFTER ? "（直し済み）" : ""}${titleOk ? "" : "  ⚠️ 今の値が想定と違う"}`);
    console.log(`    今:   ${doc.title}`);
    console.log(`    直後: ${TITLE_AFTER}\n`);

    for (const ins of INSERTS) {
      const text = blockText(doc, ins.anchorKey);
      const ok = text.startsWith(ins.anchorStarts);
      if (!ok) mismatch = true;
      const done = doc.content.some((b) => b._key === ins.key);
      console.log(`  ${ins.label}${done ? "（足し済み）" : ""}${ok ? "" : "  ⚠️ 目印の段落が想定と違う"}`);
      console.log(`    目印: ${text.slice(0, 50)}…`);
      console.log(`    足す: ${preview(ins)}\n`);
    }

    for (const fix of LINK_FIXES) {
      const s = linkState(doc, fix);
      if (!s.before && !s.done) mismatch = true;
      console.log(`  ${fix.label}${s.done ? "（直し済み）" : ""}${s.before || s.done ? "" : "  ⚠️ 今の値が想定と違う"}`);
      console.log(`    今:   リンク先 ${s.href} ／ 表示 ${s.text}`);
      console.log(`    直後: リンク先・表示とも ${fix.after}\n`);
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

  for (const doc of docs) {
    let rev = doc._rev;
    const commit = async (label: string, build: (p: ReturnType<typeof client.patch>) => ReturnType<typeof client.patch>) => {
      const res = await build(client.patch(doc._id).ifRevisionId(rev)).commit();
      rev = res._rev;
      console.log(`✅ ${doc._id}: ${label}`);
    };

    if (doc.title !== TITLE_AFTER) {
      await commit("1. title を直しました", (p) => p.set({ title: TITLE_AFTER }));
    }
    for (const ins of INSERTS) {
      if (doc.content.some((b) => b._key === ins.key)) continue;
      await commit(`${ins.label} を足しました`, (p) =>
        p.insert(ins.position, `content[_key=="${ins.anchorKey}"]`, [toBlock(ins)]),
      );
    }
    for (const fix of LINK_FIXES) {
      if (linkState(doc, fix).done) continue;
      const base = `content[_key=="${fix.blockKey}"]`;
      await commit(`${fix.label} を直しました`, (p) =>
        p.set({
          [`${base}.markDefs[_key=="${fix.markKey}"].href`]: fix.after,
          [`${base}.children[_key=="${fix.spanKey}"].text`]: fix.after,
        }),
      );
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
