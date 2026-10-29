/**
 * #267 勉強法のハブ（267-Q 2章・S3）
 *
 * 親子は 267-O 1章: トップ > 勉強法 > 項目（項目ごとのページは次の段。今はカードから今ある記事・レッスンへ直接）。
 * 名前は 267-P 7章（検索の言葉）。中身は _data/hierarchy.ts の studyItems（文言は二重に持たない）。
 * 見た目は悩みの一覧と同じ（HubHeader → 目次チップ → カード → 人に聞く → 次に整えたいこと）。
 * 未ログイン／会員は ?state=member（右下の確認用の切り替え）。本番は proxy の /dev 遮断で 404。
 */

import type { Metadata } from "next";
import { Kari } from "../../_parts/shared";
import { studyItems } from "../_data/hierarchy";
import { DevStateToggle } from "../_parts/DevStateToggle";
import { coversFrom, fetchHubMedia, GuideItemCard, hubCounts, SectionTitle, SmallItemRow } from "../_parts/guide-hub";
import { AskPeople, HubHeader, NextSteps, PAGE, TocChips } from "../_parts/hub-parts";
import { CAREER_GUIDE_BASE, ROADMAP_HUB_BASE, STUDY_BASE, TOP_BASE, TROUBLES_HUB_BASE, withState } from "../_parts/top-parts";

export const metadata: Metadata = {
  title: "勉強法｜UIデザインの勉強方法と続け方（#267 試作）",
  robots: { index: false, follow: false },
};

const pad2 = (n: number) => String(n).padStart(2, "0");

export default async function StudyHubPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  const member = state === "member";

  const main = studyItems.filter((it) => !it.small);
  const small = studyItems.filter((it) => it.small);
  const { lessons, visuals, lessonSlugs } = await fetchHubMedia(studyItems);
  const counts = hubCounts(studyItems);

  return (
    <div className="pb-24">
      <HubHeader
        crumbs={[{ label: "トップ", href: withState(TOP_BASE, member) }, { label: "勉強法" }]}
        eyebrow="HOW TO STUDY / 学び方"
        title="勉強法"
        intro={
          <>
            何から、どの順で、どう続けるか。学び方で迷ったときに読む記事とレッスンをまとめました。
            <Kari />
          </>
        }
        counts={[
          { n: counts.items, label: "テーマ" },
          { n: counts.guides, label: "記事" },
          { n: counts.lessons, label: "レッスン" },
        ]}
        covers={coversFrom(lessonSlugs, lessons)}
        coversCaption="このページから開けるレッスンの一部"
      />

      <div className={PAGE}>
        <div className="border-y border-border-light py-6">
          <p className="mb-3 font-noto-sans-jp text-xs font-bold text-text-muted">テーマから探す</p>
          <TocChips label="勉強法のテーマ" items={studyItems.map((it) => ({ href: `#item-${it.id}`, label: it.name }))} />
        </div>

        <section aria-labelledby="themes-title" className="pt-14 lg:pt-16">
          <SectionTitle
            id="themes-title"
            title="学び方のテーマ"
            lead={
              <>
                迷っているところから開いてください
                <Kari />
              </>
            }
          />
          <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {main.map((item, i) => (
              <li key={item.id}>
                <GuideItemCard item={item} visual={visuals[item.id]} no={pad2(i + 1)} />
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-3">
            {small.map((item) => (
              <SmallItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>

        <div className="mt-20 flex flex-col gap-16 border-t border-border-light pt-14 lg:mt-24 lg:gap-20">
          <AskPeople
            title="一人で続けるのがむずかしいときは"
            lead={
              <>
                学び方の迷いも、そのまま聞いて大丈夫です。今のレベルを知りたいときは、つくったものを見てもらいましょう。
                <Kari />
              </>
            }
          />
          <NextSteps
            lead={
              <>
                学び方が決まったら、進む道と、そのあとのことも見ておきましょう。
                <Kari />
              </>
            }
            items={[
              { label: "ロードマップ", href: withState(ROADMAP_HUB_BASE, member), reason: "何を、どの順で学ぶかを道のりで決める" },
              { label: "キャリア", href: withState(CAREER_GUIDE_BASE, member), reason: "転職やポートフォリオの準備を知っておく" },
              { label: "悩みの一覧", href: withState(TROUBLES_HUB_BASE, member), reason: "作っていて手が止まったところから探す" },
              { label: "新しいトップへ戻る", href: withState(TOP_BASE, member), reason: "ほかの入口から探し直す" },
            ]}
          />
        </div>
      </div>

      <DevStateToggle base={STUDY_BASE} member={member} />
    </div>
  );
}
