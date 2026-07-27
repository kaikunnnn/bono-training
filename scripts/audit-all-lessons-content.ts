/**
 * 全レッスン横断・本文空記事の Webflow 突合調査（読み取り専用 / 書き込み一切なし）。
 *
 * 背景・目的:
 *   #151 で「UIビジュアル基礎」レッスン（37記事）の本文を Webflow Videos コレクション
 *   （6029d027f6cb8852cbce8c75）の description-3 から復旧済み。
 *   本スクリプトはその横展開の準備として、残り37レッスン（issue #152）の「本文空」記事を
 *   slug で Webflow と突合し、レッスンごとに以下を集計する:
 *     - Webflow一致（description-3 に本文あり）件数
 *     - Webflow一致したが description-3 も空の件数
 *     - Webflow不一致（該当slugなし）件数
 *   これにより「復旧可能」レッスンと「本文なしが正の可能性が高い（音声/インタビュー系等）」
 *   レッスンを仕分ける。
 *
 * ⚠️ このスクリプトは Sanity への patch/create/upload を一切行わない読み取り専用ツール。
 *    Webflow 側も GET のみ。
 *
 * 実行:
 *   npx tsx scripts/audit-all-lessons-content.ts
 *   npx tsx scripts/audit-all-lessons-content.ts --json  # 詳細JSONを scratchpad 風に stdout へ
 *
 * ロジックは scripts/restore-article-content.ts の
 *   fetchAllWebflowVideos / Sanity記事取得 を流用（コピー）。書き込み系は一切持ち込まない。
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });

const args = process.argv.slice(2);
const OUTPUT_JSON = args.includes("--json");

const WEBFLOW_VIDEOS_COLLECTION_ID = "6029d027f6cb8852cbce8c75";
const WEBFLOW_TOKEN =
  process.env.WEBFLOW_TOKEN ||
  "674b54cf2429858c005eb647787f444c749bb324a1ca1615b6cf4967b4033e76";

const projectId =
  process.env.SANITY_PROJECT_ID ||
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.VITE_SANITY_PROJECT_ID ||
  "cqszh4up";
const dataset =
  process.env.SANITY_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.VITE_SANITY_DATASET ||
  "production";

// 読み取り専用。書き込みトークンは使わない（万一の誤書き込みを避けるため未設定でよい）。
const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false,
});

// issue #152 の表に載っている37レッスン（UIビジュアル基礎は除外）。
// slug → 表示名（並び順は記事数の多い順=issue表順）。
const TARGET_LESSONS: { slug: string; name: string }[] = [
  { slug: "dezainanokiyaria", name: "キャリア相談まとめ" },
  { slug: "ui-architect-beginner", name: "ゼロからはじめるUI情報設計" },
  { slug: "bonoradio", name: "BONOラジオ" },
  { slug: "ui-layout-basic", name: "使いやすいUIの秘密" },
  { slug: "bannerbeginner", name: "バナーデザイン入門" },
  { slug: "ui-pattern", name: "UI PATTERN 入門" },
  { slug: "figmabeginner", name: "Figmaの使い方入門" },
  { slug: "failurepoint", name: "FAILURE POINT 課題発見の方法" },
  { slug: "dailyui-part01", name: "DailyUI 音声SNS" },
  { slug: "uidesignflow-challenge", name: "UIデザインの基本-応用" },
  { slug: "uidesignflow", name: "UIデザインの基本" },
  { slug: "designyourownservice", name: "ゼロからサービスをデザインしよう" },
  { slug: "ux-biginner", name: "はじめてのUXデザイン" },
  { slug: "ooui", name: "OOUI コンテンツ中心のUI設計" },
  { slug: "codeanddesign", name: "実装とデザインの関係超入門" },
  { slug: "wayofuiuxdesigner", name: "UIUXデザイナーになる条件" },
  { slug: "uiidea", name: "UIアイデア入門" },
  { slug: "uidesignbeginner", name: "はじめてのUIデザイン" },
  { slug: "tutorial-uivisual", name: "ゼロからはじめるUIビジュアル" },
  { slug: "rookiesaction", name: "UIデザイナー1年目の立ち回り" },
  { slug: "graphicbeginner", name: "グラフィック入門" },
  { slug: "materialdesign-rindokukai", name: "UIの教科書 - マテリアルデザイン" },
  { slug: "figma-elementary", name: "Figmaの使い方初級" },
  { slug: "uxdezaintohahe-ka-copy", name: "顧客体験デザインの基本" },
  { slug: "materialdesign-for-funiordesigner", name: '今日から使える"Material Design"' },
  { slug: "howtostudy", name: "デザインの学習環境" },
  { slug: "navigation-basics", name: "ナビゲーションUIの基本" },
  { slug: "portfolio", name: "ポートフォリオの作り方" },
  { slug: "ui-typography", name: "UIタイポグラフィ入門" },
  { slug: "zerokara-userinterview", name: "ゼロからはじめるユーザーインタビュー" },
  { slug: "inhouseplus-uikaizen", name: "顧客中心の商品ページ改善" },
  { slug: "ux-beginner-2", name: "UXデザインってなに？" },
  { slug: "feedback", name: "BONOフィードバック集" },
  { slug: "weeklyui-baseui-chintai", name: "賃貸アプリで基本UIトレーニング" },
  { slug: "bonokomiyunitei", name: "BONOコミュニティ" },
  { slug: "bono-session", name: "BONO勉強会アーカイブ" },
  { slug: "uiflowchallenge-businesstripsoftwear", name: "出張申請ソフトをデザインしよう" },
  { slug: "material-you0610", name: "Material You 勉強会" },
  { slug: "uitrace", name: "UIトレース入門" },
];

type WebflowFieldData = Record<string, unknown> & {
  slug?: string;
  "description-3"?: string;
};

let webflowApiCalls = 0;

async function fetchAllWebflowVideos(): Promise<Map<string, WebflowFieldData>> {
  const map = new Map<string, WebflowFieldData>();
  let offset = 0;
  const limit = 100;
  while (true) {
    webflowApiCalls++;
    const res = await fetch(
      `https://api.webflow.com/v2/collections/${WEBFLOW_VIDEOS_COLLECTION_ID}/items?limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${WEBFLOW_TOKEN}`, accept: "application/json" } }
    );
    if (!res.ok) {
      throw new Error(`Webflow API error (${res.status}): ${await res.text()}`);
    }
    const data: {
      items: Array<{ id: string; fieldData: WebflowFieldData }>;
      pagination?: { total?: number };
    } = await res.json();
    for (const item of data.items) {
      const slug = item.fieldData?.slug;
      if (slug) map.set(slug, item.fieldData);
    }
    offset += limit;
    if (data.items.length < limit || offset >= (data.pagination?.total ?? 0)) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  return map;
}

/**
 * 参考情報: Webflow に Videos 以外のコレクションがあるか（BONOラジオ等が別コレクションの可能性）を
 * ベストエフォートで一覧化する。site_id 不明なので /v2/token/authorized_by → sites 経由で探る。
 * 失敗しても本調査は続行する。
 */
