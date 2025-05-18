
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

export interface TaskDetailData extends Task {
  content: string; 
  video_url?: string;
  preview_video_url?: string;
  next_task: string | null;
  prev_task: string | null;
  trainingTitle: string;
  trainingSlug: string;
  // TypeScriptエラーを防ぐためにnullable型を明示的に定義
  created_at: string | null;
  video_full: string | null;
  video_preview: string | null;
  preview_sec: number | null;
  training_id: string;
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
