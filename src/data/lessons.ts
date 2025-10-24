import { Lesson } from '@/types/lesson';

/**
 * レッスン一覧（静的データ）
 *
 * 将来的にマークダウンまたはCMSから取得する予定
 */
export const lessons: Lesson[] = [
  {
    id: '1',
    category: '情報設計',
    title: 'ゼロからはじめるUI情報設計',
    description: '「どこに何をなぜ置くべきか？」の情報設計基礎をトレースしながら身につけられます。必須!',
    coverImage: '/assets/lesson-covers/lesson-01.jpg',
    slug: 'ui-information-architecture',
  },
  {
    id: '2',
    category: 'UIデザイン',
    title: 'UIデザインの基本原則',
    description: 'デザインの4大原則を実践的に学び、美しく使いやすいUIを作るスキルを習得できます。',
    coverImage: '/assets/lesson-covers/lesson-02.jpg',
    slug: 'ui-design-principles',
  },
  {
    id: '3',
    category: '情報設計',
    title: 'ナビゲーション設計入門',
    description: 'ユーザーが迷わないナビゲーション設計の考え方と実装方法を学びます。',
    coverImage: '/assets/lesson-covers/lesson-03.jpg',
    slug: 'navigation-design',
  },
];

/**
 * IDでレッスンを取得
 */
export const getLessonById = (id: string): Lesson | undefined => {
  return lessons.find(lesson => lesson.id === id);
};

/**
 * スラッグでレッスンを取得
 */
export const getLessonBySlug = (slug: string): Lesson | undefined => {
  return lessons.find(lesson => lesson.slug === slug);
};

/**
 * カテゴリーでレッスンを絞り込み
 */
export const getLessonsByCategory = (category: string): Lesson[] => {
  return lessons.filter(lesson => lesson.category === category);
};
