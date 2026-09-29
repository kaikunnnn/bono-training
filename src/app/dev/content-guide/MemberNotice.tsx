/**
 * 未ログイン表示の会員登録導線。
 *
 * 既存のロック部品 `src/components/premium/ContentPreviewOverlay.tsx` の見た目に合わせる:
 * 丸背景のロックアイコン + メッセージ + 「ログインする」「メンバーシップ登録へ」（共通 Button + Link、同じ遷移先・アイコン）。
 * 部品そのものは記事の続きを隠すグラデーション前提のため使わず、色はDSトークン（info）に置き換えている。
 */

import Link from "next/link";
import { Lock, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MemberNoticeProps {
  redirectTo: string;
}

export function MemberNotice({ redirectTo }: MemberNoticeProps) {
  const loginHref = `/login?redirectTo=${encodeURIComponent(redirectTo)}`;
  return (
    <section
      aria-labelledby="content-guide-member-heading"
      className="rounded-[20px] border border-[var(--card-border-subtle)] bg-surface px-5 py-8 text-center shadow-[var(--shadow-board-card)] sm:px-8"
    >
      <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-info-feedback">
        <Lock aria-hidden="true" className="size-8 text-text-info" strokeWidth={2} />
      </div>
      <h2
        id="content-guide-member-heading"
        className="font-heading text-lg font-bold leading-7 text-text-primary sm:text-xl"
      >
        続きの記事はメンバーシップで見られます
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
        この道筋には、会員限定の記事が多いレッスンがあります。無料の記事から始めて、続きはメンバーシップで学べます。
      </p>
      <div className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
        <Button asChild size="large" className="flex-1 text-base">
          <Link href={loginHref}>
            <LogIn className="mr-2 h-4 w-4" />
            ログインする
          </Link>
        </Button>
        <Button asChild variant="outline" size="large" className="flex-1 text-base">
          <Link href="/subscription">
            <UserPlus className="mr-2 h-4 w-4" />
            メンバーシップ登録へ
          </Link>
        </Button>
      </div>
    </section>
  );
}
