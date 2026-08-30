import { ReactNode, MouseEventHandler } from "react";

/**
 * メニュー項目の型定義
 */
export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
}

/**
 * メニューグループの型定義
 */
export interface MenuGroup {
  label?: string;
  items: MenuItem[];
}

/**
 * Sidebarコンポーネントのprops
 */
export interface SidebarProps {
  className?: string;
  user?: {
    id: string;
    email: string;
  } | null;
  /**
   * 通知ベル（#160 S3）。未読件数取得を内包した Server Component を Suspense で
   * ラップした要素を上位から受け取りそのまま描画する。未ログイン時は undefined/null。
   */
  notificationSlot?: ReactNode;
  /**
   * 掲示板の新着ドット（掲示板の新着ドット）。hasUnseenBoard を内包した Server Component を
   * Suspense でラップした要素。「みんなの掲示板」項目の右上に描画する。未ログイン時は undefined/null。
   */
  boardDotSlot?: ReactNode;
}

/**
 * SidebarMenuItemコンポーネントのprops
 */
export interface SidebarMenuItemProps {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  isActive?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  /**
   * 新着ドット（掲示板の新着ドット）。項目の右上に絶対配置される Suspense スロット。
   * 未確定/新着なしのときは null/undefined（ドット無しで描画）。
   */
  dot?: ReactNode;
}

/**
 * SidebarMenuGroupコンポーネントのprops
 */
export interface SidebarMenuGroupProps {
  label?: string;
  children: ReactNode;
  className?: string;
  itemGap?: boolean;
}

/**
 * SidebarGroupLabelコンポーネントのprops
 */
export interface SidebarGroupLabelProps {
  children: ReactNode;
  className?: string;
}
