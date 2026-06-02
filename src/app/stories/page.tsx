import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/common/PageHeader";
import StoryCardItem from "@/components/story/StoryCardItem";
import { getStoriesList } from "@/lib/sanity";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ストーリー一覧",
  description:
    "BONOで学んで人生を動かした受講者たちのインタビュー記事。未経験からUIデザイナーへの転職、独立、キャリアチェンジなど。",
  openGraph: {
    title: "ストーリー一覧 | BONO",
    description:
      "BONOで学んで人生を動かした受講者たちのインタビュー記事。",
  },
  twitter: {
    title: "ストーリー一覧 | BONO",
    description:
      "BONOで学んで人生を動かした受講者たちのインタビュー記事。",
  },
  alternates: { canonical: "/stories" },
};

const tagFilters = ["すべて", "未経験", "業界経験あり", "デザイン未経験"];

export default async function StoriesPage() {
  const stories = await getStoriesList();

  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 min-w-0">
        <PageHeader
          label="STORIES"
          title="ストーリー一覧"
          description="BONOで学んで人生を動かした受講者たちのインタビュー記事。"
        />

        <div className="mb-6">
          <Link
            href="/achievements"
            className="inline-flex items-center gap-1 text-sm text-text-primary/60 hover:underline font-noto-sans-jp"
          >
            ← みんなの成果 に戻る
          </Link>
        </div>

        {/* タグフィルタ（叩き：MVP では絞り込みロジック未実装、UI のみ） */}
        <div className="mb-8 flex flex-wrap gap-2">
          {tagFilters.map((tag, i) => (
            <span
              key={tag}
              className={`text-sm px-4 py-2 rounded-full font-noto-sans-jp ${
                i === 0
                  ? "bg-text-primary text-white font-bold"
                  : "bg-muted-custom text-text-primary/70"
              }`}
            >
              {i === 0 ? tag : `#${tag}`}
            </span>
          ))}
        </div>

        {stories.length === 0 ? (
          <p className="text-text-primary/50 text-center py-16 font-noto-sans-jp">
            まだストーリーが公開されていません。
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {stories.map((story) => (
              <StoryCardItem key={story._id} story={story} />
            ))}
          </div>
        )}

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
