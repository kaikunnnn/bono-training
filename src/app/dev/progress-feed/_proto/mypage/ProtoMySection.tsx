import Link from "next/link";
import type { ReactNode } from "react";

/**
 * src/app/mypage/_shared/MySection.tsx ＋ ViewAllButton.tsx の複製（inline style は本番のまま）。
 * 「すべてみる」の遷移先を /dev/progress-feed/mypage にし、計測（HomeClickLink）を外した。
 */
export function ProtoMySection({
  title,
  headingId,
  viewAllHref,
  note,
  children,
}: {
  title: string;
  headingId: string;
  viewAllHref?: string;
  /** 見出しの右に小さく添える説明（新しく足したセクションだけで使う） */
  note?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={headingId}
      className="w-full pt-8 pb-10 flex flex-col items-start gap-3 border-b border-black/10"
    >
      <div className="flex items-center justify-between w-full" style={{ gap: 16 }}>
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
          <h2
            id={headingId}
            className="text-slate-950"
            style={{
              fontFamily: "'Rounded Mplus 1c', sans-serif",
              fontSize: 16,
              fontWeight: 600,
              lineHeight: "24px",
            }}
          >
            {title}
          </h2>
          {note && <span className="text-xs text-text-muted">{note}</span>}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            scroll={false}
            className="shrink-0 text-xs font-medium cursor-pointer text-slate-950/65 transition-colors hover:text-blue-600"
          >
            すべてみる
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
