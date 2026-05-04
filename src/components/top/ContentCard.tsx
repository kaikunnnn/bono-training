/**
 * コンテンツカード（ガイド・読みもの用）
 * - サムネイル画像またはフォールバック絵文字表示
 * - レスポンシブ対応
 */

import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ContentCardProps {
  /** リンク先URL */
  href: string;
  /** 外部リンクかどうか（trueの場合、別タブで開く） */
  external?: boolean;
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

export default function ContentCard({
  href,
  external = false,
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

  const cardContent = (
    <div
      className={cn(
        'bg-surface rounded-[24px] sm:rounded-[32px] overflow-hidden will-change-transform group-hover:shadow-lg group-hover:scale-[1.02]',
        isLarge
          ? 'lg:rounded-[32px] border-2 border-white shadow-sm min-h-[320px] sm:min-h-[360px] lg:min-h-[400px]'
          : 'lg:rounded-[40px] border-4 border-white shadow-sm'
      )}
      style={{ transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out' }}
    >
      {/* サムネイル */}
      <div
        className={cn(
          'bg-[#f5f5f4] rounded-[20px] sm:rounded-[28px] lg:rounded-[32px] flex items-center justify-center overflow-hidden w-full',
          isLarge
            ? 'aspect-[8/5]'  // ガイドカード: 8:5 (1.6:1)
            : 'aspect-[3/2]'  // 読みものカード: 3:2 (1.5:1)
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
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn('group', className)}
      >
        {cardContent}
      </a>
    );
  }

  return (
    <Link href={href} className={cn('group', className)}>
      {cardContent}
    </Link>
  );
}
