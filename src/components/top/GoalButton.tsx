import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/** 丸枠＋棒付き下矢印（chevron ではなく ↓ 系） */
function FramedArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5M9 12l3 3 3-3" />
    </svg>
  );
}

export interface GoalButtonProps {
  /**
   * フォールバック用の絵文字（`iconSrc` 未指定時、または画像読み込み前の意味付け用）
   */
  icon: string;
  /**
   * Fluent Emoji 3D などのアイコン画像（`/public` からのパス、例: `/images/goal-buttons/career.webp`）
   * 指定時はこちらを優先表示する
   */
  iconSrc?: string;
  /** `iconSrc` 用の代替テキスト。装飾のみなら空文字でよい（隣にラベルがあるため） */
  iconAlt?: string;
  /** ボタンテキスト */
  text: string;
  /** リンク先（内部リンクまたはアンカー） */
  href: string;
  /** 追加のクラス名 */
  className?: string;
}

/** データ配列用（className なし） */
export type GoalButtonData = Omit<GoalButtonProps, 'className'>;

/**
 * ゴール選択ボタンコンポーネント
 *
 * トップの「なりたいゴール」セクションで使用される楕円形ボタン
 *
 * デザイン仕様:
 * - 楕円形（rounded-[200px]）
 * - 白背景（bg-surface）
 * - 太字フォント（font-extrabold）
 * - アイコン + テキスト + 矢印アイコン
 *
 * 使用例:
 * ```tsx
 * <GoalButton
 *   icon="✨"
 *   iconSrc="/images/goal-buttons/career.webp"
 *   iconAlt=""
 *   text="UI/UXデザイナーに転職"
 *   href="#section-career"
 * />
 * ```
 */
export default function GoalButton({
  icon,
  iconSrc,
  iconAlt,
  text,
  href,
  className,
}: GoalButtonProps) {
  return (
    <Link
      to={href}
      className={cn(
        // レイアウト
        'flex-1 flex flex-col items-center justify-center',
        // サイズ
        'h-[90px] sm:h-[100px] lg:h-[117px]',
        'px-4 sm:px-6 lg:px-8',
        'py-4 sm:py-3 lg:py-2',
        // デザイン（統一）
        'bg-surface rounded-[200px]',
        'border border-black/12',
        // インタラクション
        'hover:shadow-md transition-all',
        'group',
        className
      )}
    >
      {/* アイコン: Fluent 等の画像、または絵文字 */}
      <div className="mb-2 sm:mb-1.5 lg:mb-1 flex h-6 w-6 shrink-0 items-center justify-center sm:h-7 sm:w-7 lg:h-8 lg:w-8">
        {iconSrc ? (
          <img
            src={iconSrc}
            alt={iconAlt ?? ''}
            className="h-full w-full object-contain select-none"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        ) : (
          <span className="text-2xl leading-none sm:text-[28px] lg:text-[32px]">{icon}</span>
        )}
      </div>

      {/* テキスト + 矢印 */}
      <div className="flex items-center gap-1.5">
        <span className="text-base text-text-primary font-extrabold font-noto-sans-jp">
          {text}
        </span>
        <FramedArrowDownIcon className="h-4 w-4 shrink-0 text-text-primary group-hover:translate-y-0.5 transition-transform" />
      </div>
    </Link>
  );
}
