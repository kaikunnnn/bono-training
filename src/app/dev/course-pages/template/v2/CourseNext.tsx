/**
 * テンプレート v2（完成形）: 修了したら次は — #242
 * 次のおすすめのコース（v2 へ）／ロードマップのどこまで来たか（モック、data/roadmaps.ts）／15分フィードバック。
 * 3つとも押せるので白いカード。
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Map1, MessageText, Teacher } from "iconsax-react";
import type { Course, CourseV2 } from "../../data/types";
import { T } from "../kari";
import { ProgressBar, hereLabel } from "../path";
import { SectionHead, splitTitle } from "../shared";

const CARD =
  "group flex h-full flex-col rounded-[20px] border border-border-light bg-surface p-5 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)]";

export default function CourseNext({ v2, nextCourse }: { v2: CourseV2; nextCourse: Course | null }) {
  const next = nextCourse ? splitTitle(nextCourse.title.text) : null;
  const nextHref = nextCourse ? `/dev/course-pages/v2/${nextCourse.slug}` : null;
  const { path, position } = v2.roadmap;

  return (
    <section aria-labelledby="course-next" className="border-t border-border-light py-16 md:py-20">
      <SectionHead
        id="course-next"
        kicker="Next"
        title="修了したら次は"
        lead="コースを終えたあとに進める先です。"
      />
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {next && nextHref ? (
          <li>
            <Link href={nextHref} className={CARD}>
              <span className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                <Teacher size={16} color="currentColor" variant="Linear" />
                次のおすすめのコース
              </span>
              <h3 className="mt-3 font-heading text-[17px] font-bold leading-[1.5] text-text-primary">{next.main}</h3>
              {next.sub ? <p className="text-xs font-bold text-text-secondary">{next.sub}</p> : null}
              <p className="mt-3 text-[13px] leading-[1.8] text-text-secondary">
                <T f={v2.nextCourse.reason} />
              </p>
              <span className="mt-auto flex items-center gap-1 pt-4 text-xs font-bold text-text-primary">
                コースを見る
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ) : null}
        <li>
          <Link href={path.href} className={CARD}>
            <span className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
              <Map1 size={16} color="currentColor" variant="Linear" />
              ロードマップ：{path.name}
            </span>
            <h3 className="mt-3 font-heading text-[17px] font-bold leading-[1.5] text-text-primary">
              修了すると {hereLabel(position, path.stops.length)}
            </h3>
            <ol className="mt-3 flex gap-1">
              {path.stops.map((stop, i) => (
                <li key={stop} className="min-w-0 flex-1">
                  <ProgressBar value={i < position ? 100 : 0} className="h-1.5" />
                  <span
                    className={
                      i === position - 1
                        ? "mt-1 block truncate text-[10px] font-bold text-text-primary"
                        : "mt-1 block truncate text-[10px] text-text-muted"
                    }
                  >
                    {stop}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-[13px] leading-[1.8] text-text-secondary">
              <T f={v2.roadmap.note} />
            </p>
            <span className="mt-auto flex items-center gap-1 pt-4 text-xs font-bold text-text-primary">
              ロードマップを見る
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </li>
        <li>
          <Link href="/feedback-apply" className={CARD}>
            <span className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
              <MessageText size={16} color="currentColor" variant="Linear" />
              15分フィードバック
            </span>
            <h3 className="mt-3 font-heading text-[17px] font-bold leading-[1.5] text-text-primary">
              つくったものを見てもらう
            </h3>
            <p className="mt-3 text-[13px] leading-[1.8] text-text-secondary">
              {/* 推測の文 */}
              <T
                f={{
                  text: "コースで仕上げた制作物を、15分でフィードバックしてもらえます。次に直すところが具体的になります。",
                  kari: true,
                }}
              />
            </p>
            <span className="mt-auto flex items-center gap-1 pt-4 text-xs font-bold text-text-primary">
              申し込む
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
