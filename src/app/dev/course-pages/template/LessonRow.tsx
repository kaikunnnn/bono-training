/**
 * テンプレート＝全コース共通: レッスンの行（ステップの「やること」そのもの）— #241
 *
 * 順番の番号、表紙（56×84）、タイトル（h4）、1行の情報だけ。概要文と purposes は出さない。
 * 既存レッスンはリンクなので白。progress を渡すと、完了は ✓、途中は「記事 4/7」の小さな表示。
 */

import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import type { ResolvedLesson } from "../data/types";
import { ProgressBar } from "./path";
import type { LessonProgress } from "./progress";
import { LessonCover } from "./shared";

export function RowNumber({ n, done = false }: { n: number; done?: boolean }) {
  return (
    <span
      className={
        done
          ? "flex size-6 shrink-0 items-center justify-center rounded-full bg-text-success text-text-inverse"
          : "flex size-6 shrink-0 items-center justify-center rounded-full border border-border-default font-latin text-[11px] font-bold text-text-secondary"
      }
    >
      {done ? <Check size={13} strokeWidth={3.5} /> : n}
    </span>
  );
}

export default function LessonRow({
  slug,
  lesson,
  number,
  progress,
}: {
  slug: string;
  lesson: ResolvedLesson | null;
  number: number;
  progress?: LessonProgress;
}) {
  const done = Boolean(progress && progress.done === progress.total);
  const partial = Boolean(progress && progress.done > 0 && !done);

  return (
    <Link
      href={`/lessons/${slug}`}
      className="group flex items-center gap-4 rounded-[16px] border border-border-light bg-surface py-2.5 pl-4 pr-4 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)]"
    >
      <RowNumber n={number} done={done} />
      <LessonCover lesson={lesson} slug={slug} sizes="56px" className="w-14 shadow-[var(--shadow-quest)]" />
      <div className="min-w-0 flex-1">
        <h4 className="text-[15px] font-bold leading-[1.5] text-text-primary">{lesson?.title ?? slug}</h4>
        <p className="mt-1 text-xs text-text-muted">
          {!lesson ? (
            <span className="font-mono">Sanity 未取得: {slug}</span>
          ) : done ? (
            <span className="font-bold text-text-success">完了</span>
          ) : partial && progress ? (
            <span className="flex items-center gap-2">
              <span className="font-bold text-text-primary">
                記事 {progress.done}/{progress.total}
              </span>
              <ProgressBar value={(progress.done / progress.total) * 100} className="w-16" />
            </span>
          ) : (
            <>記事 {lesson.articleCount}本</>
          )}
        </p>
      </div>
      <ChevronRight size={18} className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
