/**
 * ロードマップコースデータ
 * Webflow分析ドキュメントからの正確なデータ
 */

import type { RoadmapCourse, RelatedCourse } from './types';

// 関連コースの共通データ
const relatedCourses: Record<string, RelatedCourse> = {
  uivisual: {
    id: 'uivisual',
    title: 'UIビジュアル入門コース',
    description: 'UIデザインの"見た目の基礎"を学べるコース',
    slug: 'uivisual-course',
    topics: ['サイズの決め方', 'グラフィックアイデア', '色の選び方', 'デザインシステム基礎', 'レイアウト'],
  },
  ia: {
    id: 'ia',
    title: '情報設計入門コース',
    description: '使いやすいUIを作るための基本を習得',
    slug: 'infomationarchitect-beginner',
    topics: ['使いやすいUI', '目的→UIに変換', 'OOUI', 'UIアイデア', 'ユーザーフロー', 'UIの要件定義書'],
  },
  ux: {
    id: 'ux',
    title: 'UX入門コース',
    description: 'ユーザー中心設計の基礎を学習',
    slug: 'ux-beginner',
    topics: ['N=1ヒアリング', '顧客を軸にしたUIデザイン', 'ユーザーフロー', '価値定義シート', 'ゼロからサービス作成'],
  },
};

// UIビジュアル入門コース
export const uivisualCourse: RoadmapCourse = {
  id: 'uivisual',
  slug: 'uivisual-course',
  title: 'UIビジュアル入門コース',
  description: 'UIデザインの"見た目の基礎"を学べるコースです。どうサイズを決めるのか？など現場でよく使われる考え方と視点を習得することができます。',
  duration: '1~2ヶ月',
  price: '￥5,800~/月',
  color: '#3B82F6', // Blue
  icon: 'UI',
  steps: [
    {
      number: 1,
      title: '上達するデザインの進め方',
      goal: '基本の進め方を習得',
      duration: '3〜7日',
      description: '全てのデザインの基本の『進め方』を理解して、ここから先使っていきましょう',
      contents: [
        {
          id: 'ui-design-cycle',
          title: 'UIデザインサイクル入門',
          description: 'デザインには"正しい進め方"の基礎があります。基本の型を身につけて、迷わず作り、確実に上達していこう',
          label: '実践して理解',
          link: '/series/ui-design-cycle',
          note: 'ベータ版の別サイトで進行',
        },
        {
          id: 'steal-sense',
          title: 'センスを盗む技術',
          description: '表現の基礎は理論だけじゃ学べません。常に良いものから基本を盗んでレベルアップしましょう',
          label: '実践して理解',
          link: '/series/steal-sense',
        },
      ],
    },
    {
      number: 2,
      title: 'ToDoサービスをデザイン',
      goal: 'ToDoアプリをデザインしよう',
      duration: '1〜2週間',
      description: 'やり方をマネしてUIの見た目の構築をはじめよう',
      contents: [
        {
          id: '3-structure-ui',
          title: '3構造ではじめるUIデザイン',
          description: 'UIを構成する必須の3要素を理解しよう。UIデザインで意識すべき要素を早めに知ると成長が加速します',
          label: 'チュートリアル',
          link: '/series/3-structure-ui',
        },
        {
          id: 'zero-ui-visual',
          title: 'ゼロからはじめるUIビジュアル',
          description: 'ステップバイステップでUIデザインを一緒にしていくコンテンツ。Todoアプリの主要画面を、やり方を真似しながらデザイン。作りながらUIデザインの基本原則を学びます',
          label: 'チュートリアル',
          link: '/series/zero-ui-visual',
        },
      ],
    },
    {
      number: 3,
      title: 'UIの基礎要素を習得',
      goal: 'UIビジュアルの基礎を学ぶ',
      duration: '2週間',
      description: 'UIの見た目の基本を身につけよう',
      contents: [
        {
          id: 'ui-typography',
          title: 'UIタイポグラフィ入門',
          description: 'UIデザインの視点からタイポグラフィの基本をしっかり学び、文字がデザインに与える影響を身につけよう',
          label: '実践しながら理解',
          link: '/series/ui-typography',
        },
        {
          id: 'ui-visual-basics',
          title: 'UIビジュアルの入門基礎',
          description: '6つの『UI見た目の基本』の理解をUIを作りながら進める実践型コンテンツ',
          label: '実践しながら理解',
          link: '/series/ui-visual-basics',
        },
        {
          id: 'graphic-intro',
          title: 'グラフィック入門',
          description: '『表層』をマネして雰囲気をデザインする方法を実践して習得しよう',
          label: '実践しながら理解',
          link: '/series/graphic-intro',
        },
      ],
    },
    {
      number: 4,
      title: 'ゼロからデザインしてみよう',
      goal: '音声SNSアプリをデザイン',
      duration: '2週間',
      description: '身につけたことを実践しよう',
      contents: [
        {
          id: 'dailyui-voice-sns',
          title: 'DailyUI 音声SNS',
          description: 'UIを自分でデザインしながら基本パターンの解説をインプットできる基礎シリーズです',
          label: 'DailyUI TUTORIAL',
          link: '/series/dailyui-voice-sns',
        },
      ],
    },
  ],
  relatedCourses: [relatedCourses.ia, relatedCourses.ux],
  completionMessage: '身につけた基礎を使って最後のデザインお題を終えたらコース終了です。お疲れさまでした！お茶でも一息ついてください',
};

