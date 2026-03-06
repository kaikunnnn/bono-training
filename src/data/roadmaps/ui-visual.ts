/**
 * UIビジュアル入門コース
 *
 * UIデザインの"見た目の基礎"を学べるコース
 * どうサイズを決めるのか？など現場でよく使われる考え方と視点を習得
 */

import type { Roadmap, RoadmapAudience, RoadmapBenefit, RoadmapStep } from '@/types/roadmap';

const audience: RoadmapAudience[] = [
  {
    label: 'UI未経験者',
    description: '未経験からUIデザインを始めたい方',
  },
  {
    label: '見た目の基本を学びたい人',
    description: 'デザインの見た目の基本を理解したい学習者',
  },
  {
    label: 'スキルアップしたい人',
    description: 'UIビジュアルスキルを体系的に学びたい方',
  },
];

const benefits: RoadmapBenefit[] = [
  {
    icon: 'Palette',
    title: 'UIの見た目構築スキル',
    description: 'サイズ、色、タイポグラフィなどUIの見た目を作る基礎を習得',
  },
  {
    icon: 'Layout',
    title: 'デザインの進め方の基本',
    description: '現場で使われる効率的なデザインプロセスを学ぶ',
  },
  {
    icon: 'PenTool',
    title: '実践的なUIデザイン能力',
    description: 'ToDoアプリや音声SNSなど実際のUIをデザインする力',
  },
  {
    icon: 'Target',
    title: 'センスを磨く技術',
    description: '良いデザインを分析し、自分のスキルに取り込む方法',
  },
];

const steps: RoadmapStep[] = [
  {
    stepNumber: 1,
    type: 'course',
    title: '上達するデザインの進め方',
    description: 'デザインの基本的な進め方を習得。効率的にスキルアップするための土台を作る。完了目安: 3〜7日',
    linkedCourseSlug: 'ui-design-flow-lv1',
    lessonSlugs: ['ui-design-flow-lv1', 'steel-design-sense'],
  },
  {
    stepNumber: 2,
    type: 'course',
    title: 'ToDoサービスをデザイン',
    description: 'マネから始めてToDoアプリをデザインしながら、実践的なUIデザインスキルを習得。完了目安: 1〜2週間',
    linkedCourseSlug: 'three-structures-ui-design',
    lessonSlugs: ['three-structures-ui-design', 'tutorial-uivisual'],
  },
  {
    stepNumber: 3,
    type: 'course',
    title: 'UIの基礎要素を習得',
    description: '見た目の基本6要素（タイポグラフィ、色、サイズなど）を体系的に学ぶ。完了目安: 2週間',
    linkedCourseSlug: 'ui-typography',
    lessonSlugs: ['ui-typography', 'uivisual', 'graphicbeginner'],
  },
  {
    stepNumber: 4,
    type: 'course',
    title: 'ゼロからデザインしてみよう',
    description: '音声SNSアプリをゼロからデザイン。学んだスキルを総合的に活用。完了目安: 2週間',
    linkedCourseSlug: 'dailyui-part01',
    lessonSlugs: ['dailyui-part01'],
  },
];

export const uiVisualRoadmap: Roadmap = {
  id: 'ui-visual',
  slug: 'ui-visual',
  title: 'UIビジュアル入門',
  subtitle: '見た目の基礎を学ぶ',
  description:
    'UIデザインの"見た目の基礎"を学べるコース。どうサイズを決めるのか？など現場でよく使われる考え方と視点を習得します。',
  stats: {
    duration: '1〜2ヶ月',
    stepsCount: 4,
    lessonsCount: 8,
    estimatedHours: '40時間',
  },
  audience,
  benefits,
  steps,
  aboutPageUrl: '/roadmaps/ui-visual/about',
  gradientColors: 'from-purple-500 to-pink-600',
};

export default uiVisualRoadmap;
