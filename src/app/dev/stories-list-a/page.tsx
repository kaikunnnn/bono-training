/**
 * /dev/stories-list-a — ストーリー一覧（カードA + 概要なし版）
 *
 * /dev/stories-list と同じレイアウトベース、カードを「パターンA（最小化）」に差し替え。
 * 概要文・職種・タグは出さない。シンプル特化版。
 */

import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/common/PageHeader";
import { dummyStories } from "@/app/achievements/dummy-data";
import StoryCardPatternA from "@/components/story/_patterns/StoryCardPatternA";

export const metadata: Metadata = {
  title: "ストーリー一覧 / カードA + 概要なし (/dev/stories-list-a)",
  robots: { index: false, follow: false },
};

const tagFilters = ["すべて", "未経験", "業界経験あり", "デザイン未経験"];

export default function DevStoriesListAPage() {
  return (
    <div className="min-h-screen">
      {/* dev portal 戻りリンク */}
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
          label="STORIES"
          title="ストーリー一覧"
          description="BONOで学んで人生を動かした受講者たちのインタビュー記事。"
        />

        {/* 戻りナビ */}
        <div className="mb-6">
          <Link
            href="/achievements"
            className="inline-flex items-center gap-1 text-sm text-text-primary/60 hover:underline font-noto-sans-jp"
          >
            ← みんなの成果 に戻る
          </Link>
        </div>

        {/* タグフィルタ */}
        <div className="mb-8 flex flex-wrap gap-2">
          {tagFilters.map((tag, i) => (
            <button
              key={tag}
              type="button"
              className={`text-sm px-4 py-2 rounded-full font-noto-sans-jp transition-colors ${
                i === 0
                  ? "bg-text-primary text-white font-bold"
                  : "bg-muted-custom text-text-primary/70 hover:bg-gray-200"
              }`}
            >
              {i === 0 ? tag : `#${tag}`}
            </button>
          ))}
        </div>

        {/* ストーリーグリッド（カードA: 画像 + タイトル + 名前のみ） */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

        <div className="mt-12 text-center text-sm text-text-primary/50 font-noto-sans-jp">
          ※ 件数増えたらページネーション or 「もっと読み込む」を実装
        </div>

        {/* 回遊CTA: /outputs へ */}
        <div className="mt-16 pt-12 border-t border-gray-200/60">
          <Link
            href="/outputs"
            className="group block bg-surface rounded-[24px] border border-gray-200/60 shadow-sm p-6 sm:p-8 hover:shadow-md hover:border-gray-300 transition-all max-w-2xl mx-auto"
          >
            <p className="text-xs font-bold text-text-primary/50 font-noto-sans-jp">
              みんなのアウトプット
            </p>
            <h3 className="text-lg sm:text-xl font-bold text-text-primary font-rounded-mplus mt-1">
              受講者が実際に書いたアウトプット記事も見てみる →
            </h3>
            <p className="text-sm text-text-primary/70 font-noto-sans-jp mt-2">
              15分FBを受けた記事の一覧。「こういう使い方もできるんだ」が分かる。
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
