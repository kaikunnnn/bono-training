/**
 * #276 タイトル重複・title の直し（Sanity 本番データ）。既定は DRY RUN（読むだけ）。
 *
 *   npx tsx scripts/fix-276-sanity-titles.ts                 # DRY RUN（変更前→変更後を表示）
 *   npx tsx scripts/fix-276-sanity-titles.ts --execute       # 本番に書き込む（オーナーが実行）
 *   npx tsx scripts/fix-276-sanity-titles.ts --only=figma    # 1 だけ
 *   npx tsx scripts/fix-276-sanity-titles.ts --only=guide    # 2 だけ
 *
 * 1 figma: 「Figmaの使い方入門」クエスト3の #8 が2本ある件
 *   - figma-beginner12 と figma-beginner13 が同じ title・同じ動画（bXKV_gly8H0 = #8）・同じ目次。
 *     本物の #9（GTzQ_XKVgBk「詳細ページをデザイン/動画UIに黒背景が多い理由は？」）がどこにも無い。
 *   - サムネは 12 が「#08 Shorts」、13 が「#09 詳細の動画UI」。検索のクリックは 12 が #8 として持っている
 *     （16ヶ月116クリック、13 は0）。なので 12 を #8 のまま残し、13 を #9 に直す。
 *   - 13 の title・videoUrl・videoDuration・目次を #9 の YouTube の値に、articleNumber を 9 に。
 *     12 の articleNumber を 8 に。クエストの並びも 12（#8）→ 13（#9）の順に入れ替える。
 *   - 目次は YouTube の #9 の概要欄（2026-11-01 取得）をそのまま写した。
 *
 * 2 guide: /guide/become-uiux-designer-beginner-guide の h1（Sanity の title）から「未経験」を外す
 *   - <title> と description はコード側（src/lib/guide-seo.ts）で上書き済み。これは h1・一覧カードの文言。
 *   - 本文の h3 に「未経験」を含む見出しが3つ残るが、本文の編集なのでこのスクリプトでは触らない。
 */
import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });

const EXECUTE = process.argv.includes("--execute");
const onlyArg = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1];
const RUN_FIGMA = !onlyArg || onlyArg === "figma";
const RUN_GUIDE = !onlyArg || onlyArg === "guide";

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

const NINE = {
  title: "#9 詳細ページをデザイン/動画UIに黒背景が多い理由は？",
  videoUrl: "https://youtu.be/GTzQ_XKVgBk",
  videoDuration: "24:53",
  toc: [
    "00:00 動画の詳細ページをUIトレース！",
    "00:15 今回作るUIの説明",
    "02:36 動画プレイヤーの基本構造",
    "03:29 黒背景の意図",
    "05:34 ステータスバーのデザイン",
    "06:29 「選択範囲の色」について",
    "10:53 動画プレイヤーのUIトレース",
    "12:47 バーの色を調べる",
    "16:39 次のステップへ",
    "19:39 シャドウの仕組み",
    "20:25 バーを仕上げていく",
  ].join("\n"),
};

const GUIDE_TITLE_AFTER =
  "UI/UXデザイナーの年収と将来性｜仕事の役割・年収の目安・キャリアの広げ方";

interface Span { _key: string; _type: string; text?: string }
interface Block { _key: string; _type: string; children?: Span[] }
interface ArticleDoc {
  _id: string; _rev: string; title: string; articleNumber?: number;
  videoUrl?: string; videoDuration?: string; content?: Block[];
}
interface QuestDoc { _id: string; _rev: string; title: string; articles: { _key: string; _ref: string }[] }

function show(label: string, before: unknown, after: unknown) {
  const same = JSON.stringify(before) === JSON.stringify(after);
  console.log(`  ${label}: ${same ? "（変更なし）" : ""}`);
  console.log(`    前: ${JSON.stringify(before)}`);
  if (!same) console.log(`    後: ${JSON.stringify(after)}`);
}

// 下書きがあると、公開版だけ直しても Studio で下書きを公開した時点で元に戻る。
// DRY RUN では警告して続け、--execute では止める。
async function assertNoDraft(id: string) {
  const draft = await client.fetch<{ _id: string; title?: string; _updatedAt: string } | null>(
    `*[_id == $id][0]{_id,title,_updatedAt}`,
    { id: `drafts.${id}` },
  );
  if (!draft) return;
  const msg = `下書き ${draft._id} があります（title: ${JSON.stringify(draft.title)}、更新 ${draft._updatedAt}）。Studio で公開か破棄をしてから実行してください`;
  if (EXECUTE) {
    console.error(`⛔ ${msg}`);
    process.exit(1);
  }
  console.warn(`  ⚠️ ${msg}`);
}

