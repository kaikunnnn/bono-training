/**
 * サイドバーで使用するアイコンマッピング
 * lucide-reactを使用
 *
 * Note: react-refresh/only-export-components 警告を回避するため、
 * このファイルはコンポーネント（アイコン）のみをエクスポートします。
 * 定数やユーティリティ関数は icon-utils.ts を参照してください。
 */

import {
  Map,
  BookOpen,
  Compass,
  Settings,
  User,
  LogIn,
  LogOut,
  Search,
  Play,
} from "lucide-react";

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
  // ログアウト
  logout: LogOut,
  // 検索
  search: Search,
} as const;

/**
 * アイコンキーの型定義
 */
export type IconKey = keyof typeof MenuIcons;
