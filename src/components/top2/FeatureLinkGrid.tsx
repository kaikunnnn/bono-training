import Link from "next/link";
import { Map, MessageSquare, BookOpen, MessagesSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * サービス機能訴求グリッド（新トップ 2026 / top2・top3 再構築版 / ブロックB-2）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 662-39678
 *
 * スタイル抽出チェックリスト（Figma実測値）:
 *
 * | 要素 | font-family | weight | size | line-height | 色 |
 * |---|---|---|---|---|---|
 * | 見出し | Noto Sans JP | Medium(500) | 22px（compact時20px） | 37.6px(=1.71) | #021710→text-text-primary |
 * | 機能名ラベル | Hind | Medium(500) | 12px（compact時10px） | 24px(=2) | rgba(5,46,22,0.56)→text-text-primary/[0.56] |
 * | タイトル | Hind | Medium(500) | 16px（compact時14px） | 24px(=1.5) | #052e16→text-text-primary |
 *
 * 構造: border-b border-black/[0.12]、py-[32px]（spacing/xl）。見出し→グリッド gap-[24px]
 * （spacing/lg）。グリッド内: 56x56 角丸4px アイコンボックス（bg: --bg-feature-icon）
 * + lucide-reactアイコン(20px) + 機能名ラベル/タイトルの2行テキスト。項目間 gap-[21px]。
 * `paddingY`（number）を渡すと外側の上下パディングをinline styleで上書きする
 * （ページ単位の余白統一実験用 / 例: /dev/top4）。未指定時は既存挙動のまま。
 */

interface FeatureLinkItem {
  feature: string;
  title: string;
  icon: LucideIcon;
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
  /** 見出し */
  heading?: string;
  /** フォントサイズを2px落とした試験用バリアント（/dev/top3 での比較用） */
  compact?: boolean;
  /** 外側の上下パディングをinline styleで上書き（px。ページ単位の余白統一実験用） */
  paddingY?: number;
  className?: string;
}

export default function FeatureLinkGrid({
  heading = "目的から探す",
  compact = false,
  paddingY,
  className,
}: FeatureLinkGridProps) {
  return (
    <div
      className={`flex flex-col gap-6 border-b border-black/[0.12] py-8 ${className ?? ""}`}
      style={
        paddingY !== undefined
          ? { paddingTop: paddingY, paddingBottom: paddingY }
          : undefined
      }
    >
      <p
        className={`font-noto-sans-jp font-medium leading-[1.71] text-text-primary ${
          compact ? "text-xl" : "text-[22px]"
        }`}
      >
        {heading}
      </p>

      <div className="grid grid-cols-1 gap-[21px] sm:grid-cols-2 lg:grid-cols-4">
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

            <span className="flex flex-col gap-0.5">
              <span
                className={`font-medium text-text-primary/[0.56] ${
                  compact ? "text-[10px]" : "text-xs"
                }`}
              >
                {item.feature}
              </span>
              <span
                className={`font-rounded-mplus font-medium text-text-primary group-hover:underline ${
                  compact ? "text-sm" : "text-base"
                }`}
              >
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
