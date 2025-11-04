import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { ArticleWithContext } from "@/types/sanity";

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || "2024-01-01",
  useCdn: true,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

/**
 * Article Detail ページ用のデータ取得
 * 記事の詳細 + 所属するQuest + Lesson + サイドナビゲーション用の全データを取得
 */
export async function getArticleWithContext(
  slug: string
): Promise<ArticleWithContext | null> {
  const query = `
    *[_type == "article" && slug.current == $slug][0] {
      _id,
      _type,
      articleNumber,
      title,
      slug,
      excerpt,
      coverImage,
      thumbnail,
      videoUrl,
      videoDuration,
      content,
      learningObjectives,
      publishedAt,
      author,
      tags,
      isPremium,

      // 記事が所属するQuestを取得
      "questInfo": *[_type == "quest" && references(^._id)][0] {
        _id,
        questNumber,
        title,
        "articles": articles[]-> {
          _id,
          title,
          slug,
          videoDuration,
          isPremium
        }
      },

      // Questが所属するLessonと、Lessonの全Questと記事を取得（サイドナビ用）
      "lessonInfo": *[_type == "lesson" && references(*[_type == "quest" && references(^._id)][0]._id)][0] {
        _id,
        title,
        slug,
        iconImage,
        "quests": quests[]-> {
          _id,
          questNumber,
          title,
          "articles": articles[]-> {
            _id,
            title,
            slug,
            videoDuration,
            isPremium
          }
        }
      }
    }
  `;

  const result = await client.fetch<ArticleWithContext | null>(query, {
    slug,
  });
  return result;
}
