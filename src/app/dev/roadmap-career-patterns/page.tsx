/**
 * /dev/roadmap-career-patterns — 転職ロードマップのスマホ離脱を減らす UI改善パターンの試作（#282）
 *
 * 本番 /roadmap/uiux-career-change と同じ Sanity データ・同じ並びを再現し、?p= でパターンを差し込む／差し替える。
 * - ?p=now（既定）: 本番と同じ
 * - ?p=A〜I: 1パターンずつ
 * - ?p=all: A〜I を全部入れた版（ヒーローはD版、目次はG版、変化はC版）
 *
 * 本番の共有部品（src/components/roadmap/**）は変えない。中身を変える C・D・G は ./copies にコピーして変えている。
 * ログイン中でも未会員の見え方を出すため getSubscriptionStatus は呼ばず、isSubscribed={false} 固定。
 * Sanity は読むだけ。/dev は proxy と dev layout で本番から隠れている。
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRoadmapBySlug, getStoryBySlug } from "@/lib/sanity";
import RoadmapHero from "@/components/roadmap/detail/RoadmapHero";
import RoadmapPathway from "@/components/roadmap/detail/RoadmapPathway";
import SectionNav, { type SectionNavItem } from "@/components/roadmap/detail/SectionNav";
import ChangingLandscape from "@/components/roadmap/detail/ChangingLandscape";
import InterestingPerspectives from "@/components/roadmap/detail/InterestingPerspectives";
import CurriculumSection from "@/components/roadmap/detail/CurriculumSection";
import ClearBlock from "@/components/roadmap/detail/ClearBlock";
import DottedDivider from "@/components/common/DottedDivider";
import type { GradientPreset } from "@/styles/gradients";
import { getRoadmapSeoOverride } from "@/lib/roadmap-seo";
import PrototypeBar from "./PrototypeBar";
import { includesPattern, normalizePattern } from "./patterns";
import { CAREER_STORIES, type CareerStoryView } from "./career-stories";
import ChangingLandscapeDev from "./copies/ChangingLandscapeDev";
import HeroStoryCard from "./blocks/HeroStoryCard";
import CareerStoriesSection from "./blocks/CareerStoriesSection";
import RoadmapHeroDev from "./copies/RoadmapHeroDev";
import SectionNavDev, { type SectionNavDevItem } from "./copies/SectionNavDev";
import PricingMiniBlock from "./blocks/PricingMiniBlock";
import WhatYouLearn from "./blocks/WhatYouLearn";
import FaqSection, { type FaqItem } from "./blocks/FaqSection";
import OperatorCard from "./blocks/OperatorCard";
import StickyMobileBar from "./blocks/StickyMobileBar";

const SLUG = "uiux-career-change";
/** F: ヒーロー（料金枠）の終わりの目印 */
const HERO_END_SENTINEL_ID = "hero-end-sentinel";

export const metadata: Metadata = {
  title: "転職ロードマップ 離脱対策の試作 (/dev/roadmap-career-patterns)",
  robots: { index: false, follow: false },
};

async function loadCareerStories(): Promise<CareerStoryView[]> {
  const results = await Promise.all(
    CAREER_STORIES.map(async (def) => {
      try {
        const story = await getStoryBySlug(def.slug);
        if (!story) {
          console.warn(`[dev/roadmap-career-patterns] story が見つかりません: ${def.slug}`);
          return null;
        }
        const photoUrl =
          def.photoSource === "profile" ? story.person?.profileImageUrl ?? null : story.heroImageUrl ?? null;
        return { ...def, photoUrl };
      } catch (e) {
        console.warn(`[dev/roadmap-career-patterns] story の取得に失敗: ${def.slug}`, e);
        return null;
      }
    })
  );
  return results.filter((s): s is CareerStoryView => s !== null);
}

function Divider() {
  return (
    <div className="px-4 md:px-8">
      <div className="max-w-[1100px] mx-auto">
        <DottedDivider />
      </div>
    </div>
  );
}

export default async function RoadmapCareerPatternsPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string | string[] }>;
}) {
  const { p } = await searchParams;
  const current = normalizePattern(p);
  const has = (k: Parameters<typeof includesPattern>[1]) => includesPattern(current, k);

  const [roadmap, stories] = await Promise.all([getRoadmapBySlug(SLUG), loadCareerStories()]);
  if (!roadmap) notFound();

  const gradientPreset = (roadmap.gradientPreset || "career-change") as GradientPreset;
  const stepCount = roadmap.steps?.length || 0;
  const estimatedDuration = roadmap.estimatedDuration || "1-2";
  const hasChangingLandscape = !!roadmap.changingLandscape?.items?.length;
  const hasInterestingPerspectives = !!roadmap.interestingPerspectives?.items?.length;
  const hasCurriculum = !!roadmap.steps?.length;

  const sectionNavItems: SectionNavItem[] = [];
  if (hasChangingLandscape) sectionNavItems.push({ id: "changing-landscape", label: "ロードマップで変わる景色" });
  if (hasInterestingPerspectives) sectionNavItems.push({ id: "interesting-perspectives", label: "デザインが面白くなる「視点」" });
  if (hasCurriculum) sectionNavItems.push({ id: "curriculum", label: "カリキュラム" });

  const heroStory = stories.find((s) => s.slug === CAREER_STORIES[0].slug);
  const showStories = has("B") && stories.length > 0;

  // I: よくある質問（文言は Sanity と issue 282 の決定から。資格の質問は出典が無いので載せない）
  const faqItems: FaqItem[] = [];
  const [step1, step2] = roadmap.steps ?? [];
  if (step1 && step2) {
    faqItems.push({
      question: "何から勉強すればいい？",
      answer: `ステップ1「${step1.title}」、ステップ2「${step2.title}」から始めます。`,
    });
  } else {
    console.warn("[dev/roadmap-career-patterns] steps[0]/[1] が無いため「何から」の質問を出しません");
  }
  const workingAnswer = roadmap.changingLandscape?.items?.find((it) => it.description?.includes("働きながら"))
    ?.description;
  if (workingAnswer) {
    faqItems.push({ question: "働きながらでも進められる？", answer: workingAnswer });
  } else {
    console.warn("[dev/roadmap-career-patterns] 「働きながら」の文が Sanity に見つからないため質問を出しません");
  }
  faqItems.push({
    question: "デザインの経験があると早く進められる？",
    answer: "グラフィックなどの経験があっても、6〜8ヶ月は必要です。",
    provisional: "仮（オーナーの言葉・文言未確定）",
  });
  const showFaq = has("I") && faqItems.length > 0;

  // G: チップの目次（ページの並び順）
  const chipItems: SectionNavDevItem[] = [];
  if (hasCurriculum) chipItems.push({ id: "pathway", label: "流れ" });
  if (showStories) chipItems.push({ id: "career-stories", label: "転職した人" });
  if (hasChangingLandscape) chipItems.push({ id: "changing-landscape", label: "変化" });
  if (hasInterestingPerspectives) chipItems.push({ id: "interesting-perspectives", label: "視点" });
  if (showFaq) chipItems.push({ id: "faq", label: "よくある質問" });
  if (hasCurriculum) chipItems.push({ id: "curriculum", label: "カリキュラム" });

  return (
    // 本番のカリキュラム（#curriculum）には scroll-margin が無く、ページ内移動でスマホの固定ヘッダーに隠れるため、
    // 試作パターンでは外側から scroll-margin を足す（部品は変えない）。現状(now)は本番どおり
    <div className={current === "now" ? undefined : "[&_#curriculum]:scroll-mt-20"}>
      <PrototypeBar current={current} />

      {has("D") ? (
        <RoadmapHeroDev
          title={roadmap.title}
          heading={getRoadmapSeoOverride(SLUG)?.heading}
          shortTitle={roadmap.shortTitle}
          tagline={roadmap.tagline || roadmap.description}
          stepCount={stepCount}
          estimatedDuration={estimatedDuration}
          gradientPreset={gradientPreset}
          heroImageUrl={roadmap.heroImageUrl}
          thumbnailUrl={roadmap.thumbnailUrl}
        />
      ) : (
        <RoadmapHero
          title={roadmap.title}
          heading={getRoadmapSeoOverride(SLUG)?.heading}
          shortTitle={roadmap.shortTitle}
          tagline={roadmap.tagline || roadmap.description}
          stepCount={stepCount}
          estimatedDuration={estimatedDuration}
          gradientPreset={gradientPreset}
          heroImageUrl={roadmap.heroImageUrl}
          thumbnailUrl={roadmap.thumbnailUrl}
          isSubscribed={false}
        />
      )}
      {has("F") && <div id={HERO_END_SENTINEL_ID} aria-hidden="true" className="h-px" />}

      {has("E") && <WhatYouLearn />}
      {has("A") && heroStory && <HeroStoryCard story={heroStory} />}
      {has("H") && <OperatorCard />}

      {has("G")
        ? chipItems.length > 0 && <SectionNavDev items={chipItems} />
        : sectionNavItems.length > 0 && <SectionNav items={sectionNavItems} />}

      {hasCurriculum && (
        <div id="pathway" className="scroll-mt-20">
          <RoadmapPathway description={roadmap.description} steps={roadmap.steps!} />
        </div>
      )}

      {showStories && <CareerStoriesSection stories={stories} />}

      {has("D") && <PricingMiniBlock />}

      {hasChangingLandscape && (
        <>
          {has("C") ? (
            <ChangingLandscapeDev data={roadmap.changingLandscape} />
          ) : (
            <ChangingLandscape data={roadmap.changingLandscape} />
          )}
          {(hasInterestingPerspectives || hasCurriculum) && <Divider />}
        </>
      )}

      {hasInterestingPerspectives && (
        <>
          <InterestingPerspectives data={roadmap.interestingPerspectives} />
          {hasCurriculum && <Divider />}
        </>
      )}

      {showFaq && (
        <>
          <FaqSection items={faqItems} />
          {hasCurriculum && <Divider />}
        </>
      )}

      {hasCurriculum && <CurriculumSection steps={roadmap.steps!} />}

      <ClearBlock roadmapTitle={roadmap.title} roadmapSlug={SLUG} />

      {has("F") && (
        <>
          {/* 固定バー（64px＋safe-area）のぶん、ページの最後に余白を足す（スマホのみ） */}
          <div aria-hidden="true" className="h-[calc(64px+env(safe-area-inset-bottom))] md:hidden" />
          <StickyMobileBar sentinelId={HERO_END_SENTINEL_ID} />
        </>
      )}
    </div>
  );
}
