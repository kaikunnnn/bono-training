import {
  SearchResult,
  LessonSearchResult,
  ArticleSearchResult,
  GuideSearchResult,
  RoadmapSearchResult,
} from "@/types/search";

/**
 * テスト用のモック検索データ
 */

// レッスンコース
export const mockLessons: LessonSearchResult[] = [
  {
    id: "lesson-1",
    type: "lesson",
    title: "ゼロからはじめる情報設計",
    description:
      "UIデザインの土台となる情報設計を基礎から学びます。ユーザーの目的を達成するための構造設計を身につけましょう。",
    slug: "information-architecture-basics",
    category: "情報設計",
    lessonCount: 12,
    isPremium: false,
    tags: ["情報設計", "IA", "初心者向け"],
  },
  {
    id: "lesson-2",
    type: "lesson",
    title: "UIビジュアル基礎",
    description:
      "色、タイポグラフィ、レイアウトなどUIビジュアルの基本原則を学びます。美しく機能的なデザインを作るための第一歩。",
    slug: "ui-visual-basics",
    category: "UIデザイン",
    lessonCount: 15,
    isPremium: true,
    tags: ["UIデザイン", "ビジュアル", "基礎"],
  },
  {
    id: "lesson-3",
    type: "lesson",
    title: "Figma実践マスター",
    description:
      "FigmaでのUI制作を効率的に行うためのテクニックを学びます。コンポーネント、Auto Layout、プロトタイプまで網羅。",
    slug: "figma-master",
    category: "Figma",
    lessonCount: 20,
    isPremium: true,
    tags: ["Figma", "ツール", "実践"],
  },
  {
    id: "lesson-4",
    type: "lesson",
    title: "UXリサーチ入門",
    description:
      "ユーザーを理解するためのリサーチ手法を学びます。インタビュー、ユーザビリティテスト、データ分析の基礎。",
    slug: "ux-research-intro",
    category: "UXデザイン",
    lessonCount: 8,
    isPremium: false,
    tags: ["UXデザイン", "リサーチ", "入門"],
  },
];

// 記事（レッスン内コンテンツ）
export const mockArticles: ArticleSearchResult[] = [
  {
    id: "article-1",
    type: "article",
    title: "ユーザーフローの作り方",
    description:
      "ユーザーの行動を可視化するフロー図の作成方法を解説します。タスク分析からフロー図への落とし込みまで。",
    slug: "user-flow-creation",
    parentLessonTitle: "ゼロからはじめる情報設計",
    parentLessonSlug: "information-architecture-basics",
    readingTime: 15,
    isPremium: false,
    tags: ["ユーザーフロー", "情報設計"],
  },
  {
    id: "article-2",
    type: "article",
    title: "カラーパレットの選び方",
    description:
      "ブランドに合った配色を選ぶためのガイド。60-30-10ルールとアクセシビリティを考慮した色選びのコツ。",
    slug: "color-palette-guide",
    parentLessonTitle: "UIビジュアル基礎",
    parentLessonSlug: "ui-visual-basics",
    readingTime: 10,
    isPremium: true,
    tags: ["カラー", "配色", "UIデザイン"],
  },
  {
    id: "article-3",
    type: "article",
    title: "Auto Layoutの基本と応用",
    description:
      "FigmaのAuto Layout機能を使いこなすためのチュートリアル。レスポンシブなコンポーネント作成のコツ。",
    slug: "auto-layout-tutorial",
    parentLessonTitle: "Figma実践マスター",
    parentLessonSlug: "figma-master",
    readingTime: 20,
    isPremium: true,
    tags: ["Figma", "Auto Layout", "コンポーネント"],
  },
  {
    id: "article-4",
    type: "article",
    title: "ペルソナの作り方",
    description:
      "効果的なペルソナを作成するためのステップバイステップガイド。リサーチデータからペルソナへの落とし込み方。",
    slug: "persona-creation",
    parentLessonTitle: "UXリサーチ入門",
    parentLessonSlug: "ux-research-intro",
    readingTime: 12,
    isPremium: false,
    tags: ["ペルソナ", "UXデザイン", "リサーチ"],
  },
  {
    id: "article-5",
    type: "article",
    title: "ワイヤーフレームの描き方",
    description:
      "素早く効果的なワイヤーフレームを作成する方法。低精度から高精度への段階的なアプローチ。",
    slug: "wireframe-basics",
    parentLessonTitle: "ゼロからはじめる情報設計",
    parentLessonSlug: "information-architecture-basics",
    readingTime: 18,
    isPremium: false,
    tags: ["ワイヤーフレーム", "情報設計", "プロトタイプ"],
  },
];

