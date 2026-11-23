/**
 * AI動画2本のレッスン（Cursor入門 `cur-` / Claude Code入門 `ccu-`）を、development dataset から production dataset へ写す。
 * development がオーナー確認済みの正（Studioで直したタイトル・slug・表紙・本文リンクを含む）なので、MDからは作り直さない。
 *
 * 実行:
 *   npx tsx scripts/publish-ai-video-lessons-prod.ts --dry-run   # 写す内容・画像・衝突チェックの一覧のみ（書き込みなし）
 *   npx tsx scripts/publish-ai-video-lessons-prod.ts             # production へ書き込み（オーナー承認後）
 *
 * - 書き込みは `cur-` / `ccu-` プレフィックスの _id のみ（createOrReplace）。削除はしない
 * - 画像（表紙・リンク用・記事サムネ）は development から取得して production にアップロードし、参照を付け替える
 * - production だけの追加: lesson.category = AI カテゴリ参照、article.publishedAt = 公開日時（新着に出すため）
 * - development に下書き（drafts.）が残っていたら中止する（公開版との食い違いを持ち込まない）
 * - issue: rebono/issues/260_AI動画2本の無料レッスン化.md
 */
import { createClient, type SanityClient } from "@sanity/client";

const DRY_RUN = process.argv.includes("--dry-run");
const PROJECT_ID = process.env.SANITY_PROJECT_ID;
const PREFIXES = ["cur-", "ccu-"];
const AI_CATEGORY_ID = "vDTWRLEpXesEd0F5RtkdOq"; // production の category「AI」
const PUBLISHED_AT = new Date().toISOString();

if (!PROJECT_ID) throw new Error("SANITY_PROJECT_ID が .env.local にありません");
if (!process.env.SANITY_WRITE_TOKEN) throw new Error("SANITY_WRITE_TOKEN が .env.local にありません");

function makeClient(dataset: "development" | "production"): SanityClient {
  return createClient({
    projectId: PROJECT_ID,
    dataset,
    apiVersion: "2024-01-01",
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,
    perspective: "raw",
  });
}
const dev = makeClient("development");
const prod = makeClient("production");

type Doc = Record<string, unknown> & { _id: string; _type: string; title?: string; slug?: { current: string } };
type ImageField = { _type: "image"; asset: { _type: "reference"; _ref: string } };

const IMAGE_FIELDS = ["iconImage", "thumbnail", "coverImage"] as const;
const idFilter = PREFIXES.map((p) => `_id match "${p}*"`).join(" || ");

