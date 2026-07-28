import Link from "next/link";
import { Map, MessageSquare, BookOpen, MessagesSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * サービス機能訴求グリッド（新トップ 2026 / ブロックB-2）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 662-39676（見出し込みの親フレーム）
 *
 * 見出し「目的から探す」(22px, Noto Sans JP Medium) + border-b + py-32px。
 * 4項目を横並び（モバイルは縦積み）。各項目:
 * - 56x56px の黄色アイコンボックス（角丸4px, bg は --bg-feature-icon）
 * - lucide-react アイコン（20px, text-text-primary）
 * - 機能名（12px）+ タイトル（16px）
 */

interface FeatureLinkItem {
  /** 機能名（小さいラベル） */
  feature: string;
  /** タイトル */
  title: string;
  /** アイコン */
  icon: LucideIcon;
  /** 遷移先 */
  href: string;
}

const FEATURE_ITEMS: FeatureLinkItem[] = [
  {
    feature: "ロードマップ",
    title: "スキルアップ計画を立てる",
    icon: Map,
    href: "/roadmap",
  },
  {
    feature: "フィードバック",
    title: "プロに改善点をもらう",
    icon: MessageSquare,
    href: "/feedbacks",
  },
  {
    feature: "レッスン",
    title: "UI・UXのコンテンツ",
    icon: BookOpen,
    href: "/lessons",
  },
  {
    // Footer.tsx の「みんなの質問」と同じ /questions を使用（ページ自体は未実装の可能性あり）
    feature: "掲示板",
    title: "質問・相談する",
    icon: MessagesSquare,
    href: "/questions",
  },
];

export interface FeatureLinkGridProps {
  heading?: string;
  className?: string;
}

export default function FeatureLinkGrid({
  heading = "目的から探す",
  className,
}: FeatureLinkGridProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 border-b border-black/[0.12] py-8",
        className
      )}
    >
      <p className="font-noto-sans-jp text-[22px] font-medium leading-[1.71] text-text-primary">
        {heading}
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {FEATURE_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.feature}
            href={item.href}
            className="group flex items-center gap-4"
          >
            {/* 黄色アイコンボックス（56x56, 角丸4px） */}
            <span className="flex size-14 shrink-0 items-center justify-center rounded-[4px] bg-[var(--bg-feature-icon)]">
              <Icon className="size-5 text-text-primary" aria-hidden />
            </span>

            {/* テキスト（Figma: Hind Medium、両方とも font-medium） */}
            <span className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-text-primary/[0.56]">
                {item.feature}
              </span>
              <span className="text-base font-medium text-text-primary group-hover:underline">
                {item.title}
              </span>
            </span>
          </Link>
        );
      })}
      </div>
    </div>
  );
}
