import * as React from "react"
import { Link } from "react-router-dom"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ViewedArticle } from "@/services/viewHistory"

interface HistoryListProps extends React.HTMLAttributes<HTMLDivElement> {
  articles: ViewedArticle[]
  emptyMessage?: string
}

interface HistoryListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  article: ViewedArticle
}

// Figma仕様に基づくスタイル定数（BookmarkListと共通）
const styles = {
  colors: {
    cardBg: "#FFFFFF",
    titleText: "#000000",
    lessonInfoText: "#4B5563",
    thumbnailPlaceholder: "#F5F5F5",
    timeText: "#9CA3AF",
  },
  sizes: {
    cardHeight: "68px",
    cardBorderRadius: "0px",
    thumbnailWidth: "85px",
    thumbnailHeight: "48px",
    thumbnailBorderRadius: "8px",
    iconSize: "16px",
  },
  spacing: {
    cardPadding: "16px",
    cardGap: "12px",
    contentGap: "12px",
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
 * 閲覧日時を相対表示にフォーマット
 */
function formatViewedAt(viewedAt?: string): string {
  if (!viewedAt) return ""

  const now = new Date()
  const viewed = new Date(viewedAt)
  const diffMs = now.getTime() - viewed.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return "たった今"
  if (diffMinutes < 60) return `${diffMinutes}分前`
  if (diffHours < 24) return `${diffHours}時間前`
  if (diffDays < 7) return `${diffDays}日前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`

  // 30日以上前は日付表示
  return viewed.toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  })
}

/**
 * HistoryList - 閲覧履歴一覧のコンテナ
 */
const HistoryList = React.forwardRef<HTMLDivElement, HistoryListProps>(
  ({ className, articles, emptyMessage, ...props }, ref) => {
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
          <p className="text-gray-600">
            {emptyMessage || "閲覧履歴がありません"}
          </p>
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
          <HistoryListItem
            key={article._id}
            article={article}
          />
        ))}
      </div>
    )
  }
)
HistoryList.displayName = "HistoryList"

/**
 * HistoryListItem - 閲覧履歴リストの1アイテム
 */
const HistoryListItem = React.forwardRef<HTMLDivElement, HistoryListItemProps>(
  ({ className, article, ...props }, ref) => {
    // GROQで解決済みのURLを使用
    const thumbnailUrl = article.resolvedThumbnailUrl
      || article.thumbnailUrl
      || "/placeholder-thumbnail.svg"

    // レッスン名を取得
    const lessonTitle = article.questInfo?.lessonInfo?.title || ""

    return (
      <Link
        to={`/articles/${article.slug.current}`}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={cn(
          "w-full block no-underline",
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
          transition: "background-color 0.2s ease",
        }}
        {...(props as React.HTMLAttributes<HTMLAnchorElement>)}
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

        {/* 閲覧日時 */}
        {article.viewedAt && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              flexShrink: 0,
              color: styles.colors.timeText,
            }}
          >
            <Clock size={14} />
            <span
              style={{
                fontFamily: styles.typography.lessonFontFamily,
                fontSize: "12px",
                fontWeight: 400,
                lineHeight: "16px",
                whiteSpace: "nowrap",
              }}
            >
              {formatViewedAt(article.viewedAt)}
            </span>
          </div>
        )}
      </Link>
    )
  }
)
HistoryListItem.displayName = "HistoryListItem"

export { HistoryList, HistoryListItem }
