/**
 * 「続きから」カード（#243 トピック5）
 *
 * 1つのコースの進み具合を1枚で見せる。階層は
 * - 親: コース名と進み具合（レッスン N/M 完了・細いバー）。白にしない（ここ自体は主な押す場所ではない）
 * - 主: 次に進める記事（白い面）＋「続きから」ボタン。押す場所はここだけ
 * - 従: ロードマップのいまここ（小さな1行リンク）
 * - ほかに進めているコースがあれば、下に1行ずつ小さく
 * データは continue-data.ts で組み立てて渡す（このファイルは表示だけ）。
 */

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Routing2 } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProgressBar } from "../../template/path";

export interface ContinueCourseSummary {
  title: string;
  href: string;
  lessonsDone: number;
  lessonsTotal: number;
  percent: number;
}

export interface ContinueCardData {
  course: ContinueCourseSummary;
  next: {
    lessonTitle: string;
    articleTitle: string;
    articleNumber: number;
    href: string;
    thumbnailUrl: string | null;
  } | null;
  roadmap: { label: string; done: number; total: number; href: string } | null;
  others: ContinueCourseSummary[];
}

export function ContinueCourseCard({
  data,
  className,
  titleAs: Title = "h3",
}: {
  data: ContinueCardData;
  className?: string;
  /** コース名のタグ。h1 より上に置くときは "p"（見出しの順を崩さない） */
  titleAs?: "h2" | "h3" | "p";
}) {
  const { course, next, roadmap, others } = data;

  return (
    <div className={cn("w-full rounded-[24px] bg-muted-custom p-4 md:p-5", className)}>
      {/* 親: コース */}
      <p className="text-[11px] font-bold text-text-muted">進めているコース</p>
      <Title className="mt-0.5 font-heading text-[17px] font-bold leading-[1.5] text-text-primary">
        <Link href={course.href} className="hover:underline">
          {course.title}
        </Link>
      </Title>
      <div className="mt-2 flex items-center gap-3">
        <ProgressBar value={course.percent} className="h-1 max-w-[280px] flex-1" />
        <span className="shrink-0 text-xs text-text-secondary">
          レッスン {course.lessonsDone}/{course.lessonsTotal} 完了
        </span>
      </div>

      {/* 主: 次の記事（押す場所はここだけ） */}
      {next ? (
        <Link
          href={next.href}
          className="group mt-4 flex flex-col gap-3 rounded-[18px] border border-border-light bg-surface p-3 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)] sm:flex-row sm:items-center sm:gap-4 md:p-4"
        >
          <span className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
            <span className="relative h-[73px] w-12 shrink-0 overflow-hidden rounded-r-lg bg-muted-custom">
              {next.thumbnailUrl ? (
                <Image src={next.thumbnailUrl} alt="" fill sizes="48px" style={{ objectFit: "cover" }} />
              ) : null}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs text-text-muted">
                {next.lessonTitle}・記事{next.articleNumber}
              </span>
              <span className="mt-0.5 line-clamp-2 block font-heading text-[16px] font-bold leading-[1.5] text-text-primary">
                {next.articleTitle}
              </span>
            </span>
          </span>
          <Button asChild className="w-full shrink-0 sm:w-auto">
            <span>
              続きから
              <ArrowRight aria-hidden />
            </span>
          </Button>
        </Link>
      ) : (
        <p className="mt-4 text-sm text-text-secondary">このコースはすべて完了しています</p>
      )}

      {/* 従: ロードマップのいまここ */}
      {roadmap ? (
        <Link
          href={roadmap.href}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary hover:underline"
        >
          <Routing2 size={14} color="currentColor" variant="Linear" aria-hidden />
          {roadmap.label} <strong className="text-text-primary">いまここ {Math.min(roadmap.done + 1, roadmap.total)}/{roadmap.total}</strong>
          <ArrowRight size={12} aria-hidden />
        </Link>
      ) : null}

      {/* ほかに進めているコース */}
      {others.length > 0 ? (
        <div className="mt-4 border-t border-border-light pt-3">
          <p className="text-[11px] font-bold text-text-muted">ほかに進めているコース</p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {others.map((o) => (
              <li key={o.href}>
                <Link
                  href={o.href}
                  className="flex items-center gap-3 text-[13px] text-text-secondary hover:text-text-primary hover:underline"
                >
                  <span className="min-w-0 flex-1 truncate">{o.title}</span>
                  <span className="shrink-0 text-xs text-text-muted">
                    レッスン {o.lessonsDone}/{o.lessonsTotal}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
