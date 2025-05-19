
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

// TrainingDetailDataの定義
export interface TrainingDetailData extends Training {
  tasks: Task[]; // 必須プロパティとして定義
  skills?: string[];
  prerequisites?: string[];
  has_premium_content?: boolean;
}

/**
 * コンテンツアップロード結果の型定義
 */
export interface ContentUploadResult {
  success: boolean;
  path: string;
  data?: any;
  error?: string;
}

/**
 * コンテンツ管理画面の状態
 */
export interface ContentManagementState {
  currentTraining: string | null;
  currentTask: string | null;
  isUploading: boolean;
  uploadResult: ContentUploadResult | null;
  availableTrainings: Array<{slug: string}>;
  trainingContents: Array<{name: string; path: string; isDirectory: boolean}>;
}
