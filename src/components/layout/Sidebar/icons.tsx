"use client";

/**
 * サイドバーで使用するアイコンマッピング
 * iconsax-react を使用
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
  People,
  MessageQuestion,
  Messages1,
  Lamp,
} from "iconsax-react";

/**
 * メニュー項目用アイコンコンポーネント
 */
export const MenuIcons = {
  roadmap: Map,
  lesson: Book,
  training: Play,
  guide: LocationDiscover,
  settings: Setting2,
  mypage: User,
  user: User,
  login: Login,
  logout: LogoutCurve,
  search: SearchNormal1,
  share: ExportCurve,
  community: People,
  question: MessageQuestion,
  feedback: Messages1,
  knowledge: Lamp,
} as const;

export type IconKey = keyof typeof MenuIcons;
