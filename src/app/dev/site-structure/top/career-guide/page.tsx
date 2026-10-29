/**
 * #267 キャリアのハブ（267-Q 2章・S3）
 *
 * 親子は 267-O 1章: トップ > キャリア > 項目（項目ごとのページは次の段。今はカードから今ある記事・レッスンへ直接）。
 * 名前は 267-P 7章（検索の言葉）。中身は _data/hierarchy.ts の careerItems。
 * テーマの横に「先輩の道のり」（今ある /stories の体験談。267-P 4章）を置く。名前は出さず、題とタグだけ。
 * 未ログイン／会員は ?state=member（右下の確認用の切り替え）。本番は proxy の /dev 遮断で 404。
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { Kari } from "../../_parts/shared";
import { careerItems } from "../_data/hierarchy";
import { DevStateToggle } from "../_parts/DevStateToggle";
import { coversFrom, fetchHubMedia, GuideCollage, GuideItemCard, hubCounts, SectionTitle, StoriesRow } from "../_parts/guide-hub";
import { AskPeople, HubHeader, NextSteps, PAGE, TocChips } from "../_parts/hub-parts";
import {
  CAREER_BASE,
  CAREER_GUIDE_BASE,
  ROADMAP_HUB_BASE,
  STUDY_BASE,
  TOP_BASE,
  withState,
} from "../_parts/top-parts";

export const metadata: Metadata = {
  title: "キャリア｜UI/UXデザイナーへの転職とポートフォリオ（#267 試作）",
  robots: { index: false, follow: false },
};

const pad2 = (n: number) => String(n).padStart(2, "0");

export default async function CareerGuideHubPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  const member = state === "member";

  const { lessons, visuals, lessonSlugs } = await fetchHubMedia(careerItems);
  const counts = hubCounts(careerItems);

  return (
    <div className="pb-24">
      <HubHeader
        crumbs={[{ label: "トップ", href: withState(TOP_BASE, member) }, { label: "キャリア" }]}
        eyebrow="CAREER / これからのこと"
        title="キャリア"
        intro={
          <>
            転職の進め方、ポートフォリオ、面接、これからの働き方。デザイナーとして次に進むための記事をまとめました。
            <Kari />
          </>
        }
        counts={[
          { n: counts.items, label: "テーマ" },
          { n: counts.guides, label: "記事" },
          { n: counts.lessons, label: "レッスン" },
        ]}
        covers={coversFrom(lessonSlugs, lessons)}
        coversCaption="このページから読める記事の一部"
        aside={<GuideCollage visuals={careerItems.map((it) => visuals[it.id])} />}
      />

      <div className={PAGE}>
        <div className="border-y border-border-light py-6">
          <p className="mb-3 font-noto-sans-jp text-xs font-bold text-text-muted">テーマから探す</p>
          <TocChips
            label="キャリアのテーマ"
            items={[
              ...careerItems.map((it) => ({ href: `#item-${it.id}`, label: it.name })),
              { href: "#stories", label: "先輩の道のり" },
            ]}
          />
        </div>

        <section aria-labelledby="themes-title" className="pt-14 lg:pt-16">
          <SectionTitle
            id="themes-title"
            title="キャリアのテーマ"
            lead={
              <>
                気になっているところから開いてください
                <Kari />
              </>
            }
          />
          <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {careerItems.map((item, i) => (
              <li key={item.id}>
                <GuideItemCard item={item} visual={visuals[item.id]} no={pad2(i + 1)} />
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-20 border-t border-border-light pt-14 lg:mt-24">
          <Suspense fallback={<div className="h-[320px] animate-pulse rounded-[20px] bg-muted-custom motion-reduce:animate-none" aria-hidden="true" />}>
            <StoriesRow />
          </Suspense>
        </div>

        <div className="mt-20 flex flex-col gap-16 border-t border-border-light pt-14 lg:mt-24 lg:gap-20">
          <AskPeople
            title="自分の場合を相談したいときは"
            lead={
              <>
                年齢や経歴、今の仕事との両立など、記事に当てはまらない事情はそのまま聞いてください。
                <Kari />
              </>
            }
          />
          <NextSteps
            lead={
              <>
                進む方向が見えたら、道のりと学び方も整えましょう。
                <Kari />
              </>
            }
            items={[
              {
                no: "01",
                label: "未経験からUI/UXデザイナーへ",
                href: withState(CAREER_BASE, member),
                reason: "転職までの道のりを、ステップごとに進める",
              },
              { label: "ロードマップ", href: withState(ROADMAP_HUB_BASE, member), reason: "ほかの目標の道のりも見比べる" },
              { label: "勉強法", href: withState(STUDY_BASE, member), reason: "働きながら続ける進め方を決める" },
              { label: "新しいトップへ戻る", href: withState(TOP_BASE, member), reason: "ほかの入口から探し直す" },
            ]}
          />
        </div>
      </div>

      <DevStateToggle base={CAREER_GUIDE_BASE} member={member} />
    </div>
  );
}
