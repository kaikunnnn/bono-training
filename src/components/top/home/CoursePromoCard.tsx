import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * コース訴求カード（新トップ 2026 / 汎用）
 *
 * Figma: PRD🏠_topUI_newBONO2026
 *   node-id: 671-7219（"Component1" prop2="Course"）
 *   - 671-7217: prop3="default"（サムネ → タイトル → 説明 → CTA）
 *   - 671-7215: prop3="title-first"（タイトル → サムネ → 説明 → CTA）
 *
 * ページ固有ではなく、複数箇所の banner-inner スロットに差し込む再利用可能な
 * コンポーネントとして設計している。top 固有の型（TrainingCardData 等）や
 * データ取得は一切持ち込まず、完全に props 駆動にしている。
 * 将来 src/components/course/ 等へ昇格しやすいよう独立させている。
 */

export type CoursePromoLayout = "default" | "title-first";

/**
 * ダーク背景のグラデーションプリセット。
 * design-system の各 --grad-* トークンに対応（colors_and_type.css 参照）。
 */
export type CoursePromoGradientPreset =
  | "ui-visual"
  | "career-change"
  | "ui-beginner"
  | "info-arch"
  | "ux-design";

export type CoursePromoVisual =
  | {
      /** ロードマップ系: 4枚の正方形サムネイルを回転・オフセットで重ねるコラージュ */
      type: "collage";
      images: { src: string; alt: string }[];
    }
  | {
      /** トレーニング系: ダーク背景に単一バッジ画像 */
      type: "single";
      image: { src: string; alt: string };
      /** ダーク背景のグラデーションプリセット（省略時は muted 背景） */
      gradientPreset?: CoursePromoGradientPreset;
    }
  | {
      /**
       * 最新コンテンツ訴求系（ブロックB-1 / Figma 662-40053）:
       * 薄いパステルグラデ背景に縦長画像を1枚センター配置。
       * カテゴリ/タイプラベルなし・角丸4px・タイトル20px で用いる。
       */
      type: "spotlight";
      image: { src: string; alt: string };
    }
  | {
      /**
       * OGP画像系（ブロックC / Figma 671-6642）:
       * リンク先ページの Open Graph 画像を 16:9 で表示する。
       * ラベルなし・角丸8px。src が null の場合は bg-muted-custom フォールバック。
       */
      type: "og";
      image: { src: string | null; alt: string };
    };

export interface CoursePromoCardProps {
  /** レイアウトバリアント（デフォルト "default"） */
  layout?: CoursePromoLayout;
  /** サムネ内の背景に溶け込む大きい文字（例: "UIUX転職"） */
  categoryLabel: string;
  /** サムネ右上のラベル（例: "ロードマップ" / "トレーニング"） */
  typeLabel: string;
  /** ビジュアル（コラージュ or 単一バッジ） */
  visual: CoursePromoVisual;
  /** タイトル */
  title: string;
  /** 説明文 */
  description: string;
  /** CTA ラベル（デフォルト "詳しく見る"） */
  ctaLabel?: string;
  /** 遷移先 */
  href: string;
  /** 外部リンク（別タブで開く: target="_blank" rel="noopener noreferrer"） */
  external?: boolean;
  className?: string;
}

/**
 * パステルグラデ背景（ロードマップ系）。
 * Figma 固有のパステルグラデで design-system にトークンがないため、
 * Figma の値（rgba stops）をそのまま arbitrary value で使用する。
 */
const COLLAGE_GRADIENT =
  "linear-gradient(180deg,rgba(232,235,251,0.35)_0%,rgba(214,189,213,0.35)_47.461%,rgba(234,209,189,0.35)_76.635%,rgba(248,245,245,0.35)_100%)";

/**
 * spotlight ビジュアル用のパステルグラデ背景（ブロックB-1 / Figma 662-40053）。
 * COLLAGE_GRADIENT に薄いオフホワイトのオーバーレイを重ねたもの。
 * design-system にトークンがないため Figma の rgba stops をそのまま使用する。
 */
const SPOTLIGHT_GRADIENT =
  "linear-gradient(90deg,rgba(246,246,245,0.58)_0%,rgba(246,246,245,0.58)_100%),linear-gradient(180deg,rgba(232,235,251,0.35)_0%,rgba(214,189,213,0.35)_47.461%,rgba(234,209,189,0.35)_76.635%,rgba(248,245,245,0.35)_100%)";

/** コラージュの各画像の重なり演出（回転角・水平オフセット）。Figma の近似値。 */
const COLLAGE_TRANSFORMS = [
  "-rotate-[8deg] -translate-x-[36%]",
  "-rotate-[2deg] -translate-x-[12%]",
  "-rotate-[2deg] translate-x-[12%]",
  "rotate-[6deg] translate-x-[36%]",
];

