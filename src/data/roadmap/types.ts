/**
 * ロードマップデータの型定義
 * Webflow分析ドキュメントに基づく正確な構造
 */

// コンテンツのラベル種類
export type ContentLabel =
  | 'チュートリアル'
  | '実践して理解'
  | '実践しながら理解'
  | 'DailyUI TUTORIAL'
  | 'Deep Dive'
  | 'チャレンジ'
  | '入門'
  | '基礎';

// ステップ/セクションの状態
export type StepStatus = 'completed' | 'current' | 'locked' | 'available';

// コンテンツアイテム（シリーズ内の各コンテンツ）
export interface RoadmapContent {
  id: string;
  title: string;
  description: string;
  label: ContentLabel;
  duration?: string; // "1時間", "4時間" など
  thumbnail?: string;
  link: string;
  note?: string; // "ベータ版の別サイトで進行" など
  completed?: boolean;
}

// チャレンジ（実践課題）
export interface RoadmapChallenge {
  id: string;
  title: string;
  description: string;
  duration: string; // "3日", "1週間" など
  link: string;
  completed?: boolean;
}

// ステップ/セクション
export interface RoadmapStep {
  number: number;
  title: string;
  goal: string;
  duration: string; // "3〜7日", "1〜2週間" など
  description?: string;
  contents: RoadmapContent[];
  challenge?: RoadmapChallenge;
  status?: StepStatus;
}

// 関連コース
export interface RelatedCourse {
  id: string;
  title: string;
  description: string;
  slug: string;
  topics: string[];
}

// コース全体
export interface RoadmapCourse {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  duration: string; // "1~2ヶ月" など
  price: string; // "￥5,800~/月"
  color: string; // テーマカラー
  icon?: string; // アイコン or 絵文字
  steps: RoadmapStep[];
  relatedCourses: RelatedCourse[];
  completionMessage?: string;
}

// ユーザーの進捗データ
export interface UserRoadmapProgress {
  courseId: string;
  completedSteps: number[];
  completedContents: string[];
  completedChallenges: string[];
  currentStepNumber: number;
  startedAt?: string;
  lastAccessedAt?: string;
}
