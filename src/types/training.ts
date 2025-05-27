export interface Training {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: 'challenge' | 'skill';
  difficulty: string;
  tags: string[];
  backgroundImage?: string;
  thumbnailImage?: string;
  isFree?: boolean;
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

// TaskDetailDataはTaskを拡張し、必須プロパティを明示的に定義
export interface TaskDetailData {
  id: string;
  training_id: string;
  slug: string;
  title: string;
  order_index: number;
  is_premium: boolean | null;
  preview_sec: number | null;
  content: string; // 必須プロパティとして定義
  video_full: string | null;
  video_preview: string | null;
  created_at: string | null;
  next_task: string | null; // 必須プロパティとして定義
  prev_task: string | null; // 必須プロパティとして定義
  trainingTitle: string;
  trainingSlug: string;
  video_url?: string;
  preview_video_url?: string;
}

// TrainingDetailDataに必須プロパティとしてtasksを定義
export interface TrainingDetailData {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  tags: string[];
  tasks: Task[]; // 必須プロパティとして定義
  skills?: string[];
  prerequisites?: string[];
  has_premium_content?: boolean;
  thumbnailImage?: string;
}

/**
 * Markdownフロントマターの型定義
 */
export interface TrainingFrontmatter {
  title: string;
  description?: string;
  type?: 'challenge' | 'skill';
  difficulty?: string;
  tags?: string[];
  estimated_total_time?: string;
  task_count?: number;
  is_premium?: boolean;
  slug?: string;
}

/**
 * タスクフロントマターの型定義
 */
export interface TaskFrontmatter {
  title: string;
  slug: string;
  order_index: number;
  is_premium?: boolean;
  difficulty?: string;
  estimated_time?: string;
  video_preview?: string;
  video_full?: string;
  preview_sec?: number;
  preview_marker?: string;
}

/**
 * Markdownファイルの読み込み結果型
 */
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
