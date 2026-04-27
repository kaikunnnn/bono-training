import { cn } from "@/lib/utils";
import GoalSectionHeader from "./GoalSectionHeader";
import DottedDivider from "@/components/common/DottedDivider";

interface GoalSectionProps {
  /** ゴールのタイトル */
  title: string;
  /** ゴールの説明文 */
  description: string;
  /** 説明文の後に表示する絵文字（任意、`emojiSrc` 未指定時） */
  emoji?: string;
  emojiSrc?: string;
  emojiAlt?: string;
  /** セクション内のコンテンツ */
  children: React.ReactNode;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * ゴールセクション
 *
 * トップの目的別セクションのラッパー
 * - 薄い背景色（bg-muted）
 * - 角丸40px
 * - GoalSectionHeader + コンテンツエリア
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 47-14026
 */
export default function GoalSection({
  title,
  description,
  emoji,
  emojiSrc,
  emojiAlt,
  children,
  className,
}: GoalSectionProps) {
  return (
    <section
      className={cn(
        "bg-muted rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] overflow-hidden",
        "w-full max-w-[1138px]",
        className
      )}
    >
      {/* セクションヘッダー */}
      <GoalSectionHeader
        title={title}
        description={description}
        emoji={emoji}
        emojiSrc={emojiSrc}
        emojiAlt={emojiAlt}
      />

      {/* 区切り線 */}
      <DottedDivider className="mx-4 sm:mx-8 lg:mx-14" />

      {/* コンテンツエリア */}
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

// ============================================
// サブコンポーネント: GoalSectionBlock
// ============================================

interface GoalSectionBlockProps {
  /** ラベル（「コンテンツ」「読みもの」など） */
  label: string;
  /** ブロックのタイトル */
  title: string;
  /** ブロックの説明文 */
  description: string;
  /** ブロック内のコンテンツ */
  children: React.ReactNode;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * ゴールセクション内のコンテンツブロック
 */
export function GoalSectionBlock({
  label,
  title,
  description,
  children,
  className,
}: GoalSectionBlockProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:gap-6 px-4 sm:px-8 lg:px-14 py-8 sm:py-12 lg:py-16", className)}>
      {/* ブロックヘッダー */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex flex-col gap-1 sm:gap-2">
          <p className="text-xs sm:text-sm font-bold text-text-primary leading-[1.93]">
            {label}
          </p>
          <h3 className="text-base sm:text-lg lg:text-xl font-extrabold text-text-primary leading-[1.8] font-['Rounded_Mplus_1c',sans-serif]">
            {title}
          </h3>
        </div>
        <p className="text-sm sm:text-base font-normal text-text-secondary/80 leading-[1.69]">
          {description}
        </p>
        {/* 下線 */}
        <div className="h-px bg-text-primary/35 rounded-[1px]" />
      </div>

      {/* コンテンツ */}
      <div className="flex flex-col gap-4 sm:gap-6">{children}</div>
    </div>
  );
}
