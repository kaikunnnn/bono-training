/**
 * 投入された AIxUIスタイリング入門 レッスンを GROQ で取得し、
 * Quest → Article の参照が正しく連結されているか確認する。
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cqszh4up",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

async function main() {
  // getLesson() 相当のクエリ
  const lesson = await client.fetch(
    `*[_type == "lesson" && slug.current == $slug][0] {
      _id, title, slug, description, isPremium, isHidden, tags, purposes,
      "quests": quests[]-> {
        _id, questNumber, title, slug, goal,
        "articles": articles[]-> {
          _id, articleNumber, articleType, title, slug, excerpt, videoUrl, tags,
          "blockCount": count(content)
        }
      }
    }`,
    { slug: "ai-ui-styling-intro" }
  );

  console.log(JSON.stringify(lesson, null, 2));

  // サマリ
  console.log("\n=== サマリ ===");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const l = lesson as any;
  console.log(`Lesson: ${l?.title}  (isHidden=${l?.isHidden}, isPremium=${l?.isPremium})`);
  console.log(`Quests: ${l?.quests?.length ?? 0}`);
  let articleTotal = 0;
  for (const q of l?.quests ?? []) {
    console.log(
      `  - Q${q.questNumber}: ${q.title}  / articles=${q.articles?.length ?? 0}`
    );
    articleTotal += q.articles?.length ?? 0;
  }
  console.log(`Articles total: ${articleTotal}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
