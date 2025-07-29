# 型定義とスキーマ設計

## 基本方針

### 1. 二重型安全性
- **コンパイル時**: TypeScript型定義
- **実行時**: Zod スキーマによるバリデーション

### 2. 型定義の階層化
```
基底型 → 組み合わせ型 → UI特化型
```

### 3. 自動型生成
```typescript
// Zodスキーマから自動生成
type TrainingData = z.infer<typeof TrainingSchema>
```

## 基底型定義

### src/types/base.ts
```typescript
/**
 * 基底型定義
 */

// プリミティブ型
export type Slug = string & { __brand: 'Slug' };
export type Duration = string & { __brand: 'Duration' }; // "30分", "1-2時間"
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type TrainingType = 'challenge' | 'skill' | 'portfolio';
export type TaskType = 'introduction' | 'research' | 'design' | 'development' | 'review';

// アクセス権限
export type AccessLevel = 'free' | 'member' | 'premium';
export type PlanType = 'free' | 'community' | 'standard' | 'growth';

// 共通メタデータ
export interface BaseMetadata {
  slug: Slug;
  title: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// アセット情報
export interface AssetInfo {
  thumbnail?: string;
  icon?: string;
  background?: string;
  video_preview?: string;
  video_full?: string;
}
```

### src/types/skill.ts
```typescript
/**
 * スキル関連型定義
 */

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  level: Difficulty;
  prerequisites?: string[];
}

export interface SkillProgress {
  skill_id: string;
  user_id: string;
  level: number; // 0-100
  acquired_at?: string;
}
```

### src/types/category.ts
```typescript
/**
 * カテゴリ関連型定義
 */

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string; // HSL形式
  icon: string;
  parent_category?: string;
}
```

## コンテンツ型定義

### src/types/content.ts
```typescript
import { BaseMetadata, AssetInfo, TrainingType, Difficulty, AccessLevel } from './base';
import { Skill } from './skill';
import { Category } from './category';

/**
 * トレーニング型定義
 */
export interface Training extends BaseMetadata {
  type: TrainingType;
  difficulty: Difficulty;
  category: string;
  tags: string[];
  estimated_total_time: string;
  
  // 学習設計
  skills: Skill[];
  prerequisites: string[];
  learning_objectives: string[];
  
  // アクセス制御
  access_level: AccessLevel;
  has_premium_content: boolean;
  
  // アセット
  assets: AssetInfo;
  
  // 統計情報
  task_count: number;
  completion_rate?: number;
}

/**
 * タスク型定義
 */
export interface Task extends BaseMetadata {
  training_slug: Slug;
  order: number;
  type: TaskType;
  estimated_time: string;
  
  // アクセス制御
  access_level: AccessLevel;
  unlock_condition?: UnlockCondition;
  
  // コンテンツ
  content: string;
  assets: AssetInfo;
  
  // ナビゲーション
  prev_task?: Slug;
  next_task?: Slug;
}

export interface UnlockCondition {
  type: 'sequential' | 'skill_based' | 'time_based' | 'custom';
  requirements?: {
    completed_tasks?: Slug[];
    required_skills?: string[];
    min_time_spent?: number;
    custom_check?: string;
  };
}
```

## Zodスキーマ定義

