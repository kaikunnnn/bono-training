import type { ReactNode } from "react";
import AchievementCard, {
  type AchievementCardProps,
} from "@/components/top/home/AchievementCard";
import { cn } from "@/lib/utils";
import TopSectionHeading from "@/components/top2/TopSectionHeading";

/**
 * みんなの実績セクション（新トップ 2026 / ブロックF）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 662-39795（"みんなの実績"）
 *
 * ユーザー指示の確定版:
 * - 転職インタビュー(story) 3件、アウトプット(output) 3件を「混ぜずに別グループ」として
 *   それぞれ表示する（Figmaの2行構成に対応）
 * - 各グループには見出しをつける（「デザイナー転職の体験談」「メンバーのアウトプット」、
 *   20px M PLUS Medium, tracking 1.6px。Figma実データは「BONOで〜」だったがユーザー指示で短縮）
 * - カードデザインは両グループで統一（`AchievementCard`）
 *
 * Figma 実データ由来のスペーシング（セクション全体のリズムは踏襲）:
 * - 外側 上下パディング: `py-[120px]`
 * - 見出し → グループ群: `gap-[48px]`
 * - グループ間: `gap-[48px]`（`gap/section`）
 * - グループ内サブ見出し → カード群: `gap-[24px]`（Figma実測）
 * - カード間: `gap-[24px]`
 * - カード横幅 442px / 3 枚横並び
 *
 * このセクションの py-[120px] が余白リズムの参照値。`paddingY`（number）を渡すと
 * 外側sectionの上下パディングをinline styleで上書きできる（API統一のため。未指定時は
 * デフォルトの py-[120px] のまま。ページ単位の余白統一実験用 / 例: /dev/top4）。
 */

export interface AchievementHighlightSectionProps {
  /** バッジ文言（TODO: 実コピー未確定。仮で "MEMBER'S VOICE" を使用） */
  badgeLabel?: string;
  /** メイン見出し */
  heading?: string;
  /** 転職インタビューグループの見出し（20px） */
  storyHeading?: string;
  /** アウトプットグループの見出し（20px） */
  outputHeading?: string;
  /** 転職インタビュー（3件想定） */
  storyItems: AchievementCardProps[];
  /** アウトプット（3件想定） */
  outputItems: AchievementCardProps[];
  /** フォントサイズを2px落とした試験用バリアント（/dev/top3 での比較用） */
  compact?: boolean;
  /** 外側sectionの上下パディングをinline styleで上書き（px。未指定時はデフォルト py-[120px]） */
  paddingY?: number;
  /**
   * メイン見出しを差し替える任意スロット。指定時は既定の `TopSectionHeading`
   * （バッジpill＋見出し）の代わりにこの ReactNode を描画する。未指定時は従来どおり
   * `TopSectionHeading` を出す（/top 等は無影響）。料金ページで plan-detail と同じ
   * 見出し体裁に合わせるために使用する。
   */
  headingSlot?: ReactNode;
  /**
   * 各カードグリッド（story/output）の `<div>` に付与する追加クラス（twMergeで合成）。
   * 未指定時は従来どおり（/top 等は無影響）。料金ページでスマホのカード間 gap を
   * 広げる（gap-[40px]）ために使用する。
   */
  cardGridClassName?: string;
  className?: string;
}

export default function AchievementHighlightSection({
  badgeLabel = "MEMBER'S VOICE",
  heading = "みんなの実績",
  storyHeading = "デザイナー転職の体験談",
  outputHeading = "メンバーのアウトプット",
  storyItems,
  outputItems,
  compact = false,
  paddingY,
  headingSlot,
  cardGridClassName,
  className,
}: AchievementHighlightSectionProps) {
  const subheadingClass =
    "font-rounded-mplus text-[20px] font-medium leading-[1.4] tracking-[1.6px] text-text-primary";

  return (
    <section
      className={cn("border-b border-black/[0.12] py-[120px]", className)}
      style={
        paddingY !== undefined
          ? { paddingTop: paddingY, paddingBottom: paddingY }
          : undefined
      }
    >
      <div className="flex flex-col gap-[48px]">
        {headingSlot ?? (
          <TopSectionHeading badgeLabel={badgeLabel} heading={heading} />
        )}

        {storyItems.length > 0 && (
          <div className="flex flex-col gap-12">
            <h3 className={subheadingClass}>{storyHeading}</h3>
            <div
              className={cn(
                "grid grid-cols-1 gap-[24px] sm:grid-cols-3",
                cardGridClassName,
              )}
            >
              {storyItems.map((item) => (
                <AchievementCard
                  key={`story-${item.href}`}
                  {...item}
                  compact={compact}
                />
              ))}
            </div>
          </div>
        )}

        {outputItems.length > 0 && (
          <div className="flex flex-col gap-12">
            <h3 className={subheadingClass}>{outputHeading}</h3>
            <div
              className={cn(
                "grid grid-cols-1 gap-[24px] sm:grid-cols-3",
                cardGridClassName,
              )}
            >
              {outputItems.map((item) => (
                <AchievementCard
                  key={`output-${item.href}`}
                  {...item}
                  compact={compact}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
