import { FeaturedCard, type FeaturedCardProps } from "@/components/top-next/molecules/FeaturedCard";

/**
 * おすすめシリーズ（新トップページ Figma Make HANDOFF / FeaturedSeries）
 *
 * 3枚の FeaturedCard を横並び。データは page.tsx 側で取得して props で渡す
 * （Server Componentのデータフロー規約に従い、organism は presentational に保つ）。
 */
export interface FeaturedSeriesProps {
  cards: FeaturedCardProps[];
}

export function FeaturedSeries({ cards }: FeaturedSeriesProps) {
  return (
    <section className="px-6 lg:px-12">
      <div className="border-b border-black/[0.12] pt-[64px] pb-[65px]">
        <div className="flex flex-col gap-6 sm:flex-row">
          {cards.map((card) => (
            <FeaturedCard key={card.href} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
