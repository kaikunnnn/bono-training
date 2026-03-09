/**
 * UIデザイン情報設計基礎コース
 *
 * 使いやすいUIをつくるための基本を習得するコース
 * 顧客と目的に即したUIの検討と実現方法を学べる
 */

import type { Roadmap, RoadmapAudience, RoadmapBenefit, RoadmapStep } from '@/types/roadmap';

const audience: RoadmapAudience[] = [
  {
    label: 'UIデザイナー志望者',
    description: 'UIデザイナーを目指している方',
  },
  {
    label: '使いやすさを追求したい人',
    description: 'UIの使いやすさを論理的に設計したい方',
  },
  {
    label: 'ビジュアルの次を学びたい人',
    description: '見た目だけでなく設計力を身につけたい方',
  },
];

const benefits: RoadmapBenefit[] = [
  {
    icon: 'Layout',
    title: '使いやすいUIの設計力',
    description: 'ユーザーが迷わない、使いやすいUIを設計するスキル',
  },
  {
    icon: 'Target',
    title: '論理的な設計思考',
    description: '「なぜここに配置するのか」を説明できる設計力',
  },
  {
    icon: 'Users',
    title: '顧客目線のUI設計',
    description: '顧客と目的に即したUIの検討と実現方法',
  },
  {
    icon: 'BookOpen',
    title: 'OOUI/ナビゲーション設計',
    description: 'オブジェクト指向UIとナビゲーション設計の基本',
  },
];

const steps: RoadmapStep[] = [
  {
    stepNumber: 1,
    type: 'course',
    title: 'UIデザイン基本を習得',
    description: 'デザインの流れをトレースして、機能×UIで必須要素（モード、アクション、コンテンツ、ナビゲーション）の基礎を習得。完了目安: 1〜2週間',
    goal: 'UIを構成する4つの必須要素を理解する',
    skills: [
      'モード（状態）の設計',
      'アクション（操作）の配置',
      'コンテンツの整理と表示',
      'ナビゲーションの基本パターン',
    ],
    linkedCourseSlug: 'ui-layout-basic',
    lessonSlugs: ['ui-layout-basic', 'navigation-basics'],
  },
  {
    stepNumber: 2,
    type: 'course',
    title: '情報設計の基礎をインプット',
    description: 'OOUI（オブジェクト指向UI）の概念と、"どこに何をなぜ置くべきか"の基礎を習得。完了目安: 2週間',
    goal: '「なぜここに配置するか」を論理的に説明できる',
    skills: [
      'OOUI（オブジェクト指向UI）の考え方',
      'タスク指向とオブジェクト指向の違い',
      '情報の構造化と階層設計',
      'UI配置の根拠を言語化する力',
    ],
    linkedCourseSlug: 'ooui',
    lessonSlugs: ['ooui', 'ui-architect-beginner'],
  },
  {
    stepNumber: 3,
    type: 'course',
    title: '実践お題チャレンジ',
    description: '出張申請ソフトをデザインして、学んだ情報設計スキルを実践で活用。完了目安: 2週間',
    goal: '学んだ情報設計スキルを実務レベルで活用できる',
    skills: [
      '業務アプリのUI設計プロセス',
      'フローに沿った画面設計',
      'フォーム設計と入力フロー',
      '情報設計の実践的な適用',
    ],
    linkedCourseSlug: 'uiflowchallenge-businesstripsoftwear',
    lessonSlugs: ['uiflowchallenge-businesstripsoftwear'],
  },
];

export const informationArchitectureRoadmap: Roadmap = {
  id: 'information-architecture',
  slug: 'information-architecture',
  title: '情報設計基礎',
  subtitle: '使いやすいUIを設計する',
  description:
    '使いやすいUIをつくるための基本を習得するコース。顧客と目的に即したUIの検討と実現方法を学びます。',
  stats: {
    duration: '1〜2ヶ月',
    stepsCount: 3,
    lessonsCount: 5,
    estimatedHours: '30時間',
  },
  audience,
  benefits,
  steps,
  aboutPageUrl: '/roadmaps/information-architecture/about',
  relatedGuideSlug: 'roadmap-ia',
  gradientColors: 'from-blue-500 to-cyan-600',
};

export default informationArchitectureRoadmap;
