"use client";

import { Check } from "lucide-react";
import { Timer1 } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ME_ID, findContent, findPerson, formatMinutesAgo, type LiveEntry } from "../_data";
import { InitialAvatar } from "./InitialAvatar";

interface LiveNowStripProps {
  live: LiveEntry[];
  sentCheerTo: string[];
  myContentId: string | null;
  receivedCheerFrom: string | null;
  onSendCheer: (learnerId: string) => void;
  onOpenStart: () => void;
  onFinish: () => void;
}

/**
 * 「今やっている人」帯（全パターン共通の「始めた」が分かる場所）。
 * 参考: Studyplus の「今勉強している人」一覧 / Nike Run Club の「走り始めた」通知
 */
export function LiveNowStrip({
  live,
  sentCheerTo,
  myContentId,
  receivedCheerFrom,
  onSendCheer,
  onOpenStart,
  onFinish,
}: LiveNowStripProps) {
  const isLearning = myContentId !== null;
  const myContent = myContentId ? findContent(myContentId) : null;
  const cheerer = receivedCheerFrom ? findPerson(receivedCheerFrom) : null;

  return (
    <section
      aria-labelledby="live-now-heading"
      className="rounded-[24px] border border-[var(--card-border-subtle)] bg-surface p-5 shadow-[var(--shadow-board-card)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
          <h2 id="live-now-heading" className="font-heading text-base font-bold text-text-primary">
            今やっている人
          </h2>
          <span className="text-xs text-text-muted">{live.length}人</span>
        </div>
        {!isLearning && (
          <Button size="sm" onClick={onOpenStart}>
            <Timer1 size={16} color="currentColor" />
            学習を始める
          </Button>
        )}
      </div>

      {/* 自分が受け取った「がんばろ」 */}
      {cheerer && isLearning && (
        <p
          role="status"
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-success-feedback px-3 py-1.5 text-xs font-medium text-text-success motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1"
        >
          <InitialAvatar person={cheerer} size="xs" />
          {cheerer.name}さんから「👋 がんばろ」が届きました
        </p>
      )}

      <ul className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {live.map((entry) => {
          const person = findPerson(entry.learnerId);
          const isMe = entry.learnerId === ME_ID;
          const sent = sentCheerTo.includes(entry.learnerId);
          return (
            <li
              key={entry.learnerId}
              className={cn(
                "flex w-[188px] shrink-0 flex-col gap-3 rounded-[16px] border p-3",
                isMe
                  ? "border-[var(--reaction-active-border)] bg-[var(--reaction-active-bg)]"
                  : "border-[var(--card-border-subtle)] bg-[var(--bg-base)]",
              )}
            >
              <div className="flex items-start gap-2.5">
                <InitialAvatar person={person} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-text-primary">
                    {isMe ? "あなた" : `${person.name}さん`}
                  </p>
                  <p className="truncate text-xs text-text-secondary">{entry.contentTitle}</p>
                  <p className="text-[length:var(--text-2xs)] text-text-muted">
                    {entry.startedMinutesAgo === 0 ? "たった今 開始" : `${formatMinutesAgo(entry.startedMinutesAgo)}に開始`}
                  </p>
                </div>
              </div>
              {isMe ? (
                <Button size="sm" variant="default" className="h-8 w-full text-xs" onClick={onFinish}>
                  <Check strokeWidth={2.5} />
                  終える
                </Button>
              ) : sent ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-full text-xs text-text-success disabled:opacity-100"
                  disabled
                  aria-label={`${person.name}さんに「がんばろ」を送りました`}
                >
                  <Check strokeWidth={2.5} />
                  送りました
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-full text-xs"
                  onClick={() => onSendCheer(entry.learnerId)}
                  aria-label={`${person.name}さんに「がんばろ」を送る`}
                >
                  <span aria-hidden>👋</span>
                  がんばろ
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      {isLearning && myContent && (
        <p className="mt-3 text-xs text-text-muted">
          あなたは「{myContent.title}」の「{myContent.lesson}」を進めています（目安{myContent.minutes}分）。終えたら「終える」を押してください。
        </p>
      )}
    </section>
  );
}
