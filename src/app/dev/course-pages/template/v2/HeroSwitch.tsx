/**
 * テンプレート v2: ヒーローの切り替え（確認用の帯）— #241
 *
 * 前の形（v2 のヒーロー）と Figma の4パターン（?hero=01〜04）を、同じコースページの中で切り替える。
 * リンクはページ側で、ほかのクエリ（?started 等）を残したまま作って渡す。
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export type HeroVariant = "v2" | "01" | "02" | "03" | "04";

export const HERO_VARIANTS: { id: HeroVariant; label: string }[] = [
  { id: "v2", label: "前の形" },
  { id: "01", label: "01 左右分割" },
  { id: "02", label: "02 カード3枚" },
  { id: "03", label: "03 中央寄せ＋帯" },
  { id: "04", label: "04 見出し＋帯" },
];

export default function HeroSwitch({
  current,
  hrefs,
  v1Href,
}: {
  current: HeroVariant;
  hrefs: Record<HeroVariant, string>;
  /** 前の形のときはヒーロー内に同じリンクがあるので出さない */
  v1Href: string | null;
}) {
  return (
    <div className="border-b border-border-light bg-muted-custom">
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 text-xs md:px-10">
        {current !== "v2" ? (
          <Link
            href="/dev/course-pages/prototyping"
            className="inline-flex items-center gap-1 font-bold text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft size={14} />
            プロトタイピング
          </Link>
        ) : null}
        <div className="flex flex-wrap items-center gap-1">
          <span className="mr-1 text-text-muted">ヒーロー</span>
          {HERO_VARIANTS.map((v) => (
            <Link
              key={v.id}
              href={hrefs[v.id]}
              aria-current={v.id === current ? "page" : undefined}
              className={cn(
                "rounded-full px-2.5 py-1 font-bold",
                v.id === current ? "bg-text-primary text-text-inverse" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {v.label}
            </Link>
          ))}
        </div>
        {v1Href ? (
          <Link href={v1Href} className="font-bold text-text-link hover:underline">
            v1 と比べる →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
