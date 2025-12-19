import React, { useState } from 'react';
import { FavoriteArticleCardProps, CategoryColor } from './FavoriteArticleCard.types';

/**
 * お気に入り記事カードコンポーネント
 * 
 * @component
 * @example
 * ```tsx
 * <FavoriteArticleCard
 *   category="ビジュアル"
 *   title="送る視線①：ビジュアル"
 *   description="by「3種盛」ではじめるUIデザイン入門"
 *   isFavorite={false}
 * />
 * ```
 */
export const FavoriteArticleCard: React.FC<FavoriteArticleCardProps> = ({
  icon = 'CC',
  iconBgColor = '#F5F5F5',
  category,
  categoryColor = { bg: '#E8F5E9', text: '#2E7D32' },
  title,
  description,
  isFavorite: initialFavorite = false,
  onFavoriteToggle,
  onClick,
  className = '',
  articleId,
}) => {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavoriteHovered, setIsFavoriteHovered] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    onFavoriteToggle?.(newFavoriteState);
  };

  const isImageIcon = icon.startsWith('http://') || icon.startsWith('https://');

  return (
    <div
      role="article"
      aria-label={`${title} - ${category}`}
      className={className}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '443px',
        height: '68px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: isHovered && onClick
          ? '0px 4px 16px rgba(0, 0, 0, 0.12)'
          : '0px 2px 8px rgba(0, 0, 0, 0.08)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'relative',
      }}
    >
      {/* アイコンエリア */}
      <div
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: iconBgColor,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {isImageIcon ? (
          <img
            src={icon}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <>
            {/* 背景テキスト "COPY" */}
            <span
              style={{
                position: 'absolute',
                fontSize: '8px',
                fontWeight: '600',
                color: '#CCCCCC',
                letterSpacing: '0.5px',
              }}
            >
              COPY
            </span>
            {/* 前面テキスト */}
            <span
              style={{
                position: 'relative',
                fontSize: '14px',
                fontWeight: '700',
                color: '#999999',
                zIndex: 1,
              }}
            >
              {icon}
            </span>
          </>
        )}
      </div>

      {/* カテゴリタグ */}
      <div
        style={{
          padding: '4px 12px',
          backgroundColor: categoryColor.bg,
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          color: categoryColor.text,
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {category}
      </div>

      {/* コンテンツエリア */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '4px',
        }}
      >
        {/* タイトル */}
        <h3
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '700',
            color: '#1A1A1A',
            lineHeight: '1.4',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </h3>

        {/* 説明文 */}
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            fontWeight: '400',
            color: '#666666',
            lineHeight: '1.4',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {description}
        </p>
      </div>

      {/* お気に入りボタン */}
      <button
        type="button"
        onClick={handleFavoriteClick}
        onMouseEnter={() => setIsFavoriteHovered(true)}
        onMouseLeave={() => setIsFavoriteHovered(false)}
        role="button"
        aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
        aria-pressed={isFavorite}
        style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          color: isFavorite ? '#FFC107' : '#E0E0E0',
          transform: isFavoriteHovered ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.2s ease',
          flexShrink: 0,
          padding: 0,
        }}
      >
        ⭐
      </button>
    </div>
  );
};

export default FavoriteArticleCard;
