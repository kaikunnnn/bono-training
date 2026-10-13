/**
 * テンプレート＝全コース共通: 既存レッスンの行 — #241
 *
 * 表紙（2:3, 72×108）／タイトル h4／概要（2行）／このレッスンのゴール（purposes 最大2つ）／クエスト数。
 * Sanity から取れなかった slug も落とさず、灰色の表紙＋slug で出す。
 */

import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import type { ResolvedLesson } from "../data/types";
import { LessonCover } from "./shared";

export default function LessonRow({
  slug,
  lesson,
  order,
}: {
  slug: string;
  lesson: ResolvedLesson | null;
  order: number;
}) {
  const purposes = lesson?.purposes.slice(0, 2) ?? [];

  return (
    <Link
      href={`/lessons/${slug}`}
      className="group flex gap-4 rounded-[20px] border border-border-light bg-surface p-4 shadow-[var(--shadow-card)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)] md:gap-6 md:p-5"
    >
      <LessonCover
        lesson={lesson}
        slug={slug}
        sizes="72px"
        className="w-[60px] self-start shadow-[var(--shadow-quest)] md:w-[72px]"
      />

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-text-muted">
          <span className="font-latin tracking-[0.04em]">LESSON {String(order).padStart(2, "0")}</span>
          {lesson ? (
            <span className="font-medium">
              {lesson.questCount}クエスト・{lesson.articleCount}本
            </span>
          ) : (
            <span className="rounded bg-muted-strong px-1.5 py-px font-mono font-medium">
              Sanity 未取得: {slug}
            </span>
          )}
        </p>
        <h4 className="mt-1 font-heading text-base font-bold leading-[1.5] text-text-primary md:text-[17px]">
          {lesson?.title ?? slug}
        </h4>
        {lesson?.description ? (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.75] text-text-secondary">
            {lesson.description}
          </p>
        ) : null}

        {purposes.length > 0 ? (
          <div className="mt-3 border-t border-dashed border-border-light pt-3">
            <p className="text-[11px] font-bold text-text-muted">このレッスンのゴール</p>
            <ul className="mt-1.5 flex flex-col gap-1">
              {purposes.map((purpose) => (
                <li key={purpose} className="flex gap-2 text-[13px] leading-[1.7] text-text-primary">
                  <Check size={14} strokeWidth={2.5} className="mt-[4px] shrink-0 text-text-success" />
                  <span>{purpose}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <span className="hidden size-8 shrink-0 items-center justify-center self-center rounded-full border border-border-light text-text-muted transition-colors group-hover:bg-hover group-hover:text-text-primary md:flex">
        <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
