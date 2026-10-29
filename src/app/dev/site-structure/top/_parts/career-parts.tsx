/**
 * #267 01 転職の入口ページ（/dev/site-structure/top/career）で v6 の本文に差し込む部品（267-N 2章）
 *
 * - CareerTopLinks: 冒頭の上の小さなリンク（新しいトップへ戻る・v6 の元ページ）
 * - CareerContinue: 会員だけ。v6 試作の ContinueCourseCard ＋ continue-data（進み具合といまここ）
 * - CareerAudience: 見出しの下の「どんな人向け」の1行（仮）
 * - CareerTroubles: このタイプのよくある悩み（267-L 4章の 01 の4項目。項目ページはまだ無いので準備中の仮ページへ）
 * - CareerNext: 次に整えたいこと（02・03 は準備中の仮ページ、04 は本番の /guide）
 * 見た目は v6 の SectionHead と、トップの RowList（行の一覧）をそのまま使う。色はトークンだけ・オレンジは使わない。
 */

import Link from "next/link";
import { ContinueCourseCard } from "../../../course-pages/prototyping/roadmap/ContinueCourseCard";
import { fetchContinueMock } from "../../../course-pages/prototyping/roadmap/continue-data";
import { FOCUS, SECTION, SectionHead, TextLink } from "../../../course-pages/prototyping/roadmap/career-change-v6/_parts/parts";
import { v6Steps } from "../../../course-pages/data/roadmap-career-change-v6";
import { cn } from "@/lib/utils";
import { Kari, V6_BASE } from "../../_parts/shared";
import { RowList, type RowItem } from "./sections";
import { CAREER_BASE, COMING_BASE, TOP_BASE, withState } from "./top-parts";

/** ページ内のステップへのリンク（?state=member を残したまま #step-n へ） */
export function careerStepHref(n: number, member: boolean) {
  return `${withState(CAREER_BASE, member)}#step-${n}`;
}

export function CareerTopLinks({ member }: { member: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
      <Link href={withState(TOP_BASE, member)} className={cn("rounded-[4px] hover:text-text-primary", FOCUS)}>
        ← 新しいトップ
      </Link>
      <Link href={V6_BASE} className={cn("rounded-[4px] hover:text-text-primary", FOCUS)}>
        v6 の元ページと比べる
      </Link>
    </div>
  );
}

// ------------------------------------------------------------
// 会員だけ: 続きから（h1 より上なので見出しタグは使わない）
// ------------------------------------------------------------

export async function CareerContinue({ member }: { member: boolean }) {
  const { card, primary } = await fetchContinueMock();
  // いまここ: 進めているコースを使う v6 のステップ（見つからなければ1つ目）。行き先はこのページの #step-n
  const current =
    v6Steps.find((st) => st.course.type === "course" && st.course.slug === primary.slug) ?? v6Steps[0];
  const data = {
    ...card,
    roadmap: {
      label: "転職ロードマップの",
      done: current.n - 1,
      total: v6Steps.length,
      href: careerStepHref(current.n, member),
    },
  };
  return (
    <div className="mt-6">
      <p className="mb-2 text-xs font-bold text-text-muted">続きから</p>
      <ContinueCourseCard data={data} titleAs="p" />
    </div>
  );
}

export function CareerContinueSkeleton() {
  return (
    <div className="mt-6" aria-hidden="true">
      <div className="h-[220px] animate-pulse rounded-[24px] bg-muted-custom motion-reduce:animate-none" />
    </div>
  );
}

// ------------------------------------------------------------
// 見出しの下: どんな人向け（1行・仮）
// ------------------------------------------------------------

export function CareerAudience() {
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-bold leading-[1.8] text-text-secondary">
      <span className="inline-flex shrink-0 items-center rounded-full border border-border-default px-2 py-px text-xs text-text-secondary">
        こんな人向け
      </span>
      <span>
        デザインの仕事は未経験。働きながら、UIUXデザイナーへの転職を目指す人
        <Kari />
      </span>
    </p>
  );
}

// ------------------------------------------------------------
// このタイプのよくある悩み（267-L 4章: 003 / 004 / 014 / 015）
// ------------------------------------------------------------

const TROUBLES = [
  "最初の1画面が作れない",
  "お手本を真似しても、同じ形にならない",
  "ポートフォリオに何を載せればいいか分からない",
  "面接で、ポートフォリオをうまく話せない",
];

export function CareerTroubles({ member }: { member: boolean }) {
  const href = withState(`${COMING_BASE}?what=troubles`, member);
  return (
    <section id="troubles" aria-labelledby="troubles-title" className={SECTION}>
      <SectionHead
        id="troubles-title"
        kicker="Troubles"
        title="このタイプのよくある悩み"
        lead={
          <>
            転職を目指して進めていると、ここでつまずく人が多いです。
            <Kari />
          </>
        }
      />
      <RowList items={TROUBLES} href={href} className="mt-8" />
      <div className="mt-6">
        <TextLink href={href}>悩みの一覧を見る</TextLink>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// 次に整えたいこと（ほかの入口と勉強法）
// ------------------------------------------------------------

export function CareerNext({ member }: { member: boolean }) {
  const items: RowItem[] = [
    { no: "02", label: "UIデザインのスキルを伸ばす", href: withState(`${COMING_BASE}?what=skill`, member) },
    { no: "03", label: "実務の悩みを解決する", href: withState(`${COMING_BASE}?what=work`, member) },
    { no: "04", label: "勉強法・キャリア", href: "/guide" },
  ];
  return (
    <section id="next" aria-labelledby="next-title" className={SECTION}>
      <SectionHead
        id="next-title"
        kicker="Next"
        title="次に整えたいこと"
        lead={
          <>
            転職の準備と一緒に、ほかの入口からも進められます。
            <Kari />
          </>
        }
      />
      <RowList items={items} className="mt-8" />
    </section>
  );
}
