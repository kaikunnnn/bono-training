import Link from "next/link";
import { Heart, Sparkles, ThumbsUp, type LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { extractPreviewText } from "@/lib/portable-text-utils";
import type { QuestionListItem, ReactionKey } from "@/lib/services/questions";

/**
 * QuestionCard の凍結スナップショット（2026-07-21・#153着手前）。
 * 「掲示板一覧の速度改善 + コメント者アイコン表示」実装前の見た目を
 * /dev/questions-list-before でいつでも見比べられるようにするための複製。
 * 以降このファイルは更新しない（本体は src/components/questions/QuestionCard.tsx）。
 */

const PREVIEW_LINES = 4;

const STAMPS: Array<{ key: ReactionKey; label: string; Icon: LucideIcon }> = [
  { key: "cheer", label: "応援", Icon: Sparkles },
  { key: "thanks", label: "いいやん", Icon: ThumbsUp },
  { key: "insight", label: "知りたい", Icon: Heart },
];

function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

interface QuestionCardBeforeProps {
  item: QuestionListItem;
  showEngagement: boolean;
}

export function QuestionCardBefore20260721({
  item,
  showEngagement,
}: QuestionCardBeforeProps) {
  const { question, commentCount, reactionCounts } = item;
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
        <div className="flex flex-col gap-3">
          {question.category && (
            <span className="inline-flex w-fit items-center rounded-full bg-[var(--tag-category-bg)] px-[7px] py-[2px] text-xs font-medium text-foreground">
              {question.category.title}
            </span>
          )}
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

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {activeStamps.map(({ key, label, Icon }) => (
              <span
                key={key}
                className="flex items-center gap-[6px] rounded-full px-[8.5px] py-[6.5px]"
              >
                <Icon className="size-3.5 text-muted-foreground" />
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
                <span>コメント {commentCount}件</span>
              </>
            )}
          </div>

          <span className="text-xs text-muted-foreground">
            {formatDate(question.publishedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
