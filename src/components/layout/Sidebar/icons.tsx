/**
 * サイドバーで使用するアイコンマッピング
 * lucide-reactを使用
 */

import {
  Map,
  BookOpen,
  Compass,
  Settings,
  User,
  LogIn,
  Search,
  Play,
} from "lucide-react";

/**
 * アイコンサイズの定数
 * Figma仕様: 16×16px
 */
export const ICON_SIZE = 16;

/**
 * メニュー項目用アイコンコンポーネント
 */
export const MenuIcons = {
  // ロードマップ
  roadmap: Map,
  // レッスン
  lesson: BookOpen,
  // トレーニング
  training: Play,
  // ガイド
  guide: Compass,
  // 設定
  settings: Settings,
  // マイページ
  mypage: User,
  user: User,
  // ログイン
  login: LogIn,
  // 検索
  search: Search,
} as const;

/**
 * アイコンキーの型定義
 */
export type IconKey = keyof typeof MenuIcons;

/**
 * アイコンを取得するヘルパー関数
 * @param key - アイコンキー
 * @param size - アイコンサイズ（デフォルト: 16）
 * @param className - 追加のクラス名
 */
export const getIcon = (
  key: IconKey,
  size: number = ICON_SIZE,
  className?: string
) => {
  const IconComponent = MenuIcons[key];
  return <IconComponent size={size} className={className} />;
};
