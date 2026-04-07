/**
 * コンテンツカード（ガイド・読みもの用）
 * - サムネイル画像またはフォールバック絵文字表示
 * - レスポンシブ対応
 */

import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface ContentCardProps {
  /** リンク先URL */
  href: string;
  /** カテゴリラベル（例: "ガイド", "メンバー", "BONOサービス"） */
  label: string;
  /** カードタイトル */
  title: string;
  /** 説明文 */
  description: string;
  /** サムネイル画像のパス（指定時は画像を優先表示） */
  thumbnailSrc?: string;
  /** 画像の代替テキスト */
  thumbnailAlt?: string;
  /** フォールバック絵文字（画像未指定時に表示） */
  fallbackEmoji?: string;
  /** カードのサイズバリエーション */
  variant?: 'default' | 'large';
  /** グリッドレイアウト用のクラス名（例: "sm:col-span-2"） */
  className?: string;
}

/**
 * コンテンツカードコンポーネント
 *
 * 使用例:
 * ```tsx
 * <ContentCard
 *   href="/lessons/career-guide-uiux"
 *   label="ガイド"
 *   title="未経験からのUIUXデザイナー転職攻略ガイド"
 *   description="使いやすいUI体験をつくるための表現の基礎を身につけよう。"
 *   thumbnailSrc="/images/content/career/career-guide.jpg"
 *   thumbnailAlt="キャリアガイド"
 *   fallbackEmoji="📚"
 *   variant="large"
 * />
 * ```
 */
export default function ContentCard({
  href,
  label,
  title,
  description,
  thumbnailSrc,
  thumbnailAlt,
  fallbackEmoji = '📝',
  variant = 'default',
  className,
}: ContentCardProps) {
  const isLarge = variant === 'large';

  return (
    <Link to={href} className={cn('group', className)}>
      <div
        className={cn(
          'bg-surface rounded-[24px] sm:rounded-[32px] overflow-hidden transition-all group-hover:shadow-lg group-hover:scale-[1.02]',
          isLarge
            ? 'lg:rounded-[64px] border-2 border-white shadow-sm min-h-[320px] sm:min-h-[360px] lg:min-h-[400px]'
            : 'lg:rounded-[40px] border-4 border-white shadow-sm'
        )}
      >
        {/* サムネイル */}
        <div
          className={cn(
            'bg-[#f5f5f4] rounded-[20px] sm:rounded-[28px] lg:rounded-[32px] flex items-center justify-center overflow-hidden',
            isLarge
              ? 'h-[140px] sm:h-[170px] lg:h-[209px]'
              : 'h-[140px] sm:h-[160px] lg:h-[180px]'
          )}
        >
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt={thumbnailAlt ?? ''}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="text-3xl sm:text-4xl select-none">{fallbackEmoji}</span>
          )}
        </div>

        {/* テキストコンテンツ */}
        <div className={cn(isLarge ? 'p-5 sm:p-6 lg:p-8' : 'p-4 sm:p-5 lg:p-6')}>
          <span className="text-[10px] sm:text-xs font-bold text-text-primary/60">
            {label}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-text-primary leading-[1.6] mt-1">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-text-primary/80 mt-2">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
