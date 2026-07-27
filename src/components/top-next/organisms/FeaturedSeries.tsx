import Link from "next/link";
import Image from "next/image";

/**
 * おすすめシリーズ（新トップページ /dev/top5 / FeaturedSeries）
 *
 * 参照: Figma Make HANDOFF「ページ実装計画作成 2」の FeaturedSeriesV2/FeaturedCardV2（Pattern 2）。
 * 画像が上、画像下にタイトル→説明文→「詳しく見る」ボタン（枠線あり）の順。
 * シャドウは無し（旧Pattern 1のスタイルを誤って適用していたため削除）。
 * 共通の PromoCard は使わず（他セクションと見た目が異なるため）、専用カードをここで定義する。
 * データは page.tsx 側で取得して props で渡す（organism は presentational に保つ）。
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
      <div className="border-b border-black/[0.12] py-1">
        <div className="flex flex-col sm:-mx-3 sm:flex-row">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group -mx-3 flex flex-1 flex-col gap-4 rounded-[8px] px-3 py-8 transition-colors duration-200 hover:bg-black/[0.02] sm:mx-0"
            >
              <div
                className="relative w-full overflow-hidden rounded-[4px] border border-black/[0.03] bg-muted-custom"
                style={{ aspectRatio: "16/9" }}
              >
                {card.image && (
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-rounded-mplus text-[16px] font-medium leading-[28px] tracking-[0.22px] text-text-primary transition-opacity duration-300 group-hover:opacity-70">
                  {card.title}
                </h3>
                <span className="font-noto-sans-jp text-xs text-text-link underline-offset-4 group-hover:text-text-link-hover group-hover:underline">
                  詳しく見る →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