async function listWebflowCollections(): Promise<{ id: string; name: string; slug: string }[] | null> {
  try {
    webflowApiCalls++;
    const sitesRes = await fetch("https://api.webflow.com/v2/sites", {
      headers: { Authorization: `Bearer ${WEBFLOW_TOKEN}`, accept: "application/json" },
    });
    if (!sitesRes.ok) return null;
    const sitesData: { sites?: Array<{ id: string }> } = await sitesRes.json();
    const collections: { id: string; name: string; slug: string }[] = [];
    for (const site of sitesData.sites ?? []) {
      webflowApiCalls++;
      const colRes = await fetch(
        `https://api.webflow.com/v2/sites/${site.id}/collections`,
        { headers: { Authorization: `Bearer ${WEBFLOW_TOKEN}`, accept: "application/json" } }
      );
      if (!colRes.ok) continue;
      const colData: { collections?: Array<{ id: string; displayName?: string; slug?: string }> } =
        await colRes.json();
      for (const c of colData.collections ?? []) {
        collections.push({ id: c.id, name: c.displayName ?? "", slug: c.slug ?? "" });
      }
    }
    return collections;
  } catch {
    return null;
  }
}

type EmptyArticle = {
  slug: string | null;
  title: string;
  lessonSlug: string | null;
};

