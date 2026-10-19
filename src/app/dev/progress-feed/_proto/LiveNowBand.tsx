"use client";

import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ME, ME_ID, findPerson, formatMinutesAgo } from "../_data";
import { InitialAvatar } from "../_components/InitialAvatar";
import { useProto } from "./ProtoProvider";

/**
 * 「今やっている人」帯（1行・高さ控えめ）。
 * 開いた瞬間に仲間の気配が見えることが目的なので、ページの主役（自分の続き）より目立たせない。
 * 「がんばろ」を送るときだけ、帯から一覧を開く。
 */
export function LiveNowBand({ className }: { className?: string }) {
  const { state, dispatch } = useProto();
  const others = state.live.filter((l) => l.learnerId !== ME_ID);
  const isLearning = state.learning !== null;
  const myEntry = state.live.find((l) => l.learnerId === ME_ID);
  const cheerer = state.receivedCheerFrom ? findPerson(state.receivedCheerFrom) : null;
  const avatars = [...(myEntry ? [ME] : []), ...others.map((l) => findPerson(l.learnerId))].slice(0, 5);

  return (
    <section
      aria-labelledby="live-now-band-heading"
      className={cn(
        "flex w-full flex-wrap items-center gap-x-3 gap-y-2 rounded-[16px] border border-[var(--card-border-subtle)] bg-surface px-4 py-2.5",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2" aria-hidden>
          <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        <h2 id="live-now-band-heading" className="font-heading text-sm font-bold text-text-primary">
          今やっている人
        </h2>
        <span className="text-xs text-text-muted">{state.live.length}人</span>
      </div>

      <span className="flex -space-x-1.5" aria-hidden>
        {avatars.map((p) => (
          <InitialAvatar key={p.id} person={p} size="xs" className="h-6 w-6 ring-2 ring-surface" />
        ))}
      </span>

      <p className="min-w-0 flex-1 truncate text-xs text-text-secondary" role="status">
        {cheerer && isLearning ? (
          <span className="font-medium text-text-success">
            {cheerer.name}さんから「👋 がんばろ」が届きました
          </span>
        ) : isLearning && myEntry ? (
          <>
            <span className="font-bold text-text-primary">あなたも学習中</span>（{myEntry.contentTitle}）
          </>
        ) : (
          `${others
            .slice(0, 2)
            .map((l) => `${findPerson(l.learnerId).name}さん`)
            .join("、")}たちが進めています`
        )}
      </p>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-text-secondary">
            <span aria-hidden>👋</span>
            がんばろを送る
            <ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          collisionPadding={15}
          className="w-[300px] rounded-[var(--radius-md)] border-[var(--border-hairline)] p-0 shadow-[var(--shadow-popover)]"
        >
          <p className="border-b px-4 py-3 text-xs font-medium text-text-primary">今やっている人</p>
          <ul className="flex flex-col py-1">
            {others.map((entry) => {
              const person = findPerson(entry.learnerId);
              const sent = state.sentCheerTo.includes(entry.learnerId);
              return (
                <li key={entry.learnerId} className="flex items-center gap-2.5 px-3 py-2">
                  <InitialAvatar person={person} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-text-primary">{person.name}さん</p>
                    <p className="truncate text-xs text-text-muted">
                      {entry.contentTitle}・{formatMinutesAgo(entry.startedMinutesAgo)}に開始
                    </p>
                  </div>
                  {sent ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 px-2.5 text-xs text-text-success disabled:opacity-100"
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
                      className="h-8 px-2.5 text-xs"
                      onClick={() => dispatch({ type: "sendCheer", learnerId: entry.learnerId })}
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
        </PopoverContent>
      </Popover>
    </section>
  );
}
