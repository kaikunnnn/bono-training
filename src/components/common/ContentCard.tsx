import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { AnchorHTMLAttributes } from "react";
import type { LinkProps } from "react-router-dom";

interface ContentCardProps {
  /** リンク先URL */
  href: string;
  /** サムネイル画像URL */
  thumbnailUrl?: string;
  /** ラベル（「ガイド」「読みもの」など） */
  label?: string;
  /** タイトル */
  title: string;
  /** 説明文 */
  description?: string;
  /** 外部リンクかどうか */
  external?: boolean;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * コンテンツカードコンポーネント
 *
 * ガイド記事・読みもの等の汎用カード
 * - サムネイル画像（上部）
 * - ラベル（任意）
 * - タイトル
 * - 説明文（任意）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 73:16759
 */
export default function ContentCard({
  href,
  thumbnailUrl,
  label,
  title,
  description,
  external = false,
  className,
}: ContentCardProps) {
  const cardClassName = cn(
    "group block bg-white rounded-[32px] sm:rounded-[48px] lg:rounded-[64px] overflow-hidden",
    "border-2 sm:border-4 border-white",
    "shadow-[0px_1px_12px_0px_rgba(0,0,0,0.08)]",
    "transition-all duration-300",
    "hover:shadow-lg hover:scale-[1.02]",
    className
  );

  const content = (
    <>
      {/* サムネイル */}
      <div className="aspect-[16/9] bg-[#f5f5f4] rounded-[20px] sm:rounded-[28px] lg:rounded-[32px] overflow-hidden border border-white/10">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <div className="flex flex-col gap-1.5 sm:gap-2 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
        {/* ラベル */}
        {label && (
          <p className="text-[10px] sm:text-[11px] font-bold text-[#293525] leading-none">
            {label}
          </p>
        )}

        {/* タイトル */}
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#293525] leading-[1.65] line-clamp-2">
          {title}
        </h3>

        {/* 説明文 */}
        {description && (
          <p className="text-sm sm:text-base text-[#293525]/80 leading-[1.8] line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClassName}
      >
        {content}
      </a>
    );
  }

  return (
    <Link to={href} className={cardClassName}>
      {content}
    </Link>
  );
}
