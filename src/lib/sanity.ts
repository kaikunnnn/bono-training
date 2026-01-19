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
 *
 * Quest.lessonフィールドを使って直接Lessonを取得
 */
export async function getArticleWithContext(
  slug: string
): Promise<ArticleWithContext | null> {
  const articleQuery = `
    *[_type == "article" && slug.current == $slug][0] {
      _id,
      _type,
      articleNumber,
      articleType,
      title,
      slug,
      excerpt,
      thumbnail,
      thumbnailUrl,
      videoUrl,
      videoDuration,
      content[] {
        ...,
        _type == "image" => {
          ...,
          "asset": asset-> {
            _id,
            url
          }
        }
      },
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
          articleType,
          title,
          slug,
          videoDuration,
          isPremium
        },
        // Quest.lessonフィールドから直接Lessonを取得
        "lessonInfo": lesson-> {
          _id,
          title,
          slug,
          iconImage,
          iconImageUrl,
          "quests": quests[]-> {
            _id,
            questNumber,
            title,
            "articles": articles[]-> {
              _id,
              articleType,
              title,
              slug,
              videoDuration,
              isPremium
            }
          }
        }
      }
    }
  `;

  const article = await client.fetch<any>(articleQuery, { slug });

  // 記事が見つからない場合
  if (!article) {
    return null;
  }

  // questInfo がない場合はそのまま返す（lessonInfo なし）
  if (!article.questInfo) {
    console.warn(`[getArticleWithContext] Article "${slug}" has no questInfo`);
    return article;
  }

  // lessonInfo がない場合は警告を出す
  if (!article.questInfo.lessonInfo) {
    console.warn(`[getArticleWithContext] Quest "${article.questInfo._id}" has no lesson reference`);
  }

  // lessonInfo をトップレベルに移動
  return {
    ...article,
    lessonInfo: article.questInfo.lessonInfo,
  };
}
