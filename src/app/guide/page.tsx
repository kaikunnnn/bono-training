import { Metadata } from "next";
import { getAllGuidesFromSanity } from "@/lib/sanity";
import { GuideCard } from "@/components/guide/GuideCard";
import DottedDivider from "@/components/common/DottedDivider";
import { GUIDE_THEMES } from "./data";
import ThemeScroller from "./ThemeScroller";

// ISR: 1時間キャッシュ
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ガイド",
  description:
    "自分に必要なスキルを見つけて、体系的に学ぼう。UIUXデザイナー転職、ポートフォリオ、学習法などを攻略。",
  openGraph: {
    title: "ガイド | BONO",
    description: "自分に必要なスキルを見つけて、体系的に学ぼう。",
  },
  alternates: { canonical: "/guide" },
};

export default async function GuidePage() {
  const sanityGuides = await getAllGuidesFromSanity();

  return (
    <div className="min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        {/* ヘッダー */}
        <section className="pt-8 pb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-rounded-mplus text-text-primary mb-4">
            ガイド
          </h1>
          <p className="text-base text-text-muted font-noto-sans-jp leading-relaxed max-w-[600px]">
            自分に必要なスキルを見つけて、体系的に学ぼう。気になるテーマから始めてみてください。
          </p>
        </section>

        {/* テーマ横スクロール（3件表示 + スライドでもっと見れる） */}
        <section className="pb-12">
          <ThemeScroller themes={GUIDE_THEMES} />
        </section>

        {/* 最新の記事（ファーストビューに入る） */}
        {sanityGuides.length > 0 && (
          <>
            <DottedDivider className="mb-8" />
            <section className="pb-16">
              <h2 className="text-xl font-bold font-rounded-mplus text-text-primary mb-6">
                最新の記事
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {sanityGuides.slice(0, 16).map((guide) => (
                  <GuideCard key={guide.slug} guide={guide} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
