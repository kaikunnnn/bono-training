import Link from "next/link";
import { ArticleRow, type ArticleRowProps } from "@/components/top-next/molecules/ArticleRow";

/**
 * あたらしいコンテンツ（新トップページ Figma Make HANDOFF / NewContentSection）
 *
 * ArticleRow を 2col グリッドで表示。データは page.tsx 側で取得して props で渡す。
 */
export interface NewContentSectionProps {
  articles: ArticleRowProps[];
  /** 指定時のみ見出し行に「一覧を見る →」内部リンクを表示（例: /updates） */
  viewAllHref?: string;
}

export function NewContentSection({ articles, viewAllHref }: NewContentSectionProps) {
  return (
    <section className="px-6 lg:px-12">
      <div className="border-b border-black/[0.12] py-8">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="font-rounded-mplus text-[22px] font-medium leading-[1.71] text-text-primary">
            あたらしいコンテンツ
          </h2>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="shrink-0 font-noto-sans-jp text-sm text-text-link underline-offset-4 hover:text-text-link-hover hover:underline"
            >
              一覧を見る →
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 gap-x-12 gap-y-0 sm:grid-cols-2">
          {articles.map((article) => (
            <ArticleRow key={article.href} {...article} />
          ))}
        </div>
      </div>
    </section>
  );
}
