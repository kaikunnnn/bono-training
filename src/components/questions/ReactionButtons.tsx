"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Sparkles, ThumbsUp } from "lucide-react";
import {
  toggleReaction,
  type ReactionKey,
  type ReactionTarget,
} from "@/lib/services/questions";
import { cn } from "@/lib/utils";

const REACTIONS: Array<{ key: ReactionKey; label: string; Icon: typeof Heart }> = [
  { key: "cheer", label: "応援", Icon: Sparkles },
  { key: "thanks", label: "ありがとう", Icon: Heart },
  { key: "insight", label: "なるほど", Icon: ThumbsUp },
];

interface ReactionButtonsProps {
  targetType: ReactionTarget;
  targetId: string;
  counts: Record<ReactionKey, number>;
  myReactions: ReactionKey[];
  canReact: boolean;
  size?: "sm" | "md";
}

export function ReactionButtons({
  targetType,
  targetId,
  counts,
  myReactions,
  canReact,
  size = "md",
}: ReactionButtonsProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  // Optimistic state（押下直後に即反映、Server側完了で router.refresh）
  const [optCounts, setOptCounts] = useState(counts);
  const [optMine, setOptMine] = useState<Set<ReactionKey>>(new Set(myReactions));
  const [pendingKey, setPendingKey] = useState<ReactionKey | null>(null);

  // router.refresh() で新しいサーバー集計が届いたら楽観 state を上書きして再同期する
  // （useState の初期値だけだと props の更新が反映されず表示がズレたままになる）
  const countsKey = `${counts.cheer}:${counts.thanks}:${counts.insight}`;
  const mineKey = [...myReactions].sort().join(",");
  useEffect(() => {
    setOptCounts(counts);
    setOptMine(new Set(myReactions));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countsKey, mineKey]);

  const handleClick = (reaction: ReactionKey) => {
    if (!canReact || pendingKey) return;
    const wasActive = optMine.has(reaction);

    // 楽観更新
    setPendingKey(reaction);
    const nextMine = new Set(optMine);
    if (wasActive) nextMine.delete(reaction);
    else nextMine.add(reaction);
    setOptMine(nextMine);
    setOptCounts({
      ...optCounts,
      [reaction]: optCounts[reaction] + (wasActive ? -1 : 1),
    });

    startTransition(async () => {
      const res = await toggleReaction({ targetType, targetId, reaction });
      if (!res.ok) {
        // ロールバック
        setOptMine(new Set(myReactions));
        setOptCounts(counts);
      } else {
        // 念のためサーバー状態と同期
        router.refresh();
      }
      setPendingKey(null);
    });
  };

  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs gap-1" : "px-3 py-1 text-xs gap-1.5";
  const iconSize = size === "sm" ? 12 : 14;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {REACTIONS.map(({ key, label, Icon }) => {
        const active = optMine.has(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleClick(key)}
            disabled={!canReact || pendingKey !== null}
            aria-pressed={active}
            aria-label={`${label}スタンプ${active ? "を取り消す" : "を押す"}`}
            className={cn(
              "inline-flex items-center rounded-full font-medium shadow-sm transition",
              sizeClasses,
              active
                ? "bg-primary/10 text-primary border border-primary/30"
                : "bg-white/90 text-muted-foreground border border-transparent hover:text-foreground",
              !canReact && "cursor-not-allowed opacity-50",
              pendingKey === key && "opacity-70",
            )}
          >
            <Icon size={iconSize} />
            <span>{label}</span>
            <span
              className={cn(
                "rounded-full px-1.5 text-[11px]",
                active ? "bg-primary/15 text-primary" : "bg-muted text-foreground",
              )}
            >
              {optCounts[key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
