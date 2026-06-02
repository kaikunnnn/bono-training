/**
 * /dev/output-card — OutputCard パターン確認
 *
 * 15分FB済みアウトプットのカード表示確認用。
 */

import { Metadata } from "next";
import Link from "next/link";
import { dummyOutputs } from "@/app/achievements/dummy-data";
import OutputCard from "@/components/output/OutputCard";
import OutputListItem from "@/components/output/OutputListItem";
import OutputBannerCard from "@/components/output/OutputBannerCard";

export const metadata: Metadata = {
  title: "OutputCard パターン確認 (/dev/output-card)",
  robots: { index: false, follow: false },
};

export default function DevOutputCardPage() {
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
            OutputCard パターン確認
          </h1>
          <p className="text-sm text-text-primary/60 mt-1 font-noto-sans-jp">
            15分FB済みアウトプット記事のカード表示
          </p>
        </header>

        <section className="mb-16">
          <div className="mb-4 pb-3 border-b border-gray-200">
            <h2 className="text-xl font-bold text-text-primary font-rounded-mplus">
              現状版（縦長グリッドカード・5要素）
            </h2>
            <p className="text-sm text-text-primary/60 mt-1 font-noto-sans-jp">
              サムネ + タイトル + 投稿者 + 日付 + 使ったコンテンツ。/stories と形が似ている。
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {dummyOutputs.map((o) => (
              <OutputCard
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
        </section>

        <section className="mb-16">
          <div className="mb-4 pb-3 border-b border-gray-200">
            <h2 className="text-xl font-bold text-text-primary font-rounded-mplus">
              リスト型（横長カード・Zapier/Intercom/Substack風）★リサーチ推し
            </h2>
            <p className="text-sm text-text-primary/60 mt-1 font-noto-sans-jp">
              サムネ左 + テキスト右の横長レイアウト。1列縦並びで流し読みに最適。
              /stories の縦長グリッドと形状が完全に違うので一目で区別できる。
            </p>
          </div>
          <div className="flex flex-col gap-3 max-w-3xl">
            {dummyOutputs.map((o) => (
              <OutputListItem
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
        </section>

        <section className="mb-16">
          <div className="mb-4 pb-3 border-b border-gray-200">
            <h2 className="text-xl font-bold text-text-primary font-rounded-mplus">
              バナー型（横長グリッド・aspect 2:1）★ユーザー提案
            </h2>
            <p className="text-sm text-text-primary/60 mt-1 font-noto-sans-jp">
              横長サムネ（2:1）を大きく見せるグリッドカード。2〜3列配置で、note記事のOGP画像が映える。
              /stories の縦長グリッドとはアスペクト比が違うので形状で区別できる。
            </p>
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
        </section>
      </div>
    </div>
  );
}
