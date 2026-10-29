/**
 * #267 新しいトップの試作 — ヒーローと4つの入口（S2・オーナー指摘で組み直し）
 *
 * レイアウトはエアコン屋（参考サイト）のヒーローを写す。見た目は今のBONOのトークン・字体・Button。
 * - TopHero: 左にアイブロウ／大きな2行の見出し（h1）／3行の説明／大きいボタン2つ、右に大きな画像
 * - EntryTiles: 全幅の上下線と縦の区切り線で4枠を1行に。アイコン枠（本番 PurposeItem のグラデーション）・小さな番号・太字ラベル・↗
 * 計測（home_click・料金ボタンの計測）は付けない。試作のクリックを本番の数字に混ぜないため。
 */

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Briefcase, Brush2, DocumentText, Personalcard } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { PURPOSE_ICON_GRADIENT } from "@/styles/gradients";
import { cn } from "@/lib/utils";
import { Kari, V6_BASE } from "../../_parts/shared";

export const TOP_BASE = "/dev/site-structure/top";
export const COMING_BASE = `${TOP_BASE}/coming`;
export const HERO_IMAGE = "/images/lesson-persona-ui/slides/slide-01.jpg";

/** 試作の中のリンクには会員の見え方を引き継ぐ（本番ページへのリンクはそのまま） */
export function withState(href: string, member: boolean) {
  if (!member) return href;
  return href.includes("?") ? `${href}&state=member` : `${href}?state=member`;
}

// ------------------------------------------------------------
// ヒーロー
// ------------------------------------------------------------

export function TopHero({ member }: { member: boolean }) {
  return (
    <section className="px-6 pt-8 pb-10 lg:px-12 lg:pt-12 lg:pb-14">
      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1.2fr_1fr] xl:gap-12">
        {/* 左: アイブロウ → 見出し → 説明 → ボタン */}
        <div className="flex min-w-0 flex-col justify-center">
          <p className="font-noto-sans-jp text-xs font-bold tracking-[0.16em] text-accent-orange sm:text-sm">
            FOR UI/UX DESIGN LEARNERS / つくりながら、次の一歩へ。
            <Kari />
          </p>
          <h1 className="mt-5 font-heading text-[clamp(30px,4.1vw,64px)] font-bold leading-[1.18] tracking-[-0.01em] text-text-primary">
            <span className="block">UI/UXデザインを、</span>
            <span className="block text-accent-orange">実践でトレーニング。</span>
          </h1>
          <p className="mt-6 font-noto-sans-jp text-base leading-[1.9] text-text-muted sm:text-lg">
            <span className="block">UIデザインを学ぶ人のための実践ガイド。</span>
            <span className="block">転職の準備も、スキルを伸ばすことも、実務の悩みも。</span>
            <span className="block">
              実際の画面と手を動かす課題で、わかりやすく。
              <Kari />
            </span>
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="hero-cta" asChild>
              <Link href={member ? "/mypage" : "/subscription"}>
                {member ? "続きから" : "BONOをはじめる"}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="outline-ghost" size="hero-cta" asChild>
              <Link href={withState(`${COMING_BASE}?what=troubles`, member)}>
                悩みから探す
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          {!member && (
            <p className="mt-4 font-noto-sans-jp text-xs leading-[1.6] text-text-muted">
              <Link
                href="/subscription"
                className="underline decoration-text-muted/40 underline-offset-4 transition-colors hover:text-text-primary"
              >
                料金を見る
              </Link>
            </p>
          )}
        </div>

        {/* 右: 大きな画像（今ある /public の画像。ペルソナ中心のUIデザインのスライス） */}
        <div className="relative min-h-[280px] overflow-hidden rounded-3xl border border-border-light bg-muted sm:min-h-[360px] xl:min-h-[440px]">
          <Image
            src={HERO_IMAGE}
            alt="BONOの課題でつくるUIの画面の例"
            fill
            priority
            sizes="(min-width: 1280px) 960px, 100vw"
            className="object-cover object-right"
          />
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// 4つの入口
// ------------------------------------------------------------

interface Entry {
  no: string;
  label: string;
  icon: ReactNode;
  href: string;
}

// アイコンの色は枠（text-text-primary）から受け継ぐ。04 はサイドバーの「勉強法・キャリア」と同じアイコン
const ICON = { size: 26, color: "currentColor", variant: "Outline" as const };

function entries(member: boolean): Entry[] {
  return [
    { no: "01", label: "UIUXデザイナーへの転職を進める", icon: <Personalcard {...ICON} />, href: V6_BASE },
    {
      no: "02",
      label: "UIデザインのスキルを伸ばす",
      icon: <Brush2 {...ICON} />,
      href: withState(`${COMING_BASE}?what=skill`, member),
    },
    {
      no: "03",
      label: "実務の悩みを解決する",
      icon: <Briefcase {...ICON} />,
      href: withState(`${COMING_BASE}?what=work`, member),
    },
    { no: "04", label: "勉強法・キャリア", icon: <DocumentText {...ICON} />, href: "/guide" },
  ];
}

/** 区切り線: スマホ（2×2）は右列に左線・下段に上線、PC（1行4つ）は2つ目以降に左線。両端はヒーローの左右の余白にそろえる */
const TILE_BY_INDEX = [
  "lg:pl-12",
  "border-l",
  "border-t lg:border-t-0 lg:border-l",
  "border-l border-t lg:border-t-0 lg:pr-12",
];

export function EntryTiles({ member }: { member: boolean }) {
  return (
    <section className="border-y border-black/[0.12]">
      {/* 見た目は出さないが、h1 → h2 → h3 の階層を保つ（本番 PurposeNav と同じ） */}
      <h2 className="sr-only">目的から選ぶ</h2>
      <ul className="grid grid-cols-2 lg:grid-cols-4">
        {entries(member).map((e, i) => (
          <li key={e.no} className={cn("border-black/[0.12]", TILE_BY_INDEX[i])}>
            <Link
              href={e.href}
              className="group flex h-full min-h-[168px] flex-col justify-between gap-6 px-6 py-6 transition-colors duration-200 hover:bg-black/[0.03] lg:min-h-[200px] lg:px-8 lg:py-8"
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-2xl border-[0.5px] border-black/10 text-text-primary transition-transform duration-300 group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100 lg:size-14"
                  style={{ backgroundImage: PURPOSE_ICON_GRADIENT }}
                  aria-hidden="true"
                >
                  {e.icon}
                </div>
                <span className="font-latin text-xs tracking-[0.2em] text-text-muted" aria-hidden="true">
                  {e.no}
                </span>
              </div>
              <div className="flex items-end justify-between gap-3">
                {/* 日本語の文節で折り返し、行の長さをそろえる（1文字だけの行を作らない） */}
                <h3 className="min-w-0 text-balance font-noto-sans-jp text-sm font-bold leading-[1.6] text-text-primary [word-break:auto-phrase] lg:text-base">
                  <span className="sr-only">{e.no} </span>
                  {e.label}
                </h3>
                <ArrowUpRight
                  size={18}
                  aria-hidden="true"
                  className="mb-1 shrink-0 text-accent-orange transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
