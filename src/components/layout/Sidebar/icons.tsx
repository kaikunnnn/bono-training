/**
 * サイドバーで使用するアイコンマッピング
 * iconsax-react を使用
 *
 * Note: react-refresh/only-export-components 警告を回避するため、
 * このファイルはコンポーネント（アイコン）のみをエクスポートします。
 * 定数やユーティリティ関数は icon-utils.ts を参照してください。
 */

import {
  Map,
  Book,
  LocationDiscover,
  Setting2,
  User,
  Login,
  LogoutCurve,
  SearchNormal1,
  Play,
  ExportCurve,
} from "iconsax-react";

/**
 * メニュー項目用アイコンコンポーネント
 */
export const MenuIcons = {
  // ロードマップ
  roadmap: Map,
  // レッスン
  lesson: Book,
  // トレーニング
  training: Play,
  // ガイド
  guide: LocationDiscover,
  // 設定
  settings: Setting2,
  // マイページ
  mypage: User,
  user: User,
  // ログイン
  login: Login,
  // ログアウト
  logout: LogoutCurve,
  // 検索
  search: SearchNormal1,
  // シェア
  share: ExportCurve,
} as const;

/**
 * アイコンキーの型定義
 */
export type IconKey = keyof typeof MenuIcons;
