import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  SearchResult,
  CONTENT_TYPE_LABELS,
  CONTENT_TYPE_ICONS,
  CONTENT_TYPE_COLORS,
  isLessonResult,
  isArticleResult,
  isGuideResult,
  isRoadmapResult,
} from "@/types/search";
import { Clock, BookOpen, Map, FileText, Lightbulb, Lock } from "lucide-react";

interface SearchResultCardProps {
  result: SearchResult;
  className?: string;
}

/**
 * 検索結果カードコンポーネント
 * コンテンツタイプに応じて異なるスタイルで表示
 */
const SearchResultCard: React.FC<SearchResultCardProps> = ({
  result,
  className,
}) => {
  const colors = CONTENT_TYPE_COLORS[result.type];
  const icon = CONTENT_TYPE_ICONS[result.type];
  const label = CONTENT_TYPE_LABELS[result.type];

  // リンク先を決定
  const getLink = (): string => {
    switch (result.type) {
      case "lesson":
        return `/lessons/${result.slug}`;
      case "article":
        if (isArticleResult(result) && result.parentLessonSlug) {
          return `/lessons/${result.parentLessonSlug}/${result.slug}`;
        }
        return `/articles/${result.slug}`;
      case "guide":
        return `/guide/${result.slug}`;
      case "roadmap":
        return `/roadmap/${result.slug}`;
      default:
        return "#";
    }
  };

  // アイコンコンポーネントを取得
  const getIconComponent = () => {
    switch (result.type) {
      case "lesson":
        return <BookOpen className="w-4 h-4" />;
      case "article":
        return <FileText className="w-4 h-4" />;
      case "guide":
        return <Lightbulb className="w-4 h-4" />;
      case "roadmap":
        return <Map className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // メタ情報をレンダリング
  const renderMeta = () => {
    if (isLessonResult(result)) {
      return (
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {result.lessonCount && (
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {result.lessonCount}レッスン
            </span>
          )}
          {result.category && (
            <span className="px-2 py-0.5 bg-gray-100 rounded-full">
              {result.category}
            </span>
          )}
        </div>
      );
    }

    if (isArticleResult(result)) {
      return (
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {result.parentLessonTitle && (
            <span className="flex items-center gap-1 text-emerald-600">
              <BookOpen className="w-3 h-3" />
              {result.parentLessonTitle}
            </span>
          )}
          {result.readingTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {result.readingTime}分
            </span>
          )}
        </div>
      );
    }

    if (isGuideResult(result)) {
      return (
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {result.readingTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {result.readingTime}
            </span>
          )}
          {result.publishedAt && (
            <span>
              {new Date(result.publishedAt).toLocaleDateString("ja-JP")}
            </span>
          )}
        </div>
      );
    }

    if (isRoadmapResult(result)) {
      return (
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {result.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {result.duration}
            </span>
          )}
          {result.stepsCount && <span>{result.stepsCount}ステップ</span>}
          {result.lessonsCount && <span>{result.lessonsCount}レッスン</span>}
        </div>
      );
    }

    return null;
  };

  return (
    <Link
      to={getLink()}
      className={cn(
        "group block bg-white rounded-xl overflow-hidden border transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5",
        colors.border,
        className
      )}
    >
      <div className="flex">
        {/* 左側: カラーバー + サムネイル */}
        <div className="relative flex-shrink-0">
          {/* カラーアクセントバー */}
          <div className={cn("absolute left-0 top-0 bottom-0 w-1", colors.accent)} />

          {/* サムネイルまたはアイコン */}
          {result.thumbnail ? (
            <div className="w-24 h-24 sm:w-32 sm:h-32 ml-1">
              <img
                src={result.thumbnail}
                alt={result.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className={cn(
                "w-24 h-24 sm:w-32 sm:h-32 ml-1 flex items-center justify-center",
                colors.bg
              )}
            >
              <span className="text-4xl">{icon}</span>
            </div>
          )}
        </div>

        {/* 右側: コンテンツ */}
        <div className="flex-1 p-4 min-w-0">
          {/* ヘッダー: タイプバッジ + プレミアムバッジ */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                colors.bg,
                colors.text
              )}
            >
              {getIconComponent()}
              {label}
            </span>
            {result.isPremium && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                <Lock className="w-3 h-3" />
                Premium
              </span>
            )}
          </div>

          {/* タイトル */}
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {result.title}
          </h3>

          {/* 説明 */}
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {result.description}
          </p>

          {/* メタ情報 */}
          {renderMeta()}

          {/* タグ */}
          {result.tags && result.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {result.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default SearchResultCard;
