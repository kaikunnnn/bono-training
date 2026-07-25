import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { extractPreviewText } from "@/lib/portable-text-utils";
import type { QuestionListItem, ReactionKey } from "@/lib/services/questions";

/** 一覧カードの本文プレビュー行数（line-clamp-2 と揃える。切れる前提で余裕を持たせる） */
const PREVIEW_LINES = 4;

/** スタンプ3種の表示定義（ReactionButtons と揃える：cheer=応援 / thanks=いいやん / insight=知りたい） */
const STAMPS: Array<{ key: ReactionKey; label: string; emoji: string }> = [
  { key: "cheer", label: "応援", emoji: "📣" },
  { key: "thanks", label: "いいやん", emoji: "👍" },
  { key: "insight", label: "知りたい", emoji: "🙋" },
];

function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

interface QuestionCardProps {
  item: QuestionListItem;
  /** コメント数・スタンプ数を表示するか（非メンバーには RLS で 0 が返るため隠す） */
  showEngagement: boolean;
}

/**
 * 掲示板一覧の投稿カード（Figma: fb-post-card-link-style / node 13:1467）。
 *
 * 構成順: カテゴリタグ → タイトル → アバター+投稿者名 → 本文2行プレビュー → フッター。
 * フッター左はスタンプ3種（件数>0のもののみ・表示専用）+「・」+コメント件数（0件でも常時表示）、右は日付のみ。
 * カード全体が詳細ページへのリンク。
 */
export function QuestionCard({ item, showEngagement }: QuestionCardProps) {
  const { question, commentCount, reactionCounts, recentCommenters } = item;
  const authorName = question.author?.displayName || "メンバー";
  const authorAvatar = question.author?.avatarUrl;
  const bodyText = extractPreviewText(question.questionContent, PREVIEW_LINES);
  const activeStamps = showEngagement
    ? STAMPS.filter((s) => reactionCounts[s.key] > 0)
    : [];

  return (
    <Link
      href={`/questions/${question.slug.current}`}
      className="group block w-full rounded-[24px] border border-[var(--card-border-subtle)] bg-surface p-6 shadow-[var(--shadow-board-card)] transition hover:bg-muted/30 hover:shadow-md"
    >
      <div className="flex flex-col gap-4">
        {/* Content */}
        <div className="flex flex-col gap-3">
          {question.category && (
            <span className="inline-flex w-fit items-center rounded-full bg-[var(--tag-category-bg)] px-[7px] py-[2px] text-xs font-medium text-foreground">
              {question.category.title}
            </span>
          )}
          {/* Figma 127:3266: M PLUS Rounded 1c SemiBold 16px / leading-6(24px) */}
          <h2 className="font-rounded-mplus text-[16px] font-semibold leading-6 text-foreground transition-colors group-hover:text-primary">
            {question.title}
          </h2>
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              {authorAvatar && <AvatarImage src={authorAvatar} alt={authorName} />}
              <AvatarFallback className="text-[10px]">
                {authorName.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <span className="text-[13px] font-medium leading-none text-foreground">
              {authorName}
            </span>
          </div>
          <p className="line-clamp-2 whitespace-pre-line text-sm leading-[1.6] text-[var(--text-body-muted)]">
            {bodyText}
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* 左: スタンプ3種（件数>0のもののみ・表示専用）+「・」+ コメント件数（0件のときは非表示） */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {activeStamps.map(({ key, label, emoji }) => (
              <span
                key={key}
                className="flex items-center gap-[6px] rounded-full px-[8.5px] py-[6.5px]"
              >
                <span className="text-[14px] leading-none" aria-hidden>
                  {emoji}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {label}
                </span>
                <span className="rounded-full bg-muted px-[6px] text-[11px] font-medium leading-[14.7px] text-foreground">
                  {reactionCounts[key]}
                </span>
              </span>
            ))}
            {showEngagement && commentCount > 0 && (
              <>
                {activeStamps.length > 0 && <span aria-hidden>・</span>}
                {/* 直近コメント者の重なりアバタースタック（最大3人・名前なし・投稿者アバターより小さく区別）。
                    recentCommenters が空（コメント0件 or 非メンバー）なら描画しない。 */}
                {recentCommenters.length > 0 && (
                  <span className="flex -space-x-1.5" aria-hidden>
                    {recentCommenters.map((c) => (
                      <Avatar
                        key={c.userId}
                        className="size-5 ring-2 ring-surface"
                      >
                        {c.avatarUrl && (
                          <AvatarImage src={c.avatarUrl} alt={c.name} />
                        )}
                        <AvatarFallback className="text-[9px]">
                          {c.name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </span>
                )}
                <span>コメント {commentCount}件</span>
              </>
            )}
          </div>

          {/* 右: 日付のみ */}
          <span className="text-xs text-muted-foreground">
            {formatDate(question.publishedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
