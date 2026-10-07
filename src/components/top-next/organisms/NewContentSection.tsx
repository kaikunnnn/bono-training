import Link from "next/link";
import { ArticleRow, type ArticleRowProps } from "@/components/top-next/molecules/ArticleRow";
import { HomeClickLink } from "@/components/analytics/HomeClickLink";
import {
  classifyHomeHref,
  type HomeClickSurface,
} from "@/lib/activity-utils";

/**
 * あたらしいコンテンツ（新トップページ Figma Make HANDOFF / NewContentSection）
 *
 * ArticleRow を 2col グリッドで表示。データは page.tsx 側で取得して props で渡す。
 */
export interface NewContentSectionProps {
  articles: ArticleRowProps[];
  /** 指定時のみ見出し行に「一覧を見る →」内部リンクを表示（例: /updates） */
  viewAllHref?: string;
  /** Reserve four rows while the server streams the latest content. */
  loading?: boolean;
  /**
   * 指定時はクリックを計測する（#232 home_click / section: new_content）。
   * 記事・イベント・掲示板などが混ざるので、item_type はリンク先URLから決める。
   */
  surface?: HomeClickSurface;
}

export function NewContentSection({
  articles,
  viewAllHref,
  loading = false,
  surface,
}: NewContentSectionProps) {
  const viewAllClassName =
    "shrink-0 font-noto-sans-jp text-sm text-text-link underline-offset-4 hover:text-text-link-hover hover:underline";
  return (
    <section className="px-6 lg:px-12" aria-busy={loading || undefined}>
      <div className="border-b border-black/[0.12] py-8">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="font-rounded-mplus text-[22px] font-medium leading-[1.71] text-text-primary">
            あたらしいコンテンツ
          </h2>
          {viewAllHref &&
            (surface ? (
              <HomeClickLink
                href={viewAllHref}
                className={viewAllClassName}
                tracking={{ surface, section: "new_content", itemType: "view_all" }}
              >
                一覧を見る →
              </HomeClickLink>
            ) : (
              <Link href={viewAllHref} className={viewAllClassName}>
                一覧を見る →
              </Link>
            ))}
        </div>
        <div className="grid grid-cols-1 gap-x-12 gap-y-0 sm:grid-cols-2">
          {loading && Array.from({ length: 4 }, (_, index) => (
            <div key={index} aria-hidden="true" className="flex items-center gap-4 py-3">
              <div className="aspect-video w-[101px] shrink-0 rounded-[2px] bg-muted-custom lg:w-[115px]" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-12 rounded bg-muted-custom" />
                <div className="h-12 rounded bg-muted-custom" />
              </div>
            </div>
          ))}
          {articles.map((article, index) => (
            <ArticleRow
              key={article.href}
              {...article}
              tracking={
                surface && {
                  surface,
                  section: "new_content",
                  ...classifyHomeHref(article.href),
                  position: index + 1,
                }
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
