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

// 表示名・アイコンは Figma 100:2820 系＋#135 確定に準拠
// （DBキー cheer/thanks/insight は変更しない）
const REACTIONS: Array<{ key: ReactionKey; label: string; Icon: typeof Heart }> = [
  { key: "cheer", label: "応援", Icon: Sparkles },
  { key: "thanks", label: "いいやん", Icon: ThumbsUp },
  { key: "insight", label: "知りたい", Icon: Heart },
];

interface ReactionButtonsProps {
  targetType: ReactionTarget;
  targetId: string;
  counts: Record<ReactionKey, number>;
  myReactions: ReactionKey[];
  canReact: boolean;
  size?: "sm" | "md";
  /**
   * 表示するリアクションの種類を絞り込む。省略時は 3 種すべて（元投稿用）。
   * コメント用は ["thanks"] を渡して 1 種のみ表示する。
   */
  keys?: ReactionKey[];
}

export function ReactionButtons({
  targetType,
  targetId,
  counts,
  myReactions,
  canReact,
  size = "md",
  keys,
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

  // md は Figma 135:4348 実測（px-[13.5px] py-[5.5px] gap-[6px]・rounded-9px）。sm はコメント用の縮小版
  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 gap-1"
      : "px-[13.5px] py-[5.5px] gap-[6px]";
  const iconSize = size === "sm" ? 12 : 14;

  const visibleReactions = keys
    ? REACTIONS.filter((r) => keys.includes(r.key))
    : REACTIONS;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {visibleReactions.map(({ key, label, Icon }) => {
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
              // Figma 135:4348: rounded-9px・黒15%枠・shadowなし。
              // hover はDSの背景色（--bg-hover）、ON はリンク色系統（primaryが黒のための暫定）
              "inline-flex items-center rounded-[9px] text-[12px] font-medium leading-[18px] transition",
              sizeClasses,
              active
                ? "border border-[var(--reaction-active-border)] bg-[var(--reaction-active-bg)] text-text-link"
                : "border border-[var(--reaction-border)] bg-surface/90 text-muted-foreground hover:bg-[var(--bg-hover)] hover:text-foreground",
              !canReact && "cursor-not-allowed opacity-50",
              pendingKey === key && "opacity-70",
            )}
          >
            <Icon size={iconSize} />
            <span>{label}</span>
            <span
              className={cn(
                "rounded-full px-[6px] text-[11px] font-medium leading-[14.7px]",
                active
                  ? "bg-[var(--reaction-active-bg)] text-text-link"
                  : "bg-muted text-foreground",
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
