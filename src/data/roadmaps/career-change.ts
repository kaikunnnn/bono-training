/**
 * 未経験から転職ロードマップ
 *
 * 4つのコースを順番に学ぶメタロードマップ。
 * UIデザイン入門（無料）→ UIビジュアル入門 → 情報設計基礎 → UX基礎 → ポートフォリオ
 */

import type {
  Roadmap,
  RoadmapBenefit,
  RoadmapStep,
} from "../../types/roadmap";

// ============================================
// 得られるもの（Benefits）
// ============================================

const benefits: RoadmapBenefit[] = [
  {
    icon: "Palette",
    title: "UIデザインの基礎スキル",
    description:
      "サイズ、色、タイポグラフィなど、UIの見た目を作る基礎を習得",
  },
  {
    icon: "Layout",
    title: "情報設計の考え方",
    description:
      "使いやすいUIを設計するための論理的な思考プロセスを身につける",
  },
  {
    icon: "Users",
    title: "UXデザインの基本",
    description:
      "ユーザー中心の課題解決アプローチと顧客理解の手法を習得",
  },
  {
    icon: "Briefcase",
    title: "転職に必要なポートフォリオ",
    description:
      "実践課題を通じて、転職活動で使えるポートフォリオを構築",
  },
];

// ============================================
// ステップ定義
// ============================================

const steps: RoadmapStep[] = [
  // Step 0: 転職の理解（特殊ステップ）
  {
    stepNumber: 0,
    type: "special",
    title: "転職の理解",
    description:
      "デザイナーとして転職するために必要なことを理解しよう。独学の心構えと注意点を確認してからスタート。",
    content: {
      links: [
        {
          title: "未経験からUI/UXデザイナーになるには",
          url: "https://www.bo-no.design/blog/uiux-career-guide",
          description: "転職に必要なスキルと準備を解説",
          icon: "BookOpen",
        },
        {
          title: "独学でデザインを学ぶ際の注意点",
          url: "https://www.bo-no.design/blog/self-study-tips",
          description: "効率的に学ぶためのマインドセット",
          icon: "AlertCircle",
        },
        {
          title: "デザイナーのポートフォリオとは",
          url: "https://www.bo-no.design/blog/portfolio-basics",
          description: "転職活動で見られるポイント",
          icon: "FolderOpen",
        },
      ],
      guidance: [
        {
          title: "ゴールを明確にする",
          description:
            "「なぜデザイナーになりたいのか」を言語化することで、学習のモチベーションが維持できる",
          icon: "Target",
        },
        {
          title: "毎日少しでも続ける",
          description:
            "1日30分でもいいので継続することが上達の鍵。週末にまとめてやるより効果的",
          icon: "Calendar",
        },
        {
          title: "アウトプットを意識する",
          description:
            "インプットだけでなく、実際に手を動かしてデザインを作ることが重要",
          icon: "PenTool",
        },
      ],
      tips: [
        "完璧を目指さず、まずは作ってみることが大切",
        "他の人のデザインを参考にすることは悪いことではない",
        "フィードバックをもらえる環境を作ろう",
      ],
    },
  },

  // Step 1: UIデザイン入門（無料）
  {
    stepNumber: 1,
    type: "course",
    title: "デザインツールの習得",
    description:
      "まずはFigmaの使い方をマスターしよう。デザインツールを使えることが全ての土台になる。",
    linkedCourseSlug: "uidezainru-men",
    lessonSlugs: [
      // TODO: Sanityからレッスンスラッグを取得して設定
    ],
  },

  // Step 2: UIビジュアル入門
  {
    stepNumber: 2,
    type: "course",
    title: "ビジュアルの基礎",
    description:
      "UIの見た目の基礎を学ぶ。サイズ、色、タイポグラフィなど、デザインの根幹となるスキルを習得。",
    linkedCourseSlug: "uivisual-course",
    lessonSlugs: [
      // TODO: Sanityからレッスンスラッグを取得して設定
    ],
  },

  // Step 3: 情報設計基礎
  {
    stepNumber: 3,
    type: "course",
    title: "情報設計",
    description:
      "使いやすいUIを設計するための考え方を学ぶ。「どこに、何を、なぜ配置するか」を論理的に説明できるようになる。",
    linkedCourseSlug: "infomationarchitect-beginner",
    lessonSlugs: [
      // TODO: Sanityからレッスンスラッグを取得して設定
    ],
  },

  // Step 4: UX基礎
  {
    stepNumber: 4,
    type: "course",
    title: "顧客課題解決",
    description:
      "ユーザー中心の課題解決アプローチを学ぶ。インタビュー、価値定義、プロトタイピングの基本を習得。",
    linkedCourseSlug: "ux-beginner",
    lessonSlugs: [
      // TODO: Sanityからレッスンスラッグを取得して設定
    ],
  },

  // Step 5: ポートフォリオ
  {
    stepNumber: 5,
    type: "course",
    title: "ポートフォリオ",
    description:
      "転職活動に向けて、学んだスキルをまとめたポートフォリオを作成する。",
    linkedCourseSlug: "portfolio",
    lessonSlugs: [
      // TODO: ポートフォリオコースのスラッグを設定
    ],
  },
];

// ============================================
// ロードマップ本体
// ============================================

export const careerChangeRoadmap: Roadmap = {
  id: "career-change",
  slug: "career-change",
  title: "未経験から転職ロードマップ",
  subtitle: "未経験からUIUXデザイナーへ",
  description:
    "UIデザインの基礎から、情報設計、UXデザインまで。転職に必要なスキルを6ヶ月で体系的に学ぶロードマップ。",
  stats: {
    duration: "6ヶ月",
    stepsCount: 6,
    lessonsCount: 50, // TODO: 実際の数を計算
    estimatedHours: "100時間以上",
  },
  benefits,
  steps,
  aboutPageUrl: "/roadmaps/career-change/about",
  gradientColors: "from-blue-600 to-purple-600",
};

export default careerChangeRoadmap;
