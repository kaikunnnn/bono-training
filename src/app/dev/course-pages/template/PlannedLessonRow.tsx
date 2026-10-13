/**
 * テンプレート＝全コース共通: 未制作レッスンの行 — #241
 * 点線の枠＋灰色の表紙＋「未制作」タグ。予定のタイトルと概要を出す。
 */

import type { PlannedLessonRef } from "../data/types";
import { T } from "./kari";
import { LessonCover } from "./shared";

export default function PlannedLessonRow({
  item,
  order,
}: {
  item: PlannedLessonRef;
  order: number;
}) {
  return (
    <div className="flex gap-4 rounded-[20px] border-2 border-dashed border-border-default bg-transparent p-4 md:gap-6 md:p-5">
      <LessonCover plannedTitle={item.title.text} sizes="72px" className="w-[60px] self-start md:w-[72px]" />

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-text-muted">
          <span className="font-latin tracking-[0.04em]">LESSON {String(order).padStart(2, "0")}</span>
          <span className="rounded-full border border-border-default px-2 py-px text-[10px] text-text-secondary">
            未制作
          </span>
        </p>
        <h4 className="mt-1 font-heading text-base font-bold leading-[1.5] text-text-secondary md:text-[17px]">
          <T f={item.title} />
        </h4>
        <p className="mt-1.5 text-[13px] leading-[1.75] text-text-muted">
          <span className="font-bold">予定の内容：</span>
          <T f={item.summary} />
        </p>
      </div>
    </div>
  );
}
