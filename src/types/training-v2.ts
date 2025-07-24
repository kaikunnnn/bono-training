/**
 * 新しいマークダウン構造に対応した型定義
 * Phase 1: 基盤準備とマークダウン構造検証
 */

/**
 * 新しいTrainingフロントマターの型定義（v2）
 * 新フィールド: icon, thumbnail, type: "portfolio"
 */
export interface TrainingFrontmatterV2 {
  icon: string;                                        // 🆕 アイコン画像
  title: string;
  description: string;
  thumbnail: string;                                   // 🆕 サムネイル画像
  type: "challenge" | "portfolio" | "skill";          // 🆕 portfolio追加
  difficulty?: "easy" | "normal" | "hard";            // 表示しないが互換性維持
  tags: string[];
  estimated_total_time: string;
  task_count: number;
  category?: string;                                   // 既存フィールドも含める
  is_premium?: boolean;                                // プレミアム対応
  slug?: string;
}

/**
 * 新しいTrainingDetailData（v2）
 */
export interface TrainingDetailDataV2 {
  id: string;
  slug: string;
  frontmatter: TrainingFrontmatterV2;
  content: string;                                     // マークダウンコンテンツ
  tasks?: any[];                                       // 既存互換性のためのタスク
  isPremium?: boolean;
  hasAccess?: boolean;
}

/**
 * SimpleMarkdownRendererのプロパティ型
 */
export interface SimpleMarkdownRendererProps {
  content: string;
  className?: string;
  isPremium?: boolean;
  hasMemberAccess?: boolean;
}

/**
 * YamlMetaDisplayのプロパティ型
 */
export interface YamlMetaDisplayProps {
  frontmatter: TrainingFrontmatterV2;
}

/**
 * Figmaから抽出したスタイルのマッピング型
 */
export interface FigmaStyleMapping {
  'skill-group': string;
  'lesson': string;
  'step': string;
  [key: string]: string;
}

/**
 * 型安全性確認用のアサート関数（v2）
 */
export function assertTrainingMetaV2(meta: any): asserts meta is TrainingFrontmatterV2 {
  if (!meta.title) {
    throw new Error(`TrainingV2 meta is missing required field 'title'`);
  }
  if (!meta.icon) {
    throw new Error(`TrainingV2 meta is missing required field 'icon'`);
  }
  if (!meta.thumbnail) {
    throw new Error(`TrainingV2 meta is missing required field 'thumbnail'`);
  }
  if (!['challenge', 'portfolio', 'skill'].includes(meta.type)) {
    throw new Error(`TrainingV2 meta has invalid type: ${meta.type}`);
  }
}