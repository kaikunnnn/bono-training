/**
 * コース一覧用データ
 * カテゴリ構造とコースデータ
 * 設計ドキュメントに基づく6カテゴリ + キャリア
 */

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string; // 「〜できる」で終わる一行説明
  categoryId: string;
  thumbnail: string; // グラデーションカラーで代用
  lessonCount: number;
  totalDuration: string;
  isPremium: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // テーマカラー
  courseCount: number;
}

// 7カテゴリ定義
export const categories: Category[] = [
  {
    id: 'design-basics',
    name: 'デザインの基礎',
    description: 'UIデザインの考え方・UXの導入を学ぶ',
    icon: 'Lightbulb',
    color: '#6366F1', // Indigo
    courseCount: 6,
  },
  {
    id: 'information-architecture',
    name: '情報設計',
    description: 'IA・OOUI・ナビゲーション設計など、BONOの核となるスキル',
    icon: 'LayoutGrid',
    color: '#8B5CF6', // Violet
    courseCount: 12,
  },
  {
    id: 'ux-research',
    name: 'UXリサーチ',
    description: 'ユーザーインタビュー・課題発見・顧客体験を理解する',
    icon: 'Search',
    color: '#EC4899', // Pink
    courseCount: 5,
  },
  {
    id: 'ui-design',
    name: 'UIデザイン',
    description: 'ビジュアル・コンポーネント・タイポグラフィを磨く',
    icon: 'Palette',
    color: '#F59E0B', // Amber
    courseCount: 14,
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'Figmaの基本操作から実践的な使い方まで',
    icon: 'Figma',
    color: '#10B981', // Emerald
    courseCount: 2,
  },
  {
    id: 'ai-design',
    name: 'AI × デザイン',
    description: 'AIを活用したプロトタイピング・リサーチ手法',
    icon: 'Sparkles',
    color: '#3B82F6', // Blue
    courseCount: 1,
  },
  {
    id: 'career',
    name: 'キャリア',
    description: 'ポートフォリオ・転職・立ち回りを学ぶ',
    icon: 'Briefcase',
    color: '#64748B', // Slate
    courseCount: 3,
  },
];

