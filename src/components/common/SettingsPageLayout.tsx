// src/components/common/SettingsPageLayout.tsx
// main準拠の設定ページ用UIパターン（account, profile等で共用）
// 既存のshadcn/ui Cardをベースに、mainのテイストでスタイル統一

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

// ───── ページレイアウト ─────

interface SettingsPageLayoutProps {
  children: ReactNode;
}

/** 設定ページ共通のレイアウト（中央寄せコンテナ） */
export function SettingsPageLayout({ children }: SettingsPageLayoutProps) {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">{children}</div>
    </div>
  );
}

// ───── ページ見出し ─────

interface SettingsPageTitleProps {
  children: ReactNode;
}

/** 設定ページのページ見出し（h1） */
export function SettingsPageTitle({ children }: SettingsPageTitleProps) {
  return (
    <h1 className="font-noto-sans-jp font-bold text-3xl text-gray-800 mb-8">
      {children}
    </h1>
  );
}

// ───── セクションカード ─────

interface SettingsCardProps {
  /** セクション見出し */
  title?: string;
  /** カードに追加するクラス */
  className?: string;
  /** タイトル(h2)に追加するクラス */
  titleClassName?: string;
  children: ReactNode;
}

/** shadcn/ui Card をベースにした設定用カード */
export function SettingsCard({
  title,
  className,
  titleClassName,
  children,
}: SettingsCardProps) {
  return (
    <Card className={cn("mb-6", className)}>
      {title && (
        <CardHeader>
          <CardTitle
            className={cn(
              "font-noto-sans-jp font-bold text-xl text-gray-800",
              titleClassName
            )}
          >
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? undefined : "pt-6"}>
        {children}
      </CardContent>
    </Card>
  );
}

// ───── ラベル＋値ペア ─────

interface SettingsFieldProps {
  label: string;
  children: ReactNode;
}

/** ラベル: 値 の横並び表示 */
export function SettingsField({ label, children }: SettingsFieldProps) {
  return (
    <div>
      <span className="font-noto-sans-jp text-sm text-gray-600">{label}</span>
      <span className="ml-2 font-noto-sans-jp font-medium text-base text-gray-800">
        {children}
      </span>
    </div>
  );
}
