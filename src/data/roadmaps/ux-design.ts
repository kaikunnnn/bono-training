/**
 * UXデザイン基礎コース
 *
 * UI/UXデザインで必須の"顧客を中心"にした課題解決のデザイン手法を学ぶ
 */

import type { Roadmap, RoadmapAudience, RoadmapBenefit, RoadmapStep } from '@/types/roadmap';

const audience: RoadmapAudience[] = [
  {
    label: 'UI/UXデザイン初心者',
    description: 'UXデザインを基礎から学びたい方',
  },
  {
    label: '見た目から脱却したい人',
    description: '見た目だけのデザインから脱却したい方',
  },
  {
    label: '顧客理解を深めたい人',
    description: '顧客理解に基づくデザイン手法を習得したい方',
  },
];

const benefits: RoadmapBenefit[] = [
  {
    icon: 'Users',
    title: '顧客中心の課題解決',
    description: 'ユーザーの課題を理解し、解決するためのデザイン思考',
  },
  {
    icon: 'Target',
    title: '価値定義スキル',
    description: 'サービスの価値を明確に定義し、デザインに落とし込む力',
  },
  {
    icon: 'BookOpen',
    title: 'ユーザーインタビュー',
    description: 'ユーザーインタビューで顧客の本当の課題を発見する方法',
  },
  {
    icon: 'PenTool',
    title: '実践的なUXデザイン',
    description: '架空サービスを通じて、実践的なUXデザインプロセスを体験',
  },
];

const steps: RoadmapStep[] = [
  {
    stepNumber: 1,
    type: 'course',
    title: 'ゴールと進め方の確認',
    description: 'UXデザインとは何かを理解し、コースのゴールと進め方を確認。期間: 3日',
    linkedCourseSlug: 'ux-beginner-2',
    lessonSlugs: ['ux-beginner-2'], // UXデザインってなに？
  },
  {
    stepNumber: 2,
    type: 'course',
    title: '架空サービスの「価値定義」仮説をつくろう',
    description: 'ゴールダイレクテッドデザインを習得し、サービスの価値を定義。期間: 1週間',
    linkedCourseSlug: 'uxdezaintohahe-ka-copy',
    lessonSlugs: [
      'uxdezaintohahe-ka-copy', // UX入門/顧客体験デザインの基本
      'ux-biginner',            // はじめてのUXデザイン
    ],
  },
  {
    stepNumber: 3,
    type: 'course',
    title: 'インタビューで"顧客理解"に挑戦',
    description: 'ユーザーインタビューで課題要因を特定するスキルを習得。期間: 2週間',
    linkedCourseSlug: 'zerokara-userinterview',
    lessonSlugs: ['zerokara-userinterview'], // ゼロからユーザーインタビュー
  },
  {
    stepNumber: 4,
    type: 'course',
    title: '架空サービスを完成させよう',
    description: 'ユーザーの課題解決するサービスをデザイン。総合的な実践課題。期間: 1ヶ月',
    linkedCourseSlug: 'designyourownservice',
    lessonSlugs: ['designyourownservice'], // チャレンジ課題
  },
];

export const uxDesignRoadmap: Roadmap = {
  id: 'ux-design',
  slug: 'ux-design',
  title: 'UXデザイン基礎',
  subtitle: '顧客中心のデザイン',
  description:
    'UI/UXデザインで必須の"顧客を中心"にした課題解決のデザイン手法を学びます。インタビューから価値定義まで、実践的なUXデザインプロセスを習得。',
  stats: {
    duration: '2ヶ月',
    stepsCount: 4,
    lessonsCount: 5,
    estimatedHours: '50時間',
  },
  audience,
  benefits,
  steps,
  aboutPageUrl: '/roadmaps/ux-design/about',
  gradientColors: 'from-orange-500 to-red-600',
};

export default uxDesignRoadmap;