### src/schemas/training.ts
```typescript
import { z } from 'zod';

/**
 * 基底スキーマ
 */
const SlugSchema = z.string().regex(/^[a-z0-9-]+$/, '英小文字・数字・ハイフンのみ');
const DifficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);
const TrainingTypeSchema = z.enum(['challenge', 'skill', 'portfolio']);
const AccessLevelSchema = z.enum(['free', 'member', 'premium']);

/**
 * アセットスキーマ
 */
const AssetInfoSchema = z.object({
  thumbnail: z.string().optional(),
  icon: z.string().optional(),
  background: z.string().optional(),
  video_preview: z.string().url().optional(),
  video_full: z.string().url().optional(),
});

/**
 * スキルスキーマ
 */
const SkillSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  category: z.string(),
  level: DifficultySchema,
  prerequisites: z.array(z.string()).optional(),
});

/**
 * トレーニングスキーマ
 */
export const TrainingMetaSchema = z.object({
  slug: SlugSchema,
  title: z.string().min(1),
  description: z.string().optional(),
  type: TrainingTypeSchema,
  difficulty: DifficultySchema,
  category: z.string(),
  tags: z.array(z.string()),
  estimated_total_time: z.string(),
  
  // 学習設計
  skills: z.array(z.string()), // スキルID参照
  prerequisites: z.array(z.string()).optional(),
  learning_objectives: z.array(z.string()),
  
  // アクセス制御
  access_level: AccessLevelSchema,
  has_premium_content: z.boolean().default(false),
  
  // アセット
  assets: AssetInfoSchema,
});

/**
 * タスクスキーマ
 */
export const TaskMetaSchema = z.object({
  slug: SlugSchema,
  title: z.string().min(1),
  description: z.string().optional(),
  training_slug: SlugSchema,
  order: z.number().min(1),
  type: z.enum(['introduction', 'research', 'design', 'development', 'review']),
  estimated_time: z.string(),
  
  // アクセス制御
  access_level: AccessLevelSchema,
  unlock_condition: z.object({
    type: z.enum(['sequential', 'skill_based', 'time_based', 'custom']),
    requirements: z.object({
      completed_tasks: z.array(SlugSchema).optional(),
      required_skills: z.array(z.string()).optional(),
      min_time_spent: z.number().optional(),
      custom_check: z.string().optional(),
    }).optional(),
  }).optional(),
  
  // アセット
  assets: AssetInfoSchema,
  
  // ナビゲーション
  prev_task: SlugSchema.optional(),
  next_task: SlugSchema.optional(),
});

/**
 * 設定ファイルスキーマ
 */
export const ConfigSchema = z.object({
  trainings: z.array(TrainingMetaSchema),
  skills: z.array(SkillSchema),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    color: z.string().regex(/^hsl\(/), // HSL形式を強制
    icon: z.string(),
    parent_category: z.string().optional(),
  })),
});

// 型生成
export type TrainingMeta = z.infer<typeof TrainingMetaSchema>;
export type TaskMeta = z.infer<typeof TaskMetaSchema>;
export type ConfigData = z.infer<typeof ConfigSchema>;
```

## バリデーション関数

### src/schemas/validation.ts
```typescript
import { z } from 'zod';
import { TrainingMetaSchema, TaskMetaSchema, ConfigSchema } from './training';

/**
 * バリデーション結果型
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/**
 * 汎用バリデーション関数
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return {
      success: false,
      errors: ['Unknown validation error']
    };
  }
}

/**
 * 特化型バリデーション関数
 */
export const validateTrainingMeta = (data: unknown): ValidationResult<TrainingMeta> =>
  validateData(TrainingMetaSchema, data);

export const validateTaskMeta = (data: unknown): ValidationResult<TaskMeta> =>
  validateData(TaskMetaSchema, data);

export const validateConfig = (data: unknown): ValidationResult<ConfigData> =>
  validateData(ConfigSchema, data);

/**
 * カスタムバリデーション
 */
export function validateTrainingConsistency(
  training: TrainingMeta,
  tasks: TaskMeta[]
): ValidationResult<void> {
  const errors: string[] = [];
  
  // タスクの順序チェック
  const orders = tasks.map(t => t.order).sort((a, b) => a - b);
  for (let i = 0; i < orders.length; i++) {
    if (orders[i] !== i + 1) {
      errors.push(`Task order is not sequential: expected ${i + 1}, got ${orders[i]}`);
    }
  }
  
  // スキル参照の整合性チェック
  // (実装時にスキル一覧と照合)
  
  // プレミアムコンテンツの整合性チェック
  const hasPremiumTasks = tasks.some(t => t.access_level === 'premium');
  if (hasPremiumTasks && !training.has_premium_content) {
    errors.push('Training has premium tasks but has_premium_content is false');
  }
  
  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}
```

## データローダー設計

