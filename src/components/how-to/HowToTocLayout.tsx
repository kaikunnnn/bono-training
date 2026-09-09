/**
 * how-to ページの 2 カラムレイアウト「型」。
 * 左 = sticky 目次（約180px・md 以上でのみ表示）、右 = 本文カラム（max 640px）。
 * 目次は Server Component で組み、現在地ハイライトのみ Client 葉（HowToTocNav）に隔離。
 */
import type { ReactNode } from "react";
import HowToTocNav, { type TocItem } from "./HowToTocNav";

export default function HowToTocLayout({
  toc,
  children,
}: {
  toc: TocItem[];
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[880px] px-4 sm:px-6">
      <div className="md:grid md:grid-cols-[180px_minmax(0,1fr)] md:gap-12">
        {/* 目次（sm 未満は非表示 = 1カラム） */}
        <aside className="hidden md:block">
          <HowToTocNav toc={toc} />
        </aside>

        {/* 本文カラム */}
        <div className="min-w-0 max-w-[640px]">{children}</div>
      </div>
    </div>
  );
}