// ガイドコンテンツ
export const mockGuides: GuideSearchResult[] = [
  {
    id: "guide-1",
    type: "guide",
    title: "UIUXデザイナーに必要なスキルとは？",
    description:
      "UIUXデザイナーとして活躍するために必要なスキルセットを解説。ハードスキルとソフトスキルの両面から。",
    slug: "uiux-designer-skills",
    category: "career",
    readingTime: "10分",
    publishedAt: "2024-01-15",
    author: "BONO",
    isPremium: false,
    tags: ["キャリア", "スキル", "入門"],
  },
  {
    id: "guide-2",
    type: "guide",
    title: "未経験からUIUXデザイナーになるロードマップ",
    description:
      "デザイン未経験からUIUXデザイナーになるための学習ステップを詳しく解説。必要な期間と学習リソース。",
    slug: "career-roadmap-beginner",
    category: "career",
    readingTime: "15分",
    publishedAt: "2024-02-01",
    author: "BONO",
    isPremium: true,
    tags: ["キャリア", "ロードマップ", "未経験"],
  },
  {
    id: "guide-3",
    type: "guide",
    title: "デザイナーの勉強法：効率的に学ぶコツ",
    description:
      "限られた時間で効率的にデザインスキルを身につけるための学習法。インプットとアウトプットのバランス。",
    slug: "effective-learning-methods",
    category: "learning",
    readingTime: "8分",
    publishedAt: "2024-01-20",
    author: "BONO",
    isPremium: false,
    tags: ["学習法", "効率化", "勉強"],
  },
  {
    id: "guide-4",
    type: "guide",
    title: "ポートフォリオの作り方完全ガイド",
    description:
      "採用担当者に刺さるポートフォリオの作り方。プロジェクトの選び方から見せ方まで徹底解説。",
    slug: "portfolio-complete-guide",
    category: "career",
    readingTime: "20分",
    publishedAt: "2024-02-15",
    author: "BONO",
    isPremium: true,
    tags: ["ポートフォリオ", "転職", "キャリア"],
  },
];

// ロードマップ
export const mockRoadmaps: RoadmapSearchResult[] = [
  {
    id: "roadmap-1",
    type: "roadmap",
    title: "未経験からUIデザイナーへ",
    description:
      "デザイン未経験の方がUIデザイナーとして活躍できるようになるまでの学習ロードマップ。6ヶ月で基礎を完成。",
    slug: "beginner-to-ui-designer",
    duration: "6ヶ月",
    stepsCount: 6,
    lessonsCount: 45,
    gradientColors: "from-blue-500 to-cyan-500",
    isPremium: false,
    tags: ["未経験", "UIデザイン", "転職"],
  },
  {
    id: "roadmap-2",
    type: "roadmap",
    title: "UIデザイナーからUXデザイナーへ",
    description:
      "UIデザインの経験を活かしてUXデザイナーへキャリアアップするためのロードマップ。リサーチから戦略まで。",
    slug: "ui-to-ux-designer",
    duration: "4ヶ月",
    stepsCount: 5,
    lessonsCount: 30,
    gradientColors: "from-purple-500 to-pink-500",
    isPremium: true,
    tags: ["UXデザイン", "キャリアアップ", "リサーチ"],
  },
  {
    id: "roadmap-3",
    type: "roadmap",
    title: "Figma完全マスターコース",
    description:
      "Figmaを使いこなすための集中ロードマップ。基本操作から高度なプロトタイピングまで。",
    slug: "figma-mastery",
    duration: "2ヶ月",
    stepsCount: 4,
    lessonsCount: 20,
    gradientColors: "from-orange-500 to-red-500",
    isPremium: false,
    tags: ["Figma", "ツール", "プロトタイプ"],
  },
];

// 全てのモックデータを結合
export const allMockSearchData: SearchResult[] = [
  ...mockLessons,
  ...mockArticles,
  ...mockGuides,
  ...mockRoadmaps,
];

/**
 * シンプルな検索関数（クライアントサイド）
 */
export function searchContent(
  query: string,
  contentTypes: string[] = []
): SearchResult[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    // クエリが空の場合は全データを返す（フィルタのみ適用）
    if (contentTypes.length === 0) {
      return allMockSearchData;
    }
    return allMockSearchData.filter((item) =>
      contentTypes.includes(item.type)
    );
  }

  // フィルタリング
  let results = allMockSearchData;

  // コンテンツタイプでフィルタ
  if (contentTypes.length > 0) {
    results = results.filter((item) => contentTypes.includes(item.type));
  }

  // テキスト検索
  results = results.filter((item) => {
    const searchableText = [
      item.title,
      item.description,
      item.category || "",
      ...(item.tags || []),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });

  return results;
}
