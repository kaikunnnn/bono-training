import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * トップ アイキャッチブロック（新トップ 2026）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 573-22331
 *
 * 構成:
 * - NEW バッジ
 * - メインコピー + サブコピー
 * - CTA（メンバーになる / ロードマップへ）
 * - 訴求カード × 2（サムネは画像で受け取る・タイトルはトップ用に自由入力）
 */

export interface EyecatchCardData {
  /** カード上のラベル（例: ロードマップ） */
  label: string;
  /** トップ用に自由入力できるタイトル */
  title: string;
  /** サムネイル画像（public 配下 or 外部URL） */
  thumbnail: string;
  /** サムネイルの alt */
  thumbnailAlt: string;
  /** 遷移先 */
  href: string;
}

export interface EyecatchSectionProps {
  /** NEW バッジのテキスト（省略時は非表示） */
  badgeText?: string;
  /** メインコピー */
  title?: string;
  /** サブコピー（太字部分は boldText で指定） */
  leadText?: string;
  boldText?: string;
  tailText?: string;
  /** プライマリ CTA */
  primaryCta?: { label: string; href: string };
  /** セカンダリ CTA */
  secondaryCta?: { label: string; href: string };
  /** 訴求カード（2つ想定） */
  cards?: EyecatchCardData[];
  className?: string;
}

// Figma のデフォルトコピー（トップ用に差し替え可能）
const DEFAULT_CARDS: EyecatchCardData[] = [
  {
    label: "ロードマップ",
    title: "AIとデザインする新しいワークフローを身につけよう",
    thumbnail: "/images/top/eyecatch-roadmap-1.png",
    thumbnailAlt: "path to UI/UX Designer",
    href: "/roadmap",
  },
  {
    label: "ロードマップ",
    title: "目的から必要な情報や体験を考えてデザインする",
    thumbnail: "/images/top/eyecatch-roadmap-2.png",
    thumbnailAlt: "情報設計 BEGINNER COURSE",
    href: "/roadmap",
  },
];

/** 訴求カード */
function EyecatchCard({ label, title, thumbnail, thumbnailAlt, href }: EyecatchCardData) {
  return (
    <Link
      href={href}
      className="group flex flex-1 min-w-0 flex-col overflow-hidden rounded-[24px] bg-surface transition-shadow sm:rounded-[32px] hover:shadow-[0px_4px_18px_0px_rgba(0,0,0,0.12)]"
    >
      {/* サムネイル（画像が来る） */}
      <div className="relative aspect-[674/379] w-full overflow-hidden bg-muted-custom">
        <Image
          src={thumbnail}
          alt={thumbnailAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>

      {/* テキスト */}
      <div className="flex flex-col gap-1 px-6 py-5 sm:px-10 sm:py-6">
        <p className="text-[13px] font-bold leading-7 text-text-primary/70">{label}</p>
        <p className="text-lg font-bold leading-7 text-text-primary sm:text-xl">{title}</p>
      </div>
    </Link>
  );
}

export default function EyecatchSection({
  badgeText = "AI時代に活きる「デザインの進め方」をリリース",
  title = "はじめよう！キモチがうごくものづくり",
  leadText = "ボノはユーザー起点で未来のワクワクを“つくる”力を磨く、",
  boldText = "デザイントレーニングサービス",
  tailText = "です。",
  primaryCta = { label: "メンバーになってはじめる", href: "/subscription" },
  secondaryCta = { label: "ロードマップへ", href: "/roadmap" },
  cards = DEFAULT_CARDS,
  className,
}: EyecatchSectionProps) {
  return (
    <section className={cn("flex flex-col gap-10 sm:gap-16", className)}>
      {/* ヘッダー部分 */}
      <div className="flex flex-col gap-4 sm:gap-[18px]">
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* NEW バッジ */}
          {badgeText && (
            <div className="inline-flex w-fit items-center gap-2.5 rounded-full bg-muted-custom px-4 py-2">
              <span className="text-xs font-bold text-accent-orange">NEW!</span>
              <span className="text-[13px] font-bold text-text-primary">{badgeText}</span>
            </div>
          )}

          {/* メインコピー */}
          <div className="flex flex-col gap-3">
            <h1 className="font-rounded-mplus text-3xl font-bold leading-[1.4] text-text-primary sm:text-4xl">
              {title}
            </h1>
            <p className="text-base leading-[1.88] text-text-primary sm:text-xl">
              {leadText}
              <span className="font-bold">{boldText}</span>
              {tailText}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Link
            href={primaryCta.href}
            className="inline-flex h-11 items-center justify-center rounded-[14px] bg-cta-primary-bg px-6 text-sm font-bold tracking-[0.35px] text-white shadow-cta transition-colors hover:bg-cta-primary-hover"
          >
            {primaryCta.label}
          </Link>
          <Link
            href={secondaryCta.href}
            className="inline-flex h-11 items-center justify-center rounded-[14px] border-2 border-text-primary px-7 text-sm font-bold tracking-[0.35px] text-text-primary transition-colors hover:bg-hover"
          >
            {secondaryCta.label}
          </Link>
        </div>
      </div>

      {/* 訴求カード */}
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        {cards.map((card, i) => (
          <EyecatchCard key={i} {...card} />
        ))}
      </div>
    </section>
  );
}
