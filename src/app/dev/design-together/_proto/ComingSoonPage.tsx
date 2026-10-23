import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { DT_MYPAGE } from "./data";

/**
 * 次のスライスで中身を作るページの入れ物（#253 S0）。
 * ヘッダーと空状態だけ。空状態は次のアクション（マイページで作業を始める）へつなぐ。
 */
export function ComingSoonPage({
  title,
  lead,
  icon,
  emptyTitle,
  emptyBody,
}: {
  title: string;
  lead: string;
  icon: ReactNode;
  emptyTitle: string;
  emptyBody: string;
}) {
  return (
    <div className="min-h-screen">
      <div className="pt-10 pb-12 px-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold leading-6 font-rounded-mplus text-slate-950">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">{lead}</p>

        <section
          aria-labelledby="coming-soon-heading"
          className="mt-8 flex flex-col items-center gap-3 rounded-[20px] border border-[var(--card-border-subtle)] bg-surface px-6 py-12 text-center"
        >
          <span className="text-text-muted" aria-hidden>
            {icon}
          </span>
          <h2 id="coming-soon-heading" className="font-heading text-base font-bold text-text-primary">
            {emptyTitle}
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-text-secondary">{emptyBody}</p>
          <p className="text-xs text-text-muted">このページの中身は次のスライスで作ります。</p>
          <Button asChild variant="secondary" className="mt-2">
            <Link href={DT_MYPAGE}>マイページで作業を始める</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
