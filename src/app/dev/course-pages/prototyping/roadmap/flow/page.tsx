/**
 * /dev/course-pages/prototyping/roadmap/flow — コースを進める仕組み（イメージ）（#243 トピック4）
 *
 * 進める＝コースだけ（「このコースを始める」で登録 → 続きからの元）。記録＝記事・レッスンの完了。
 * ロードマップは選ばせず、終えたコースから「いまここ」を自動で出す。
 * 4つの場面を上から順に縦へ並べ、それぞれ1行の説明と実物のページへのリンクを付ける。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRoadmap } from "../../../data/roadmaps";
import { KariProvider } from "../../../template/kari";
import { ProgressBar } from "../../../template/path";
import { splitTitle } from "../../../template/shared";
import { ContinueCourseCard } from "../ContinueCourseCard";
import { COURSE_V2, fetchContinueMock } from "../continue-data";
import { MiniPath, ROADMAP_BASE } from "../parts";

export const metadata: Metadata = {
  title: "コースを進める仕組み（ロードマップ・プロト）",
  robots: { index: false, follow: false },
};

const LINK_PILL =
  "inline-flex items-center gap-1 rounded-full border border-border-light bg-surface px-3 py-1.5 text-xs font-bold text-text-secondary hover:border-border-default hover:text-text-primary";

function Frame({
  no,
  title,
  links,
  children,
}: {
  no: string;
  title: string;
  links: { label: string; href: string }[];
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`flow-${no}`} className="rounded-[24px] border border-border-light p-5 md:p-7">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">{no}</p>
      <h2 id={`flow-${no}`} className="mt-1.5 font-heading text-lg font-bold leading-[1.5] tracking-[-0.02em] md:text-xl">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
      <div className="mt-5 flex flex-wrap gap-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={LINK_PILL}>
            {l.label}
            <ArrowRight size={12} aria-hidden />
          </Link>
        ))}
      </div>
    </section>
  );
}

function Between() {
  return (
    <div className="flex justify-center text-text-muted" aria-hidden="true">
      <ArrowDown size={20} />
    </div>
  );
}

export default async function FlowPage() {
  const { card, primary } = await fetchContinueMock();
  const career = getRoadmap("career-change")!;
  const title = splitTitle(primary.title.text).main;
  const before = card.course.percent;
  // 記事を1本終えた後（モック: 1本ぶん増える）
  const after = Math.min(100, before + 3);

  return (
    <KariProvider>
      <div className="min-h-screen w-full bg-[var(--bg-base)] font-noto-sans-jp text-text-primary">
        <div className="mx-auto w-full max-w-[760px] px-4 pb-28 pt-10 md:px-10 md:pt-14">
          <Link href={ROADMAP_BASE} className="text-xs text-text-muted hover:text-text-primary">
            ← ロードマップのプロト
          </Link>
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">#243 · トピック4</p>
          <h1 className="mt-2 font-heading text-[28px] font-bold leading-[1.4] tracking-[-0.05em] md:text-[36px]">
            コースを進める仕組み（イメージ）
          </h1>
          <p className="mt-3 text-[15px] leading-[1.9] text-text-secondary">
            進めるのはコースだけ。記録は記事・レッスンの完了。ロードマップは選ばず、終えたコースから位置が決まります。
          </p>

          <div className="mt-10 flex flex-col gap-4">
            <Frame
              no="01"
              title="コースページで「このコースを始める」"
              links={[
                { label: "始める前", href: `${COURSE_V2}/${primary.slug}?started=0` },
                { label: "始めた後", href: `${COURSE_V2}/${primary.slug}?started=1` },
              ]}
            >
              <div className="rounded-[18px] bg-muted-custom px-5 py-5">
                <p className="text-xs font-bold text-text-muted">コース</p>
                <p className="mt-1 font-heading text-[17px] font-bold">{title}</p>
                <Button asChild className="mt-4">
                  <Link href={`${COURSE_V2}/${primary.slug}?started=0`}>
                    このコースを始める
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              </div>
            </Frame>

            <Between />

            <Frame
              no="02"
              title="ホームの最初に「続きから」が出る"
              links={[{ label: "課金ユーザーのトップ", href: `${ROADMAP_BASE}/applied/home?state=progress` }]}
            >
              <ContinueCourseCard data={card} />
            </Frame>

            <Between />

            <Frame
              no="03"
              title="記事を終えると、コースの進み具合が増える"
              links={[{ label: "コースページ（進めている）", href: `${COURSE_V2}/${primary.slug}?started=1` }]}
            >
              <div className="flex flex-col gap-3 rounded-[18px] bg-muted-custom px-5 py-5">
                <div className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs text-text-muted">終える前</span>
                  <ProgressBar value={before} className="h-1.5 flex-1" />
                  <span className="w-10 shrink-0 text-right text-xs font-bold text-text-secondary">{before}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs text-text-muted">終えた後</span>
                  <ProgressBar value={after} className="h-1.5 flex-1" />
                  <span className="w-10 shrink-0 text-right text-xs font-bold text-text-primary">{after}%</span>
                </div>
              </div>
            </Frame>

            <Between />

            <Frame
              no="04"
              title="コースを終えると、ロードマップの「いまここ」が自動で進む（選ぶ操作はない）"
              links={[
                { label: "コースを終えた直後のトップ", href: `${ROADMAP_BASE}/applied/home?state=done` },
                { label: "ロードマップ（いまここ）", href: `${ROADMAP_BASE}/career-change-v3?progress=1` },
              ]}
            >
              <div className="flex flex-col gap-4 rounded-[18px] bg-muted-custom px-5 py-5">
                <MiniPath roadmap={career} done={1} />
                <div className="flex justify-center text-text-muted" aria-hidden="true">
                  <ArrowDown size={16} />
                </div>
                <MiniPath roadmap={career} done={2} />
              </div>
            </Frame>
          </div>
        </div>
      </div>
    </KariProvider>
  );
}
