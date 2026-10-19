"use client";

import { ME_ID, findPerson, type FeedPost } from "../_data";
import { CheerStamp } from "./CheerStamp";
import { InitialAvatar } from "./InitialAvatar";

interface FirstTimersBoxProps {
  posts: FeedPost[];
  onToggleStamp: (postId: string) => void;
}

/**
 * 反応ゼロ対策（パターンAの工夫）: 「はじめての完了」をフィードの上にまとめて、応援を集めやすくする。
 */
export function FirstTimersBox({ posts, onToggleStamp }: FirstTimersBoxProps) {
  const firstPosts = posts.filter((p) => p.milestone === "first");
  if (firstPosts.length === 0) return null;

  return (
    <section
      aria-labelledby="first-timers-heading"
      className="rounded-[24px] border border-[var(--card-border-subtle)] bg-warm p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="first-timers-heading" className="font-heading text-base font-bold text-text-primary">
          今週はじめた人
        </h2>
        <p className="text-xs text-text-secondary">はじめての1本を終えた人です。📣で迎えてみませんか</p>
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {firstPosts.map((post) => {
          const author = findPerson(post.authorId);
          const isMine = post.authorId === ME_ID;
          return (
            <li
              key={post.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[16px] bg-surface px-3 py-2.5"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <InitialAvatar person={author} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-text-primary">
                    {isMine ? "あなた" : `${author.name}さん`}
                  </span>
                  <span className="block truncate text-xs text-text-secondary">{post.contentText}</span>
                </span>
              </span>
              <CheerStamp
                size="sm"
                count={post.cheeredBy.length}
                active={post.cheeredBy.includes(ME_ID)}
                onToggle={() => onToggleStamp(post.id)}
                disabled={isMine}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
