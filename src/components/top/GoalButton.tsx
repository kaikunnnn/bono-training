import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GoalButtonProps {
  /** アイコン絵文字 */
  icon: string;
  /** ボタンテキスト */
  text: string;
  /** リンク先（内部リンクまたはアンカー） */
  href: string;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * ゴール選択ボタンコンポーネント
 *
 * トップページの「なりたいゴール」セクションで使用される楕円形ボタン
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
 *   text="UI/UXデザイナーに転職"
 *   href="#section-career"
 * />
 * ```
 */
export default function GoalButton({ icon, text, href, className }: GoalButtonProps) {
  return (
    <Link
      to={href}
      className={cn(
        // レイアウト
        'flex-1 flex flex-col items-center justify-center',
        // サイズ
        'h-[90px] sm:h-[100px] lg:h-[117px]',
        'px-4 sm:px-6 lg:px-8 py-1',
        // デザイン（統一）
        'bg-surface rounded-[200px]',
        'border border-black/12',
        // インタラクション
        'hover:shadow-md transition-all',
        'group',
        className
      )}
    >
      {/* アイコン */}
      <span className="text-2xl sm:text-[28px] lg:text-[32px] mb-1">{icon}</span>

      {/* テキスト + 矢印 */}
      <div className="flex items-center gap-1.5">
        <span className="text-base text-text-primary font-extrabold font-noto-sans-jp">
          {text}
        </span>
        <ChevronRight className="w-3 h-3 text-text-primary rotate-90 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}
