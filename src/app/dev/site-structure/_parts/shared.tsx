/**
 * #267 サイト構造案の雑プロト — 3ページ共通の部品
 *
 * - ProtoBar: ページ上部の「確認用」帯（何の試作か・見方の切り替え・一覧へ戻る）
 * - Kari: 推測で書いた文言につける「仮」タグ
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const INDEX_HREF = "/dev/site-structure";
export const V6_BASE = "/dev/course-pages/prototyping/roadmap/career-change-v6";
export const v6Step = (n: number) => `${V6_BASE}/step/${n}`;
export const courseHref = (slug: string) => `/dev/course-pages/v2/${slug}`;
export const REPORT_NAME = "267-D レポート（サイト構造とコース・ロードマップの改善）";

/** 推測で書いた文言の印 */
export function Kari({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "ml-1 inline-flex shrink-0 items-center rounded-full bg-warning-feedback px-1.5 py-0.5 align-middle font-noto-sans-jp text-[10px] font-bold leading-none text-text-warning",
        className
      )}
      title="推測で書いた文言（本番前に確認）"
    >
      仮
    </span>
  );
}

export interface ToggleOption {
  label: string;
  href: string;
  active: boolean;
}

/** 試作ページ上部の確認用の帯。見出しタグは使わない（ページの h1 は本文側） */
export function ProtoBar({
  title,
  note,
  options,
}: {
  title: string;
  note: string;
  options?: ToggleOption[];
}) {
  return (
    <div className="border-b border-border-light bg-surface px-4 py-3 font-noto-sans-jp md:px-6">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs text-text-muted">
            <Link href={INDEX_HREF} className="inline-flex items-center gap-1 hover:text-text-primary">
              <ArrowLeft size={12} aria-hidden="true" />
              サイト構造案（#267）
            </Link>
            <span aria-hidden="true">/</span>
            <span>確認用の試作</span>
          </p>
          <p className="mt-1 text-sm font-bold text-text-primary">{title}</p>
          <p className="mt-0.5 text-xs leading-[1.6] text-text-secondary">{note}</p>
        </div>
        {options ? (
          <div className="flex shrink-0 gap-2" role="group" aria-label="表示の切り替え">
            {options.map((o) => (
              <Button
                key={o.href}
                asChild
                size="sm"
                variant={o.active ? "default" : "outline"}
              >
                <Link href={o.href} aria-current={o.active ? "page" : undefined} scroll={false}>
                  {o.label}
                </Link>
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
