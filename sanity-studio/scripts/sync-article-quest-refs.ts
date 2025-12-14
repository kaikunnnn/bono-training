/**
 * 記事にquest参照を自動設定するスクリプト
 *
 * クエストのarticles配列を元に、各記事のquestフィールドを設定します。
 *
 * 実行方法:
 * SANITY_STUDIO_PROJECT_ID=xxx SANITY_STUDIO_DATASET=xxx SANITY_AUTH_TOKEN=xxx npx tsx scripts/sync-article-quest-refs.ts
 */

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: "2024-01-01",
  useCdn: false,
});

interface Quest {
  _id: string;
  title: string;
  articles: { _ref: string }[];
}

async function syncArticleQuestRefs() {
  console.log("🔄 記事のquest参照を同期します...\n");

  // 全クエストとその記事参照を取得
  const quests = await client.fetch<Quest[]>(`
    *[_type == "quest"] {
      _id,
      title,
      "articles": articles[]{ _ref }
    }
  `);

  console.log(`📚 ${quests.length} 件のクエストを取得しました\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const quest of quests) {
    if (!quest.articles || quest.articles.length === 0) {
      console.log(`⏭️  "${quest.title}" - 記事なし`);
      continue;
    }

    console.log(`\n📝 クエスト: "${quest.title}" (${quest.articles.length} 記事)`);

    for (const articleRef of quest.articles) {
      const articleId = articleRef._ref;

      // 現在の記事のquest参照を確認
      const article = await client.fetch(`
        *[_type == "article" && _id == $id][0] {
          _id,
          title,
          "questRef": quest._ref
        }
      `, { id: articleId });

      if (!article) {
        console.log(`  ⚠️  記事 ${articleId} が見つかりません`);
        continue;
      }

      // すでに正しいquest参照がある場合はスキップ
      if (article.questRef === quest._id) {
        console.log(`  ✅ "${article.title}" - 既に設定済み`);
        skippedCount++;
        continue;
      }

      // quest参照を更新
      await client
        .patch(articleId)
        .set({
          quest: {
            _type: "reference",
            _ref: quest._id,
          },
        })
        .commit();

      console.log(`  🔗 "${article.title}" - quest参照を設定しました`);
      updatedCount++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✨ 完了！`);
  console.log(`   更新: ${updatedCount} 件`);
  console.log(`   スキップ: ${skippedCount} 件`);
}

syncArticleQuestRefs().catch(console.error);
