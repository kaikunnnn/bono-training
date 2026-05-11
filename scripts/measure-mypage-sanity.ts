/**
 * /mypage で叩かれる Sanity GROQ クエリの単体実時間を計測
 *
 * 実行: NEXT_PUBLIC_SANITY_PROJECT_ID=cqszh4up NEXT_PUBLIC_SANITY_DATASET=production npx tsx scripts/measure-mypage-sanity.ts
 *
 * 認証不要（Sanity GROQ は projectId のみで叩ける）。
 * Supabase 部分（progress, status, bookmarks IDs, viewHistory IDs）は service_role が
 * 必要なため別途。本スクリプトは Sanity 部分のボトルネック特定を目的とする。
 */

import { createClient } from "@sanity/client";

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cqszh4up";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: "2024-01-01",
  useCdn: false,
});

// ============================================
// 計測対象クエリ
// ============================================

// 1. getAllLessonsWithArticleIds（一番重いと予測）
const Q_LESSONS = `
  *[_type == "lesson"] | order(lessonNumber asc) {
    _id,
    _type,
    title,
    slug,
    description,
    lessonNumber,
    thumbnail,
    thumbnailUrl,
    iconImage,
    "iconImageUrl": coalesce(iconImageUrl, iconImage.asset->url),
    tags,
    isPremium,
    "articleIds": quests[]->articles[]->_id,
    "quests": quests[]-> {
      "articles": articles[]-> {
        _id,
        title,
        slug
      }
    }
  }
`;

// 2. getBookmarkedArticles の Sanity 部分（架空 IDs で叩いて空集合の応答時間を測定）
// 実際には Supabase で取得した IDs を渡すが、ここでは存在しない IDs で空集合のレイテンシを測る
const Q_BOOKMARKS = (ids: string[]) => `*[_type == "article" && _id in $ids] {
  _id,
  title,
  slug,
  thumbnail,
  thumbnailUrl,
  "resolvedThumbnailUrl": coalesce(thumbnailUrl, thumbnail.asset->url),
  videoDuration,
  articleNumber,
  excerpt,
  isPremium,
  "questInfo": *[_type == "quest" && references(^._id)][0] {
    _id,
    questNumber,
    title,
    "lessonInfo": *[_type == "lesson" && references(^._id)][0] {
      _id,
      title,
      slug
    }
  }
} | order(_createdAt desc)`;

// ============================================
// 実行
// ============================================

async function measureN(label: string, fn: () => Promise<unknown>, runs = 5) {
  const times: number[] = [];
  // ウォームアップ
  await fn();
  for (let i = 0; i < runs; i++) {
    const t0 = performance.now();
    await fn();
    const t1 = performance.now();
    times.push(t1 - t0);
  }
  times.sort((a, b) => a - b);
  const min = times[0];
  const median = times[Math.floor(times.length / 2)];
  const max = times[times.length - 1];
  const avg = times.reduce((s, x) => s + x, 0) / times.length;
  console.log(
    `${label.padEnd(40)} runs=${runs}  min=${min.toFixed(0)}ms  median=${median.toFixed(0)}ms  avg=${avg.toFixed(0)}ms  max=${max.toFixed(0)}ms`
  );
  return { min, median, avg, max };
}

async function main() {
  console.log(`Sanity projectId=${PROJECT_ID} dataset=${DATASET}\n`);

  // 1. レッスン全件 + quests + articles
  const lessonResult = await measureN("getAllLessonsWithArticleIds", () =>
    client.fetch(Q_LESSONS)
  );

  // 1件取得して件数確認
  const lessons = (await client.fetch(Q_LESSONS)) as Array<{ _id: string; title: string; articleIds?: string[] }>;
  const totalArticles = lessons.reduce((s, l) => s + (l.articleIds?.length || 0), 0);
  console.log(`  → ${lessons.length} lessons, ${totalArticles} total articles`);

  // 2. bookmarks クエリ（実 IDs を 4 件抽出して計測 → preview の上位 4 件相当の負荷）
  const sampleIds = lessons
    .flatMap((l) => l.articleIds || [])
    .slice(0, 4);

  const bookmarksResult = await measureN(
    `getBookmarkedArticles (4 ids)`,
    () => client.fetch(Q_BOOKMARKS(sampleIds), { ids: sampleIds })
  );

  // viewHistory のクエリは bookmarks と同形なので同じ計測値を使う
  console.log(`\nviewHistory は bookmarks と同形のクエリのため同等のレイテンシと想定`);

  // ============================================
  // 改善前後の TTFB / 表示時刻の理論値算出
  // ============================================
  console.log(`\n=== 理論値算出 ===`);
  console.log(`(median 値で算出。Supabase 部分は既存最適化済みで 30-100ms と仮定)`);
  const supabaseEstimate = 50;

  const before_phase1 = Math.max(
    lessonResult.median,
    bookmarksResult.median + supabaseEstimate, // Supabase IDs取得 + Sanity
    bookmarksResult.median + supabaseEstimate  // viewHistory も同形
  );
  const before_phase2 = supabaseEstimate; // progress/status は1クエリの単一往復
  const before_total = before_phase1 + before_phase2;

  console.log(`\n[改善前] page.tsx は2段の Promise.all で逐次依存`);
  console.log(`  phase1 (max of lessons / bookmarks / viewHistory): ${before_phase1.toFixed(0)}ms`);
  console.log(`  phase2 (progress + status):                       ${before_phase2.toFixed(0)}ms`);
  console.log(`  TTFB = phase1 + phase2 =                          ${before_total.toFixed(0)}ms`);
  console.log(`  → この時間が経過するまで HTML が1バイトも返らない`);

  console.log(`\n[改善後] page.tsx は Suspense × 3 で並列ストリーミング`);
  console.log(`  TTFB (shell ready):                               ~10ms (cookies + redirect 判定のみ)`);
  console.log(`  Bookmarks 表示完了:  Supabase + Sanity =          ${(bookmarksResult.median + supabaseEstimate).toFixed(0)}ms`);
  console.log(`  History 表示完了:    Supabase + Sanity =          ${(bookmarksResult.median + supabaseEstimate).toFixed(0)}ms`);
  console.log(`  Progress 表示完了:   lessons + (progress+status) =${(lessonResult.median + supabaseEstimate).toFixed(0)}ms`);
  console.log(`  → bookmark/history は progress を待たず先行表示`);

  console.log(`\n[改善効果]`);
  console.log(`  TTFB: ${before_total.toFixed(0)}ms → ~10ms (▲${(before_total - 10).toFixed(0)}ms / 約${(before_total / 10).toFixed(0)}倍速)`);
  console.log(`  シェル + タブが即座に表示され、各セクションは揃った順から streaming`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
