"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationDropdown } from "./NotificationDropdown";
import { formatUnreadBadge } from "@/lib/notifications-display";
import {
  getRecentNotifications,
  markAllAsRead,
} from "@/lib/services/notifications";
import type { NotificationItem } from "@/types/notification";

interface NotificationBellProps {
  userId: string;
  /** Server Component（Header）で取得した初期未読件数 */
  initialUnreadCount: number;
}

/**
 * ヘッダーのベルアイコン＋未読バッジ＋通知一覧 Popover（#160 S2）。
 *
 * 開くたびに getRecentNotifications で最新化し（要件）、同時に markAllAsRead で
 * 表示分を一括既読化する（issue 確定：開いたら既読）。バッジは楽観的に即 0 にする。
 */
export function NotificationBell({
  userId,
  initialUnreadCount,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const loadNotifications = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const list = await getRecentNotifications(userId);
      setItems(list);
    } catch (e) {
      console.error("[NotificationBell] getRecentNotifications", e);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      // 開いた瞬間にバッジを楽観的に消す（既読化の結果を待たない）
      setUnreadCount(0);
      void loadNotifications();
      // 表示分を一括既読化（fire-and-forget。失敗しても UI は壊さない）
      void markAllAsRead(userId).catch((e) =>
        console.error("[NotificationBell] markAllAsRead", e),
      );
    }
  };

  const hasBadge = unreadCount > 0;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full"
          aria-label={hasBadge ? `通知（未読${unreadCount}件）` : "通知"}
        >
          <Bell className="h-5 w-5" />
          {hasBadge && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium leading-none text-destructive-foreground">
              {formatUnreadBadge(unreadCount)}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0"
        // フォーカスが Popover 内に閉じ込められると Link 遷移が阻害されるため素直に閉じる
      >
        <div className="border-b px-4 py-3">
          <p className="text-sm font-medium">通知</p>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          <NotificationDropdown
            items={items}
            isLoading={isLoading}
            isError={isError}
            onNavigate={() => setOpen(false)}
            onRetry={() => void loadNotifications()}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
