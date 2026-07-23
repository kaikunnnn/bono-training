import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

/**
 * ヒーロー（新トップページ Figma Make HANDOFF / HeroSection）
 *
 * HANDOFFのコピー・余白に準拠。ヒーロー画像は既存 EyecatchHero と同じ
 * /public/images/top2/hero-visual.png を再利用する。
 *
 * ボーダーは flexコンテナ自体に直接 border-b（不透明度 0.2。他セクションの 0.12 と異なる）。
 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 lg:px-12">
      <div className="flex flex-col items-end justify-between gap-10 border-b border-black/20 pt-[60px] pb-[60px] lg:flex-row lg:gap-0 lg:pt-[76px] lg:pb-[77px]">
        <div className="z-10 w-full shrink-0 lg:w-[672px]">
          {/* ページの主見出し。h1はページ内でここのみ */}
          <h1 className="font-rounded-mplus text-[28px] font-medium leading-[1.6] tracking-[2px] text-text-primary sm:text-[32px] lg:text-[40px]">
            <span className="block">AIとUIUXの</span>
            <span className="block">デザインワークフローを</span>
            <span className="block">身につける</span>
          </h1>
          <div className="pt-3">
            <p className="font-noto-sans-jp text-xl font-normal leading-[1.5] tracking-[1.2px] text-text-primary lg:text-2xl">
              はじめよう気持ちがうごくものづくり
            </p>
          </div>
          <div className="pt-4">
            <div className="font-noto-sans-jp text-sm font-normal leading-[1.8] tracking-[0.7px] text-text-primary">
              <p>ボノは未経験・ジュニアデザイナー向けに</p>
              <p>ユーザーを起点にしたデザイン提案力を磨くための</p>
              <p>
                <strong className="font-bold">トレーニングサービス</strong>です。
              </p>
            </div>
          </div>
          <div className="flex w-[388px] max-w-full flex-wrap items-center gap-4 pt-8">
            <Button variant="primary" size="top-cta" className="min-w-0 flex-1" asChild>
              <Link href="/subscription">メンバーになってはじめる</Link>
            </Button>
            <Button variant="outline" size="top-cta" className="whitespace-nowrap" asChild>
              <Link href="/roadmap">ロードマップへ</Link>
            </Button>
          </div>
        </div>
        {/* ヒーロー画像: PCは右下固定、モバイルは縦積み */}
        <div className="pointer-events-none flex w-full items-end justify-center lg:absolute lg:right-0 lg:bottom-0 lg:h-[499px] lg:w-[651px] lg:justify-end">
          <div className="relative aspect-[650.92/486] w-full max-w-[480px] lg:h-full lg:max-w-none">
            <Image
              src="/images/top2/hero-visual.png"
              alt=""
              fill
              sizes="(min-width: 1024px) 651px, 480px"
              className="object-contain object-bottom"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
