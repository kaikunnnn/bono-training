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
