"use client";

import { forwardRef } from "react";
import { ArrowUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  BONO_ID,
  MILESTONE_LABEL,
  ME_ID,
  findPerson,
  formatMinutesAgo,
  type FeedPost,
} from "../_data";
import { CheerStamp } from "./CheerStamp";
import { InitialAvatar } from "./InitialAvatar";

interface FeedPostCardProps {
  post: FeedPost;
  highlighted: boolean;
  onToggleStamp: () => void;
}

/** 応援した人の名前を「◯◯さん、△△さんたち3人」の形にする */
function cheerSummary(ids: string[]): string | null {
  const others = ids.filter((id) => id !== ME_ID);
  if (others.length === 0) return null;
  const first = findPerson(others[0]).name;
  if (others.length === 1) return `${first}さんが応援しました`;
  return `${first}さんたち${others.length}人が応援しました`;
}

/** 「◯◯さんが△△を終えました」の1件（パターンAの自動投稿） */
export const FeedPostCard = forwardRef<HTMLElement, FeedPostCardProps>(function FeedPostCard(
  { post, highlighted, onToggleStamp },
  ref,
) {
  const author = findPerson(post.authorId);
  const isMine = post.authorId === ME_ID;
  const isFirst = post.milestone === "first";
  const summary = cheerSummary(post.cheeredBy);
  const fromStaff = post.cheeredBy.includes(BONO_ID);
  const recent = post.cheeredBy.filter((id) => id !== ME_ID).slice(-4);

  return (
    <article
      ref={ref}
      id={`post-${post.id}`}
      tabIndex={-1}
      className="scroll-mt-24 focus:outline-none"
    >
      <Card
        className={cn(
          "rounded-[24px] border-[var(--card-border-subtle)] bg-surface p-5 shadow-[var(--shadow-board-card)]",
          "motion-safe:transition-[box-shadow,background-color] motion-safe:duration-500",
          isMine && "border-[var(--reaction-active-border)]",
          highlighted && "bg-[var(--reaction-active-bg)] ring-2 ring-text-link ring-offset-2",
        )}
      >
        {post.bumped && (
          <p className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-text-link">
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
            応援が集まって上に戻ってきました
          </p>
        )}
        <div className="flex items-start gap-3">
          <InitialAvatar person={author} size="md" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold leading-relaxed text-text-primary">
              {isMine ? "あなた" : `${author.name}さん`}が{post.contentText}を終えました
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center rounded-full bg-[var(--tag-category-bg)] px-2 py-0.5 text-xs font-medium text-foreground">
                {MILESTONE_LABEL[post.milestone]}
              </span>
              {isFirst && (
                <span className="inline-flex items-center rounded-full bg-accent-orange px-2 py-0.5 text-xs font-bold text-text-inverse">
                  はじめて
                </span>
              )}
              <span className="text-xs text-text-muted">
                {isMine ? "あなた（BONO 2週目）" : `BONO ${author.week}週目`}・{formatMinutesAgo(post.minutesAgo)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <CheerStamp
            count={post.cheeredBy.length}
            active={post.cheeredBy.includes(ME_ID)}
            onToggle={onToggleStamp}
            disabled={isMine}
          />
          {summary && (
            <span className="flex min-w-0 items-center gap-1.5 text-xs text-text-muted">
              <span className="flex -space-x-1.5">
                {recent.map((id) => (
                  <InitialAvatar key={id} person={findPerson(id)} size="xs" className="ring-2 ring-surface" />
                ))}
              </span>
              <span className="truncate">
                {summary}
                {fromStaff && isFirst && "（運営からも応援が届いています）"}
              </span>
            </span>
          )}
        </div>
      </Card>
    </article>
  );
});
