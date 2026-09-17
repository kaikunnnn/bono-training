/**
 * トレーニング冒頭記事（production）に、最終成果物「デザイン検討ドキュメント」の
 * 完成イメージ（画像のみ・素材への直リンクなし）とセクション4への誘導を追加する。
 *
 * - sbd-training-guide「何をするか」直後: 完成イメージ画像＋セクション4誘導
 * - sbd-training-guide「全体の流れ」セッション4: 記述を新構成（検討ドキュメント/30〜40分）に修正、合計時間を9時間に
 * - sbd-training-preparation「提案すること」末尾: 完成イメージ画像＋誘導
 *
 * 実行: npx tsx scripts/update-training-intro-articles.ts [--dry-run]
 */
import { createClient } from "@sanity/client";
import crypto from "crypto";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local"), quiet: true });

const DRY_RUN = process.argv.includes("--dry-run");
const EXAMPLE_IMAGE_REF = "image-d10b048d0c38a66fc9eafd06565e22e982d6dc59-1280x3869-png";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cqszh4up",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

function key() {
  return crypto.randomBytes(6).toString("hex");
}

type Span = { _type: "span"; _key: string; marks: string[]; text: string };
type Block = { _type: string; _key: string; style?: string; markDefs?: unknown[]; children?: Span[]; [k: string]: unknown };

function textOf(b: Block): string {
  return (b.children || []).map((c) => c.text).join("");
}

function pBlock(parts: Array<{ text: string; bold?: boolean; href?: string }>, style = "normal"): Block {
  const markDefs: Array<{ _key: string; _type: "link"; href: string }> = [];
  const children: Span[] = parts.map((p) => {
    const marks: string[] = [];
    if (p.bold) marks.push("strong");
    if (p.href) {
      const k = key();
      markDefs.push({ _key: k, _type: "link", href: p.href });
      marks.push(k);
    }
    return { _type: "span", _key: key(), marks, text: p.text };
  });
  return { _type: "block", _key: key(), style, markDefs, children };
}

function imageBlock(ref: string): Block {
  return { _type: "image", _key: key(), asset: { _type: "reference", _ref: ref } } as Block;
}

async function updateGuide() {
  const doc = await client.getDocument<{ content: Block[] }>("sbd-training-guide");
  if (!doc) throw new Error("sbd-training-guide が見つかりません");
  const content = [...doc.content];

  // 1) 「何をするか」末尾（…その筋を自分でつくる練習をします。）の直後に完成イメージを挿入
  const anchor1 = content.findIndex((b) => textOf(b).includes("その筋を自分でつくる練習をします"));
  if (anchor1 < 0) throw new Error("guide: 挿入位置1が見つかりません");
  const insert1: Block[] = [
    pBlock([
      { text: "最終的には、この筋を" },
      { text: "「デザイン検討ドキュメント」", bold: true },
      { text: "という1枚にまとめます。完成イメージはこちらです。" },
    ]),
    imageBlock(EXAMPLE_IMAGE_REF),
    pBlock([
      { text: "実物のサンプルとテンプレートは、" },
      { text: "セクション4", href: "/contents/sbd-step4-session4" },
      { text: "の記事内で配布しています（配布ページはメンバー限定です）。先にゴールの形を見ておきたい人はどうぞ。" },
    ]),
  ];
  content.splice(anchor1 + 1, 0, ...insert1);

  // 2) セッション4の記述を差し替え（見出し＋本文＋残るもの の3ブロック）
  const s4 = content.findIndex((b) => textOf(b).startsWith("セッション4｜提案にまとめる"));
  if (s4 < 0) throw new Error("guide: セッション4見出しが見つかりません");
  const replacement: Block[] = [
    pBlock([{ text: "セッション4｜検討ドキュメントにまとめて、完走する（30〜40分）" }], content[s4].style || "h4"),
    pBlock([
      { text: "一周で考えたこと・作ったもの・分かったことを、「デザイン検討ドキュメント」という1枚にまとめます。答えを出す資料ではなく、今わかっていることとまだ分からないことを両方載せた、次の検討につなげる現在地のログです。" },
    ]),
    pBlock([{ text: "残るもの：検討ドキュメント（次にやることの一文まで）" }]),
  ];
  // 差し替え対象: 見出し + 続く2ブロック（本文/残るもの）
  const removed = content.slice(s4, s4 + 3).map(textOf);
  content.splice(s4, 3, ...replacement);

  // 3) 合計時間
  const total = content.findIndex((b) => textOf(b).startsWith("合計12時間"));
  if (total < 0) throw new Error("guide: 合計時間ブロックが見つかりません");
  const totalOld = textOf(content[total]);
  content[total] = pBlock([{ text: textOf(content[total]).replace("合計12時間", "合計9時間ほど") }], content[total].style || "normal");

  console.log(JSON.stringify({
    doc: "sbd-training-guide",
    insertAfter: textOf(doc.content[anchor1]).slice(0, 40),
    replacedSession4: removed,
    totalTime: { from: totalOld, to: textOf(content[total]) },
    dryRun: DRY_RUN,
  }, null, 2));

  if (!DRY_RUN) {
    await client.patch("sbd-training-guide").set({ content }).commit({ visibility: "sync" });
    console.log("sbd-training-guide 更新完了");
  }
}

async function updatePreparation() {
  const doc = await client.getDocument<{ content: Block[] }>("sbd-training-preparation");
  if (!doc) throw new Error("sbd-training-preparation が見つかりません");
  const content = [...doc.content];

  // 「〆制作条件」見出しの直前に挿入
  const anchor = content.findIndex((b) => textOf(b).startsWith("〆制作条件"));
  if (anchor < 0) throw new Error("preparation: 〆制作条件が見つかりません");
  const insert: Block[] = [
    pBlock([
      { text: "この3つは、トレーニングの最後に" },
      { text: "「デザイン検討ドキュメント」", bold: true },
      { text: "という1枚にまとめます。完成イメージはこちらです。" },
    ]),
    imageBlock(EXAMPLE_IMAGE_REF),
    pBlock([
      { text: "実物のサンプルは" },
      { text: "セクション4", href: "/contents/sbd-step4-session4" },
      { text: "の記事内で配布しています（配布ページはメンバー限定です）。先にゴールの形を見ておくと、計画も立てやすくなります。" },
    ]),
  ];
  content.splice(anchor, 0, ...insert);

  console.log(JSON.stringify({
    doc: "sbd-training-preparation",
    insertBefore: textOf(doc.content[anchor]).slice(0, 30),
    dryRun: DRY_RUN,
  }, null, 2));

  if (!DRY_RUN) {
    await client.patch("sbd-training-preparation").set({ content }).commit({ visibility: "sync" });
    console.log("sbd-training-preparation 更新完了");
  }
}

async function main() {
  await updateGuide();
  await updatePreparation();
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
