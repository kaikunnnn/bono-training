/**
 * #267 新しいトップの試作 — ヒーローと4つの入口（S2）
 *
 * - TopHero: 本番 HeroSection（src/components/top-next/organisms/HeroSection.tsx）の
 *   構成・文字サイズ・余白・Button をそのまま写し、文言とボタンだけ 267-L に合わせて変えたもの
 * - EntryTiles: 本番 PurposeNav／PurposeItem の形（アイコン枠のグラデーション・区切り線・グリッド）に、
 *   番号（ペルソナ中心のUIデザインのレッスンの「01」の付け方）と矢印（ロードマップのカードの ArrowButton）を足したもの
 * 計測（home_click・料金ボタンの計測）は付けない。試作のクリックを本番の数字に混ぜないため。
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { Briefcase, Brush2, DocumentText, Personalcard } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { ArrowButton } from "@/components/roadmap/card/ArrowButton";
import { PURPOSE_ICON_GRADIENT } from "@/styles/gradients";
import { cn } from "@/lib/utils";
import { Kari, V6_BASE } from "../../_parts/shared";

export const TOP_BASE = "/dev/site-structure/top";
export const COMING_BASE = `${TOP_BASE}/coming`;

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
    <section className="relative overflow-hidden px-6 lg:px-12">
      <div className="pt-6 pb-6 sm:pt-10 lg:pt-14 lg:pb-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:items-end lg:gap-[21px]">
          {/* 左: 見出し（本番と同じく、h1 は小さめのアイブロウ。大きなコピーは p） */}
          <div className="w-full shrink-0 lg:col-span-2">
            <h1 className="mb-3 font-heading text-sm font-bold leading-[1.6] tracking-[0.7px] text-text-secondary lg:text-base">
              UI/UXデザインを実践でトレーニング
            </h1>
            <p
              className="subpixel-antialiased text-[28px] font-medium leading-[1.6] tracking-[1px] text-text-primary lg:text-[32px]"
              style={{
                fontFamily:
                  "var(--font-mplus-1-var), 'M PLUS 1', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo', sans-serif",
              }}
            >
              <span className="block">目指す姿から、</span>
              <span className="block">
                次の一歩を選ぼう
                <Kari className="ml-2 align-[0.4em]" />
              </span>
            </p>
          </div>

          {/* 右: 説明文 + ボタン（4つの入口の3番目と左端をそろえる。本番と同じ） */}
          <div className="w-full lg:col-span-2">
            <p className="font-noto-sans-jp text-sm font-normal leading-[1.8] tracking-[0.7px] text-text-primary">
              転職の準備も、スキルを伸ばすことも、実務の悩みも。
              <br className="hidden sm:block" />
              いまの目的に合う入口から、ひとつずつ進められます。
              <Kari />
            </p>
            <div className="flex max-w-full flex-wrap items-center gap-3 pt-6">
              {member ? (
                <Button variant="primary" size="top-cta" className="w-fit" asChild>
                  <Link href="/mypage">続きから</Link>
                </Button>
              ) : (
                <Button variant="primary" size="top-cta" className="w-fit" asChild>
                  <Link href="/subscription">BONOをはじめる</Link>
                </Button>
              )}
              <Button variant="outline-ghost" size="top-cta" className="w-fit" asChild>
                <Link href={withState(`${COMING_BASE}?what=troubles`, member)}>悩みから探す</Link>
              </Button>
            </div>
            {!member && (
              <p className="pt-3 font-noto-sans-jp text-xs leading-[1.6] text-text-muted">
                <Link
                  href="/subscription"
                  className="underline decoration-text-muted/40 underline-offset-4 transition-colors hover:text-text-primary"
                >
                  料金を見る
                </Link>
              </p>
            )}
          </div>
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
  sub: string;
  icon: ReactNode;
  href: string;
}

// アイコンの色は枠（text-text-primary）から受け継ぐ。04 はサイドバーの「勉強法・キャリア」と同じアイコン
const ICON = { size: 24, color: "currentColor", variant: "Outline" as const };

function entries(member: boolean): Entry[] {
  return [
    {
      no: "01",
      label: "UIUXデザイナーへの転職を進める",
      sub: "準備から応募まで、順番に進めたい人へ",
      icon: <Personalcard {...ICON} />,
      href: V6_BASE,
    },
    {
      no: "02",
      label: "UIデザインのスキルを伸ばす",
      sub: "見た目・画面のつなぎ・使いやすさを磨きたい人へ",
      icon: <Brush2 {...ICON} />,
      href: withState(`${COMING_BASE}?what=skill`, member),
    },
    {
      no: "03",
      label: "実務の悩みを解決する",
      sub: "仕事のデザインで、判断に迷っている人へ",
      icon: <Briefcase {...ICON} />,
      href: withState(`${COMING_BASE}?what=work`, member),
    },
    {
      no: "04",
      label: "勉強法・キャリア",
      sub: "学び方・続け方・これからの働き方を考えたい人へ",
      icon: <DocumentText {...ICON} />,
      href: "/guide",
    },
  ];
}

/** 区切り線: スマホ（2×2）は右列に左線・下段に上線、PC（1行4つ）は2つ目以降に左線 */
const DIVIDER_BY_INDEX = [
  "",
  "border-l",
  "border-t lg:border-t-0 lg:border-l",
  "border-l border-t lg:border-t-0",
];

export function EntryTiles({ member }: { member: boolean }) {
  return (
    <section className="px-6 lg:px-12">
      <div className="border-y border-black/[0.12]">
        {/* 見た目は出さないが、h1 → h2 → h3 の階層を保つ（本番 PurposeNav と同じ） */}
        <h2 className="sr-only">目的から選ぶ</h2>
        <ul className="grid grid-cols-2 lg:grid-cols-4">
          {entries(member).map((e, i) => (
            <li key={e.no} className={cn("border-black/[0.12]", DIVIDER_BY_INDEX[i])}>
              <Link
                href={e.href}
                className="group flex h-full flex-col gap-3 px-3 py-4 transition-colors duration-200 hover:bg-black/[0.03] sm:gap-4 sm:px-5 sm:py-5 lg:py-6"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl border-[0.5px] border-black/10 text-text-primary transition-transform duration-300 group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:size-12 lg:size-14"
                    style={{ backgroundImage: PURPOSE_ICON_GRADIENT }}
                    aria-hidden="true"
                  >
                    {e.icon}
                  </div>
                  <span className="font-heading text-lg font-bold leading-none text-text-muted lg:text-xl" aria-hidden="true">
                    {e.no}
                  </span>
                </div>
                {/* ラベルは全幅。日本語の文節で折り返し、行の長さをそろえる（1文字だけの行を作らない） */}
                <h3 className="text-balance font-noto-sans-jp text-sm font-bold leading-[1.6] text-text-primary [word-break:auto-phrase] lg:text-base">
                  <span className="sr-only">{e.no} </span>
                  {e.label}
                </h3>
                <div className="mt-auto hidden items-end justify-between gap-3 sm:flex">
                  <p className="min-w-0 font-noto-sans-jp text-xs leading-[1.7] text-text-muted">
                    {e.sub}
                    <Kari />
                  </p>
                  <div className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
                    <ArrowButton variant="dark" />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
