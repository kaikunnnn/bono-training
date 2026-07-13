import Link from "next/link";
import { Heart, Sparkles, ThumbsUp, type LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { extractPreviewText } from "@/lib/portable-text-utils";
import type { QuestionListItem, ReactionKey } from "@/lib/services/questions";

/** 一覧カードの本文プレビュー行数（line-clamp-2 と揃える。切れる前提で余裕を持たせる） */
const PREVIEW_LINES = 4;

/** スタンプ3種の表示定義（ReactionButtons と揃える：cheer=応援 / thanks=いいやん / insight=知りたい） */
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
      className="group block w-full rounded-[24px] border border-border bg-surface p-6 shadow-sm transition hover:bg-muted/30 hover:shadow-md"
    >
      <div className="flex flex-col gap-4">
        {/* Content */}
        <div className="flex flex-col gap-3">
          {question.category && (
            <span className="inline-flex w-fit items-center rounded-full bg-[var(--tag-category-bg)] px-[7px] py-[2px] text-xs font-medium text-foreground">
              {question.category.title}
            </span>
          )}
          <h2 className="text-base font-semibold leading-[1.5] text-foreground transition-colors group-hover:text-primary">
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
          {/* 左: スタンプ3種（件数>0のもののみ・表示専用）+「・」+ コメント件数（0件でも常時表示） */}
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
            {showEngagement && (
              <>
                {activeStamps.length > 0 && <span aria-hidden>・</span>}
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
