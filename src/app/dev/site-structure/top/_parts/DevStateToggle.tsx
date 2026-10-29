/**
 * #267 試作の確認用: 未ログイン／会員の切り替え（画面右下に浮かせる）
 *
 * サイトの一部に見えないよう、点線の枠・等幅の小さな文字にして、レイアウトの流れには入れない。
 * 本番の部品ではない。共通の ProtoBar は他の試作ページで使っているので触らない。
 */

import Link from "next/link";
import { cn } from "@/lib/utils";
import { INDEX_HREF } from "../../_parts/shared";

export function DevStateToggle({ base, member, className }: { base: string; member: boolean; className?: string }) {
  const opt = (label: string, href: string, active: boolean) => (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded px-1.5 py-0.5",
        active ? "bg-text-primary text-text-inverse" : "text-text-secondary hover:text-text-primary"
      )}
    >
      {label}
    </Link>
  );

  return (
    <div
      role="group"
      aria-label="試作の表示の切り替え（確認用）"
      className={cn(
        "fixed bottom-4 right-4 z-[60] flex items-center gap-1.5 rounded-md border border-dashed border-border-strong bg-surface/95 px-2 py-1.5 font-mono text-[11px] leading-none shadow-[var(--shadow-xs)] backdrop-blur",
        className
      )}
    >
      <Link href={INDEX_HREF} className="px-1 font-bold text-text-muted hover:text-text-primary" title="サイト構造案の試作一覧へ">
        DEV
      </Link>
      <span className="h-3 w-px bg-border-light" aria-hidden="true" />
      {opt("未ログイン", base, !member)}
      {opt("会員", base.includes("?") ? `${base}&state=member` : `${base}?state=member`, member)}
    </div>
  );
}
