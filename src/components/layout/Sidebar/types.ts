import { ReactNode } from "react";

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
  label?: string; // ラベルなしの場合もある（ユーザーメニュー）
  items: MenuItem[];
}

/**
 * Sidebarコンポーネントのprops
 */
export interface SidebarProps {
  className?: string;
}

/**
 * SidebarMenuItemコンポーネントのprops
 */
export interface SidebarMenuItemProps {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

/**
 * SidebarMenuGroupコンポーネントのprops
 */
export interface SidebarMenuGroupProps {
  label?: string;
  children: ReactNode;
  className?: string;
  /** NavItemリスト間のgap（「その他」セクション用） */
  itemGap?: boolean;
}

/**
 * SidebarGroupLabelコンポーネントのprops
 */
export interface SidebarGroupLabelProps {
  children: ReactNode;
  className?: string;
}

/**
 * SidebarSearchコンポーネントのprops
 */
export interface SidebarSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}
