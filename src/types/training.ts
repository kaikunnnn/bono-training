
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

export interface TaskDetailData {
  id: string;
  title: string;
  content: string;
  is_premium: boolean;
  video_url?: string;
  preview_video_url?: string;
  next_task?: string;
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
