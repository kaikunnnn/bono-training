
export interface Training {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: 'challenge' | 'skill' | 'portfolio';
  difficulty: string;
  tags: string[];
  backgroundImage?: string;
  thumbnailImage?: string;
  isFree?: boolean;
  icon?: string;
  category?: string;
  estimated_total_time?: string;
  task_count?: number;
}

export interface Task {
  id: string;
  training_id: string;
  slug: string;
  title: string;
  order_index: number;
  is_premium: boolean | null;
  preview_sec: number | null;
  video_full?: string | null;
  video_preview?: string | null;
  created_at?: string | null;
  isLocked?: boolean;
  content?: string;
  next_task?: string | null;
  prev_task?: string | null;
}

export interface TaskDetailData {
  id: string;
  slug: string;
  title: string;
  content: string;
  is_premium?: boolean;
  order_index: number;
  training_id: string;
  created_at: string | null;
  video_full?: string | null;
  video_preview?: string | null;
  preview_sec?: number | null;
  trainingTitle: string;
  trainingSlug: string;
  next_task?: string | null;
  prev_task?: string | null;
  // 新しいフィールド: プレミアムコンテンツ切り替え情報
  isPremiumCut?: boolean;
  hasAccess?: boolean;
  // Storage front-matterから取得するフィールドを追加
  estimated_time?: string;
  difficulty?: string;
  description?: string;
}

export interface TrainingDetailData {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  tags: string[];
  tasks: Task[];
  skills?: string[];
  prerequisites?: string[];
  has_premium_content?: boolean;
  thumbnailImage?: string;
}

/**
 * Edge Functionからのレスポンス型
 */
export interface TrainingContentResponse {
  meta: TaskFrontmatter;
  content: string;
  isPremium: boolean;
  showPremiumBanner: boolean;
  hasAccess: boolean;
}

/**
 * スキル情報の型定義
 */
export interface SkillData {
  title: string;
  description: string;
  reference_link?: string;
}

/**
 * ガイド情報の型定義
 */
export interface GuideData {
  title: string;
  description: string;
  lesson?: {
    title: string;
    emoji: string;
    description: string;
    link: string;
  };
  steps: Array<{
    title: string;
    description: string;
  }>;
}

/**
 * Markdownフロントマターの型定義
 */
export interface TrainingFrontmatter {
  title: string;
  description?: string;
  type?: 'challenge' | 'skill' | 'portfolio';
  difficulty?: string;
  tags?: string[];
  estimated_total_time?: string;
  task_count?: number;
  is_premium?: boolean;
  slug?: string;
  icon?: string;
  thumbnail?: string;
  category?: string;
  skills?: SkillData[];
  guide?: GuideData;
}

export interface TaskFrontmatter {
  title: string;
  description?: string;
  slug: string;
  order_index: number;
  is_premium?: boolean;
  difficulty?: string;
  estimated_time?: string;
  video_preview?: string;
  video_full?: string;
  preview_sec?: number;
  preview_marker?: string;
  prev_task?: string;
  next_task?: string;
  training_title?: string;
}

export interface MarkdownFile {
  path: string;
  content: string;
  frontmatter: TrainingFrontmatter | TaskFrontmatter;
  slug: string;
}

/**
 * 型安全性確認用のアサート関数
 */
export function assertTrainingMeta(meta: any): asserts meta is TrainingFrontmatter {
  if (!meta.title) {
    throw new Error(`Training meta is missing required field 'title'`);
  }
}

export function assertTaskMeta(meta: any): asserts meta is TaskFrontmatter {
  if (!meta.title || !meta.slug || typeof meta.order_index !== 'number') {
    throw new Error(`Task meta is missing required fields: title, slug, or order_index`);
  }
}