/** 枠線 CTA ボタン（NewContentSection と同じ枠線パターンを流用） */
function PromoButton({ label }: { label: string }) {
  return (
    <span className="inline-flex h-8 w-fit items-center justify-center rounded-[6px] border border-black/[0.06] bg-surface px-6 text-xs font-medium tracking-[0.6px] text-text-primary shadow-[0px_0px_3px_0px_rgba(0,0,0,0.04)] transition-shadow group-hover:shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]">
      {label}
    </span>
  );
}

/** コラージュサムネイル（ロードマップ系） */
function CollageThumbnail({
  categoryLabel,
  typeLabel,
  images,
}: {
  categoryLabel: string;
  typeLabel: string;
  images: { src: string; alt: string }[];
}) {
  return (
    <div
      className="relative flex aspect-[674/432] w-full items-center justify-center overflow-hidden rounded-[32px] bg-[image:var(--collage-grad)]"
      style={
        {
          "--collage-grad": COLLAGE_GRADIENT.replace(/_/g, " "),
        } as React.CSSProperties
      }
    >
      {/* 奥の巨大な薄い背景文字 */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center whitespace-nowrap font-rounded-mplus text-[clamp(48px,12vw,96px)] font-bold tracking-[0.26em] text-[#b7b7b9] select-none"
      >
        {categoryLabel}
      </span>

      {/* 左上の薄いカテゴリ文字 */}
      <span
        aria-hidden
        className="absolute left-6 top-5 font-rounded-mplus text-base font-bold text-[var(--cat-uiux-career)]/70 select-none"
      >
        {categoryLabel}
      </span>

      {/* 右上ラベル */}
      <span className="absolute right-6 top-5 text-sm font-bold text-[var(--cat-uiux-career)]/60">
        {typeLabel}
      </span>

      {/* 手前の4枚コラージュ */}
      <div className="relative flex items-center justify-center">
        {images.slice(0, 4).map((img, i) => (
          <div
            key={i}
            className={cn(
              "relative aspect-square w-[34%] max-w-[257px] shrink-0 overflow-hidden rounded-[12px] shadow-[0px_1px_32px_0px_rgba(0,0,0,0.2)] transition-transform duration-300",
              COLLAGE_TRANSFORMS[i],
              i > 0 && "-ml-[14%]"
            )}
            style={{ zIndex: i === 1 || i === 2 ? 3 : 1 }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 640px) 30vw, 257px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * gradientPreset → design-system の CSS 変数名のマッピング。
 * 値は colors_and_type.css で定義された --grad-* トークン。
 */
const GRADIENT_VARS: Record<CoursePromoGradientPreset, string> = {
  "ui-visual": "--grad-ui-visual",
  "career-change": "--grad-career-change",
  "ui-beginner": "--grad-ui-beginner",
  "info-arch": "--grad-info-arch",
  "ux-design": "--grad-ux-design",
};

/** 単一バッジサムネイル（トレーニング系） */
function SingleThumbnail({
  categoryLabel,
  typeLabel,
  image,
  gradientPreset,
}: {
  categoryLabel: string;
  typeLabel: string;
  image: { src: string; alt: string };
  gradientPreset?: CoursePromoGradientPreset;
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-[674/429] w-full items-center justify-center overflow-hidden rounded-[32px]",
        gradientPreset
          ? "bg-[image:var(--course-promo-grad)]"
          : "bg-muted-custom"
      )}
      style={
        gradientPreset
          ? ({
              "--course-promo-grad": `var(${GRADIENT_VARS[gradientPreset]})`,
            } as React.CSSProperties)
          : undefined
      }
    >
      {/* 左上の薄いカテゴリ文字 */}
      <span
        aria-hidden
        className="absolute left-6 top-5 font-rounded-mplus text-base font-bold text-[#d9d9d9] select-none"
      >
        {categoryLabel}
      </span>

      {/* 右上ラベル */}
      <span className="absolute right-6 top-5 text-sm font-bold text-[#d9d9d9]/60">
        {typeLabel}
      </span>

      {/* 中央の巨大な背景文字 */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center whitespace-nowrap font-rounded-mplus text-[clamp(48px,12vw,96px)] font-bold text-white/20 select-none"
      >
        {categoryLabel}
      </span>

      {/* 中央バッジ */}
      <div className="relative aspect-square w-[42%] max-w-[276px] overflow-hidden rounded-2xl shadow-[0px_1px_26px_0px_rgba(0,0,0,0.24)]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 640px) 40vw, 276px"
          className="object-cover"
        />
      </div>
    </div>
  );
}

/**
 * スポットライトサムネイル（最新コンテンツ訴求系 / ブロックB-1）。
 * 薄いパステルグラデ背景・角丸4px・中央に縦長画像1枚（ラベルなし）。
 */
function SpotlightThumbnail({ image }: { image: { src: string; alt: string } }) {
  // Figma実測(662-40053): 外枠674x431 → 内側 px-[24px] のパディング
  // (626 = 674 - 24*2) → visual-area(aspect 626/354, py-[6px]) → 画像(aspect 236/342)。
  // h-[80%] のようなパーセンテージ指定はflex+aspect-ratio下で解決が不安定なため、
  // Figmaの入れ子構造(パディング→aspect比ラッパー)をそのまま再現する。
  return (
    <div
      className="relative aspect-[674/432] w-full overflow-hidden rounded-[4px] bg-[image:var(--spotlight-grad)]"
      style={
        {
          "--spotlight-grad": SPOTLIGHT_GRADIENT.replace(/_/g, " "),
        } as React.CSSProperties
      }
    >
      <div className="flex size-full items-center justify-center px-[24px]">
        <div className="flex aspect-[626/354] w-full items-center justify-center py-[6px]">
          <div className="relative aspect-[236/342] h-full overflow-hidden rounded-r-[4.645px] shadow-[0px_1px_26px_0px_rgba(0,0,0,0.16)]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 640px) 40vw, 236px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * OGP画像サムネイル（ブロックC / Figma 671-6642）。
 * リンク先ページの Open Graph 画像を 16:9・角丸8px で表示。
 * src が null の場合は bg-muted-custom のフォールバック。
 */
function OgThumbnail({ image }: { image: { src: string | null; alt: string } }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted-custom">
      {image.src && (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover"
        />
      )}
    </div>
  );
}

function Thumbnail({
  categoryLabel,
  typeLabel,
  visual,
}: {
  categoryLabel: string;
  typeLabel: string;
  visual: CoursePromoVisual;
}) {
  if (visual.type === "og") {
    return <OgThumbnail image={visual.image} />;
  }
  if (visual.type === "collage") {
    return (
      <CollageThumbnail
        categoryLabel={categoryLabel}
        typeLabel={typeLabel}
        images={visual.images}
      />
    );
  }
  if (visual.type === "spotlight") {
    return <SpotlightThumbnail image={visual.image} />;
  }
  return (
    <SingleThumbnail
      categoryLabel={categoryLabel}
      typeLabel={typeLabel}
      image={visual.image}
      gradientPreset={visual.gradientPreset}
    />
  );
}

export default function CoursePromoCard({
  layout = "default",
  categoryLabel,
  typeLabel,
  visual,
  title,
  description,
  ctaLabel = "詳しく見る",
  href,
  external = false,
  className,
}: CoursePromoCardProps) {
  // spotlight / og ビジュアルはタイトル 20px・M PLUS Medium（Figma実データ準拠、
  // 他の default/single 系は既存踏襲で 22px・bold のまま）
  const isSmallTitle = visual.type === "spotlight" || visual.type === "og";
  const titleEl = (
    <h3
      className={cn(
        "font-rounded-mplus leading-snug text-text-primary",
        isSmallTitle ? "text-xl font-medium" : "text-[22px] font-bold"
      )}
    >
      {title}
    </h3>
  );

  const bodyEl = (
    <>
      <p className="font-noto-sans-jp text-base leading-[1.6] text-text-primary">
        {description}
      </p>
      <PromoButton label={ctaLabel} />
    </>
  );

  return (
    <Link
      href={href}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className={cn(
        // -m-3 p-3: ホバー背景の「見た目の余白」だけを作り、実際のレイアウト位置・
        // 幅・グリッドgapには影響させない（p-3のみだと全カードが内側に12px縮んで
        // Figmaの余白と食い違うバグがあったため、負のmarginで打ち消す）
        "group -m-3 flex flex-col rounded-2xl p-3 transition-colors hover:bg-hover active:bg-active",
        // Figma: default は gap/stack(16px)、title-first は gap/focus(20px)
        layout === "title-first" ? "gap-5" : "gap-4",
        className
      )}
    >
      {layout === "title-first" ? (
        <>
          {titleEl}
          <div className="flex flex-col">
            <Thumbnail
              categoryLabel={categoryLabel}
              typeLabel={typeLabel}
              visual={visual}
            />
            <div className="flex flex-col items-start gap-3 pt-4">{bodyEl}</div>
          </div>
        </>
      ) : (
        <>
          <Thumbnail
            categoryLabel={categoryLabel}
            typeLabel={typeLabel}
            visual={visual}
          />
          {/* Figma: Card.Body の gap/inline(8px) */}
          <div className="flex flex-col items-start gap-2">
            {titleEl}
            {bodyEl}
          </div>
        </>
      )}
    </Link>
  );
}
