/**
 * ロードマップ詳細ページ（SSR）
 *
 * URLのslugパラメータに基づいてSanityからロードマップを取得・表示
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRoadmapBySlug, getAllRoadmapSlugs, getAllRoadmaps } from "@/lib/sanity";
import { getSubscriptionStatus } from "@/lib/subscription";
import RoadmapHero from "@/components/roadmap/detail/RoadmapHero";
import RoadmapPathway from "@/components/roadmap/detail/RoadmapPathway";
import SectionNav, { type SectionNavItem } from "@/components/roadmap/detail/SectionNav";
import ChangingLandscape from "@/components/roadmap/detail/ChangingLandscape";
import InterestingPerspectives from "@/components/roadmap/detail/InterestingPerspectives";
import CurriculumSection from "@/components/roadmap/detail/CurriculumSection";
import ClearBlock from "@/components/roadmap/detail/ClearBlock";
import OtherRoadmapsSection from "@/components/roadmap/detail/OtherRoadmapsSection";
import DottedDivider from "@/components/common/DottedDivider";
import type { GradientPreset } from "@/styles/gradients";

// ============================================
// 静的パスの生成
// ============================================

export async function generateStaticParams() {
  try {
    const slugs = await getAllRoadmapSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

// ============================================
// OGP メタデータの生成
// ============================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const roadmap = await getRoadmapBySlug(slug);

  if (!roadmap) {
    return { title: "ロードマップが見つかりません" };
  }

  return {
    title: roadmap.title,
    description: roadmap.description,
    openGraph: {
      title: `${roadmap.title} | BONO`,
      description: roadmap.description,
      ...(roadmap.thumbnailUrl && { images: [{ url: roadmap.thumbnailUrl }] }),
    },
    twitter: {
      title: `${roadmap.title} | BONO`,
      description: roadmap.description,
    },
    alternates: { canonical: `/roadmap/${slug}` },
  };
}

// ============================================
// ページコンポーネント
// ============================================

export default async function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [roadmap, allRoadmaps, subscriptionStatus] = await Promise.all([
    getRoadmapBySlug(slug),
    getAllRoadmaps(),
    getSubscriptionStatus(),
  ]);

  if (!roadmap) {
    notFound();
  }

  const gradientPreset = (roadmap.gradientPreset || "career-change") as GradientPreset;
  const stepCount = roadmap.steps?.length || 0;
  const estimatedDuration = roadmap.estimatedDuration || "1-2";

  const hasChangingLandscape =
    roadmap.changingLandscape?.items && roadmap.changingLandscape.items.length > 0;
  const hasInterestingPerspectives =
    roadmap.interestingPerspectives?.items && roadmap.interestingPerspectives.items.length > 0;
  const hasCurriculum = roadmap.steps && roadmap.steps.length > 0;

  const sectionNavItems: SectionNavItem[] = [];
  if (hasChangingLandscape) {
    sectionNavItems.push({ id: "changing-landscape", label: "ロードマップで変わる景色" });
  }
  if (hasInterestingPerspectives) {
    sectionNavItems.push({ id: "interesting-perspectives", label: "デザインが面白くなる「視点」" });
  }
  if (hasCurriculum) {
    sectionNavItems.push({ id: "curriculum", label: "カリキュラム" });
  }

  return (
    <div>
      {/* ヒーローセクション */}
      <RoadmapHero
        title={roadmap.title}
        shortTitle={roadmap.shortTitle}
        tagline={roadmap.tagline || roadmap.description}
        stepCount={stepCount}
        estimatedDuration={estimatedDuration}
        gradientPreset={gradientPreset}
        heroImageUrl={roadmap.heroImageUrl}
        thumbnailUrl={roadmap.thumbnailUrl}
        isSubscribed={subscriptionStatus.isSubscribed}
      />

      {/* セクションナビゲーション */}
      {sectionNavItems.length > 0 && (
        <SectionNav items={sectionNavItems} />
      )}

      {/* ロードマップの流れセクション */}
      {hasCurriculum && (
        <RoadmapPathway
          description={roadmap.description}
          steps={roadmap.steps!}
        />
      )}

      {/* 変わる景色セクション */}
      {hasChangingLandscape && (
        <>
          <ChangingLandscape data={roadmap.changingLandscape} />
          {(hasInterestingPerspectives || hasCurriculum) && (
            <div className="px-4 md:px-8">
              <div className="max-w-[1100px] mx-auto">
                <DottedDivider />
              </div>
            </div>
          )}
        </>
      )}

      {/* 面白くなる視点セクション */}
      {hasInterestingPerspectives && (
        <>
          <InterestingPerspectives data={roadmap.interestingPerspectives} />
          {hasCurriculum && (
            <div className="px-4 md:px-8">
              <div className="max-w-[1100px] mx-auto">
                <DottedDivider />
              </div>
            </div>
          )}
        </>
      )}

      {/* カリキュラムセクション */}
      {hasCurriculum && <CurriculumSection steps={roadmap.steps!} />}

      {/* CTAブロック */}
      <ClearBlock roadmapTitle={roadmap.title} roadmapSlug={slug} />

      {/* 他のロードマップセクション */}
      {slug !== "uiux-career-change" && (
        <OtherRoadmapsSection
          currentRoadmapSlug={slug}
          roadmaps={allRoadmaps}
        />
      )}
    </div>
  );
}