// 情報設計入門コース
export const iaCourse: RoadmapCourse = {
  id: 'ia',
  slug: 'infomationarchitect-beginner',
  title: '情報設計入門コース',
  description: '使いやすいUIをつくるための基本を習得するコースです。顧客、目的に即したUIを検討→実現する、デザインの組み立て方を身につけます。',
  duration: '2ヶ月',
  price: '￥5,800~/月',
  color: '#F97316', // Orange
  icon: 'IA',
  steps: [
    {
      number: 1,
      title: 'つかいやすUIの習得',
      goal: 'デザインの流れをトレース',
      duration: '1-2週間',
      contents: [
        {
          id: 'ui-layout-basic',
          title: 'つかいやすいUIの秘密',
          description: 'モード、アクション、コンテンツ、ナビゲーションの基本を学ぶ',
          label: '実践して理解',
          link: '/series/ui-layout-basic',
        },
        {
          id: 'navigation-basics',
          title: 'ナビゲーションUIの基本',
          description: '悪いUIを改善しながら情報設計を学ぶ。リデザインとビデオチュートリアルを通じてナビゲーションの基礎を習得',
          label: '実践して理解',
          link: '/series/navigation-basics',
        },
      ],
    },
    {
      number: 2,
      title: '情報設計の進め方を習得',
      goal: '基本概念を知ろう',
      duration: '2週間',
      description: 'UIの中心は「コンテンツ」',
      contents: [
        {
          id: 'ooui',
          title: 'OOUI コンテンツ中心のUI設計',
          description: '「オブジェクト指向UI設計」の基礎シリーズ。「コンテンツがUIの中心である」という核となる原則を解説',
          label: 'チュートリアル',
          link: '/series/ooui',
        },
        {
          id: 'ui-architect-beginner',
          title: 'ゼロからはじめるUI情報設計',
          description: '「どこに、何を、なぜ配置するか？」という基礎的な問いを追跡し、情報設計スキルを構築',
          label: 'チュートリアル',
          link: '/series/ui-architect-beginner',
        },
      ],
    },
    {
      number: 3,
      title: '実践お題にチャレンジ',
      goal: '出張申請ソフトをデザイン',
      duration: '2週間',
      contents: [
        {
          id: 'training-challenge',
          title: 'ボノトレからお題を選ぶ',
          description: 'BONOトレーニングプラットフォームから情報設計の課題を選択',
          label: 'チャレンジ',
          link: '/training',
        },
      ],
      challenge: {
        id: 'business-trip-challenge',
        title: '出張申請ソフトをデザインしよう',
        description: '出張申請ソフトの管理画面UIを、指定された要件を満たすように作成',
        duration: '2週間',
        link: '/series/uiflowchallenge-businesstripsoftwear',
      },
    },
  ],
  relatedCourses: [relatedCourses.uivisual, relatedCourses.ux],
  completionMessage: '身につけた基礎を使って最後のデザインお題を終えたらコース終了です',
};

