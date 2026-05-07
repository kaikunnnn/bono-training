import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getAllGuidesFromSanity } from "@/lib/sanity";
import { GuideCard } from "@/components/guide/GuideCard";
import DottedDivider from "@/components/common/DottedDivider";
import { GUIDE_THEMES } from "./data";

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

/** テーマカード */
function ThemeCard({ theme }: { theme: (typeof GUIDE_THEMES)[number] }) {
  return (
    <div className="bg-[rgba(70,87,83,0.04)] rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] p-6 sm:p-8 lg:p-10 flex flex-col gap-5">
      {/* テーマヘッダー */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary font-rounded-mplus">
          {theme.title}
        </h2>
        <p className="text-sm text-text-muted font-noto-sans-jp">
          {theme.forWho}
        </p>
      </div>

      {/* サブトピック一覧 */}
      <div className="flex flex-col">
        {theme.topics.map((topic, index) => (
          <Link
            key={topic.slug}
            href={`/guide/${topic.slug}`}
            className="flex items-center gap-3 py-3.5 border-b border-border-light last:border-b-0 group"
          >
            <span className="text-xs font-bold text-text-disabled font-noto-sans-jp w-5 shrink-0">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="flex-1 text-[15px] font-bold text-text-primary font-noto-sans-jp group-hover:text-text-link transition-colors">
              {topic.title}
            </span>
            <ChevronRight className="w-4 h-4 text-text-disabled group-hover:text-text-link transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function GuidePage() {
  // 最新記事用にSanityデータ取得
  const sanityGuides = await getAllGuidesFromSanity();

  return (
    <div className="min-h-screen">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
        {/* ヘッダー */}
        <section className="pt-8 pb-12">
          <h1 className="text-3xl sm:text-4xl font-bold font-rounded-mplus text-text-primary mb-4">
            ガイド
          </h1>
          <p className="text-base text-text-muted font-noto-sans-jp leading-relaxed max-w-[600px]">
            自分に必要なスキルを見つけて、体系的に学ぼう。気になるテーマから始めてみてください。
          </p>
        </section>

        {/* テーマカードグリッド（ページの主役） */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-16">
          {GUIDE_THEMES.map((theme) => (
            <ThemeCard key={theme.slug} theme={theme} />
          ))}
        </section>

        {/* 最新の記事（補助的） */}
        {sanityGuides.length > 0 && (
          <>
            <DottedDivider className="mb-12" />
            <section className="pb-16">
              <h2 className="text-xl font-bold font-rounded-mplus text-text-primary mb-8">
                最新の記事
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sanityGuides.slice(0, 12).map((guide) => (
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
