"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, X } from "lucide-react";
import { IntentPrefetchLink } from "@/components/common/IntentPrefetchLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { trackHomeClick } from "@/lib/activity-client";
import { classifyHomeHref } from "@/lib/activity-utils";
import {
  CURRENT_ANNOUNCEMENT,
  buildAnnouncementPrePaintScript,
  dismissAnnouncement,
  isAnnouncementActive,
  isAnnouncementDismissed,
  subscribeAnnouncementChange,
  type Announcement,
} from "@/lib/announcement";

interface AnnouncementBarProps {
  /** 表示するお知らせ（既定: CURRENT_ANNOUNCEMENT） */
  announcement?: Announcement | null;
  /** 期限判定に使う現在時刻（/dev で期限切れを再現する用。通常は渡さない） */
  now?: number;
}

const noopSubscribe = () => () => {};

/**
 * 細い全幅のお知らせバー（#220）。どのページに出すかは Layout 側で決める。
 *
 * CLS対策: サーバーでもバーを描画し（＝初回描画からその高さが確定し、後から押し下げない）、
 * 閉じ済み・期限切れの場合だけ、直後のインラインスクリプトが描画前に hidden を付けて隠す。
 * hydration 後は localStorage を読んだ値で再描画し、閉じ済みならアンマウントする。
 * クライアント遷移で初めてマウントされる場合は、最初から localStorage の値で判定する
 * （スクリプトは不要なので出さない）。
 */
export function AnnouncementBar({
  announcement = CURRENT_ANNOUNCEMENT,
  now,
}: AnnouncementBarProps) {
  const id = announcement?.id ?? "";
  // 出すのは /top と /mypage だけ（Layout 側で決定）。home_click の surface に使う（#232）
  const pathname = usePathname();
  const surface = pathname === "/mypage" ? "mypage" : "top";

  // サーバー描画 / hydration 中だけ true。インラインスクリプトはこの間だけ出す
  // （クライアント描画の <script> は実行されず、React が警告するため）
  const isServerPass = useSyncExternalStore(
    noopSubscribe,
    () => false,
    () => true
  );
  const dismissed = useSyncExternalStore(
    subscribeAnnouncementChange,
    () => (id ? isAnnouncementDismissed(id) : false),
    () => false
  );
  const activeNow = useSyncExternalStore(
    noopSubscribe,
    () => (announcement ? isAnnouncementActive(announcement) : false),
    () => (announcement ? isAnnouncementActive(announcement) : false)
  );
  const active =
    announcement !== null &&
    (now === undefined ? activeNow : isAnnouncementActive(announcement, now));

  if (!announcement || !active || dismissed) return null;

  return (
    <>
      <div
        data-announcement-bar={announcement.id}
        // 閉じ済みの場合、直後のスクリプトがサーバーHTMLに hidden を付ける
        suppressHydrationWarning
        className="relative w-full border-b border-border-light/50"
      >
        {/* 初期表示の動的ルートを viewport だけで prefetch しない（docs/performance.md） */}
        <IntentPrefetchLink
          href={announcement.href}
          onClick={() => {
            trackEvent("announcement_click", {
              announcement_id: announcement.id,
              link_url: announcement.href,
            });
            // 活動ログにも残す（#232）。種類はリンク先から、content_id はお知らせのID
            trackHomeClick({
              surface,
              section: "announcement_bar",
              itemType: classifyHomeHref(announcement.href).itemType,
              contentId: announcement.id,
            });
          }}
          className="group flex min-h-11 w-full items-center justify-center gap-2 py-2 pl-4 pr-12 text-xs leading-5 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-12 sm:text-sm"
        >
          <Badge variant="dark" className="shrink-0">
            {announcement.label}
          </Badge>
          <span className="min-w-0 line-clamp-2 font-medium group-hover:underline group-hover:underline-offset-2">
            {announcement.text}
          </span>
          <ChevronRight
            aria-hidden="true"
            className="size-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </IntentPrefetchLink>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="お知らせを閉じる"
          onClick={() => dismissAnnouncement(announcement.id)}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
        >
          <X aria-hidden="true" />
        </Button>
      </div>
      {isServerPass && (
        <script
          dangerouslySetInnerHTML={{
            __html: buildAnnouncementPrePaintScript(announcement),
          }}
        />
      )}
    </>
  );
}

export default AnnouncementBar;
