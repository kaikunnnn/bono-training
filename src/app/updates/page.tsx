import type { Metadata } from "next";
import {
  ArticleRow,
  type ArticleRowProps,
} from "@/components/top-next/molecules/ArticleRow";
import { getLatestMixedContent } from "@/lib/sanity";
import { OG_DEFAULTS } from "@/lib/seo-metadata";

export const metadata: Metadata = {
  title: "新着コンテンツ | BONO",
  description:
    "BONOに新しく追加された記事・レッスン・ガイド・読み物などをまとめて表示する新着コンテンツ一覧ページです。",
  alternates: { canonical: "/updates" },
  robots: { index: true, follow: true },
  openGraph: {
    ...OG_DEFAULTS,
    title: "新着コンテンツ | BONO",
    description:
      "BONOに新しく追加された記事・レッスン・ガイド・読み物などをまとめて表示する新着コンテンツ一覧ページです。",
  },
};

/**
 * 新着コンテンツ一覧（/updates）
 *
 * `getLatestMixedContent(30)` で8種類のコンテンツ（記事/ガイド/読み物/体験談/
 * イベント/レッスン/アウトプット/質問）を publishedAt 降順でマージした最新30件を
 * 表示する。ルートlayoutの LayoutWrapper が共通レイアウトを担うため、ここでは
 * 個別に Layout をラップしない（/top と同じ）。
 *
 * NOTE: `getLatestMixedContent(30)` は各種類の最新30件ずつを取得してマージし
 * 上位30件に絞る集約ナビ。全件アーカイブではない。
 */
export default async function UpdatesPage() {
  const newContentItems = await getLatestMixedContent(30);

  const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const articles: ArticleRowProps[] = newContentItems.map((item) => ({
    category: item.type,
    title: item.title,
    href: item.href,
    image: item.thumbnail || undefined,
    date: item.publishedAt
      ? dateFormatter.format(new Date(item.publishedAt)).replaceAll("/", ".")
      : undefined,
    dateTime: item.publishedAt || undefined,
  }));

  return (
    <section className="px-6 lg:px-12">
      <div className="py-8">
        <h1 className="font-rounded-mplus text-[28px] font-medium leading-[1.5] text-text-primary">
          新着コンテンツ
        </h1>
        <p className="mt-2 font-noto-sans-jp text-sm leading-[1.71] text-text-primary/[0.56]">
          BONOに新しく追加された記事・レッスン・ガイドなどをまとめて表示しています。
        </p>

        {articles.length > 0 ? (
          <div className="mt-8 flex flex-col">
            {articles.map((article) => (
              <ArticleRow
                key={article.href}
                {...article}
                titleAs="h2"
                variant="updates"
              />
            ))}
          </div>
        ) : (
          <p className="mt-8 font-noto-sans-jp text-sm text-text-primary/[0.56]">
            現在表示できる新着コンテンツはありません。
          </p>
        )}
      </div>
    </section>
  );
}
