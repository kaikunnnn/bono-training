/**
 * UIデザイン入門コース
 *
 * UIトレースを中心に未経験からでもUIデザインを行う土台を身につけるコース
 * Figmaの操作方法をUIを作りながら学ぶ
 *
 * ※ほぼすべて無料で利用可能
 */

import type { Roadmap, RoadmapAudience, RoadmapBenefit, RoadmapStep } from '@/types/roadmap';

const audience: RoadmapAudience[] = [
  {
    label: '未経験者',
    description: 'デザインツールを触ったことがない方',
  },
  {
    label: 'UIデザイナー転職希望者',
    description: 'UIデザイナーへの転職を目指している方',
  },
  {
    label: 'Figma初心者',
    description: 'Figmaの使い方を基礎から学びたい方',
  },
];

const benefits: RoadmapBenefit[] = [
  {
    icon: 'PenTool',
    title: 'Figmaの基本操作',
    description: 'デザインツールFigmaの使い方を、UIを作りながら学習',
  },
  {
    icon: 'Layout',
    title: 'UIトレーススキル',
    description: '既存アプリのUIをトレースして、デザインの基礎を習得',
  },
  {
    icon: 'Target',
    title: 'UIデザインの土台',
    description: '未経験からUIデザインを行うための基礎力を構築',
  },
  {
    icon: 'BookOpen',
    title: '実践的な課題',
    description: 'YouTubeやTwitterのUIトレース、連絡帳アプリのデザイン',
  },
];

const steps: RoadmapStep[] = [
  {
    stepNumber: 1,
    type: 'course',
    title: 'Figmaの使い方をゼロから習得しよう',
    description: 'YouTubeアプリをトレースしながらFigmaの基本操作を習得。完了目安は1週間。',
    goal: 'Figmaの基本操作ができるようになる',
    skills: [
      'フレームとシェイプの作成',
      'テキストの入力と編集',
      '画像の配置と調整',
      'レイヤーの管理',
    ],
    linkedCourseSlug: 'figmabeginner',
    lessonSlugs: ['figmabeginner'],
  },
  {
    stepNumber: 2,
    type: 'course',
    title: 'FigmaのAuto Layoutを習得しよう',
    description: 'Twitter UIをトレースしてAuto Layoutなど実践的なFigmaスキルを習得。完了目安は1週間。',
    goal: '効率的にUIを作れるAuto Layoutをマスターする',
    skills: [
      'Auto Layoutの基本操作',
      'パディングとギャップの設定',
      'コンポーネントの作成',
      '再利用可能なUI部品の設計',
    ],
    linkedCourseSlug: 'figma-elementary',
    lessonSlugs: ['figma-elementary'],
  },
  {
    stepNumber: 3,
    type: 'course',
    title: '連絡帳をデザインしてUIの基本に触れる',
    description: '連絡帳アプリをデザインして、UIの基本概念を理解。完了目安は1週間。',
    goal: '実際のアプリUIを自分でデザインできるようになる',
    skills: [
      'アプリ画面の構成の理解',
      'リスト表示のデザイン',
      '詳細画面のデザイン',
      '画面間の関係性の把握',
    ],
    linkedCourseSlug: 'uidesignbeginner',
    lessonSlugs: ['uidesignbeginner'],
  },
];

export const uiDesignBeginnerRoadmap: Roadmap = {
  id: 'ui-design-beginner',
  slug: 'ui-design-beginner',
  title: 'UIデザイン入門',
  subtitle: '無料で始められる',
  description:
    'UIトレースを中心に未経験からでもUIデザインを行う土台を身につけるコース。Figmaの操作方法をUIを作りながら学びます。',
  stats: {
    duration: '1〜2ヶ月',
    stepsCount: 3,
    lessonsCount: 3,
    estimatedHours: '20時間',
  },
  audience,
  benefits,
  steps,
  aboutPageUrl: '/roadmaps/ui-design-beginner/about',
  relatedGuideSlug: 'roadmap-ui-beginner',
  gradientColors: 'from-green-500 to-emerald-600',
};

export default uiDesignBeginnerRoadmap;
