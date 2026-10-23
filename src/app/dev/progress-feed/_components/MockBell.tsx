"use client";

import { useState } from "react";
import Image from "next/image";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { findPerson } from "../_data";
import type { MockNotification } from "../_state";
import { InitialAvatar } from "./InitialAvatar";

interface MockBellProps {
  notifications: MockNotification[];
  onOpenNotification: (id: string) => void;
  onMarkAllRead: () => void;
}

/**
 * ヘッダーのベル（NotificationBell / NotificationDropdown の見た目を参考にしたローカル部品）。
 * 本物は Server Action で通知を取りに行くため import しない。
 */
export function MockBell({ notifications, onOpenNotification, onMarkAllRead }: MockBellProps) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  // 本物と同じく、開いた瞬間にバッジは消す（一覧の未読ドットは開いている間は残す）
  const hasBadge = unread > 0 && !open;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) onMarkAllRead();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative h-9 w-9 rounded-full p-0", open && "bg-[var(--bg-hover)]")}
          aria-label={hasBadge ? `お知らせ（未読${unread}件）` : "お知らせ"}
        >
          <Image src="/icons/notification-bell.svg" alt="" width={18} height={18} aria-hidden />
          {hasBadge && (
            <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[var(--notification-badge)] px-1 text-[length:var(--text-2xs)] font-bold leading-none text-text-inverse motion-safe:animate-in motion-safe:zoom-in-50">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        collisionPadding={15}
        // 通知から投稿へ移動したとき、フォーカスがベルに戻って投稿から外れないようにする
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="w-[300px] rounded-[var(--radius-md)] border-[var(--border-hairline)] p-0 shadow-[var(--shadow-popover)]"
      >
        <div className="border-b px-4 py-3">
          <p className="text-xs font-medium text-text-primary">お知らせ</p>
        </div>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground/60" />
            <p className="text-sm font-medium">まだ通知はありません</p>
            <p className="text-xs text-muted-foreground">
              あなたの投稿に応援が届くと、ここでお知らせします。
            </p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {notifications.map((n) => {
              const first = findPerson(n.actorIds[0]);
              // 「」が二重にならないよう、通知文と対象の投稿を2行に分ける
              const text =
                n.actorIds.length > 1
                  ? `${first.name}さんたち${n.actorIds.length}人があなたの進捗を応援しました`
                  : `${first.name}さんがあなたの進捗を応援しました`;
              return (
                <li key={n.id}>
                  <Button
                    variant="unstyled"
                    size="unstyled"
                    onClick={() => {
                      setOpen(false);
                      onMarkAllRead();
                      onOpenNotification(n.id);
                    }}
                    className="flex w-full items-start justify-start gap-3 whitespace-normal rounded-none px-3 py-3 text-left font-normal transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:ring-0 focus-visible:ring-offset-0"
                  >
                    <span className="relative shrink-0">
                      <InitialAvatar person={first} size="sm" />
                      <span aria-hidden className="absolute -bottom-1 -right-1 text-[12px] leading-none">
                        📣
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-[length:var(--text-13)] leading-snug",
                          n.read ? "text-text-secondary" : "text-foreground",
                        )}
                      >
                        {text}
                      </span>
                      <span className="mt-0.5 block text-xs text-text-secondary">{n.contentText}を終えました</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">たった今</span>
                    </span>
                    {!n.read && (
                      <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-destructive" />
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
