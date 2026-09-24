"use client";

import Image from "next/image";
import Link from "next/link";
import TrainingCard, { TRAINING_CARDS_DATA } from "@/components/top/TrainingCard";

/** /dev 専用の旧トップアイキャッチ再現。 */
export function ClassicTopHero() {
  return (
    <section className="overflow-hidden border-b border-black/10 bg-[linear-gradient(180deg,#f4f0ff_0px,#fff2f7_62px,#fff_150px)]">
      <div className="flex flex-col items-center px-4 pt-8 text-center sm:pt-9">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-bold text-text-primary shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <span className="text-[#fa6b3b]">NEW!</span>
          <span>AIプロトタイピングコースがリリース！</span>
        </div>

        <h1 className="mt-5 font-rounded-mplus text-[36px] font-bold leading-[1.18] tracking-[0.025em] text-[#172033] sm:text-[48px]">
          <span className="block">はじめよう！</span>
          <span className="block">キモチがうごく</span>
          <span className="block">ものづくり</span>
        </h1>

        <p className="mt-5 font-noto-sans-jp text-[13px] leading-[1.8] text-[#172033] sm:text-sm">
          ボノはユーザー起点で未来のワクワクを
          <br />
          &quot;つくる&quot;力を磨く<span className="font-bold">デザイントレーニングサービス</span>です。
        </p>

        <div className="mt-5 grid min-h-9 grid-cols-[180px_136px] items-center gap-2.5">
          <Link
            href="/subscription"
            className="inline-flex h-9 w-full items-center justify-center whitespace-nowrap rounded-lg bg-[#102720] px-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#24483d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#102720]"
          >
            メンバーになってはじめる
          </Link>
          <Link
            href="/roadmap"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[#172033] bg-white px-4 text-xs font-bold text-[#172033] transition-colors hover:bg-[#f5f6f8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#172033]"
          >
            ロードマップを見る
          </Link>
        </div>
      </div>

      <div className="mt-9 overflow-x-auto pb-3 scrollbar-hide" aria-label="トレーニングのロードマップ">
        <div className="mx-auto flex w-max gap-3 px-8">
          {TRAINING_CARDS_DATA.map((card) => (
            <div key={card.id} className="relative h-[342px] w-[252px] shrink-0">
              <div className="absolute left-0 top-0 origin-top-left scale-[0.84] sm:scale-[0.72] lg:scale-[0.6]">
                <TrainingCard data={card} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex h-[58px] items-center justify-center gap-2 px-4">
        <span className="text-[10px] font-bold text-[#293529]">キャリアパートナーシップ</span>
        <a
          href="https://beauty.gmo/recruit-design/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GMO BEAUTY デザイン採用サイト（新しいタブで開く）"
        >
          <Image src="/images/partners/gmo-beauty.png" alt="GMO BEAUTY" width={76} height={31} />
        </a>
      </div>
    </section>
  );
}
