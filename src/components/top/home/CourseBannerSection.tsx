import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * トップ コース訴求バナー（新トップ 2026）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 552-743
 *
 * 構成:
 * - ヘッダー（レッスンバッジ + ラベル + 2行見出し / 説明 + 全コースリンク）
 * - 大バナー × 1（ビジュアルエリア + テキスト + CTA）
 * - 小バナー × 2（YOUTUBE ラベル + 2行タイトル + 画像）
 */

export interface MainBannerData {
  /** バッジ / ラベル（例: レッスン） */
  label: string;
  /** タイトル */
  title: string;
  /** サブタイトル */
  subtitle: string;
  /** サムネイル画像 */
  thumbnail: string;
  /** サムネイルの alt */
  thumbnailAlt: string;
  /** サムネイル上のバッジ（例: AI） */
  thumbnailBadge?: string;
  /** CTA ラベル */
  ctaLabel: string;
  /** 遷移先 */
  href: string;
}

export interface SubBannerData {
  /** ラベル（例: YOUTUBE） */
  label: string;
  /** タイトル（改行は配列で指定） */
  titleLines: string[];
  /** 画像 */
  image: string;
  /** 画像の alt */
  imageAlt: string;
  /** 画像を muted 背景に載せるか（true でパディング付きの枠内表示） */
  framed?: boolean;
  /** 遷移先 */
  href: string;
}

export interface CourseBannerSectionProps {
  /** ヘッダーのバッジ */
  badgeLabel?: string;
  /** ヘッダーのラベル（バッジ右） */
  categoryLabel?: string;
  /** ヘッダー見出し（改行は配列で指定） */
  headingLines?: string[];
  /** ヘッダー説明文 */
  description?: string;
  /** 全コースリンク */
  allCoursesLink?: { label: string; href: string };
  /** 大バナー */
  mainBanner?: MainBannerData;
  /** 小バナー（2つ想定） */
  subBanners?: SubBannerData[];
  className?: string;
}

const DEFAULT_MAIN_BANNER: MainBannerData = {
  label: "レッスン",
  title: "AIをつかったUIづくりをはじめる1歩を踏み出そう",
  subtitle: "AIスタイリング入門",
  thumbnail: "/images/top/course-lesson-thumb.png",
  thumbnailAlt: "ゼロからはじめるUI情報設計のサムネイル",
  thumbnailBadge: "AI",
  ctaLabel: "学習を始める",
  href: "/lessons",
};

const DEFAULT_SUB_BANNERS: SubBannerData[] = [
  {
    label: "YOUTUBE",
    titleLines: ["デザイナーのための", "Cursor入門"],
    image: "/images/top/course-youtube-cursor.png",
    imageAlt: "デザイナーのための Cursor入門",
    href: "/lessons",
  },
  {
    label: "YOUTUBE",
    titleLines: ["デザイナーのための", "ClaudeCode入門"],
    image: "/images/top/course-youtube-claudecode.png",
    imageAlt: "デザイナーのための ClaudeCode入門",
    framed: true,
    href: "/lessons",
  },
];

/** 大バナー */
function MainBanner({
  label,
  title,
  subtitle,
  thumbnail,
  thumbnailAlt,
  thumbnailBadge,
  ctaLabel,
  href,
}: MainBannerData) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-[24px] bg-surface shadow-[0px_1px_8px_0px_rgba(0,0,0,0.08)] transition-shadow sm:flex-row sm:rounded-[29px] hover:shadow-[0px_4px_18px_0px_rgba(0,0,0,0.12)]"
    >
      {/* ビジュアルエリア */}
      <div className="relative flex flex-col items-center bg-surface pt-8 sm:h-[272px] sm:w-[480px] sm:shrink-0">
        <div className="flex w-full items-center px-8 pb-3.5">
          <span className="rounded-[30px] border border-black px-2 py-1 text-xs font-medium leading-none text-text-primary">
            {thumbnailBadge}
          </span>
        </div>
        <div className="relative h-[196px] w-[130px] overflow-hidden rounded-r-[5px] shadow-[0px_1.265px_15.174px_0px_rgba(0,0,0,0.17)]">
          <Image
            src={thumbnail}
            alt={thumbnailAlt}
            fill
            sizes="130px"
            className="object-cover"
          />
        </div>
      </div>

      {/* テキストエリア */}
      <div className="flex flex-1 flex-col justify-between gap-6 p-8 sm:p-10">
        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-bold uppercase leading-none text-text-primary/60">
            {label}
          </p>
          <p className="text-xl font-bold leading-snug text-text-primary sm:text-[22px]">
            {title}
          </p>
          <p className="text-sm leading-[1.6] text-text-primary/80">{subtitle}</p>
        </div>
        <span className="inline-flex w-fit items-center rounded-full bg-text-primary px-6 py-3 text-sm font-bold text-white">
          {ctaLabel}
        </span>
      </div>
    </Link>
  );
}

