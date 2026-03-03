/**
 * 共通レッスンデータ - 全20パターンで使用
 * 「UIデザインサイクル」レッスンのモックデータ
 */

export interface Article {
  id: string;
  title: string;
  duration: string;
  type: 'intro' | 'explain' | 'practice' | 'challenge';
  completed: boolean;
}

export interface Quest {
  id: string;
  number: number;
  title: string;
  description: string;
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
  id: 'ui-design-cycle',
  slug: 'ui-design-cycle',
  title: 'UIデザインサイクル',
  description: 'UIデザインの基本サイクルを学び、「なんとなく」から「根拠のある」デザインへ。理解→設計→実装→検証の4ステップで、実務で使えるスキルを身につけます。',
  category: 'UIデザイン',
  instructor: {
    name: 'BONO',
    title: 'UI/UXデザイナー',
    avatar: 'B',
    message: 'デザインは才能じゃない。学べば誰でもできるようになる。このレッスンでは、実務で使えるUIデザインの考え方を一緒に学んでいきましょう。',
  },
  totalDuration: '約60分',
  difficulty: '初級',
  quests: [
    {
      id: 'quest-1',
      number: 1,
      title: '基礎を理解する',
      description: 'UIデザインの基本概念と、デザインサイクルの全体像を学びます',
      completed: true,
      articles: [
        { id: 'a1', title: 'UIデザインとは何か', duration: '5分', type: 'intro', completed: true },
        { id: 'a2', title: 'デザインサイクルの概念', duration: '8分', type: 'explain', completed: true },
        { id: 'a3', title: '4つのステップを知る', duration: '7分', type: 'explain', completed: true },
        { id: 'a4', title: '理解度チェック', duration: '3分', type: 'practice', completed: true },
      ],
    },
    {
      id: 'quest-2',
      number: 2,
      title: '実践してみる',
      description: '実際に手を動かしながら、デザインサイクルを体験します',
      completed: false,
      articles: [
        { id: 'a5', title: '課題を理解する', duration: '5分', type: 'explain', completed: true },
        { id: 'a6', title: 'ワイヤーフレームを作る', duration: '10分', type: 'practice', completed: true },
        { id: 'a7', title: 'ビジュアルデザイン', duration: '12分', type: 'practice', completed: false },
        { id: 'a8', title: 'フィードバックを受ける', duration: '8分', type: 'explain', completed: false },
      ],
    },
    {
      id: 'quest-3',
      number: 3,
      title: '応用する',
      description: '学んだことを実際のプロジェクトに応用する方法を学びます',
      completed: false,
      articles: [
        { id: 'a9', title: '実務での活用法', duration: '7分', type: 'explain', completed: false },
        { id: 'a10', title: '最終課題', duration: '15分', type: 'challenge', completed: false },
        { id: 'a11', title: '振り返りと次のステップ', duration: '5分', type: 'explain', completed: false },
        { id: 'a12', title: 'まとめ', duration: '3分', type: 'intro', completed: false },
      ],
    },
  ],
  progress: 50,
  completedArticles: 6,
  totalArticles: 12,
  learningOutcomes: [
    'UIデザインの4つのステップを理解できる',
    '根拠を持ってデザインの意思決定ができる',
    'フィードバックを効果的に取り入れられる',
    '実務で使えるワークフローが身につく',
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