async function figma() {
  console.log("\n== 1 figma-beginner12 / 13（#8 の重複 → 13 を #9 に）==");
  const [a12, a13] = await Promise.all(
    ["figma-beginner12", "figma-beginner13"].map((slug) =>
      client.fetch<ArticleDoc | null>(
        `*[_type=="article" && slug.current==$slug && !(_id in path("drafts.**"))][0]{_id,_rev,title,articleNumber,videoUrl,videoDuration,content}`,
        { slug },
      ),
    ),
  );
  if (!a12 || !a13) throw new Error("記事が見つかりません");
  // 想定どおりの状態か確認（誰かが先に直していたら止める）
  if (a12.videoUrl !== a13.videoUrl || a12.title !== a13.title) {
    console.error("⛔ 2本がもう同じではありません。状態を見直してから実行してください");
    process.exit(1);
  }
  await assertNoDraft(a12._id);
  await assertNoDraft(a13._id);

  const tocBlock = a13.content?.find((b) =>
    b.children?.some((c) => (c.text ?? "").startsWith("00:00")),
  );
  const tocSpan = tocBlock?.children?.find((c) => (c.text ?? "").startsWith("00:00"));
  if (!tocBlock || !tocSpan) throw new Error("figma-beginner13 の目次ブロックが見つかりません");

  const quest = await client.fetch<QuestDoc | null>(
    `*[_type=="quest" && references($id) && !(_id in path("drafts.**"))][0]{_id,_rev,title,articles}`,
    { id: a13._id },
  );
  if (!quest) throw new Error("クエストが見つかりません");
  await assertNoDraft(quest._id);
  const i12 = quest.articles.findIndex((r) => r._ref === a12._id);
  const i13 = quest.articles.findIndex((r) => r._ref === a13._id);
  if (i12 < 0 || i13 < 0) throw new Error("クエストに2本が入っていません");
  const reordered = [...quest.articles];
  if (i12 > i13) [reordered[i12], reordered[i13]] = [reordered[i13], reordered[i12]];

  console.log(`- figma-beginner13（${a13._id}）`);
  show("title", a13.title, NINE.title);
  show("videoUrl", a13.videoUrl, NINE.videoUrl);
  show("videoDuration", a13.videoDuration, NINE.videoDuration);
  show("articleNumber", a13.articleNumber, 9);
  show("目次", tocSpan.text, NINE.toc);
  console.log(`- figma-beginner12（${a12._id}）`);
  show("articleNumber", a12.articleNumber, 8);
  console.log(`- クエスト「${quest.title.trim()}」（${quest._id}）の並び`);
  show(
    "8・9番目",
    [i13, i12].sort((x, y) => x - y).map((i) => quest.articles[i]._ref),
    [i13, i12].sort((x, y) => x - y).map((i) => reordered[i]._ref),
  );

  if (!EXECUTE) return;
  const tx = client.transaction();
  tx.patch(a13._id, (p) =>
    p.ifRevisionId(a13._rev).set({
      title: NINE.title,
      videoUrl: NINE.videoUrl,
      videoDuration: NINE.videoDuration,
      articleNumber: 9,
      [`content[_key=="${tocBlock._key}"].children[_key=="${tocSpan._key}"].text`]: NINE.toc,
    }),
  );
  tx.patch(a12._id, (p) => p.ifRevisionId(a12._rev).set({ articleNumber: 8 }));
  tx.patch(quest._id, (p) => p.ifRevisionId(quest._rev).set({ articles: reordered }));
  await tx.commit();
  console.log("  ✅ 書き込みました");
}

async function guide() {
  console.log("\n== 2 /guide/become-uiux-designer-beginner-guide の h1 ==");
  const g = await client.fetch<{ _id: string; _rev: string; title: string } | null>(
    `*[_type=="guide" && slug.current=="become-uiux-designer-beginner-guide" && !(_id in path("drafts.**"))][0]{_id,_rev,title}`,
  );
  if (!g) throw new Error("ガイドが見つかりません");
  await assertNoDraft(g._id);
  console.log(`- ${g._id}`);
  show("title（h1）", g.title, GUIDE_TITLE_AFTER);
  if (!EXECUTE) return;
  await client.patch(g._id).ifRevisionId(g._rev).set({ title: GUIDE_TITLE_AFTER }).commit();
  console.log("  ✅ 書き込みました");
}

async function main() {
  console.log(EXECUTE ? "🚀 本番に書き込みます" : "🧪 DRY RUN（読むだけ。書き込むには --execute）");
  if (RUN_FIGMA) await figma();
  if (RUN_GUIDE) await guide();
  console.log(EXECUTE ? "\n✨ 完了" : "\nℹ️ DRY RUN 終了（何も変えていません）");
}

main().catch((e) => {
  console.error("💥", e);
  process.exit(1);
});
