/**
 * ロードマッププロト（#243）の共通部品
 * - roadmapStats: 区切りの数、うち準備中のコースの数
 * - MiniPath: 横の小さな道のり（いまここ付き）
 * - StopIcon: コース外のやることのアイコン
 */

import { Briefcase, Book1, MessageText, Teacher } from "iconsax-react";
import { cn } from "@/lib/utils";
import { ROADMAP_BASE, stopLabel, type Roadmap, type RoadmapStop } from "../../data/roadmaps";
import { PathMarker, type MarkerStatus } from "../../template/path";

export { ROADMAP_BASE };

export function roadmapStats(r: Roadmap) {
  return {
    stops: r.stops.length,
    courses: r.stops.filter((s) => s.type === "course").length,
    planned: r.stops.filter((s) => s.type === "planned-course").length,
    outside: r.stops.filter((s) => s.type === "outside").length,
  };
}

/** 最初の既存コース（「最初の1コースからはじめる」の行き先） */
export function firstCourseSlug(r: Roadmap): string | null {
  const s = r.stops.find((st) => st.type === "course");
  return s && s.type === "course" ? s.slug : null;
}

export function StopIcon({ stop, size = 20 }: { stop: RoadmapStop; size?: number }) {
  if (stop.type !== "outside") return <Teacher size={size} color="currentColor" variant="Linear" />;
  if (stop.kind === "portfolio") return <Book1 size={size} color="currentColor" variant="Linear" />;
  if (stop.kind === "feedback") return <MessageText size={size} color="currentColor" variant="Linear" />;
  return <Briefcase size={size} color="currentColor" variant="Linear" />;
}

/** 区切りの状態（done 個終えている → 次がいまここ） */
export function stopStatus(index: number, done: number | null): MarkerStatus {
  if (done === null) return "plain";
  if (index < done) return "done";
  if (index === done) return "current";
  return "todo";
}

/** 横の小さな道のり。done を渡すと完了✓・いまここ・未着手を描き分ける */
export function MiniPath({ roadmap, done = null, className }: { roadmap: Roadmap; done?: number | null; className?: string }) {
  const n = roadmap.stops.length;
  return (
    <ol className={cn("relative flex", className)}>
      <span
        aria-hidden="true"
        className="absolute top-2 h-px bg-border-strong"
        style={{ left: `calc(100% / ${n * 2})`, right: `calc(100% / ${n * 2})` }}
      />
      {roadmap.stops.map((stop, i) => {
        const status = stopStatus(i, done);
        return (
          <li key={i} className="relative flex min-w-0 flex-1 flex-col items-center px-0.5">
            <PathMarker kind="goal" status={status} size="sm" />
            <span
              className={cn(
                "mt-1 w-full truncate text-center text-[10px] leading-[1.4]",
                status === "current" ? "font-bold text-text-primary" : "text-text-muted"
              )}
            >
              {stopLabel(stop)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
