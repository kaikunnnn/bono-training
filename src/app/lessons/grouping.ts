/**
 * レッスンのグルーピングロジック
 *
 * mainブランチの Lessons.tsx (lines 252-378) からコピー
 * Next.js 型 (LessonWithArticleIds) に適応
 *
 * 変更点:
 * - SanityLesson → LessonWithArticleIds
 * - categoryTitle/categoryTitles → tags[] でカテゴリマッチング
 */

import type { LessonWithArticleIds } from "@/lib/sanity";
import { SECTIONS, RECOMMENDED_SECTIONS } from "./sections";

/**
 * レッスンをセクション・サブセクションごとにグルーピング
 * mainブランチの groupedLessons ロジック（lines 252-354）をコピー
 *
 * Key: 同じレッスンが複数のセクション/サブセクションに属することを許可（break しない）
 */
export function groupLessonsNested(lessons: LessonWithArticleIds[]) {
  // セクションID -> サブセクションID -> レッスン配列
  const groups: Record<string, Record<string, LessonWithArticleIds[]>> = {};

  // 初期化
  SECTIONS.forEach(section => {
    groups[section.id] = {};
    section.subSections.forEach(sub => {
      groups[section.id][sub.id] = [];
    });
    // サブセクションがない場合のフォールバック
    if (section.subSections.length === 0) {
      groups[section.id]['_default'] = [];
    }
  });

  lessons.forEach((lesson) => {
    // 複数カテゴリ対応: tags配列を使用（mainブランチの categoryTitles に対応）
    const lessonCategories: string[] = lesson.tags && lesson.tags.length > 0
      ? lesson.tags
      : [];

    const lessonTitle = lesson.title;
    let matched = false;

    // 1. サブセクションのlessonTitlesでマッチング（複数セクション対応）
    // 同じレッスンが複数のセクション/サブセクションに属することを許可
    for (const section of SECTIONS) {
      if (section.id === 'others') continue;

      for (const sub of section.subSections) {
        const isMatch = sub.lessonTitles.some(t =>
          lessonTitle.toLowerCase().includes(t.toLowerCase())
        );
        if (isMatch) {
          groups[section.id][sub.id].push(lesson);
          matched = true;
          // break しない → 他のセクション/サブセクションもチェック継続
        }
      }
      // break しない → 他のセクションもチェック継続
    }

    // 2. カテゴリでマッチング（lessonTitlesでマッチしなかった場合のみ）
    if (!matched && lessonCategories.length > 0) {
      for (const section of SECTIONS) {
        if (section.id === 'others') continue;

        // レッスンのカテゴリのいずれかがセクションのカテゴリと一致するかチェック
        const categoryMatch = section.categories.some(sectionCat =>
          lessonCategories.some(lessonCat =>
            lessonCat.toLowerCase().includes(sectionCat.toLowerCase())
          )
        );
        if (categoryMatch) {
          // 最初のサブセクションに追加
          const firstSubId = section.subSections[0]?.id || '_default';
          if (groups[section.id][firstSubId]) {
            groups[section.id][firstSubId].push(lesson);
          }
          matched = true;
          // break しない → 複数カテゴリにマッチする可能性を許可
        }
      }
    }

    // 3. マッチしない場合はその他へ
    if (!matched) {
      if (!groups['others']['_default']) {
        groups['others']['_default'] = [];
      }
      groups['others']['_default'].push(lesson);
    }
  });

  // lessonTitlesの順序でソート
  SECTIONS.forEach(section => {
    section.subSections.forEach(sub => {
      const lessonsInSub = groups[section.id]?.[sub.id];
      if (lessonsInSub && lessonsInSub.length > 0) {
        groups[section.id][sub.id] = lessonsInSub.sort((a, b) => {
          const aIndex = sub.lessonTitles.findIndex(t =>
            a.title.toLowerCase().includes(t.toLowerCase())
          );
          const bIndex = sub.lessonTitles.findIndex(t =>
            b.title.toLowerCase().includes(t.toLowerCase())
          );
          // マッチしないものは最後に
          const aOrder = aIndex === -1 ? 999 : aIndex;
          const bOrder = bIndex === -1 ? 999 : bIndex;
          return aOrder - bOrder;
        });
      }
    });
  });

  return groups;
}

/**
 * おすすめタブ用のレッスングルーピング
 * mainブランチの recommendedLessons ロジック（lines 357-378）をコピー
 */
export function groupRecommendedLessons(lessons: LessonWithArticleIds[]) {
  const groups: Record<string, LessonWithArticleIds[]> = {};

  RECOMMENDED_SECTIONS.forEach(section => {
    groups[section.id] = [];
  });

  // 各おすすめセクションのlessonTitlesでマッチング
  RECOMMENDED_SECTIONS.forEach(section => {
    section.lessonTitles.forEach(titlePattern => {
      const matchedLesson = lessons.find(lesson =>
        lesson.title.toLowerCase().includes(titlePattern.toLowerCase())
      );
      if (matchedLesson && !groups[section.id].some(l => l._id === matchedLesson._id)) {
        groups[section.id].push(matchedLesson);
      }
    });
  });

  return groups;
}

/**
 * セクションごとの総レッスン数を計算
 * mainブランチの sectionCounts ロジック（lines 382-392）をコピー
 */
export function getSectionCounts(groupedLessons: Record<string, Record<string, LessonWithArticleIds[]>>) {
  const counts: Record<string, number> = {};
  SECTIONS.forEach(section => {
    let total = 0;
    Object.values(groupedLessons[section.id] || {}).forEach(lessonsInSub => {
      total += lessonsInSub.length;
    });
    counts[section.id] = total;
  });
  return counts;
}
