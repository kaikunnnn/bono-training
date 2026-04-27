/**
 * BONO Blog - Color Design Tokens
 *
 * 99frontend 仕様に基づくカラーパレット定義
 * 参照: .claude/docs/blog/99frontend/
 */

export const BLOG_COLORS = {
  // 背景色
  heroBg: '#E8E6EA',        // ヒーローセクション背景（薄紫/ラベンダー）
  white: '#FFFFFF',          // 白背景
  thumbnailBg: '#D8E7EF',    // サムネイル背景（淡いブルー）

  // テキスト色
  darkBlue: '#0F172A',       // タイトルテキスト（Ebony）
  ebony: '#151834',          // ロゴ・メインタイトル
  gray: '#9CA3AF',           // メタ情報（Gray Chateau）

  // ボーダー
  border: '#E5E7EB',         // カードボーダー

  // ホバー・フォーカス状態
  shadowLight: 'rgba(0, 0, 0, 0.1)',   // 通常のシャドウ
  shadowHover: 'rgba(0, 0, 0, 0.15)',  // ホバー時のシャドウ
} as const;

// TypeScript型定義
export type BlogColorKey = keyof typeof BLOG_COLORS;
export type BlogColorValue = typeof BLOG_COLORS[BlogColorKey];
