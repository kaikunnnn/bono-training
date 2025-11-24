/**
 * Dev環境専用の型定義
 */

import type { ReactNode } from 'react';

/**
 * カラー定義型
 */
export interface ColorDefinition {
  name: string;
  cssVar: string;
  value: string;
  category: 'theme' | 'custom';
  description?: string;
}

/**
 * アニメーション定義型
 */
export interface AnimationDefinition {
  name: string;
  className: string;
  duration: string;
  easing?: string;
  description?: string;
}

/**
 * コンポーネント情報型
 */
export interface ComponentInfo {
  name: string;
  category: string;
  description?: string;
  example: ReactNode;
  path?: string;
}
