/**
 * /dev/stories-list — ストーリー専用一覧ページの叩き
 *
 * /lessons のレイアウト・幅・PageHeader と揃える。
 * フィルタは tags のチップ（軸1: 経験背景）のみ。MVP方針。
 */

import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/common/PageHeader";
import { dummyStories } from "@/app/achievements/dummy-data";
import StoryCardPatternB from "@/components/story/_patterns/StoryCardPatternB";

export const metadata: Metadata = {
  title: "ストーリー一覧 叩き (/dev/stories-list)",
  robots: { index: false, follow: false },
};

// 軸1: 経験背景タグ（初期）
const tagFilters = ["すべて", "未経験", "業界経験あり", "デザイン未経験"];

export default function DevStoriesListPage() {
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

        {/* 戻りナビ（/achievements へ） */}
        <div className="mb-6">
          <Link
            href="/achievements"
            className="inline-flex items-center gap-1 text-sm text-text-primary/60 hover:underline font-noto-sans-jp"
          >
            ← みんなの成果 に戻る
          </Link>
        </div>

        {/* タグフィルタ（チップ） */}
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

        {/* ストーリーグリッド */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

        {/* 件数が増えたとき: ページネーション or 「もっと読み込む」を後で追加 */}
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
