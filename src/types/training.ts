
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
  is_premium: boolean;
  preview_sec: number;
  video_full?: string;
  video_preview?: string;
  created_at?: string;
  isLocked?: boolean;
}

export interface TaskDetailData extends Task {
  content: string;
  video_url?: string;
  preview_video_url?: string;
  next_task?: string;
  trainingTitle?: string;
  trainingSlug?: string;
  // TypeScriptエラーを防ぐためにnullable型を明示的に定義
  created_at: string;
  video_full: string;
  video_preview: string;
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
}
