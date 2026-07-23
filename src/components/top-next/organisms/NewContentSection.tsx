import { ArticleRow, type ArticleRowProps } from "@/components/top-next/molecules/ArticleRow";

/**
 * あたらしいコンテンツ（新トップページ Figma Make HANDOFF / NewContentSection）
 *
 * ArticleRow を 2col グリッドで表示。データは page.tsx 側で取得して props で渡す。
 */
export interface NewContentSectionProps {
  articles: ArticleRowProps[];
}

export function NewContentSection({ articles }: NewContentSectionProps) {
  return (
    <section className="px-6 lg:px-12">
      <div className="border-b border-black/[0.12] py-8">
        <h2 className="mb-6 font-noto-sans-jp text-[22px] font-medium leading-[1.71] text-text-primary">
          あたらしいコンテンツ
        </h2>
        <div className="grid grid-cols-1 gap-x-12 gap-y-0 sm:grid-cols-2">
          {articles.map((article) => (
            <ArticleRow key={article.href} {...article} />
          ))}
        </div>
      </div>
    </section>
  );
}
