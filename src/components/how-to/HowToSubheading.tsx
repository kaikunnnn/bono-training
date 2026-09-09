/**
 * how-to ページの小見出し「型」。
 * h3 17px 太字（font-heading）。バッジ・マーカー無しで本文の直上に置く。
 */
import type { ReactNode } from "react";

export default function HowToSubheading({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <h3 className="mt-8 mb-3 font-heading text-[17px] font-bold text-text-primary">
      {children}
    </h3>
  );
}
