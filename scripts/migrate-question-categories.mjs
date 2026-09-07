/**
 * 掲示板カテゴリ（Sanity `questionCategory`）の移行スクリプト。#139 スライス0。
 *
 * 目的: src/lib/questions/categories.ts の BOARD_CATEGORIES（唯一の正）に
 *       Sanity 側の title / order / 存在有無を合わせる。冪等。
 *
 * ⚠️ 定数は src/lib/questions/categories.ts と同期必須（.mjs から TS import 不可のため手動コピー）。
 *    向こうを変えたらこちらの CATEGORIES も必ず合わせること。
 *
 * 使い方:
 *   node --env-file=.env.local scripts/migrate-question-categories.mjs          # dry-run（既定・書き込まない）
 *   node --env-file=.env.local scripts/migrate-question-categories.mjs --apply  # 実書き込み
 *
 * 動作:
 *  1. 既定は dry-run。patch / create / delete の計画をテーブル表示するだけ。
 *  2. kind='post' の定数のみ Sanity に反映（bono-bug は書かない）。
 *     - slug で既存ドキュメントを探し、あれば title/order を patch、なければ
 *       決定的 ID `questionCategory-<slug>` で createIfNotExists。
 *  3. 定数に無い既存カテゴリ（design, figma, bono 等）は、参照している投稿数を数え、
 *     0 件なら削除。1 件以上なら削除せず警告のみ（自動付け替えはしない）。
 *  4. 書き込み後、全 questionCategory を再取得して結果表示。
 */

import { createClient } from '@sanity/client';

// --- src/lib/questions/categories.ts と同期必須（post のみ Sanity に書く）---
const CATEGORIES = [
  { slug: 'zatsudan',       label: '雑談・デザイン全般', order: 1, kind: 'post' },
  { slug: 'design-process', label: 'デザインの進め方',   order: 2, kind: 'post' },
  { slug: 'tools',          label: 'ツールの使い方',     order: 3, kind: 'post' },
  { slug: 'ui',             label: 'UIとデザイン',       order: 4, kind: 'post' },
  { slug: 'career',         label: 'キャリア・転職',     order: 5, kind: 'post' },
  { slug: 'bono-bug',       label: 'BONOのバグ・質問',   order: 6, kind: 'contact' },
];

const APPLY = process.argv.includes('--apply');

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

function deterministicId(slug) {
  return `questionCategory-${slug}`;
}

async function main() {
  if (!client.config().token) {
    console.error('SANITY_WRITE_TOKEN が未設定です。--env-file=.env.local を渡して実行してください。');
    process.exit(1);
  }

  console.log(`\n=== 掲示板カテゴリ移行 (${APPLY ? 'APPLY: 実書き込み' : 'DRY-RUN: 書き込みなし'}) ===\n`);

  // 現在の Sanity カテゴリを取得
  const existing = await client.fetch(
    `*[_type == "questionCategory"]{ _id, "slug": slug.current, title, order }`
  );
  const bySlug = new Map(existing.map((c) => [c.slug, c]));

  const postCategories = CATEGORIES.filter((c) => c.kind === 'post');
  const definedSlugs = new Set(CATEGORIES.map((c) => c.slug));

  const plan = []; // { action, slug, id, detail }

  // --- 1. post カテゴリを patch / create ---
  for (const cat of postCategories) {
    const found = bySlug.get(cat.slug);
    if (found) {
      const needsTitle = found.title !== cat.label;
      const needsOrder = found.order !== cat.order;
      plan.push({
        action: 'patch',
        slug: cat.slug,
        id: found._id,
        detail: `title='${cat.label}'${needsTitle ? ' (変更)' : ' (同値)'} , order=${cat.order}${needsOrder ? ' (変更)' : ' (同値)'}`,
      });
    } else {
      plan.push({
        action: 'create',
        slug: cat.slug,
        id: deterministicId(cat.slug),
        detail: `title='${cat.label}', order=${cat.order}, slug='${cat.slug}'`,
      });
    }
  }

  // --- 2. 定数に無い既存カテゴリ → 参照 0 件なら delete、それ以外は警告 ---
  for (const c of existing) {
    if (definedSlugs.has(c.slug)) continue;
    const refCount = await client.fetch(
      `count(*[_type == "question" && category._ref == $id])`,
      { id: c._id }
    );
    if (refCount === 0) {
      plan.push({
        action: 'delete',
        slug: c.slug,
        id: c._id,
        detail: `参照投稿 0 件 → 削除`,
      });
    } else {
      plan.push({
        action: 'warn',
        slug: c.slug,
        id: c._id,
        detail: `参照投稿 ${refCount} 件 → 削除せず手動判断（自動付け替えなし）`,
      });
    }
  }

  // --- 計画をテーブル表示 ---
  console.log('--- 実行計画 ---');
  console.table(
    plan.map((p) => ({ action: p.action, slug: p.slug, id: p.id, detail: p.detail }))
  );

  if (!APPLY) {
    console.log('\nDRY-RUN のため書き込みは行いません。反映するには --apply を付けて再実行してください。\n');
    return;
  }

  // --- 3. 実書き込み ---
  console.log('\n--- 書き込み実行 ---');
  for (const p of plan) {
    if (p.action === 'patch') {
      const cat = postCategories.find((c) => c.slug === p.slug);
      await client
        .patch(p.id)
        .set({ title: cat.label, order: cat.order })
        .commit();
      console.log(`patched: ${p.slug} (${p.id})`);
    } else if (p.action === 'create') {
      const cat = postCategories.find((c) => c.slug === p.slug);
      await client.createIfNotExists({
        _id: p.id,
        _type: 'questionCategory',
        title: cat.label,
        order: cat.order,
        slug: { _type: 'slug', current: cat.slug },
      });
      console.log(`created: ${p.slug} (${p.id})`);
    } else if (p.action === 'delete') {
      await client.delete(p.id);
      console.log(`deleted: ${p.slug} (${p.id})`);
    } else if (p.action === 'warn') {
      console.log(`skipped (要手動判断): ${p.slug} (${p.id}) — ${p.detail}`);
    }
  }

  // --- 4. 再取得して結果表示 ---
  const after = await client.fetch(
    `*[_type == "questionCategory"] | order(order asc){ _id, "slug": slug.current, title, order }`
  );
  console.log('\n--- 書き込み後の全 questionCategory ---');
  console.table(after);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
