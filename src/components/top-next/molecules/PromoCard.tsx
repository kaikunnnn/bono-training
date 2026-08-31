import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

/**
 * サムネイル＋タイトル＋説明（任意）＋ボタンのカード（新トップページ top-next共通）
 *
 * TrainingSection・CareerSection・FeaturedSeries・GuideSection で使っていた、
 * 構造が同じカード（旧 TrainingCard / RoadmapCard / FeaturedCard / GuideCard）を
 * 1つに統合したもの。違いは以下の2点だけ:
 * - タイトルを画像の上に置くか下に置くか（titlePosition）
 * - ダーク背景用に白系へ反転するか（inverse。GuideSection用）
 *
 * カテゴリ/タイプの画像重ねラベルは不使用（デザイン方針により削除。旧TrainingCardと統一）。
 */
export interface PromoCardProps {
  /** サムネイル画像URL（無ければグレープレースホルダー） */
  image?: string;
  title: string;
  /** 説明文（無ければ非表示。旧RoadmapCard相当の使い方） */
  description?: string;
  href: string;
  /** 未指定時は inverse に応じて "詳しく見る"/"詳細を見る" を自動選択 */
  ctaLabel?: string;
  /** タイトルを画像の上に置くか下に置くか（デフォルト "below"） */
  titlePosition?: "above" | "below";
  /** サムネイルの角丸（デフォルト "4px"） */
  rounded?: string;
  /** サムネイルのアスペクト比（デフォルト 16:9） */
  aspectRatio?: string;
  /** 外部リンク（別タブで開く） */
  external?: boolean;
  /** ダーク背景用に白系へ反転（デフォルト false。旧GuideCard相当） */
  inverse?: boolean;
}

export function PromoCard({
  image,
  title,
  description,
  href,
  ctaLabel,
  titlePosition = "below",
  rounded = "4px",
  aspectRatio = "16/9",
  external = false,
  inverse = false,
}: PromoCardProps) {
  const resolvedCtaLabel = ctaLabel ?? (inverse ? "詳細を見る" : "詳しく見る");

  const titleEl = (
    <h3
      className={`font-rounded-mplus text-xl font-medium leading-[1.4] tracking-[0.22px] ${
        inverse ? "text-text-inverse" : "text-text-primary"
      }`}
    >
      {title}
    </h3>
  );

  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`group -m-3 flex flex-1 flex-col gap-4 rounded-[8px] p-3 transition-colors duration-200 ${
        inverse ? "hover:bg-white/[0.06]" : "hover:bg-black/[0.03]"
      }`}
    >
      {titlePosition === "above" && titleEl}
      <div
        className={`relative w-full overflow-hidden ${inverse ? "bg-white/10" : "bg-muted-custom"}`}
        style={{ aspectRatio, borderRadius: rounded }}
      >
        {image && (
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
      </div>
      <div className="flex flex-col gap-2">
        {titlePosition === "below" && titleEl}
        {description && (
          <p
            className={`font-noto-sans-jp text-base font-normal leading-[1.8] tracking-[0.8px] ${
              inverse ? "text-text-inverse" : "text-text-primary"
            }`}
          >
            {description}
          </p>
        )}
        <Button
          variant={inverse ? "outline-dark" : "outline-ghost"}
          size="top-card"
          className="mt-1"
          asChild
        >
          <span>{resolvedCtaLabel}</span>
        </Button>
      </div>
    </Link>
  );
}
