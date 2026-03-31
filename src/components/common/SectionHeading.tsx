import { cn } from "@/lib/utils";
import DescriptionBadge from "./DescriptionBadge";
import PencilRulerPixelIcon from "@/components/icons/PencilRulerPixelIcon";

interface SectionHeadingProps {
  /** セクションタイトル */
  title: string;
  /** ラベル（タイトル上の小さいテキスト。例: "コンテンツ", "読みもの"） */
  label?: string;
  /** 説明文 */
  description?: string;
  /** 説明文のスタイル: 'text'=普通のテキスト, 'badge'=バッジスタイル */
  descriptionStyle?: "text" | "badge";
  /** 下線を表示するか（デフォルト: true） */
  showUnderline?: boolean;
  /** テキストの配置（デフォルト: left） */
  align?: "left" | "center";
  /** 追加のクラス名 */
  className?: string;
}

/**
 * セクション見出しコンポーネント
 *
 * カテゴリセクションの見出しとして使用
 * - ラベル（任意、タイトル上の小さいテキスト）
 * - タイトル（丸ゴシック太字）
 * - 説明文（任意、テキスト or バッジスタイル）
 * - 下線（任意）
 *
 * 使用例:
 * - label + description(text): トップページのセクション内ヘディング
 * - description(badge): ロードマップ一覧のセクション
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 47:13833
 */
export default function SectionHeading({
  title,
  label,
  description,
  descriptionStyle = "text",
  showUnderline = true,
  align = "left",
  className,
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "items-center text-center" : "items-start";

  return (
    <div className={cn("flex flex-col gap-3", alignClass, className)}>
      {/* ラベル + タイトル */}
      <div className="flex flex-col gap-0">
        {/* ラベル（任意） */}
        {label && (
          <p className="font-bold text-sm leading-[27px] text-[var(--text-muted)] w-fit">
            {label}
          </p>
        )}

        {/* タイトル */}
        <h2 className="font-rounded-mplus font-extrabold text-[18px] md:text-[20px] leading-9 text-[#293525]">
          {title}
        </h2>
      </div>

      {/* 説明文（任意） */}
      {description && (
        descriptionStyle === "badge" ? (
          <DescriptionBadge icon={<PencilRulerPixelIcon size={16} />}>
            {description}
          </DescriptionBadge>
        ) : (
          <p className="text-base leading-[27px] text-[#293525]/80">
            {description}
          </p>
        )
      )}

      {/* 下線 */}
      {showUnderline && (
        <div
          className={cn(
            "h-px w-full bg-gray-300 opacity-35 rounded-sm",
            description && "mt-1"
          )}
        />
      )}
    </div>
  );
}