async function main() {
  console.log(`${DRY_RUN ? "[DRY-RUN] " : ""}development → production（${PREFIXES.join(" / ")}）\n`);

  const drafts = await dev.fetch<string[]>(`*[${PREFIXES.map((p) => `_id match "drafts.${p}*"`).join(" || ")}]._id`);
  if (drafts.length) throw new Error(`development に下書きが残っています。Studioで公開してから実行してください: ${drafts.join(", ")}`);

  const docs = await dev.fetch<Doc[]>(`*[${idFilter}] | order(_id asc)`);
  for (const doc of docs) {
    if (!PREFIXES.some((p) => doc._id.startsWith(p))) throw new Error(`想定外の _id: ${doc._id}`);
  }
  const lessons = docs.filter((d) => d._type === "lesson");
  const quests = docs.filter((d) => d._type === "quest");
  const articles = docs.filter((d) => d._type === "article");
  if (lessons.length !== 2 || docs.length !== lessons.length + quests.length + articles.length) {
    throw new Error(`件数が想定外です（lesson ${lessons.length} / quest ${quests.length} / article ${articles.length} / 全 ${docs.length}）`);
  }
  console.log(`対象: lesson ${lessons.length} / quest ${quests.length} / article ${articles.length}（計 ${docs.length}）`);
  for (const d of docs.filter((x) => x._type !== "article")) {
    console.log(`  ${d._type.padEnd(7)} ${d._id.padEnd(22)} slug=${d.slug?.current.padEnd(30)} ${d.title}`);
  }

  // 参照切れチェック: quest/lesson が指す先がすべて対象に含まれているか
  const ids = new Set(docs.map((d) => d._id));
  const refs = JSON.stringify(docs).match(/"_ref":"([^"]+)"/g) ?? [];
  const missing = [...new Set(refs.map((r) => r.slice(8, -1)))].filter((r) => !r.startsWith("image-") && !ids.has(r));
  if (missing.length) throw new Error(`対象外を指す参照があります: ${missing.join(", ")}`);

  // 画像
  const assetRefs = new Set<string>();
  for (const d of docs) {
    for (const f of IMAGE_FIELDS) {
      const ref = (d[f] as ImageField | undefined)?.asset?._ref;
      if (ref) assetRefs.add(ref);
    }
  }
  if (JSON.stringify(docs.map((d) => d.content ?? [])).includes('"image-')) {
    throw new Error("本文中の画像は未対応です（このスクリプトは表紙・サムネだけ付け替える）");
  }
  const assets = await dev.fetch<{ _id: string; url: string; originalFilename?: string }[]>(
    `*[_id in $ids]{_id, url, originalFilename}`,
    { ids: [...assetRefs] },
  );
  if (assets.length !== assetRefs.size) throw new Error(`development に無い画像があります（${assets.length}/${assetRefs.size}）`);
  console.log(`\n画像: ${assets.length} 枚を production にアップロードして付け替え`);

  // 衝突チェック（production）
  const slugs = docs.map((d) => d.slug?.current).filter(Boolean);
  const existing = await prod.fetch<{ _id: string; _type: string; slug?: string }[]>(
    `*[${idFilter} || ${PREFIXES.map((p) => `_id match "drafts.${p}*"`).join(" || ")} || slug.current in $slugs]{_id, _type, "slug": slug.current}`,
    { slugs },
  );
  const foreign = existing.filter((d) => !ids.has(d._id));
  console.log(`\n衝突チェック（production）: 同じ _id ${existing.length - foreign.length} 件 / 別 _id で slug が同じ・下書き ${foreign.length} 件`);
  for (const d of existing) console.log(`  既存: ${d._type} ${d._id} slug=${d.slug}`);
  if (foreign.length) throw new Error("production の別ドキュメントと slug/下書きが衝突しています。中止します");

  const category = await prod.fetch<{ _id: string; title: string } | null>(`*[_id == $id][0]{_id, title}`, { id: AI_CATEGORY_ID });
  if (category?.title !== "AI") throw new Error(`production の AI カテゴリが見つかりません (${AI_CATEGORY_ID})`);

  // production 用に整える
  const out = docs.map((d) => {
    const { _rev, _createdAt, _updatedAt, _system, ...rest } = d as Doc & Record<string, unknown>;
    void _rev; void _createdAt; void _updatedAt; void _system;
    const doc: Doc = { ...rest };
    if (doc._type === "lesson") doc.category = { _type: "reference", _ref: AI_CATEGORY_ID };
    if (doc._type === "article") doc.publishedAt = PUBLISHED_AT;
    return doc;
  });

  console.log("\nproduction だけの変更:");
  for (const l of out.filter((d) => d._type === "lesson")) {
    console.log(`  ${l._id}: category → ${category.title} / tags=${JSON.stringify(l.tags)} / isHidden=${l.isHidden} / isPremium=${l.isPremium}`);
  }
  console.log(`  article ${articles.length} 本: publishedAt → ${PUBLISHED_AT}`);
  const premium = out.filter((d) => d._type === "article" && d.isPremium !== false);
  if (premium.length) throw new Error(`無料でない記事があります: ${premium.map((d) => d._id).join(", ")}`);
  console.log(`  全記事 isPremium=false（無料）を確認`);

  if (DRY_RUN) {
    console.log("\nDRY-RUN のため書き込みません");
    return;
  }

  if (prod.config().dataset !== "production") throw new Error("書き込み先が production ではありません");
  const refMap = new Map<string, string>();
  for (const a of assets) {
    const res = await fetch(a.url);
    if (!res.ok) throw new Error(`画像の取得に失敗: ${a.url} (${res.status})`);
    const uploaded = await prod.assets.upload("image", Buffer.from(await res.arrayBuffer()), {
      filename: a.originalFilename ?? a._id,
    });
    refMap.set(a._id, uploaded._id);
  }
  console.log(`アップロード: ${refMap.size} 枚`);
  for (const d of out) {
    for (const f of IMAGE_FIELDS) {
      const img = d[f] as ImageField | undefined;
      if (img?.asset?._ref) img.asset._ref = refMap.get(img.asset._ref)!;
    }
  }

  const tx = prod.transaction();
  for (const d of out) tx.createOrReplace(d);
  const res = await tx.commit();
  console.log(`\n書き込み完了: ${res.results.length} 件 (transactionId=${res.transactionId})`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
