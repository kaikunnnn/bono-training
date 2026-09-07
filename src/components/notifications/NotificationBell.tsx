"use client";

import { useState } from "react";
import Image from "next/image";
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
          className={`relative h-6 w-6 rounded-full p-0 ${
            open
              ? "bg-[var(--bell-open-bg)] ring-1 ring-inset ring-white/[0.14] hover:bg-[var(--bell-open-bg)]"
              : ""
          }`}
          aria-label={hasBadge ? `お知らせ（未読${unreadCount}件）` : "お知らせ"}
        >
          {/* Figma 専用グリフ（16px）を 24px 円コンテナ内に配置（開/閉同一） */}
          <Image
            src="/icons/notification-bell.svg"
            alt=""
            width={16}
            height={16}
            aria-hidden
          />
          {hasBadge && (
            <span className="absolute left-[13px] top-0 flex h-2.5 min-w-2.5 items-center justify-center rounded-full bg-[var(--notification-badge)] px-0.5 text-[8px] font-bold leading-none text-white">
              {formatUnreadBadge(unreadCount)}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        // PC: ベルが右寄せのため箱は左へ開く。画面左端(0px)に張り付かないよう
        // 衝突回避で左に 15px の余白を確保し、箱の左端をサイドナビの左端(=15px)に揃える。
        collisionPadding={15}
        className="w-[252px] rounded-[var(--radius-md)] border-[var(--border-hairline)] p-0 shadow-[var(--shadow-popover)]"
        // フォーカスが Popover 内に閉じ込められると Link 遷移が阻害されるため素直に閉じる
      >
        <div className="border-b px-4 py-3">
          <p className="text-xs font-medium text-[var(--text-primary)]">
            お知らせ
          </p>
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
