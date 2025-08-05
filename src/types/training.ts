
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
  category?: string;
  tags?: string[];
  description?: string;
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
    emoji?: string;
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
  background_svg?: string;
  fallback_gradient?: {
    from: string;
    via: string;
    to: string;
  };
}

export interface TaskContentSection {
  title: string;
  content: string;
  type?: 'regular' | 'design-solution' | 'premium-only';
  subsections?: {
    title: string;
    content: string;
  }[];
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
  // 構造化コンテンツフィールド
  sections?: TaskContentSection[];
}

export interface MarkdownFile {
  path: string;
  content: string;
  frontmatter: TrainingFrontmatter | TaskFrontmatter;
  slug: string;
}

import { z } from 'zod';

/**
 * Zodスキーマ定義
 */
export const SkillDataSchema = z.object({
  title: z.string(),
  description: z.string(),
  reference_link: z.string().url().optional()
});

export const GuideDataSchema = z.object({
  title: z.string(),
  description: z.string(),
  lesson: z.object({
    title: z.string(),
    emoji: z.string().optional(),
    description: z.string(),
    link: z.string()
  }).optional(),
  steps: z.array(z.object({
    title: z.string(),
    description: z.string()
  }))
});

export const TrainingFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  type: z.enum(['challenge', 'skill', 'portfolio']).optional(),
  difficulty: z.string().optional(),
  tags: z.array(z.string()).optional(),
  estimated_total_time: z.string().optional(),
  task_count: z.number().optional(),
  is_premium: z.boolean().optional(),
  slug: z.string().optional(),
  icon: z.string().optional(),
  thumbnail: z.string().optional(),
  category: z.string().optional(),
  skills: z.array(SkillDataSchema).optional(),
  guide: GuideDataSchema.optional(),
  background_svg: z.string().optional(),
  fallback_gradient: z.object({
    from: z.string(),
    via: z.string(),
    to: z.string()
  }).optional()
});

export const TaskContentSectionSchema = z.object({
  title: z.string(),
  content: z.string(),
  type: z.enum(['regular', 'design-solution', 'premium-only']).optional(),
  subsections: z.array(z.object({
    title: z.string(),
    content: z.string()
  })).optional()
});

export const TaskFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  slug: z.string(),
  order_index: z.number(),
  is_premium: z.boolean().optional(),
  difficulty: z.string().optional(),
  estimated_time: z.string().optional(),
  video_preview: z.string().optional(),
  video_full: z.string().optional(),
  preview_sec: z.number().optional(),
  preview_marker: z.string().optional(),
  prev_task: z.string().optional(),
  next_task: z.string().optional(),
  training_title: z.string().optional(),
  sections: z.array(TaskContentSectionSchema).optional()
});

/**
 * 型安全性確認用のバリデーション関数
 */
export function validateTrainingMeta(meta: unknown): TrainingFrontmatter {
  try {
    const validated = TrainingFrontmatterSchema.parse(meta);
    return validated as TrainingFrontmatter;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      throw new Error(`Training frontmatter validation failed: ${issues}`);
    }
    throw new Error('Training frontmatter validation failed');
  }
}

export function validateTaskMeta(meta: unknown): TaskFrontmatter {
  try {
    const validated = TaskFrontmatterSchema.parse(meta);
    return validated as TaskFrontmatter;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      throw new Error(`Task frontmatter validation failed: ${issues}`);
    }
    throw new Error('Task frontmatter validation failed');
  }
}
