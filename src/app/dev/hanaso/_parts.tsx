/**
 * /dev/hanaso 配下（ハナソ教材の作業ページ・#296）で共通に使う小さな部品。
 * 見た目は /dev/hanaso-compare/changes に合わせている（札・スクショ・戻るリンク）。
 * page.tsx ではないのでルートにはならない。
 */

import Link from "next/link";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const HANASO_INDEX = "/dev/hanaso";
export const SHOT_BASE = "/dev/hanaso-compare/shots";

/** 根拠の種類。必須＝守らないといけない決まり（ストアの規約・法令）、規格＝標準規格 */
export type BasisTag = "必須" | "規格";

const TAG_STYLE: Record<BasisTag, "dark" | "secondary"> = {
  必須: "dark",
  規格: "secondary",
};

export function TagBadge({ tag }: { tag: BasisTag }) {
  return (
    // Badge は div なので、文中にも置けるよう span に同じ見た目を当てる（changes/page.tsx と同じ）
    <span
      className={cn(
        badgeVariants({ variant: TAG_STYLE[tag] }),
        "shrink-0 px-2 py-0 text-[11px] font-bold"
      )}
    >
      {tag}
    </span>
  );
}

export type Shot = { file: string; caption: string };

export function ShotFigure({ shot, label }: { shot: Shot; label: string }) {
  return (
    <figure className="flex flex-col gap-1.5">
      {/* dev 専用・Route Handler 配信の固定サイズ画像のため next/image の最適化は不要 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${SHOT_BASE}/${shot.file}`}
        alt={`${label}：${shot.caption}`}
        width={417}
        height={836}
        loading="lazy"
        className="h-auto w-full"
      />
      <figcaption className="text-xs leading-relaxed text-muted-foreground">{shot.caption}</figcaption>
    </figure>
  );
}

export function BackToIndex() {
  return (
    <p className="text-sm">
      <Link href={HANASO_INDEX} className="underline underline-offset-2">
        ← ハナソの作業ページ一覧
      </Link>
    </p>
  );
}
