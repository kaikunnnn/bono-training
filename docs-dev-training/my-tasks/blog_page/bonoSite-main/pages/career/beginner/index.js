"use client";

import Head from "next/head";
import CareerHeroSection from "@/components/feature/career/career-hero-section";
import CourseSectionUIUX from "@/components/feature/career/CourseSectionUiuxcourse";
import ArticleSection from "@/components/feature/career/ArticleSection";
import ExampleOfUiuxdesignerFromScratch from "@/components/feature/career/ExampleOfUiuxdesignerFromScratch";
import AboutBono from "@/components/feature/career/AboutBono";
import {
  interviewArticles,
  portfolioArticles,
  roadmapArticles,
  sectionData,
  uiuxportfolioArticles,
  z,
} from "@/components/feature/career/data/articles";
import CareerHeader from "@/components/feature/career/CareerHeader";
import WaveDecorationSection from "@/components/feature/career/WaveDecorationSection";

export default function CareerBeginnerPage() {
  return (
    <>
      <Head>
        <title>未経験からのUI/UXデザイナー転職ガイド | BONO(ボノ)</title>
        <meta
          name="description"
          content="未経験からUI/UXデザイナーを目指す方向けの総合ガイド。ポートフォリオの作り方、ロードマップ、面接対策など、キャリアをスタートするために必要な情報を提供します。"
        />

        {/* OGP設定 */}
        <meta
          property="og:title"
          content="未経験からのUI/UXデザイナー転職ガイド | BONO(ボノ)"
        />
        <meta
          property="og:description"
          content="未経験からUI/UXデザイナーを目指す方向けの総合ガイド。ポートフォリオの作り方、ロードマップ、面接対策など、キャリアをスタートするために必要な情報を提供します。"
        />
        <meta
          property="og:image"
          content={`${
            process.env.NEXT_PUBLIC_SITE_URL || ""
          }/images/ogp/career/thumbnail_uiuxcareerguide.jpg`}
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="未経験からのUI/UXデザイナー転職ガイド | BONO(ボノ)"
        />
        <meta property="og:locale" content="ja_JP" />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="未経験からのUI/UXデザイナー転職ガイド | BONO(ボノ)"
        />
        <meta
          name="twitter:description"
          content="未経験からUI/UXデザイナーを目指す方向けの総合ガイド。ポートフォリオの作り方、ロードマップ、面接対策など、キャリアをスタートするために必要な情報を提供します。"
        />
        <meta
          name="twitter:image"
          content={`${
            process.env.NEXT_PUBLIC_SITE_URL || ""
          }/images/ogp/career/thumbnail_uiuxcareerguide.jpg`}
        />
      </Head>

      <div className="bg-stone-100">
        <CareerHeader />
        <CareerHeroSection />
        <WaveDecorationSection />
        <div className="Articles-Section flex flex-col justify-center items-center">
          <div className="Articles-Section-Title"></div>
          <ArticleSection
            sectionData={sectionData.portfolio}
            articles={portfolioArticles}
          />
          <ArticleSection
            sectionData={sectionData.roadmap}
            articles={roadmapArticles}
          />
          <ArticleSection
            sectionData={sectionData.uiuxportfolio}
            articles={uiuxportfolioArticles}
          />
          <ArticleSection
            sectionData={sectionData.interview}
            articles={interviewArticles}
          />
        </div>
        <ExampleOfUiuxdesignerFromScratch />
        <AboutBono />
      </div>
    </>
  );
}
