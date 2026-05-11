import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { MySection } from "../_shared/MySection";
import { EmptyState } from "../_shared/EmptyState";

export interface ViewedArticle {
  _id: string;
  title: string;
  slug: { current: string };
  resolvedThumbnailUrl?: string;
  questInfo?: {
    lessonInfo?: { title: string };
  };
  viewedAt?: string;
}

export function HistoryPreview({
  viewHistory,
}: {
  viewHistory: ViewedArticle[];
}) {
  return (
    <MySection
      title="閲覧履歴"
      viewAllTab="history"
      isEmpty={viewHistory.length === 0}
      emptyMessage="記事を閲覧した履歴がこちらに表示されます"
    >
      {viewHistory.slice(0, 4).map((article) => (
        <HistoryItem key={article._id} article={article} />
      ))}
    </MySection>
  );
}

export function HistoryFull({
  viewHistory,
}: {
  viewHistory: ViewedArticle[];
}) {
  if (viewHistory.length === 0) {
    return <EmptyState message="記事を閲覧した履歴がこちらに表示されます" />;
  }

  return (
    <div className="flex w-full flex-col gap-0 rounded-2xl overflow-hidden shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04)]">
      {viewHistory.map((article) => (
        <HistoryItem key={article._id} article={article} />
      ))}
    </div>
  );
}

function HistoryItem({ article }: { article: ViewedArticle }) {
  const thumbnailUrl = article.resolvedThumbnailUrl || "/placeholder-thumbnail.svg";
  const lessonTitle = article.questInfo?.lessonInfo?.title || "";

  return (
    <Link
      href={`/articles/${article.slug.current}`}
      className="w-full block no-underline"
      style={{
        minHeight: 68,
        display: "flex",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#FFFFFF",
        padding: 16,
        cursor: "pointer",
        transition: "background-color 0.2s ease",
      }}
    >
      {/* サムネイル */}
      <div
        className="flex-shrink-0 overflow-hidden bg-muted-custom"
        style={{ width: 85, minWidth: 85, height: 48, borderRadius: 8 }}
      >
        <Image
          src={thumbnailUrl}
          alt=""
          width={85}
          height={48}
          className="w-full h-full object-cover"
        />
      </div>

      {/* テキスト */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <p
          className="m-0 w-full overflow-hidden text-ellipsis whitespace-nowrap text-black"
          style={{
            fontFamily: "'Rounded Mplus 1c', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            lineHeight: "32px",
          }}
        >
          {article.title}
        </p>
        {lessonTitle && (
          <div className="flex items-center w-full overflow-hidden">
            <span
              className="text-gray-500 whitespace-nowrap flex-shrink-0"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, lineHeight: "20px" }}
            >
              by&nbsp;
            </span>
            <span
              className="text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis"
              style={{ fontFamily: "'Inter', 'Noto Sans JP', sans-serif", fontSize: 12, lineHeight: "20px" }}
            >
              {lessonTitle}
            </span>
          </div>
        )}
      </div>

      {/* 閲覧日時 */}
      {article.viewedAt && (
        <div className="flex-shrink-0 flex items-center gap-1" style={{ color: "#9CA3AF" }}>
          <Clock style={{ width: 16, height: 16 }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, lineHeight: "20px" }}>
            {formatRelativeTime(article.viewedAt)}
          </span>
        </div>
      )}
    </Link>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return "たった今";
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;
  if (diffDays < 30) return `${diffWeeks}週間前`;

  return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}