### src/utils/loaders.ts
```typescript
import yaml from 'js-yaml';
import { validateConfig, validateTrainingMeta, validateTaskMeta } from '@/schemas/validation';
import type { ConfigData, TrainingMeta, TaskMeta } from '@/schemas/training';

/**
 * 設定ローダー
 */
export class ConfigLoader {
  private static instance: ConfigLoader;
  private configCache: ConfigData | null = null;
  
  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }
  
  async loadConfig(): Promise<ConfigData> {
    if (this.configCache) {
      return this.configCache;
    }
    
    try {
      // 各設定ファイルを並行読み込み
      const [trainingsRaw, skillsRaw, categoriesRaw] = await Promise.all([
        import('../../content/config/trainings.yml?raw'),
        import('../../content/config/skills.yml?raw'),
        import('../../content/config/categories.yml?raw'),
      ]);
      
      // YAML パース
      const trainings = yaml.load(trainingsRaw.default);
      const skills = yaml.load(skillsRaw.default);
      const categories = yaml.load(categoriesRaw.default);
      
      // 統合オブジェクト作成
      const configData = { trainings, skills, categories };
      
      // バリデーション
      const validation = validateConfig(configData);
      if (!validation.success) {
        throw new Error(`Config validation failed: ${validation.errors?.join(', ')}`);
      }
      
      this.configCache = validation.data!;
      return this.configCache;
    } catch (error) {
      console.error('Config loading failed:', error);
      throw error;
    }
  }
}

/**
 * トレーニングローダー
 */
export class TrainingLoader {
  async loadTraining(slug: string): Promise<{ meta: TrainingMeta; content: string }> {
    try {
      // メタデータとコンテンツを並行読み込み
      const [metaRaw, contentRaw] = await Promise.all([
        import(`../../content/training/${slug}/meta.yml?raw`),
        import(`../../content/training/${slug}/content.md?raw`),
      ]);
      
      // メタデータパース・バリデーション
      const metaData = yaml.load(metaRaw.default);
      const metaValidation = validateTrainingMeta(metaData);
      
      if (!metaValidation.success) {
        throw new Error(`Training meta validation failed: ${metaValidation.errors?.join(', ')}`);
      }
      
      return {
        meta: metaValidation.data!,
        content: contentRaw.default
      };
    } catch (error) {
      console.error(`Training loading failed for ${slug}:`, error);
      throw error;
    }
  }
}

/**
 * タスクローダー
 */
export class TaskLoader {
  async loadTasks(trainingSlug: string): Promise<TaskMeta[]> {
    try {
      const tasksConfigRaw = await import(`../../content/training/${trainingSlug}/tasks/tasks.yml?raw`);
      const tasksData = yaml.load(tasksConfigRaw.default);
      
      // 各タスクをバリデーション
      const tasks: TaskMeta[] = [];
      for (const taskData of tasksData.tasks) {
        const validation = validateTaskMeta({ ...taskData, training_slug: trainingSlug });
        if (!validation.success) {
          throw new Error(`Task validation failed: ${validation.errors?.join(', ')}`);
        }
        tasks.push(validation.data!);
      }
      
      return tasks.sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error(`Tasks loading failed for ${trainingSlug}:`, error);
      throw error;
    }
  }
  
  async loadTaskContent(trainingSlug: string, taskSlug: string): Promise<string> {
    try {
      const contentRaw = await import(`../../content/training/${trainingSlug}/tasks/${taskSlug}/content.md?raw`);
      return contentRaw.default;
    } catch (error) {
      console.error(`Task content loading failed for ${trainingSlug}/${taskSlug}:`, error);
      throw error;
    }
  }
}
```

## 型安全性の利点

### 1. エディタ支援
```typescript
// 自動補完・型チェック
const training: TrainingMeta = {
  slug: "todo-app", // ✓ Slugフォーマットチェック
  difficulty: "expert", // ✗ TypeScriptエラー: 'expert' is not assignable
}
```

### 2. リファクタリング安全性
```typescript
// フィールド名変更時の一括更新
interface Task {
  estimated_time: string; // duration から renamed
}
// → 全参照箇所でコンパイルエラー
```

### 3. ランタイムエラー防止
```typescript
// 実行時バリデーション
const result = validateTrainingMeta(unknownData);
if (!result.success) {
  // エラー詳細を表示してユーザーに修正を促す
  console.error('Validation errors:', result.errors);
}
```