// UX入門コース
export const uxCourse: RoadmapCourse = {
  id: 'ux',
  slug: 'ux-beginner',
  title: 'UX入門コース',
  subtitle: 'UX DESIGN BASIC',
  description: 'UI/UXデザインで必須の『顧客を中心』にした課題解決のデザイン手法を学びます',
  duration: '2ヶ月',
  price: '¥4,378〜/月',
  color: '#8B5CF6', // Purple
  icon: 'UX',
  steps: [
    {
      number: 1,
      title: 'ゴールと進め方の確認',
      goal: 'UXデザイン＝何かを理解',
      duration: '3日',
      description: 'コース進め方を2週間単位で計画',
      contents: [
        {
          id: 'course-about',
          title: 'コースについて',
          description: 'コースゴール・目的把握、スケジュール立案',
          label: '入門',
          duration: '1時間',
          link: '/series/ux-course-about',
        },
        {
          id: 'what-is-ux',
          title: 'UXデザインってなに？',
          description: '顧客中心のユーザー体験デザインとは',
          label: '入門',
          duration: '5-6時間',
          link: '/series/what-is-ux',
        },
      ],
    },
    {
      number: 2,
      title: '架空サービスの『価値定義』仮説をつくろう',
      goal: 'ゴールダイレクテッドデザインを習得',
      duration: '1週間',
      description: '架空サービス価値定義仮説を立案',
      contents: [
        {
          id: 'ux-intro',
          title: 'UX入門',
          description: '顧客体験のつくりかた学習',
          label: '入門',
          duration: '4時間',
          link: '/series/ux-intro',
        },
        {
          id: 'first-ux-design',
          title: 'はじめてのUXデザイン',
          description: '顧客体験作成フロー把握',
          label: '基礎',
          duration: '4時間',
          link: '/series/first-ux-design',
        },
      ],
      challenge: {
        id: 'value-definition-challenge',
        title: '架空サービスの価値定義を仮説でつくろう',
        description: '架空サービスの価値定義仮説を立案',
        duration: '3日',
        link: '/challenge/value-definition',
      },
    },
    {
      number: 3,
      title: 'インタビューで『顧客理解』に挑戦',
      goal: 'ユーザーインタビューで課題要因特定',
      duration: '2週間',
      description: '課題とインタビュー必要性を理解',
      contents: [
        {
          id: 'user-interview',
          title: 'ゼロからユーザーインタビュー',
          description: 'インタビュー実施方法を習得',
          label: '実践して理解',
          duration: '3時間',
          link: '/series/user-interview',
        },
      ],
      challenge: {
        id: 'interview-challenge',
        title: 'ユーザーインタビューを実践しよう',
        description: '実際にインタビューを実施して課題を特定',
        duration: '1週間',
        link: '/challenge/user-interview',
      },
    },
    {
      number: 4,
      title: '架空サービスを完成させよう',
      goal: '課題要因に対し解決策をUIに変換',
      duration: '1ヶ月',
      description: 'ユーザー課題解決サービスをデザイン',
      contents: [],
      challenge: {
        id: 'final-challenge',
        title: '顧客の課題を解決する架空サービスをデザインしよう',
        description: '顧客インタビュー実施＆課題特定、課題要因に対し解決策をUIに変換',
        duration: '1ヶ月',
        link: '/challenge/final-service',
      },
    },
  ],
  relatedCourses: [relatedCourses.uivisual, relatedCourses.ia],
  completionMessage: '身につけた基礎を使って最後のデザインお題を終えたらコース終了です',
};

// 全コースをエクスポート
export const roadmapCourses: RoadmapCourse[] = [
  uivisualCourse,
  iaCourse,
  uxCourse,
];

// コースをslugで取得
export const getCourseBySlug = (slug: string): RoadmapCourse | undefined => {
  return roadmapCourses.find(course => course.slug === slug);
};

// コースをIDで取得
export const getCourseById = (id: string): RoadmapCourse | undefined => {
  return roadmapCourses.find(course => course.id === id);
};
