/**
 * #267 ロードマップのハブ（267-Q 2章・S4）
 *
 * 親子は 267-O 1章: トップ > ロードマップ > 各ロードマップ（01 の未経験からは /top/career、ほかは /top/roadmap/[slug]）。
 * 8本を 267-P 1章のとおり 01 転職／02 スキル／03 実務 に分けて並べる（トップの入口から #01〜#03 で着地）。
 * 中身は roadmaps.ts（文言は二重に持たない）。ここで開けるレッスンの表紙は、使うコースの実物（Sanity の CDN を直接）。
 * 未ログイン／会員は ?state=member（右下の確認用の切り替え）。本番は proxy の /dev 遮断で 404。
 */

import type { Metadata } from "next";
import { courses, lessonSlugs } from "../../../course-pages/data";
import { fetchLessons } from "../../../course-pages/data/sanity-lessons";
import { Kari } from "../../_parts/shared";
import { hubRoadmaps, ROADMAP_GROUPS, roadmapHubHref, V6_SLUG } from "../_data/roadmap-hub";
import { DevStateToggle } from "../_parts/DevStateToggle";
import { isGenericCover } from "../_parts/guide-hub";
import { AskPeople, HubHeader, NextSteps, PAGE, PHRASE, TocChips } from "../_parts/hub-parts";
import { RoadmapCard } from "../_parts/roadmap-parts";
import { CAREER_GUIDE_BASE, ROADMAP_HUB_BASE, STUDY_BASE, TOP_BASE, TROUBLES_HUB_BASE, withState } from "../_parts/top-parts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "ロードマップ｜UIデザインの学習ロードマップ（#267 試作）",
  robots: { index: false, follow: false },
};

export default async function RoadmapHubPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  const member = state === "member";

  const groups = ROADMAP_GROUPS.map((g) => ({ ...g, roadmaps: hubRoadmaps(g) }));
  const all = groups.flatMap((g) => g.roadmaps);
  // データから数える: 使う今あるコース・準備中のコース
  const usedCourses = new Set(all.flatMap((r) => r.stops.flatMap((s) => (s.type === "course" ? [s.slug] : []))));
  const planned = new Set(all.flatMap((r) => r.stops.flatMap((s) => (s.type === "planned-course" ? [s.title] : []))));

  const slugs = [...usedCourses].flatMap((slug) => (courses[slug] ? lessonSlugs(courses[slug]) : []));
  const lessons = await fetchLessons(slugs);
  const covers = slugs.map((s) => lessons[s] ?? null).filter((l) => l && !isGenericCover(l.iconImageUrl));

  return (
    <div className="pb-24">
      <HubHeader
        crumbs={[{ label: "トップ", href: withState(TOP_BASE, member) }, { label: "ロードマップ" }]}
        eyebrow="ROADMAP / 道のりを選ぶ"
        title="ロードマップ"
        intro={
          <>
            目指す姿に合わせて、どのコースをどの順で進めるかをまとめた道のりです。近いものを1つ選んでください。
            <Kari />
          </>
        }
        counts={[
          { n: all.length, label: "ロードマップ" },
          { n: usedCourses.size, label: "使うコース" },
          { n: planned.size, label: "準備中のコース" },
        ]}
        covers={covers}
        coversCaption="ロードマップで使うコースのレッスンの一部"
      />

      <div className={PAGE}>
        <div className="border-y border-border-light py-6">
          <p className="mb-3 font-noto-sans-jp text-xs font-bold text-text-muted">目指していることから選ぶ</p>
          <TocChips
            label="ロードマップの分け方"
            items={groups.map((g) => ({ href: `#${g.no}`, label: `${g.no} ${g.label}`, count: g.roadmaps.length }))}
          />
        </div>

        <div className="flex flex-col">
          {groups.map((g) => (
            <section key={g.no} id={g.no} aria-labelledby={`group-${g.no}-title`} className="scroll-mt-24 pt-14 lg:pt-20">
              <div className="flex items-start gap-4 lg:gap-6">
                <span className="pt-1 font-latin text-[28px] font-bold leading-none tracking-[-0.02em] text-text-muted lg:text-[36px]" aria-hidden="true">
                  {g.no}
                </span>
                <div className="min-w-0">
                  <h2 id={`group-${g.no}-title`} className={cn("font-heading text-[26px] font-bold leading-[1.4] text-text-primary lg:text-[32px]", PHRASE)}>
                    <span className="sr-only">{g.no} </span>
                    {g.label}
                  </h2>
                  <p className="mt-1 font-noto-sans-jp text-sm text-text-muted">
                    {g.lead}
                    <Kari />
                  </p>
                </div>
              </div>
              <ul className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {g.roadmaps.map((r) => (
                  <li key={r.slug}>
                    <RoadmapCard roadmap={r} group={g.no} href={withState(roadmapHubHref(r.slug), member)} featured={r.slug === V6_SLUG} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-20 flex flex-col gap-16 border-t border-border-light pt-14 lg:mt-24 lg:gap-20">
          <AskPeople
            title="どれが合うか迷ったら"
            lead={
              <>
                今の状況を書いて聞いてもらえれば、近い道のりを一緒に考えます。
                <Kari />
              </>
            }
          />
          <NextSteps
            lead={
              <>
                道のりを選んだら、つまずいたときと学び方の置き場所も知っておきましょう。
                <Kari />
              </>
            }
            items={[
              { label: "悩みの一覧", href: withState(TROUBLES_HUB_BASE, member), reason: "道のりの途中で手が止まったとき" },
              { label: "勉強法", href: withState(STUDY_BASE, member), reason: "働きながら続ける進め方を決める" },
              { label: "キャリア", href: withState(CAREER_GUIDE_BASE, member), reason: "転職やポートフォリオの準備を知っておく" },
              { label: "新しいトップへ戻る", href: withState(TOP_BASE, member), reason: "ほかの入口から探し直す" },
            ]}
          />
        </div>
      </div>

      <DevStateToggle base={ROADMAP_HUB_BASE} member={member} />
    </div>
  );
}
