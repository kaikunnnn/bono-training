import { client } from '@/lib/sanity';
import type { Lesson } from '@/types/sanity';

export interface LessonWithArticles extends Lesson {
  articleIds: string[];
  questCount: number;
}

/**
 * すべてのレッスンと記事IDを取得
 */
export async function getAllLessonsWithArticles(): Promise<LessonWithArticles[]> {
  const query = `*[_type == "lesson"] | order(lessonNumber asc) {
    _id,
    _type,
    title,
    slug,
    description,
    lessonNumber,
    coverImage,
    tags,
    isPremium,
    "articleIds": *[_type == "article" && references(^._id)]._id,
    "questCount": count(*[_type == "quest" && references(^._id)])
  }`;

  const lessons = await client.fetch<LessonWithArticles[]>(query);
  return lessons;
}
