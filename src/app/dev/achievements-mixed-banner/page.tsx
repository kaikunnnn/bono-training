/**
 * /dev/achievements-mixed-banner — ハブの差別化バリアント（バナー型）
 *
 * /achievements ベースで「ストーリー = 縦長グリッド」「アウトプット = 横長バナー型」の
 * Magazine Layout 風混在。バナー型はユーザー提案サイズ感（横長aspect 2:1）。
 */

import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/common/PageHeader";
import SectionHeading from "@/components/common/SectionHeading";
import DottedDivider from "@/components/common/DottedDivider";
import StoryCard from "@/components/story/StoryCard";
import OutputBannerCard from "@/components/output/OutputBannerCard";
import { dummyStories, dummyOutputs } from "@/app/achievements/dummy-data";

export const metadata: Metadata = {
  title: "ハブ Mixed Banner (/dev/achievements-mixed-banner)",
  robots: { index: false, follow: false },
};

export default function DevAchievementsMixedBannerPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-4">
        <Link
          href="/dev/bon-327"
          className="text-xs text-text-primary/50 hover:underline font-noto-sans-jp"
        >
          ← /dev/bon-327 (BON-327 受講者まわり) に戻る
        </Link>
      </div>

      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 min-w-0">
        <PageHeader
          label="みんなの成果"
          title="BONOで動き出した人たち"
          description="BONOで学んだ受講者の転職ストーリーと、実際に手を動かして生まれたアウトプットを紹介します。"
        />

        {/* ストーリー = 縦長グリッド */}
        <section className="mb-12">
          <div className="mb-6">
            <SectionHeading
              label="STORIES"
              title="ストーリー"
              description="受講者が人生を動かした転職ストーリー"
              showUnderline={false}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {dummyStories.map((s) => (
              <StoryCard
                key={s.slug}
                slug={s.slug}
                title={s.title}
                excerpt={s.excerpt}
                heroImageUrl={s.heroImageUrl}
                categoryLabel={s.categoryLabel}
                tags={s.tags}
                person={s.person}
              />
            ))}
          </div>

          <div className="mt-6 text-right">
            <Link
              href="/stories"
              className="inline-flex items-center gap-1 text-sm font-bold text-text-primary hover:opacity-70 transition-opacity font-noto-sans-jp"
            >
              ストーリーをすべて見る
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        <DottedDivider className="my-12" />

        {/* アウトプット = 横長バナー（aspect 2:1） */}
        <section className="mb-12">
          <div className="mb-6">
            <SectionHeading
              label="OUTPUTS"
              title="アウトプット"
              description="BONOのコンテンツを使って生まれた作品・記事たち"
              showUnderline={false}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {dummyOutputs.map((o) => (
              <OutputBannerCard
                key={o.id}
                title={o.title}
                thumbnailUrl={o.thumbnailUrl}
                authorName={o.authorName}
                usedContent={o.usedContent}
                publishedAt={o.publishedAt}
                externalUrl={o.externalUrl}
              />
            ))}
          </div>

          <div className="mt-6 text-right">
            <Link
              href="/outputs"
              className="inline-flex items-center gap-1 text-sm font-bold text-text-primary hover:opacity-70 transition-opacity font-noto-sans-jp"
            >
              アウトプットをすべて見る
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
