/**
 * 未経験から転職ロードマップ
 *
 * 4つのコースを順番に学ぶメタロードマップ。
 * UIデザイン入門（無料）→ UIビジュアル入門 → 情報設計基礎 → UX基礎 → ポートフォリオ
 */

import type {
  Roadmap,
  RoadmapAudience,
  RoadmapBenefit,
  RoadmapStep,
} from "../../types/roadmap";

// ============================================
// 対象者（Audience）
// ============================================

const audience: RoadmapAudience[] = [
  {
    label: "UI未経験者",
    description: "UIデザインを学んだことがない方、デザインツールを触ったことがない方",
  },
  {
    label: "デザイン未経験者",
    description: "デザインの基礎知識がなく、ゼロからスキルを身につけたい方",
  },
  {
    label: "転職希望者",
    description: "UIUXデザイナーとして転職を目指している方",
  },
];

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
  // Step 1: 転職条件と学習準備
  {
    stepNumber: 1,
    type: "course",
    title: "転職条件と学習準備",
    description:
      "デザイナーとして転職するために必要なことを理解しよう。独学の心構えと注意点を確認してからスタート。",
    goal: "転職に必要なスキルと学習計画の全体像を把握する",
    skills: [
      "UIUXデザイナーの仕事内容の理解",
      "転職に必要なスキルセットの把握",
      "効果的な独学の進め方",
    ],
    linkedCourseSlug: "wayofuiuxdesigner",
    lessonSlugs: [
      "wayofuiuxdesigner", // UI/UXデザイナー転職ガイド
    ],
  },

  // Step 2: デザインツール習得
  {
    stepNumber: 2,
    type: "course",
    title: "デザインツール習得",
    description:
      "まずはFigmaの使い方をマスターしよう。デザインツールを使えることが全ての土台になる。期間: 1ヶ月",
    goal: "Figmaを使って基本的なUIを自力で作れるようになる",
    skills: [
      "Figmaの基本操作（フレーム、シェイプ、テキスト）",
      "Auto Layoutによる効率的なデザイン",
      "UIトレースによる観察力",
    ],
    linkedCourseSlug: "uidezainru-men",
    linkedRoadmapSlug: "ui-design-beginner",
    lessonSlugs: [
      "figmabeginner",    // Figmaの使い方入門
      "figma-elementary", // Figmaの使い方初級
      "uidesignbeginner", // はじめてのUIデザイン
    ],
  },

  // Step 3: UIビジュアル基礎
  {
    stepNumber: 3,
    type: "course",
    title: "UIビジュアル基礎",
    description:
      "UIの見た目の基礎を学ぶ。サイズ、色、タイポグラフィなど、デザインの根幹となるスキルを習得。期間: 1-2ヶ月",
    goal: "デザインの「見た目」を論理的に説明できるようになる",
    skills: [
      "サイズと余白の設計（8の倍数ルール）",
      "配色とカラーシステムの構築",
      "タイポグラフィの基本原則",
      "UIコンポーネントの設計",
    ],
    linkedCourseSlug: "uivisual-course",
    linkedRoadmapSlug: "ui-visual",
    lessonSlugs: [
      "ui-design-flow-lv1",        // UIデザインサイクル入門
      "steel-design-sense",        // センスを盗む技術
      "three-structures-ui-design", // 3構造ではじめるUIデザイン
      "tutorial-uivisual",         // ゼロからはじめるUIビジュアル
      "ui-typography",             // UIタイポグラフィ入門
      "uivisual",                  // UIビジュアルの入門基礎
      "graphicbeginner",           // グラフィック入門
      "dailyui-part01",            // DailyUI Part01
    ],
  },

  // Step 4: 情報設計基礎
  {
    stepNumber: 4,
    type: "course",
    title: "情報設計基礎",
    description:
      "使いやすいUIを設計するための考え方を学ぶ。「どこに、何を、なぜ配置するか」を論理的に説明できるようになる。期間: 2ヶ月",
    goal: "「使いやすさ」を設計できるようになる",
    skills: [
      "OOUI（オブジェクト指向UI）の考え方",
      "ナビゲーション設計",
      "情報の優先順位と構造化",
      "ユーザーの行動フローに沿ったUI設計",
    ],
    linkedCourseSlug: "infomationarchitect-beginner",
    linkedRoadmapSlug: "information-architecture",
    lessonSlugs: [
      "ui-layout-basic",                       // つかいやすいUIの秘密
      "navigation-basics",                     // ナビゲーションUIの基本
      "ooui",                                  // OOUIコンテンツ中心のUI設計
      "ui-architect-beginner",                 // ゼロからはじめるUI情報設計
      "uiflowchallenge-businesstripsoftwear",  // 実践課題
    ],
  },

  // Step 5: UXデザイン基礎
  {
    stepNumber: 5,
    type: "course",
    title: "UXデザイン基礎",
    description:
      "ユーザー中心の課題解決アプローチを学ぶ。インタビュー、価値定義、プロトタイピングの基本を習得。期間: 2ヶ月",
    goal: "ユーザーの課題を発見し、解決策を提案できるようになる",
    skills: [
      "ユーザーインタビューの設計と実施",
      "課題の発見と定義",
      "サービスの価値定義",
      "仮説検証のプロセス",
    ],
    linkedCourseSlug: "ux-beginner-2",
    linkedRoadmapSlug: "ux-design",
    lessonSlugs: [
      "ux-beginner-2",            // UXデザインってなに？
      "uxdezaintohahe-ka-copy",   // UX入門/顧客体験デザインの基本
      "ux-biginner",              // はじめてのUXデザイン
      "zerokara-userinterview",   // ゼロからユーザーインタビュー
      "designyourownservice",     // チャレンジ課題
    ],
  },

  // Step 6: 転職準備
  {
    stepNumber: 6,
    type: "course",
    title: "転職準備",
    description:
      "転職活動に向けて、学んだスキルをまとめたポートフォリオを作成する。",
    goal: "転職活動で使えるポートフォリオを完成させる",
    skills: [
      "ポートフォリオの構成設計",
      "ケーススタディの書き方",
      "デザインプロセスの言語化",
      "採用担当者に響く見せ方",
    ],
    linkedCourseSlug: "portfolio",
    lessonSlugs: [
      "portfolio", // ポートフォリオの作り方
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
    lessonsCount: 23, // Step 1-6の合計: 1+3+8+5+5+1=23
    estimatedHours: "100時間以上",
  },
  audience,
  benefits,
  steps,
  aboutPageUrl: "/roadmaps/career-change/about",
  relatedGuideSlug: "roadmap-career-change",
  gradientColors: "from-blue-600 to-purple-600",
};

export default careerChangeRoadmap;
