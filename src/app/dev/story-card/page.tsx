/**
 * /dev/story-card — StoryCard パターン比較
 *
 * 現状版（全要素入り）と削減パターン A / B / C を並べて比較する。
 */

import { Metadata } from "next";
import Link from "next/link";
import { dummyStories } from "@/app/achievements/dummy-data";
import StoryCard from "@/components/story/StoryCard";
import StoryCardPatternA from "@/components/story/_patterns/StoryCardPatternA";
import StoryCardPatternB from "@/components/story/_patterns/StoryCardPatternB";
import StoryCardPatternC from "@/components/story/_patterns/StoryCardPatternC";

export const metadata: Metadata = {
  title: "StoryCard パターン比較 (/dev/story-card)",
  robots: { index: false, follow: false },
};

function PatternSection({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <div className="mb-4 pb-3 border-b border-gray-200">
        <h2 className="text-xl font-bold text-text-primary font-rounded-mplus">
          {label}
        </h2>
        <p className="text-sm text-text-primary/60 mt-1 font-noto-sans-jp">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

export default function DevStoryCardPage() {
  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 min-w-0">
        <header className="mb-12 pb-6 border-b-2 border-gray-300">
          <Link
            href="/dev/bon-327"
            className="text-sm text-text-primary/60 hover:underline font-noto-sans-jp"
          >
            ← /dev/bon-327 (BON-327 受講者まわり) に戻る
          </Link>
          <h1 className="text-2xl font-bold text-text-primary font-rounded-mplus mt-2">
            StoryCard パターン比較
          </h1>
          <p className="text-sm text-text-primary/60 mt-1 font-noto-sans-jp">
            一覧カードの要素削減方針を決めるための検証
          </p>
        </header>

        <PatternSection
          label="現状版（全要素入り・8要素）"
          description="アイキャッチ + カテゴリ + タイトル + リード文 + プロフ画像 + 名前 + 職種 + タグ"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </PatternSection>

        <PatternSection
          label="パターンA（最小化・3要素）"
          description="アイキャッチ + タイトル + 名前 のみ。最もシンプル"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dummyStories.map((s) => (
              <StoryCardPatternA
                key={s.slug}
                slug={s.slug}
                title={s.title}
                heroImageUrl={s.heroImageUrl}
                person={s.person}
              />
            ))}
          </div>
        </PatternSection>

        <PatternSection
          label="パターンB（中庸・4要素）★推し"
          description="アイキャッチ + タイトル + 名前 + 職種。「誰がどう変わったか」が伝わる"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dummyStories.map((s) => (
              <StoryCardPatternB
                key={s.slug}
                slug={s.slug}
                title={s.title}
                heroImageUrl={s.heroImageUrl}
                person={s.person}
              />
            ))}
          </div>
        </PatternSection>

        <PatternSection
          label="パターンC（タグ残す・4要素）"
          description="アイキャッチ + タイトル + 名前 + タグ。属性ベースの導線あり"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dummyStories.map((s) => (
              <StoryCardPatternC
                key={s.slug}
                slug={s.slug}
                title={s.title}
                heroImageUrl={s.heroImageUrl}
                tags={s.tags}
                person={s.person}
              />
            ))}
          </div>
        </PatternSection>
      </div>
    </div>
  );
}
