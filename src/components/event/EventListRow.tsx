import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EventDateParts } from "@/lib/events/event-schedule";

/**
 * イベント一覧（/events）の1行。#234 パターン D。
 *
 * 左から「日付ブロック｜区切り線｜サムネ｜（あと◯日）タイトル｜矢印」。
 * - 日付ブロックは募集中・過去で同じ固定幅にして、区切り線の位置をそろえる
 * - 年（小）→ 月日（大）→ 曜日（小）の3段。募集中の行は月日をさらに大きくし、開始時刻も出す
 * - 状態はセクション名（募集中 / 過去のイベント）で分かるので、状態バッジは出さない
 * - 行の外枠・ホバー・矢印は /updates の ArticleRow（variant "updates"）と同じ
 */

export interface EventListRowProps {
  href: string;
  title: string;
  thumbnailUrl?: string;
  dateParts: EventDateParts | null;
  /** time 要素の機械可読値（正確な日時があるときだけ） */
  dateTime?: string;
  /** 「20:00〜」（募集中の行で、正確な日時があるときだけ表示） */
  startTimeLabel?: string | null;
  /** 「今日」「あと12日」（募集中の行で表示） */
  daysUntilLabel?: string | null;
  /** 募集中の行（日付を大きく・開始時刻とあと◯日を出す） */
  upcoming: boolean;
}

/** 日付ブロックの幅（募集中・過去で共通） */
const DATE_BLOCK_WIDTH = "w-[68px] md:w-[84px]";

/** Sanity 以外の外部URL（Unsplash など）は next.config の remotePatterns に無いので最適化を通さない */
function isSanityImage(url: string) {
  try {
    const host = new URL(url).hostname;
    return host === "cdn.sanity.io" || host.endsWith(".sanity.io");
  } catch {
    return false;
  }
}

function DateBlock({
  dateParts,
  dateTime,
  startTimeLabel,
  upcoming,
}: Pick<EventListRowProps, "dateParts" | "dateTime" | "startTimeLabel" | "upcoming">) {
  const main =
    dateParts?.kind === "exact"
      ? `${dateParts.month}/${dateParts.day}`
      : dateParts
        ? `${dateParts.month}月`
        : "未定";
  const sub =
    dateParts?.kind === "exact" ? `(${dateParts.weekday})` : (dateParts?.period ?? "");
  // 正確な日時があるときだけ time 要素（「8月下旬」は time の値にできないので span）
  const Tag = dateTime ? "time" : "span";
  return (
    <Tag
      dateTime={dateTime}
      className={cn(
        "flex shrink-0 flex-col items-center text-center text-text-primary",
        DATE_BLOCK_WIDTH,
      )}
    >
      <span className="font-noto-sans-jp text-[11px] font-medium leading-[16px] text-text-primary/[0.56]">
        {dateParts?.year ?? ""}
      </span>
      <span
        className={cn(
          "font-rounded-mplus font-bold leading-[1.2] tabular-nums",
          upcoming ? "text-[26px] md:text-[32px]" : "text-xl md:text-[22px]",
        )}
      >
        {main}
      </span>
      <span className="font-noto-sans-jp text-xs font-medium leading-[18px] text-text-primary/[0.56]">
        {sub}
      </span>
      {upcoming && startTimeLabel && (
        <span className="font-noto-sans-jp text-xs font-bold leading-[18px] tabular-nums text-text-secondary">
          {startTimeLabel}
        </span>
      )}
    </Tag>
  );
}

export function EventListRow({
  href,
  title,
  thumbnailUrl,
  dateParts,
  dateTime,
  startTimeLabel,
  daysUntilLabel,
  upcoming,
}: EventListRowProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex w-full items-center gap-3 rounded-[8px] border-b border-black/[0.1] px-1 text-left outline-none transition duration-200 hover:bg-black/[0.035] active:scale-[0.995] active:bg-black/[0.06] focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 md:gap-4",
        upcoming ? "py-4" : "py-3",
      )}
    >
      <DateBlock
        dateParts={dateParts}
        dateTime={dateTime}
        startTimeLabel={startTimeLabel}
        upcoming={upcoming}
      />
      <span aria-hidden="true" className="w-px self-stretch bg-black/[0.1]" />
      <div
        className={cn(
          "relative aspect-video shrink-0 overflow-hidden rounded-[8px] bg-muted-custom",
          upcoming ? "w-[80px] md:w-[128px]" : "w-[72px] md:w-[96px]",
        )}
      >
        {thumbnailUrl && (
          <Image
            src={thumbnailUrl}
            alt=""
            fill
            sizes={upcoming ? "(min-width: 768px) 128px, 80px" : "(min-width: 768px) 96px, 72px"}
            unoptimized={!isSanityImage(thumbnailUrl)}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        {upcoming && daysUntilLabel && (
          <span className="inline-flex items-center rounded-full bg-success-feedback px-2.5 font-noto-sans-jp text-xs font-bold leading-[22px] text-text-success">
            {daysUntilLabel}
          </span>
        )}
        <h3 className="font-rounded-mplus text-sm font-medium leading-[24px] text-text-primary group-hover:underline">
          {title}
        </h3>
      </div>
      <span className="hidden size-9 shrink-0 items-center justify-center rounded-full border border-black/[0.14] text-text-primary/[0.52] transition-colors duration-200 group-hover:border-black/[0.3] group-hover:text-text-primary md:flex">
        <ArrowRight
          className="size-4.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-active:translate-x-1"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
