/**
 * /dev/course-pages/prototyping — プロトタイピングのハブ（#241 / #242）
 *
 * コース一覧・コース詳細・完成形（v2）・分析を1か所から見られるようにする入口。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { courses, lessonSlugs } from "../data";
import { fetchLessons } from "../data/sanity-lessons";
import CourseEyecatch, { pickCovers } from "../template/CourseEyecatch";
import { courseCounts, splitTitle } from "../template/shared";
import { hubSummary } from "./analysis/analysis-content";

export const metadata: Metadata = {
  title: "プロトタイピング：コースページ（プロト）",
  robots: { index: false, follow: false },
};

const CARD =
  "group block rounded-[24px] border border-border-light bg-surface p-5 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)] md:p-7";

function CardHead({ kicker, title, lead }: { kicker: string; title: string; lead: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">{kicker}</p>
        <h2 className="mt-1.5 font-heading text-xl font-bold leading-[1.5] tracking-[-0.03em] md:text-[22px]">
          {title}
        </h2>
        <p className="mt-1.5 text-sm leading-[1.8] text-text-secondary">{lead}</p>
      </div>
      <ArrowRight size={20} className="mt-1 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
    </div>
  );
}

export default async function PrototypingHubPage() {
  const list = Object.values(courses);
  const lessons = await fetchLessons(list.flatMap(lessonSlugs));

  return (
    <div className="min-h-screen w-full bg-[var(--bg-base)] font-noto-sans-jp text-text-primary">
      <div className="mx-auto w-full max-w-[960px] px-4 pb-24 pt-10 md:px-10 md:pt-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">#241 / #242</p>
        <h1 className="mt-3 font-heading text-[30px] font-bold leading-[1.4] tracking-[-0.05em] md:text-[40px]">
          プロトタイピング
        </h1>
        <p className="mt-3 max-w-[640px] text-[15px] leading-[1.9] text-text-secondary">
          コースページのプロトタイプと、その検討に使った分析をまとめた場所です。一覧・詳細で見え方を確かめ、分析でコースとロードマップの役割分担を読めます。
        </p>

        <div className="mt-10 flex flex-col gap-6">
          {/* 1. 一覧 */}
          <Link href="/dev/course-pages" className={CARD}>
            <CardHead
              kicker="01 · List"
              title="コースの一覧"
              lead="4コースをアイキャッチつきのカードで並べたページ。"
            />
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {list.map((course) => (
                <CourseEyecatch
                  key={course.slug}
                  covers={pickCovers(course, lessons)}
                  label={course.shortTitle.text}
                  sizes="60px"
                  className="rounded-[16px]"
                />
              ))}
            </div>
          </Link>

          {/* 2. 詳細（4コースへのリンク。カード全体ではなく各行がリンク） */}
          <section aria-labelledby="hub-detail" className="rounded-[24px] border border-border-light p-5 md:p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">02 · Detail</p>
            <h2 id="hub-detail" className="mt-1.5 font-heading text-xl font-bold leading-[1.5] tracking-[-0.03em] md:text-[22px]">
              コースの詳細
            </h2>
            <p className="mt-1.5 text-sm leading-[1.8] text-text-secondary">
              確認用の切り替え: <code className="font-mono text-[13px]">?progress=1</code> で会員の進捗、
              <code className="font-mono text-[13px]">?curriculum=syllabus|list</code> でカリキュラムの版（既定はシラバス（大））。画面下のバーからも切り替えられます。
            </p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {list.map((course) => {
                const { main, sub } = splitTitle(course.title.text);
                const counts = courseCounts(course);
                return (
                  <li key={course.slug} className="flex items-center gap-2">
                    <Link
                      href={`/dev/course-pages/${course.slug}`}
                      className="group flex min-w-0 flex-1 items-center gap-4 rounded-[16px] border border-border-light bg-surface px-4 py-3 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-heading text-base font-bold leading-[1.5]">{main}</p>
                        <p className="text-xs text-text-muted">
                          {sub}・レッスン {counts.lessons}本（うち未制作 {counts.planned}本）
                        </p>
                      </div>
                      <ArrowRight size={18} className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                      href={`/dev/course-pages/${course.slug}?progress=1`}
                      className="shrink-0 rounded-full border border-border-light bg-surface px-3 py-1.5 text-[11px] font-bold text-text-secondary hover:border-border-default"
                    >
                      進捗あり
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* 3. 完成形（v2） */}
          <section aria-labelledby="hub-v2" className="rounded-[24px] border border-border-light p-5 md:p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">03 · v2</p>
            <h2 id="hub-v2" className="mt-1.5 font-heading text-xl font-bold leading-[1.5] tracking-[-0.03em] md:text-[22px]">
              完成形（v2）
            </h2>
            <p className="mt-1.5 text-sm leading-[1.8] text-text-secondary">
              分析の問1で出た改善点をすべて入れた版。今は AI コースだけ。v1 は残してあるので、行き来して比べられます。
            </p>
            <ul className="mt-3 flex flex-col gap-1 text-[13px] leading-[1.8] text-text-secondary">
              <li>・ヒーローに「こんな人向け」、得られる変化を書き直し、FAQ に「向いていない人」</li>
              <li>・会員の途中は「あなたが目指していること」、レッスンと全体の目安時間</li>
              <li>・「修了したら次は」、未制作は「近日公開」、料金の一文、マイページの「続きから」</li>
            </ul>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {[
                { href: "/dev/course-pages/v2/ai-ui-design", label: "v2：AI×UIデザイン入門コース", sub: "進捗なし（未ログイン・未課金の見え方）" },
                { href: "/dev/course-pages/v2/ai-ui-design?progress=1", label: "v2：進行中の会員の見え方", sub: "?progress=1" },
                { href: "/dev/course-pages/ai-ui-design", label: "v1 と比べる", sub: "今のコースページ（v1）" },
                { href: "/dev/course-pages/v2/mypage", label: "マイページの「続きから」", sub: "マイページ上部のモック" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group flex items-center gap-3 rounded-[16px] border border-border-light bg-surface px-4 py-3 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-[15px] font-bold leading-[1.5]">{l.label}</p>
                    <p className="text-xs text-text-muted">{l.sub}</p>
                  </div>
                  <ArrowRight size={18} className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>

          {/* 4. 分析 */}
          <Link href="/dev/course-pages/prototyping/analysis" className={CARD}>
            <CardHead
              kicker="04 · Analysis"
              title="分析：コースとロードマップ"
              lead="ロードマップとコースを「払う」「続ける」で比べ、言葉と役割分担を整理した読みもの（2026-10-13）。"
            />
            <ul className="mt-5 flex flex-col gap-1.5 border-t border-border-light pt-4">
              {hubSummary.map((line, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-[1.8] text-text-primary">
                  <span className="font-latin font-bold text-text-muted">{i + 1}</span>
                  {line}
                </li>
              ))}
            </ul>
          </Link>
        </div>
      </div>
    </div>
  );
}
