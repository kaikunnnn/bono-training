import { PromoCard } from "@/components/top-next/molecules/PromoCard";

/**
 * おすすめシリーズ（新トップページ Figma Make HANDOFF / FeaturedSeries）
 *
 * 3枚の PromoCard を横並び。titlePosition="above"（タイトルが画像の上）。
 * データは page.tsx 側で取得して props で渡す
 * （Server Componentのデータフロー規約に従い、organism は presentational に保つ）。
 */
export interface FeaturedSeriesCard {
  title: string;
  desc: string;
  image?: string;
  href: string;
}

export interface FeaturedSeriesProps {
  cards: FeaturedSeriesCard[];
}

export function FeaturedSeries({ cards }: FeaturedSeriesProps) {
  return (
    <section className="px-6 lg:px-12">
      <div className="border-b border-black/[0.12] pt-[64px] pb-[65px]">
        <div className="flex flex-col gap-6 sm:flex-row">
          {cards.map((card) => (
            <PromoCard
              key={card.href}
              title={card.title}
              description={card.desc}
              image={card.image}
              href={card.href}
              titlePosition="above"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