// コースデータ（各カテゴリに数コースずつ）
export const courses: Course[] = [
  // デザインの基礎（6コース）
  {
    id: 'course-001',
    slug: 'ui-design-flow-lv1',
    title: 'UIデザインサイクル入門',
    description: 'デザインで迷走しない「正しい進め方」を体得できる',
    categoryId: 'design-basics',
    thumbnail: 'from-indigo-500 to-purple-600',
    lessonCount: 23,
    totalDuration: '約9時間',
    isPremium: false,
  },
  {
    id: 'course-002',
    slug: 'design-thinking-basics',
    title: 'デザイン思考の基本',
    description: 'ユーザー中心の問題解決アプローチを身につけられる',
    categoryId: 'design-basics',
    thumbnail: 'from-violet-500 to-indigo-600',
    lessonCount: 15,
    totalDuration: '約5時間',
    isPremium: true,
  },
  {
    id: 'course-003',
    slug: 'ux-basics',
    title: 'UXデザインの第一歩',
    description: 'ユーザー体験の設計プロセスを理解できる',
    categoryId: 'design-basics',
    thumbnail: 'from-blue-500 to-indigo-600',
    lessonCount: 12,
    totalDuration: '約4時間',
    isPremium: true,
  },
  {
    id: 'course-004',
    slug: 'design-principles',
    title: 'デザイン原則マスター',
    description: '良いデザインの判断基準を自分の中に持てる',
    categoryId: 'design-basics',
    thumbnail: 'from-cyan-500 to-blue-600',
    lessonCount: 18,
    totalDuration: '約6時間',
    isPremium: true,
  },
  {
    id: 'course-005',
    slug: 'visual-hierarchy',
    title: '視覚的階層の作り方',
    description: '情報の優先度を視覚で伝えられるようになる',
    categoryId: 'design-basics',
    thumbnail: 'from-teal-500 to-cyan-600',
    lessonCount: 10,
    totalDuration: '約3時間',
    isPremium: false,
  },
  {
    id: 'course-006',
    slug: 'design-feedback',
    title: 'デザインフィードバック入門',
    description: '建設的なフィードバックを出し・受けられるようになる',
    categoryId: 'design-basics',
    thumbnail: 'from-emerald-500 to-teal-600',
    lessonCount: 8,
    totalDuration: '約2時間',
    isPremium: false,
  },

  // 情報設計（12コース）
  {
    id: 'course-101',
    slug: 'ooui-basics',
    title: 'OOUIの基本',
    description: 'オブジェクト指向UIの考え方でUIを設計できる',
    categoryId: 'information-architecture',
    thumbnail: 'from-violet-500 to-purple-600',
    lessonCount: 20,
    totalDuration: '約7時間',
    isPremium: true,
  },
  {
    id: 'course-102',
    slug: 'ooui-content-centered',
    title: 'OOUIコンテンツ中心のUI設計',
    description: 'コンテンツから逆算してUIを組み立てられる',
    categoryId: 'information-architecture',
    thumbnail: 'from-purple-500 to-pink-600',
    lessonCount: 12,
    totalDuration: '約3時間',
    isPremium: false,
  },
  {
    id: 'course-103',
    slug: 'navigation-design',
    title: 'ナビゲーション設計',
    description: 'ユーザーが迷わないナビゲーション構造を設計できる',
    categoryId: 'information-architecture',
    thumbnail: 'from-fuchsia-500 to-purple-600',
    lessonCount: 16,
    totalDuration: '約5時間',
    isPremium: true,
  },
  {
    id: 'course-104',
    slug: 'ia-fundamentals',
    title: '情報アーキテクチャ入門',
    description: '情報の構造化と整理の原則を理解できる',
    categoryId: 'information-architecture',
    thumbnail: 'from-pink-500 to-rose-600',
    lessonCount: 14,
    totalDuration: '約4時間',
    isPremium: true,
  },
  {
    id: 'course-105',
    slug: 'user-flow-design',
    title: 'ユーザーフロー設計',
    description: 'ユーザーの行動を予測したフローを描けるようになる',
    categoryId: 'information-architecture',
    thumbnail: 'from-rose-500 to-orange-600',
    lessonCount: 11,
    totalDuration: '約3時間',
    isPremium: true,
  },
  {
    id: 'course-106',
    slug: 'screen-mapping',
    title: '画面マッピング実践',
    description: 'アプリ全体の画面構成を俯瞰して設計できる',
    categoryId: 'information-architecture',
    thumbnail: 'from-violet-600 to-indigo-700',
    lessonCount: 9,
    totalDuration: '約2時間',
    isPremium: true,
  },
  {
    id: 'course-107',
    slug: 'task-analysis',
    title: 'タスク分析と画面設計',
    description: 'ユーザータスクを分解してUIに落とし込める',
    categoryId: 'information-architecture',
    thumbnail: 'from-indigo-600 to-blue-700',
    lessonCount: 13,
    totalDuration: '約4時間',
    isPremium: true,
  },
  {
    id: 'course-108',
    slug: 'content-modeling',
    title: 'コンテンツモデリング',
    description: 'コンテンツの関係性を整理してUIに反映できる',
    categoryId: 'information-architecture',
    thumbnail: 'from-blue-600 to-cyan-700',
    lessonCount: 10,
    totalDuration: '約3時間',
    isPremium: true,
  },
  {
    id: 'course-109',
    slug: 'labeling-system',
    title: 'ラベリングシステム設計',
    description: '一貫性のある命名規則でUIをわかりやすくできる',
    categoryId: 'information-architecture',
    thumbnail: 'from-cyan-600 to-teal-700',
    lessonCount: 8,
    totalDuration: '約2時間',
    isPremium: false,
  },
  {
    id: 'course-110',
    slug: 'search-design',
    title: '検索UI設計',
    description: '効果的な検索体験を設計できる',
    categoryId: 'information-architecture',
    thumbnail: 'from-teal-600 to-emerald-700',
    lessonCount: 12,
    totalDuration: '約4時間',
    isPremium: true,
  },
  {
    id: 'course-111',
    slug: 'filtering-sorting',
    title: 'フィルタ・ソート設計',
    description: 'ユーザーが欲しい情報に素早くたどり着けるUIを作れる',
    categoryId: 'information-architecture',
    thumbnail: 'from-emerald-600 to-green-700',
    lessonCount: 10,
    totalDuration: '約3時間',
    isPremium: true,
  },
  {
    id: 'course-112',
    slug: 'mobile-ia',
    title: 'モバイルアプリの情報設計',
    description: 'スマホアプリ特有のIA課題を解決できる',
    categoryId: 'information-architecture',
    thumbnail: 'from-green-600 to-lime-700',
    lessonCount: 15,
    totalDuration: '約5時間',
    isPremium: true,
  },

  // UXリサーチ（5コース）
  {
    id: 'course-201',
    slug: 'user-interview-basics',
    title: 'ユーザーインタビュー入門',
    description: 'ユーザーから本質的なインサイトを引き出せる',
    categoryId: 'ux-research',
    thumbnail: 'from-pink-500 to-rose-600',
    lessonCount: 18,
    totalDuration: '約6時間',
    isPremium: true,
  },
  {
    id: 'course-202',
    slug: 'problem-discovery',
    title: '課題発見のフレームワーク',
    description: '真の課題を特定するための思考法を身につけられる',
    categoryId: 'ux-research',
    thumbnail: 'from-rose-500 to-red-600',
    lessonCount: 14,
    totalDuration: '約4時間',
    isPremium: true,
  },
  {
    id: 'course-203',
    slug: 'persona-journey',
    title: 'ペルソナ・ジャーニーマップ',
    description: 'ユーザー像と体験を可視化して共有できる',
    categoryId: 'ux-research',
    thumbnail: 'from-red-500 to-orange-600',
    lessonCount: 12,
    totalDuration: '約3時間',
    isPremium: true,
  },
  {
    id: 'course-204',
    slug: 'usability-testing',
    title: 'ユーザビリティテスト実践',
    description: 'デザインの問題点をユーザー視点で発見できる',
    categoryId: 'ux-research',
    thumbnail: 'from-orange-500 to-amber-600',
    lessonCount: 16,
    totalDuration: '約5時間',
    isPremium: true,
  },
  {
    id: 'course-205',
    slug: 'competitive-analysis',
    title: '競合分析の進め方',
    description: '競合から学び、差別化ポイントを見つけられる',
    categoryId: 'ux-research',
    thumbnail: 'from-amber-500 to-yellow-600',
    lessonCount: 10,
    totalDuration: '約3時間',
    isPremium: false,
  },

  // UIデザイン（14コース）
  {
    id: 'course-301',
    slug: 'visual-design-basics',
    title: 'ビジュアルデザインの基本',
    description: '見た目の良いUIを論理的に作れるようになる',
    categoryId: 'ui-design',
    thumbnail: 'from-amber-500 to-orange-600',
    lessonCount: 20,
    totalDuration: '約7時間',
    isPremium: true,
  },
  {
    id: 'course-302',
    slug: 'color-theory',
    title: '配色設計マスター',
    description: '目的に合った配色を自信を持って選べる',
    categoryId: 'ui-design',
    thumbnail: 'from-orange-500 to-red-600',
    lessonCount: 15,
    totalDuration: '約5時間',
    isPremium: true,
  },
  {
    id: 'course-303',
    slug: 'typography-ui',
    title: 'UIのためのタイポグラフィ',
    description: '読みやすく美しい文字組みを設計できる',
    categoryId: 'ui-design',
    thumbnail: 'from-red-500 to-rose-600',
    lessonCount: 12,
    totalDuration: '約4時間',
    isPremium: true,
  },
  {
    id: 'course-304',
    slug: 'icon-design',
    title: 'アイコンデザイン入門',
    description: '一貫性のあるアイコンセットを作成できる',
    categoryId: 'ui-design',
    thumbnail: 'from-rose-500 to-pink-600',
    lessonCount: 10,
    totalDuration: '約3時間',
    isPremium: false,
  },
  {
    id: 'course-305',
    slug: 'component-design',
    title: 'コンポーネント設計',
    description: '再利用可能なUIパーツを設計できる',
    categoryId: 'ui-design',
    thumbnail: 'from-pink-500 to-fuchsia-600',
    lessonCount: 18,
    totalDuration: '約6時間',
    isPremium: true,
  },
  {
    id: 'course-306',
    slug: 'form-design',
    title: 'フォームデザイン実践',
    description: 'ユーザーがストレスなく入力できるフォームを作れる',
    categoryId: 'ui-design',
    thumbnail: 'from-fuchsia-500 to-purple-600',
    lessonCount: 14,
    totalDuration: '約4時間',
    isPremium: true,
  },
  {
    id: 'course-307',
    slug: 'button-cta',
    title: 'ボタン・CTAデザイン',
    description: 'ユーザーを行動に導くボタンを設計できる',
    categoryId: 'ui-design',
    thumbnail: 'from-purple-500 to-violet-600',
    lessonCount: 8,
    totalDuration: '約2時間',
    isPremium: false,
  },
  {
    id: 'course-308',
    slug: 'card-list-design',
    title: 'カード・リストデザイン',
    description: '情報を効果的にグルーピングして表示できる',
    categoryId: 'ui-design',
    thumbnail: 'from-violet-500 to-indigo-600',
    lessonCount: 12,
    totalDuration: '約3時間',
    isPremium: true,
  },
  {
    id: 'course-309',
    slug: 'modal-dialog',
    title: 'モーダル・ダイアログ設計',
    description: '適切なタイミングで適切な情報を表示できる',
    categoryId: 'ui-design',
    thumbnail: 'from-indigo-500 to-blue-600',
    lessonCount: 10,
    totalDuration: '約3時間',
    isPremium: true,
  },
  {
    id: 'course-310',
    slug: 'empty-state',
    title: 'エンプティステート設計',
    description: '空の状態でもユーザーを導けるデザインができる',
    categoryId: 'ui-design',
    thumbnail: 'from-blue-500 to-cyan-600',
    lessonCount: 6,
    totalDuration: '約1時間',
    isPremium: false,
  },
  {
    id: 'course-311',
    slug: 'loading-feedback',
    title: 'ローディング・フィードバック',
    description: 'システム状態を適切にユーザーに伝えられる',
    categoryId: 'ui-design',
    thumbnail: 'from-cyan-500 to-teal-600',
    lessonCount: 8,
    totalDuration: '約2時間',
    isPremium: true,
  },
  {
    id: 'course-312',
    slug: 'responsive-design',
    title: 'レスポンシブデザイン',
    description: 'あらゆるデバイスで最適な体験を提供できる',
    categoryId: 'ui-design',
    thumbnail: 'from-teal-500 to-emerald-600',
    lessonCount: 16,
    totalDuration: '約5時間',
    isPremium: true,
  },
  {
    id: 'course-313',
    slug: 'dark-mode',
    title: 'ダークモード設計',
    description: 'ライト/ダーク両対応のUIを設計できる',
    categoryId: 'ui-design',
    thumbnail: 'from-slate-600 to-gray-800',
    lessonCount: 10,
    totalDuration: '約3時間',
    isPremium: true,
  },
  {
    id: 'course-314',
    slug: 'micro-interaction',
    title: 'マイクロインタラクション',
    description: '心地よいアニメーション・フィードバックを設計できる',
    categoryId: 'ui-design',
    thumbnail: 'from-emerald-500 to-green-600',
    lessonCount: 14,
    totalDuration: '約4時間',
    isPremium: true,
  },

  // Figma（2コース）
  {
    id: 'course-401',
    slug: 'figma-basics',
    title: 'Figma入門',
    description: 'Figmaの基本操作を一通りマスターできる',
    categoryId: 'figma',
    thumbnail: 'from-emerald-500 to-teal-600',
    lessonCount: 20,
    totalDuration: '約6時間',
    isPremium: false,
  },
  {
    id: 'course-402',
    slug: 'figma-components',
    title: 'Figmaコンポーネント実践',
    description: '効率的なコンポーネント設計でワークフローを改善できる',
    categoryId: 'figma',
    thumbnail: 'from-teal-500 to-cyan-600',
    lessonCount: 16,
    totalDuration: '約5時間',
    isPremium: true,
  },

  // AI × デザイン（1コース）
  {
    id: 'course-501',
    slug: 'ai-prototyping',
    title: 'AIプロトタイピング入門',
    description: 'AIツールを活用して素早くプロトタイプを作れる',
    categoryId: 'ai-design',
    thumbnail: 'from-blue-500 to-indigo-600',
    lessonCount: 12,
    totalDuration: '約4時間',
    isPremium: true,
  },

  // キャリア（3コース）
  {
    id: 'course-601',
    slug: 'portfolio-design',
    title: 'ポートフォリオ設計',
    description: '自分の強みを伝えるポートフォリオを作成できる',
    categoryId: 'career',
    thumbnail: 'from-slate-500 to-gray-600',
    lessonCount: 14,
    totalDuration: '約4時間',
    isPremium: true,
  },
  {
    id: 'course-602',
    slug: 'job-hunting',
    title: 'デザイナー転職戦略',
    description: '希望の企業に転職するための準備ができる',
    categoryId: 'career',
    thumbnail: 'from-gray-500 to-zinc-600',
    lessonCount: 10,
    totalDuration: '約3時間',
    isPremium: true,
  },
  {
    id: 'course-603',
    slug: 'designer-communication',
    title: 'デザイナーの立ち回り',
    description: 'チームで信頼されるデザイナーになれる',
    categoryId: 'career',
    thumbnail: 'from-zinc-500 to-neutral-600',
    lessonCount: 12,
    totalDuration: '約3時間',
    isPremium: true,
  },
];

// ヘルパー関数
export const getCoursesByCategory = (categoryId: string): Course[] => {
  return courses.filter((course) => course.categoryId === categoryId);
};

export const getCategoryById = (categoryId: string): Category | undefined => {
  return categories.find((cat) => cat.id === categoryId);
};

export const getTotalCourseCount = (): number => {
  return courses.length;
};

export const getFreeCourses = (): Course[] => {
  return courses.filter((course) => !course.isPremium);
};

export const getPremiumCourses = (): Course[] => {
  return courses.filter((course) => course.isPremium);
};
