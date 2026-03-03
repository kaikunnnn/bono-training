/**
 * 共通レッスンデータ - 全20パターンで使用
 * 「UIが上手くなる人の"デザインサイクル" ─ 入門編β」の実データ
 * Sanityから取得した実際のコンテンツ
 */

export interface Article {
  id: string;
  title: string;
  slug: string;
  duration: string | null;
  type: 'intro' | 'explain' | 'practice' | 'challenge' | 'demo';
  completed: boolean;
  isPremium: boolean;
}

export interface Quest {
  id: string;
  number: number;
  title: string;
  description: string;
  goal: string;
  estTimeMins: number;
  articles: Article[];
  completed: boolean;
}

export interface LessonData {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  instructor: {
    name: string;
    title: string;
    avatar: string;
    message: string;
  };
  totalDuration: string;
  difficulty: '初級' | '中級' | '上級';
  quests: Quest[];
  progress: number;
  completedArticles: number;
  totalArticles: number;
  learningOutcomes: string[];
  prerequisites: string[];
  targetAudience: string[];
}

export const lessonData: LessonData = {
  id: 'ae7022b5-aaf0-4201-986a-5b934019c155',
  slug: 'ui-design-flow-lv1',
  title: 'UIが上手くなる人の"デザインサイクル" ─ 入門編β',
  description: 'デザインで迷走しなくなる「正しい進め方」を、実践しながら体で覚えるAI時代にも必須な入門レッスンです。',
  category: 'UI',
  instructor: {
    name: 'BONO',
    title: 'UI/UXデザイナー',
    avatar: 'B',
    message: 'デザインは才能じゃない。学べば誰でもできるようになる。このレッスンでは、実務で使えるUIデザインの考え方を一緒に学んでいきましょう。',
  },
  totalDuration: '約9時間',
  difficulty: '初級',
  quests: [
    {
      id: 'a8fc2c28-87c2-4cbf-9394-463265d8d991',
      number: 1,
      title: 'UIデザインサイクル習得の旅をはじめよう',
      description: 'サイクルとレッスンの概要を理解しよう',
      goal: 'サイクルとレッスンの概要を理解しよう',
      estTimeMins: 15,
      completed: true,
      articles: [
        {
          id: '4acde991-2293-4bce-9eb4-65fde8f6df42',
          title: 'デザインの上達はセンスじゃなく進め方で決まる',
          slug: 'uidesigncycle_process_is_important',
          duration: '15:56',
          type: 'explain',
          completed: true,
          isPremium: false,
        },
        {
          id: '46bad0fb-d39f-4667-8fe1-f6ff82682757',
          title: 'レッスンの「進め方」と「達成メリット」',
          slug: 'uidesigncycle_overview_01',
          duration: null,
          type: 'intro',
          completed: true,
          isPremium: false,
        },
        {
          id: '660d250c-c42b-4c0b-9488-7aef5a273308',
          title: 'UIサイクル入門ー思考力と制作力が上達する4ステップ',
          slug: 'howto_uidesigncycle',
          duration: '10:24',
          type: 'explain',
          completed: true,
          isPremium: false,
        },
        {
          id: 'a3506c82-1a65-454c-9573-c5b4c13f1d05',
          title: 'デザインするお題を確認しよう',
          slug: 'challenge_uidesignflow',
          duration: '03:44',
          type: 'intro',
          completed: true,
          isPremium: false,
        },
      ],
    },
    {
      id: '3e915396-d221-44b1-ab99-598a8e53c717',
      number: 2,
      title: '視野を広く持つための「UIリサーチ」',
      description: 'UIリサーチの必要性と進め方を真似して実践しよう',
      goal: 'UIリサーチの必要性と進め方を真似して実践しよう',
      estTimeMins: 60,
      completed: false,
      articles: [
        {
          id: '6e5737ac-53fa-4b12-af3f-348e44a154f7',
          title: '「UIリサーチ」を身につけるクエストの流れ',
          slug: 'uidesigncycle_uiresearch_questoverview',
          duration: null,
          type: 'intro',
          completed: true,
          isPremium: false,
        },
        {
          id: '2e419a9e-6eae-42a5-8dc0-280557acc454',
          title: 'リサーチはなぜデザイン力を伸ばすのか？3つの理由',
          slug: 'uidesigncycle_research_reason',
          duration: '09:30',
          type: 'explain',
          completed: true,
          isPremium: true,
        },
        {
          id: '3aa41983-a68d-4371-af48-ced84296d67c',
          title: '「UIリサーチ」の進め方ー"このUIでいい？"の不安を減らす材料を集める',
          slug: 'uidesigncycle_ui_research',
          duration: '11:04',
          type: 'practice',
          completed: false,
          isPremium: true,
        },
        {
          id: 'b5b6f08e-2678-4e68-aba5-6be65b990d6f',
          title: '"類似サービス"のUIリサーチの実践イメージ',
          slug: 'uidesigncycle_ui_research_04',
          duration: '24:33',
          type: 'demo',
          completed: false,
          isPremium: true,
        },
        {
          id: 'cd57816d-6cfd-4485-a7ad-a60ac8f80b84',
          title: '構造を盗むUIリサーチを実演解説',
          slug: 'uidesigncycle_research_block',
          duration: '13:38',
          type: 'demo',
          completed: false,
          isPremium: true,
        },
        {
          id: 'fb8bf5a5-36b8-41f8-a622-a620c2077e02',
          title: '「UIリサーチ」をお題でやってみよう',
          slug: 'uidesigncycle_ui_research_05',
          duration: null,
          type: 'challenge',
          completed: false,
          isPremium: true,
        },
      ],
    },
    {
      id: '4f887b6c-a68e-41a2-9b8c-15b7eaecb359',
      number: 3,
      title: '試すものを整理する「アイデア整理」',
      description: 'アイデア整理の必要性と進め方を真似して実践しよう',
      goal: 'アイデア整理の必要性と進め方を真似して実践しよう',
      estTimeMins: 60,
      completed: false,
      articles: [
        {
          id: 'bee55340-4310-49a0-9d64-b0c69f8d9e1f',
          title: 'アイデア整理を身につける流れ',
          slug: 'uidesigncycle_ideation_01',
          duration: null,
          type: 'intro',
          completed: false,
          isPremium: false,
        },
        {
          id: '82ca5b01-7199-4ef7-b723-3e6dda104ccc',
          title: 'なぜいきなりデザインを作らないのか？ラフでアイデアを整理・作成する理由',
          slug: 'uidesigncycle_ideation',
          duration: '13:05',
          type: 'explain',
          completed: false,
          isPremium: true,
        },
        {
          id: '250c0807-055e-48f2-a4c4-3162fc07295b',
          title: '解説ーつくるものを整理する、ラフ・アイデアの実践イメージ',
          slug: 'uidesigncycle_ideation_03',
          duration: '32:31',
          type: 'demo',
          completed: false,
          isPremium: true,
        },
        {
          id: '98c6cda9-cb8f-48c9-9dde-ca5d24075a32',
          title: '「アイデア整理」をお題で実践しよう',
          slug: 'uidesigncycle_ideation_04',
          duration: null,
          type: 'practice',
          completed: false,
          isPremium: false,
        },
      ],
    },
    {
      id: '6230aa6f-12b2-4df8-95b7-72c0bae7c21e',
      number: 4,
      title: 'アイデアを実験する「プロトタイピング」',
      description: 'プロトタイピングを理解して進め方を真似して実践しよう',
      goal: 'プロトタイピングを理解して進め方を真似して実践しよう',
      estTimeMins: 120,
      completed: false,
      articles: [
        {
          id: '40cc7117-1ca2-43c2-94c2-266c3e01cd51',
          title: 'クエスト概要：「プロトタイピング」',
          slug: 'uidesigncycle_creation_01',
          duration: null,
          type: 'intro',
          completed: false,
          isPremium: false,
        },
        {
          id: 'b73d507a-f821-468c-890c-3afa684288bb',
          title: 'なぜ"1方向性"だけで進めるとデザインはダメになるのか？',
          slug: 'uidesigncycle_creation',
          duration: '07:40',
          type: 'explain',
          completed: false,
          isPremium: true,
        },
        {
          id: 'f18f2ff0-2dab-4af5-bc02-7a172ae1c1fd',
          title: '「プロトタイピング」をお題で実践しよう',
          slug: 'uidesigncycle_creation_04',
          duration: null,
          type: 'practice',
          completed: false,
          isPremium: true,
        },
        {
          id: 'd2038023-7b15-4b31-bf45-f4016453dd8d',
          title: '解説ー構造とパターンを「制作・実験」する実践イメージ',
          slug: 'uidesigncycle_creation_03',
          duration: '23:35',
          type: 'demo',
          completed: false,
          isPremium: true,
        },
      ],
    },
    {
      id: 'bb31ef7c-a37c-430a-8b81-88a7bd44c6c8',
      number: 5,
      title: 'デザインを良くするための「評価・計画」',
      description: '制作したものから気づきを得る進め方を実践しよう',
      goal: '制作したものから気づきを得る進め方を実践しよう',
      estTimeMins: 30,
      completed: false,
      articles: [
        {
          id: 'c3b89903-4906-4692-be08-cf0a1ccbe9b3',
          title: '「評価／計画」を身につけるクエスト概要',
          slug: 'uidesigncycle_checkandaction_01',
          duration: null,
          type: 'intro',
          completed: false,
          isPremium: false,
        },
        {
          id: 'db4064de-c64f-4256-819f-07312686f0f5',
          title: '制作したものを自分で批評するとデザインは上達する。コツは"比較"',
          slug: 'uidesigncycle_review',
          duration: '09:15',
          type: 'explain',
          completed: false,
          isPremium: true,
        },
        {
          id: 'ed8cd35e-d0b4-44d0-8a4f-6f0ad106ff8e',
          title: 'デザインしたお題で「評価・計画」を実践しよう',
          slug: 'uidesigncycle_checkandaction_04',
          duration: null,
          type: 'practice',
          completed: false,
          isPremium: false,
        },
        {
          id: 'c71bc851-eaac-46e0-a06a-dafebcd2b1d8',
          title: '解説ーバイアスを避けて自分のデザインを批評する実践イメージ',
          slug: 'uidesigncycle_checkandaction_03',
          duration: '22:58',
          type: 'demo',
          completed: false,
          isPremium: true,
        },
      ],
    },
    {
      id: '92ddbe53-dde1-44bc-9d44-4b28997ef2d4',
      number: 6,
      title: '挑戦：お題のデザインを完成させよう',
      description: '身につけたサイクルでお題を完成させよう',
      goal: '身につけたサイクルでお題を完成させよう',
      estTimeMins: 240,
      completed: false,
      articles: [
        {
          id: '1d309e70-cca6-4272-8299-45411365fd0b',
          title: 'お題のデザインを完成させようーサイクルを回して質を上げる',
          slug: 'uidesigncycle_challenge_01',
          duration: null,
          type: 'challenge',
          completed: false,
          isPremium: false,
        },
      ],
    },
  ],
  progress: 26,
  completedArticles: 6,
  totalArticles: 23,
  learningOutcomes: [
    'デザインサイクルの進め方を体得する',
    '複数のアイデアを小さく試し、比較する習慣を身につける',
    '自分の制作物を評価・判断する力を養う方法を獲得する',
    '世の中のUIパターンから学ぶリサーチ力を高める',
    '間違った方向性で時間を無駄にしない進め方を習得する',
    'AIとも相性の良い「検証しながら進める力」を獲得する',
  ],
  prerequisites: [
    '特になし（初心者歓迎）',
  ],
  targetAudience: [
    'デザインを始めたい方',
    'なんとなくデザインしている方',
    'デザインの考え方を体系的に学びたい方',
  ],
};

// ユーザーの学習状態
export const userProgress = {
  streak: 3,
  totalXP: 245,
  currentQuestIndex: 1,
  currentArticleIndex: 2,
  lastStudiedAt: '2時間前',
};

// 次に学ぶべき記事
export const getNextArticle = () => {
  for (const quest of lessonData.quests) {
    for (const article of quest.articles) {
      if (!article.completed) {
        return { quest, article };
      }
    }
  }
  return null;
};

// CTAテキストを進捗に応じて変更
export const getCTAText = () => {
  if (lessonData.progress === 0) return 'レッスンを始める';
  if (lessonData.progress === 100) return 'もう一度見る';
  return '続きから学習する';
};

export default lessonData;
