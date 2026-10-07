"use client";

import type { Ref } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface EventMoreMenuItem {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
}

/**
 * ⋯ ボタン＋メニュー（#218。参加中の1行・自分のコメント行で使う）。
 * 掲示板のコメント（QuestionCommentItem）と同じ組み方。
 * メニューから開くモーダルはメニューの外（兄弟）に置くこと（中に置くとメニューと一緒に閉じる）。
 */
export default function EventMoreMenu({
  label,
  items,
  className,
  triggerRef,
}: {
  /** ボタンの読み上げ名（例: 「参加のメニュー」） */
  label: string;
  items: EventMoreMenuItem[];
  className?: string;
  triggerRef?: Ref<HTMLButtonElement>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="ghost"
          size="unstyled"
          aria-label={label}
          className={cn(
            "h-7 w-7 shrink-0 rounded-full text-text-muted hover:bg-black/[0.06] hover:text-text-primary data-[state=open]:bg-black/[0.06]",
            className,
          )}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            onSelect={item.onSelect}
            className={cn(
              "cursor-pointer",
              item.destructive && "text-destructive focus:text-destructive",
            )}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
