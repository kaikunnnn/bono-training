import * as React from "react"
import { Link } from "react-router-dom"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BookmarkedArticle } from "@/services/bookmarks"

interface BookmarkListProps extends React.HTMLAttributes<HTMLDivElement> {
  articles: BookmarkedArticle[]
  emptyMessage?: string
  emptyLink?: { href: string; label: string }
  onRemoveBookmark?: (articleId: string) => void
}

interface BookmarkListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  article: BookmarkedArticle
  onRemoveBookmark?: (articleId: string) => void
}

// Figma仕様に基づくスタイル定数
const styles = {
  colors: {
    cardBg: "#FFFFFF",
    titleText: "#000000",
    lessonInfoText: "#4B5563",
    thumbnailPlaceholder: "#F5F5F5",
    favoriteActive: "#FFC107",
    favoriteInactive: "#E0E0E0",
    tooltipBg: "#1F2937",
    tooltipText: "#FFFFFF",
  },
  sizes: {
    cardHeight: "68px",
    cardBorderRadius: "0px",
    thumbnailWidth: "85px",
    thumbnailHeight: "48px",
    thumbnailBorderRadius: "8px",
    iconSize: "20px",
  },
  spacing: {
    cardPadding: "16px",
    cardGap: "12px",
    contentGap: "12px",
    buttonPadding: "8px",
  },
  typography: {
    titleFontFamily: "'Rounded Mplus 1c', sans-serif",
    titleFontSize: "14px",
    titleFontWeight: 700,
    titleLineHeight: "32px",
    lessonFontFamily: "'Inter', 'Noto Sans JP', sans-serif",
    lessonFontSize: "12px",
    lessonFontWeight: 400,
    lessonLineHeight: "20px",
  },
}

/**
 * BookmarkList - ブックマーク一覧のコンテナ
 */
const BookmarkList = React.forwardRef<HTMLDivElement, BookmarkListProps>(
  ({ className, articles, emptyMessage, emptyLink, onRemoveBookmark, ...props }, ref) => {
    if (articles.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            "text-center py-12 bg-gray-50 rounded-lg",
            className
          )}
          {...props}
        >
          <p className="text-gray-600 mb-4">
            {emptyMessage || "ブックマークした記事がありません"}
          </p>
          {emptyLink && (
            <Link
              to={emptyLink.href}
              className="text-blue-600 hover:underline"
            >
              {emptyLink.label}
            </Link>
          )}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full flex-col gap-0 rounded-2xl overflow-hidden shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04)]",
          className
        )}
        {...props}
      >
        {articles.map((article) => (
          <BookmarkListItem
            key={article._id}
            article={article}
            onRemoveBookmark={onRemoveBookmark}
          />
        ))}
      </div>
    )
  }
)
BookmarkList.displayName = "BookmarkList"

/**
 * BookmarkListItem - ブックマークリストの1アイテム（Figma仕様準拠）
 * レスポンシブ対応: 常に width: 100%
 */