/** 小バナー */
function SubBanner({ label, titleLines, image, imageAlt, framed, href }: SubBannerData) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex h-[177px] flex-1 items-stretch overflow-hidden rounded-[24px] bg-surface shadow-[0px_1px_8px_0px_rgba(0,0,0,0.08)] transition-shadow sm:rounded-[29px] hover:shadow-[0px_4px_18px_0px_rgba(0,0,0,0.12)]",
        framed && "p-1"
      )}
    >
      {/* テキストエリア */}
      <div className="flex flex-1 flex-col justify-center gap-3 px-6 sm:px-10">
        <p className="text-[13px] font-bold uppercase leading-none text-text-primary/60">
          {label}
        </p>
        <div className="text-lg font-bold leading-normal text-text-primary sm:text-xl">
          {titleLines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>

      {/* ビジュアルエリア */}
      {framed ? (
        <div className="relative flex w-[45%] items-center justify-center overflow-hidden rounded-[24px] bg-muted-custom sm:w-[299px]">
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 45vw, 299px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="relative w-[45%] shrink-0 sm:flex-1">
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 45vw, 336px"
            className="object-cover"
          />
        </div>
      )}
    </Link>
  );
}

export default function CourseBannerSection({
  badgeLabel = "レッスン",
  categoryLabel = "AI時代のプロダクトデザイン",
  headingLines = ["AI時代のデザインを身につけて", "グッドなプロダクトをつくろう"],
  description = "AIツールの導入からユーザーリサーチ、最新ツールの活用まで。現場で即使えるスキルを、体系的に学べるプログラム。",
  allCoursesLink = { label: "すべてのコースを見る", href: "/lessons" },
  mainBanner = DEFAULT_MAIN_BANNER,
  subBanners = DEFAULT_SUB_BANNERS,
  className,
}: CourseBannerSectionProps) {
  return (
    <section className={cn("flex flex-col gap-10 border-b border-black/[0.06] pb-14", className)}>
      {/* ヘッダー */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-muted-custom px-2 py-1 text-[10px] font-bold text-text-primary">
              {badgeLabel}
            </span>
            <span className="text-xs text-text-primary/60">{categoryLabel}</span>
          </div>
          <h2 className="font-rounded-mplus text-2xl font-bold leading-[1.35] text-text-primary sm:text-[28px]">
            {headingLines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h2>
        </div>

        <div className="flex flex-col gap-3 lg:w-[400px] lg:shrink-0">
          <p className="text-sm leading-[1.6] text-text-primary/70">{description}</p>
          <Link
            href={allCoursesLink.href}
            className="inline-flex w-fit items-center gap-1 text-[13px] font-bold text-text-primary hover:underline"
          >
            {allCoursesLink.label}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>

      {/* バナー群 */}
      <div className="flex flex-col gap-8">
        <MainBanner {...mainBanner} />
        <div className="flex flex-col gap-5 lg:flex-row">
          {subBanners.map((banner, i) => (
            <SubBanner key={i} {...banner} />
          ))}
        </div>
      </div>
    </section>
  );
}
