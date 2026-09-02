"use client";

import Link from "next/link";
import { Loader2, Inbox } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  buildNotificationMessage,
  formatRelativeTime,
} from "@/lib/notifications-display";
import type { NotificationItem } from "@/types/notification";

interface NotificationDropdownProps {
  items: NotificationItem[];
  isLoading: boolean;
  isError: boolean;
  /** 行をクリック（遷移）したら Popover を閉じる */
  onNavigate: () => void;
  /** エラー時の再取得 */
  onRetry: () => void;
}

/**
 * 通知一覧の中身（Popover の内側に描画する Client Component）。
 * ローディング / エラー / Empty / 一覧 の各状態を担当する。
 */
export function NotificationDropdown({
  items,
  isLoading,
  isError,
  onNavigate,
  onRetry,
}: NotificationDropdownProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        読み込み中...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          通知を読み込めませんでした
        </p>
        <Button variant="secondary" size="sm" onClick={onRetry}>
          再読み込み
        </Button>
      </div>
    );
  }

  // Empty 状態：素っ気なく終わらせず次のアクションを促す（rules/03 ステート原則）
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
        <Inbox className="h-8 w-8 text-muted-foreground/60" />
        <div>
          <p className="text-sm font-medium">まだ通知はありません</p>
          <p className="mt-1 text-xs text-muted-foreground">
            掲示板でメンバーと交流すると、コメントやリアクションがここに届きます。
          </p>
        </div>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/questions" onClick={onNavigate}>
            掲示板を見てみる
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="flex flex-col">
      {items.map((item) => {
        const actorName = item.actorName?.trim() || "メンバー";
        const relative = formatRelativeTime(item.createdAt);
        const isUnread = item.readAt === null;
        return (
          <li key={item.id}>
            <Link
              href={item.linkUrl}
              onClick={onNavigate}
              className="flex items-start gap-3 px-3 py-3 transition-colors hover:bg-accent focus:bg-accent focus:outline-none"
            >
              <Avatar className="h-8 w-8 shrink-0 border border-border bg-muted">
                {item.actorAvatarUrl && (
                  <AvatarImage src={item.actorAvatarUrl} alt={actorName} />
                )}
                <AvatarFallback>{actorName.slice(0, 1) || "?"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                {/* 既読は一段落としたグレー（--text-secondary）で表示する */}
                <p
                  className={`text-[length:var(--text-13)] leading-snug ${
                    isUnread ? "text-foreground" : "text-text-secondary"
                  }`}
                >
                  {buildNotificationMessage(item)}
                </p>
                {relative && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {relative}
                  </p>
                )}
              </div>
              {/* 未読ドット（Dropdown を開いた時点の状態を反映。既読化は開いた後） */}
              {isUnread && (
                <span
                  aria-hidden
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-destructive"
                />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