const BookmarkListItem = React.forwardRef<HTMLDivElement, BookmarkListItemProps>(
  ({ className, article, onRemoveBookmark, ...props }, ref) => {
    const [isBookmarked, setIsBookmarked] = React.useState(true)
    const [isFavoriteHovered, setIsFavoriteHovered] = React.useState(false)

    // GROQで解決済みのURLを使用（優先順位: thumbnailUrl > thumbnail > coverImage）
    const thumbnailUrl = article.resolvedThumbnailUrl
      || article.thumbnailUrl
      || "/placeholder-thumbnail.svg"

    // レッスン名を取得
    const lessonTitle = article.questInfo?.lessonInfo?.title || ""

    const handleToggleBookmark = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      setIsBookmarked(!isBookmarked)

      if (onRemoveBookmark) {
        onRemoveBookmark(article._id)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "w-full",
          className
        )}
        role="article"
        aria-label={article.title}
        style={{
          minHeight: styles.sizes.cardHeight,
          display: "flex",
          alignItems: "center",
          gap: styles.spacing.cardGap,
          backgroundColor: styles.colors.cardBg,
          borderRadius: styles.sizes.cardBorderRadius,
          padding: styles.spacing.cardPadding,
          boxShadow: "none",
          cursor: "pointer",
          transition: "box-shadow 0.2s ease",
        }}
        {...props}
      >
        {/* リンク部分（クリック可能エリア） */}
        <Link
          to={`/articles/${article.slug.current}`}
          style={{
            display: "flex",
            gap: styles.spacing.contentGap,
            alignItems: "center",
            flex: 1,
            minWidth: 0,
            textDecoration: "none",
          }}
        >
          {/* サムネイル */}
          <div
            style={{
              width: styles.sizes.thumbnailWidth,
              minWidth: styles.sizes.thumbnailWidth,
              height: styles.sizes.thumbnailHeight,
              borderRadius: styles.sizes.thumbnailBorderRadius,
              position: "relative",
              flexShrink: 0,
              overflow: "hidden",
              backgroundColor: styles.colors.thumbnailPlaceholder,
            }}
          >
            <img
              src={thumbnailUrl}
              alt={`${article.title}のサムネイル`}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* テキストエリア */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            {/* タイトル */}
            <p
              style={{
                fontFamily: styles.typography.titleFontFamily,
                fontWeight: styles.typography.titleFontWeight,
                fontSize: styles.typography.titleFontSize,
                fontStyle: "normal",
                lineHeight: styles.typography.titleLineHeight,
                color: styles.colors.titleText,
                margin: 0,
                width: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {article.title}
            </p>

            {/* レッスン情報 */}
            {lessonTitle && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                {/* "by" */}
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: styles.typography.lessonFontWeight,
                    fontSize: styles.typography.lessonFontSize,
                    fontStyle: "normal",
                    lineHeight: styles.typography.lessonLineHeight,
                    color: styles.colors.lessonInfoText,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  by&nbsp;
                </span>

                {/* レッスン名 */}
                <span
                  style={{
                    fontFamily: styles.typography.lessonFontFamily,
                    fontWeight: styles.typography.lessonFontWeight,
                    fontSize: styles.typography.lessonFontSize,
                    fontStyle: "normal",
                    lineHeight: styles.typography.lessonLineHeight,
                    color: styles.colors.lessonInfoText,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {lessonTitle}
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* お気に入りボタン */}
        <div
          role="button"
          aria-label={isBookmarked ? "お気に入りを解除" : "お気に入りに追加"}
          aria-pressed={isBookmarked}
          tabIndex={0}
          onClick={handleToggleBookmark}
          onMouseEnter={() => setIsFavoriteHovered(true)}
          onMouseLeave={() => setIsFavoriteHovered(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleToggleBookmark(e as unknown as React.MouseEvent)
            }
          }}
          style={{
            padding: styles.spacing.buttonPadding,
            borderRadius: "9999px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            flexShrink: 0,
            cursor: "pointer",
            transition: "transform 0.2s ease",
            transform: isFavoriteHovered ? "scale(1.1)" : "scale(1)",
          }}
        >
          {/* スターアイコン */}
          <Star
            style={{
              width: styles.sizes.iconSize,
              height: styles.sizes.iconSize,
              flexShrink: 0,
              transition: "all 0.2s ease",
            }}
            fill={isBookmarked ? styles.colors.favoriteActive : "transparent"}
            stroke={isBookmarked ? styles.colors.favoriteActive : styles.colors.favoriteInactive}
            strokeWidth={1.5}
          />

          {/* ツールチップ */}
          {isBookmarked && (
            <div
              style={{
                position: "absolute",
                bottom: "110%",
                right: "50%",
                transform: "translateX(50%)",
                backgroundColor: styles.colors.tooltipBg,
                padding: "4px 8px",
                borderRadius: "4px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                opacity: isFavoriteHovered ? 1 : 0,
                transition: "opacity 0.2s ease",
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  fontFamily: styles.typography.lessonFontFamily,
                  fontWeight: 400,
                  fontSize: "11px",
                  lineHeight: "16px",
                  textAlign: "center",
                  color: styles.colors.tooltipText,
                }}
              >
                解除
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }
)
BookmarkListItem.displayName = "BookmarkListItem"

export { BookmarkList, BookmarkListItem }
