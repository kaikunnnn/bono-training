/**
 * テンプレート＝全コース共通: 未制作レッスンの行 — #241
 * 点線の枠＋背景なし＋灰色の表紙＋「未制作」。押せないので白は使わない。
 */

import type { PlannedLessonRef } from "../data/types";
import { T } from "./kari";
import { RowNumber } from "./LessonRow";
import { LessonCover } from "./shared";

export default function PlannedLessonRow({ item, number }: { item: PlannedLessonRef; number: number }) {
  return (
    <div className="flex items-center gap-4 rounded-[16px] border-2 border-dashed border-border-light py-2.5 pl-4 pr-4">
      <RowNumber n={number} />
      <LessonCover plannedTitle="" sizes="56px" className="w-14" />
      <div className="min-w-0 flex-1">
        <h4 className="text-[15px] font-bold leading-[1.5] text-text-secondary">
          <T f={item.title} />
        </h4>
        <p className="mt-1 text-xs text-text-muted">
          <span className="mr-2 rounded-full border border-border-default px-1.5 py-px text-[10px] font-bold text-text-secondary">
            未制作
          </span>
          公開準備中
        </p>
      </div>
    </div>
  );
}
