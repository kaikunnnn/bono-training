/**
 * how-to ページの大セクション見出し「型」。
 * 長丸バッジ（TopSectionHeading と同じ vocabulary）+ h2（28px / font-heading / weight700）。
 * id を付けて目次アンカーの着地点にする。
 */
import type { ReactNode } from "react";

export interface HowToSectionProps {
  /** 目次アンカー用の id（例: "first-steps"） */
  id: string;
  /** 長丸バッジのラベル（例: "参加したら"） */
  badge: string;
  /** h2 見出し */
  heading: string;
  children: ReactNode;
}

export default function HowToSection({
  id,
  badge,
  heading,
  children,
}: HowToSectionProps) {
  return (
    <section id={id} className="scroll-mt-24 py-14">
      <div className="mb-8 flex flex-col gap-3">
        <span className="inline-flex w-fit items-center justify-center rounded-full border border-black/20 px-3 py-1 font-heading text-xs tracking-[1.6px] text-text-primary">
          {badge}
        </span>
        <h2 className="font-heading text-2xl font-bold leading-[1.4] tracking-[1.6px] text-text-primary sm:text-[28px]">
          {heading}
        </h2>
      </div>
      {children}
    </section>
  );
}