type LessonResult = {
  slug: string;
  name: string;
  totalEmpty: number;
  matchedWithContent: number;
  matchedEmptyDesc: number;
  noWebflow: number;
  nullSlug: number;
  matchRate: number; // matchedWithContent / totalEmpty
  category: "A" | "B" | "C" | "-";
  noWebflowSlugs: string[];
};

function classify(matchRate: number, totalEmpty: number): "A" | "B" | "C" | "-" {
  if (totalEmpty === 0) return "-";
  if (matchRate >= 0.8) return "A";
  if (matchRate === 0) return "B";
  // 0 < rate < 0.8。極端に低い(<0.2)は B 寄り、それ以外は C。
  if (matchRate < 0.2) return "B";
  return "C";
}

async function main() {
  const start = Date.now();
  console.log("\n🧪 全レッスン本文空記事の Webflow 突合調査（読み取り専用・書き込みなし）\n");
  console.log(`   Sanity: projectId=${projectId} dataset=${dataset}`);
  console.log(`   Webflow Videos collection: ${WEBFLOW_VIDEOS_COLLECTION_ID}\n`);

  // 1. 本文空の記事を全件取得（レッスンslug付き）。
  //    「本文空」= content 未定義 or ブロック数0。
  const emptyArticles = (await client.fetch(
    `*[_type == "article" && (!defined(content) || count(content) == 0)]{
      "slug": slug.current,
      title,
      "lessonSlug": quest->lesson->slug.current
    }`
  )) as EmptyArticle[];

  console.log(`📚 本文空の記事（全レッスン合計）: ${emptyArticles.length}件\n`);

  // 2. Webflow Videos 全件取得
  console.log("Webflow Videos を全件取得中...");
  const webflowMap = await fetchAllWebflowVideos();
  const withDescCount = Array.from(webflowMap.values()).filter(
    (fd) => ((fd["description-3"] as string) || "").trim().length > 0
  ).length;
  console.log(
    `   → Webflow item: ${webflowMap.size}件（slug保有） / うち description-3 に本文あり: ${withDescCount}件\n`
  );

  // 3. 参考: 他コレクションの有無
  console.log("Webflow コレクション一覧を確認中（参考・ベストエフォート）...");
  const collections = await listWebflowCollections();
  if (collections) {
    console.log(`   → コレクション ${collections.length}件:`);
    for (const c of collections) {
      const mark = c.id === WEBFLOW_VIDEOS_COLLECTION_ID ? " ← Videos(突合対象)" : "";
      console.log(`      - ${c.name}  (slug=${c.slug}, id=${c.id})${mark}`);
    }
  } else {
    console.log("   → 取得できず（権限/site不明）。Videos コレクションのみで突合を続行。");
  }
  console.log("");

  // 4. レッスンごとに集計
  const byLesson = new Map<string, EmptyArticle[]>();
  for (const a of emptyArticles) {
    const key = a.lessonSlug ?? "(no-lesson)";
    if (!byLesson.has(key)) byLesson.set(key, []);
    byLesson.get(key)!.push(a);
  }

  const results: LessonResult[] = [];
  for (const target of TARGET_LESSONS) {
    const arts = byLesson.get(target.slug) ?? [];
    let matchedWithContent = 0;
    let matchedEmptyDesc = 0;
    let noWebflow = 0;
    let nullSlug = 0;
    const noWebflowSlugs: string[] = [];

    for (const art of arts) {
      if (!art.slug) {
        nullSlug++;
        continue;
      }
      const fd = webflowMap.get(art.slug);
      if (!fd) {
        noWebflow++;
        noWebflowSlugs.push(art.slug);
        continue;
      }
      const html = ((fd["description-3"] as string) || "").trim();
      if (!html) {
        matchedEmptyDesc++;
      } else {
        matchedWithContent++;
      }
    }

    const totalEmpty = arts.length;
    const matchRate = totalEmpty > 0 ? matchedWithContent / totalEmpty : 0;
    results.push({
      slug: target.slug,
      name: target.name,
      totalEmpty,
      matchedWithContent,
      matchedEmptyDesc,
      noWebflow,
      nullSlug,
      matchRate,
      category: classify(matchRate, totalEmpty),
      noWebflowSlugs,
    });
  }

  // 5. 表出力（一致率降順 → カテゴリでまとまる）
  results.sort((a, b) => b.matchRate - a.matchRate || b.totalEmpty - a.totalEmpty);

  console.log("=".repeat(96));
  console.log("📊 レッスン別 突合結果（一致率降順）");
  console.log("=".repeat(96));
  const pad = (s: string, n: number) => (s + " ".repeat(n)).slice(0, n);
  console.log(
    pad("区", 3) +
      pad("一致率", 8) +
      pad("一致/空", 9) +
      pad("空desc", 7) +
      pad("該当なし", 9) +
      "レッスン"
  );
  console.log("-".repeat(96));
  for (const r of results) {
    const rate = r.totalEmpty > 0 ? `${Math.round(r.matchRate * 100)}%` : "-";
    console.log(
      pad(r.category, 3) +
        pad(rate, 8) +
        pad(`${r.matchedWithContent}/${r.totalEmpty}`, 9) +
        pad(String(r.matchedEmptyDesc), 7) +
        pad(String(r.noWebflow), 9) +
        `${r.name} (${r.slug})`
    );
  }

  // 6. A/B/C サマリ
  const groupA = results.filter((r) => r.category === "A");
  const groupB = results.filter((r) => r.category === "B");
  const groupC = results.filter((r) => r.category === "C");
  const sum = (rs: LessonResult[], k: (r: LessonResult) => number) =>
    rs.reduce((acc, r) => acc + k(r), 0);

  console.log("\n" + "=".repeat(96));
  console.log("📋 A/B/C 分類サマリ");
  console.log("=".repeat(96));
  console.log(
    `  A（一致率80%以上・復旧候補）           : ${groupA.length}レッスン / 対象記事 ${sum(
      groupA,
      (r) => r.totalEmpty
    )}件 / 一致 ${sum(groupA, (r) => r.matchedWithContent)}件`
  );
  console.log(
    `  B（0% または <20%・本文なしが正の疑い） : ${groupB.length}レッスン / 対象記事 ${sum(
      groupB,
      (r) => r.totalEmpty
    )}件 / 一致 ${sum(groupB, (r) => r.matchedWithContent)}件`
  );
  console.log(
    `  C（部分的・個別確認）                   : ${groupC.length}レッスン / 対象記事 ${sum(
      groupC,
      (r) => r.totalEmpty
    )}件 / 一致 ${sum(groupC, (r) => r.matchedWithContent)}件`
  );

  const totalTarget = sum(results, (r) => r.totalEmpty);
  const totalMatched = sum(results, (r) => r.matchedWithContent);
  console.log(`\n  合計対象記事（本文空）: ${totalTarget}件 / Webflow一致（本文あり）: ${totalMatched}件`);

  // 7. B/C のレッスンは「該当なし slug」を明示（本文なしが正か個別判断の材料）
  const detail = [...groupB, ...groupC];
  if (detail.length > 0) {
    console.log("\n" + "=".repeat(96));
    console.log("🔎 B/C レッスンの内訳（Webflow該当なしslug）");
    console.log("=".repeat(96));
    for (const r of detail) {
      console.log(
        `\n[${r.category}] ${r.name} (${r.slug}) — 一致 ${r.matchedWithContent}/${r.totalEmpty}, 該当なし ${r.noWebflow}, 空desc ${r.matchedEmptyDesc}`
      );
      if (r.noWebflowSlugs.length > 0) {
        const show = r.noWebflowSlugs.slice(0, 8);
        console.log(`     該当なし: ${show.join(", ")}${r.noWebflowSlugs.length > 8 ? " …" : ""}`);
      }
    }
  }

  // 8. 実行情報
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n" + "=".repeat(96));
  console.log(`⏱  Webflow API 呼び出し回数: ${webflowApiCalls}回 / 所要時間: ${elapsed}秒`);
  console.log("✅ Sanity への書き込み・patch・upload は一切行っていません（GROQ 読み取りのみ）。");
  console.log("=".repeat(96));

  if (OUTPUT_JSON) {
    console.log("\n----- JSON -----");
    console.log(JSON.stringify(results, null, 2));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
