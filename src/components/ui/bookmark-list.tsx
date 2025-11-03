import * as React from "react"
import { Link } from "react-router-dom"
import { Clock, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { urlFor } from "@/lib/sanity"
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
        className={cn("space-y-3", className)}
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
 * BookmarkListItem - ブックマークリストの1アイテム
 */
const BookmarkListItem = React.forwardRef<HTMLDivElement, BookmarkListItemProps>(
  ({ className, article, onRemoveBookmark, ...props }, ref) => {
    const [isBookmarked, setIsBookmarked] = React.useState(true)

    const thumbnailUrl = article.thumbnail
      ? urlFor(article.thumbnail).width(160).height(90).url()
      : article.coverImage
      ? urlFor(article.coverImage).width(160).height(90).url()
      : "/placeholder-thumbnail.png"

    const durationMinutes = article.videoDuration
      ? Math.ceil(article.videoDuration / 60)
      : null

    const questTitle = article.questInfo?.title
    const lessonTitle = article.questInfo?.lessonInfo?.title

    const handleToggleBookmark = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // 見た目だけ変更（リストから消さない）
      setIsBookmarked(!isBookmarked)

      // 実際のブックマーク状態を更新
      if (onRemoveBookmark) {
        onRemoveBookmark(article._id)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 relative group",
          className
        )}
        {...props}
      >
        {/* リンク部分（クリック可能エリア） */}
        <Link
          to={`/articles/${article.slug.current}`}
          className="flex gap-4 flex-1 min-w-0"
        >
          {/* サムネイル */}
          <div className="flex-shrink-0 w-40 h-[90px] bg-gray-200 rounded overflow-hidden">
            <img
              src={thumbnailUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* テキスト情報 */}
          <div className="flex-1 min-w-0">
            {/* クエスト名・レッスン名 */}
            {(questTitle || lessonTitle) && (
              <p className="text-sm text-gray-600 mb-1">
                {questTitle && lessonTitle
                  ? `${questTitle} / ${lessonTitle}`
                  : questTitle || lessonTitle}
              </p>
            )}

            {/* タイトル */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
              {article.title}
            </h3>

            {/* 推定時間 */}
            {durationMinutes && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{durationMinutes}分</span>
              </div>
            )}
          </div>
        </Link>

        {/* お気に入り解除ボタン */}
        <div className="flex-shrink-0 flex items-start pt-1">
          <button
            onClick={handleToggleBookmark}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors group/button relative"
            aria-label={isBookmarked ? "ブックマークを解除" : "ブックマークに追加"}
            title={isBookmarked ? "ブックマークを解除" : "ブックマークに追加"}
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                isBookmarked
                  ? "fill-yellow-400 stroke-yellow-400"
                  : "fill-transparent stroke-gray-400"
              }`}
            />
            {/* ホバー時のツールチップ */}
            <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover/button:opacity-100 transition-opacity pointer-events-none">
              {isBookmarked ? "解除" : "追加"}
            </span>
          </button>
        </div>
      </div>
    )
  }
)
BookmarkListItem.displayName = "BookmarkListItem"

export { BookmarkList, BookmarkListItem }
