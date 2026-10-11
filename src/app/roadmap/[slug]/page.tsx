/**
 * ロードマップ詳細ページ（SSR）
 *
 * URLのslugパラメータに基づいてSanityからロードマップを取得・表示
 */

import { Metadata } from "next";
import { OG_DEFAULTS } from "@/lib/seo-metadata";
import { notFound } from "next/navigation";
import { getRoadmapBySlug, getAllRoadmaps } from "@/lib/sanity";
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
import { getRoadmapSeoOverride, roadmapTitleForMetadata } from "@/lib/roadmap-seo";

// ISR: 1時間キャッシュ
export const revalidate = 3600;

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

  // #236: 検索向けに文言を決めたページはコード側の値で上書きする（Sanityは変更しない）
  const seo = getRoadmapSeoOverride(slug);
  if (seo) {
    return {
      // 文言に「｜BONO」を含むため root の title.template を付けない
      title: { absolute: seo.title },
      description: seo.description,
      openGraph: {
        ...OG_DEFAULTS,
        title: seo.title,
        description: seo.description,
        ...(roadmap.thumbnailUrl && { images: [{ url: roadmap.thumbnailUrl }] }),
      },
      twitter: {
        title: seo.title,
        description: seo.description,
      },
      alternates: { canonical: `/roadmap/${slug}` },
    };
  }

  // #236: Sanity の名前の「|」は h1 の改行マーカー。title/og では表示されないようスペースにする
  const metaTitle = roadmapTitleForMetadata(roadmap.title);

  return {
    title: metaTitle,
    description: roadmap.description,
    openGraph: {
      ...OG_DEFAULTS,
      title: metaTitle,
      description: roadmap.description,
      ...(roadmap.thumbnailUrl && { images: [{ url: roadmap.thumbnailUrl }] }),
    },
    twitter: {
      title: metaTitle,
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
        heading={getRoadmapSeoOverride(slug)?.heading}
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
