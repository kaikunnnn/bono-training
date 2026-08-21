"use client";

/**
 * 料金ページ「プラン説明セクション」簡潔化検討（E1/E2）統合。
 *
 * - 情報過多な /plan のプラン説明を、読みやすく簡潔に伝えて課金判断を助ける。
 * - p(E1/E2) は確認用コントロールで切替、URLクエリ(p)に反映。
 * - h1 はページ全体で1つだけ。
 * - CTA は Stripe を呼ばず console.log のダミーのみ（各Patternコンポーネント内）。
 */

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { parseEPattern, type EPattern } from "./data";
import { PatternE1 } from "./PatternE1";
import { PatternE2 } from "./PatternE2";
import { DevControls } from "./DevControls";

export function PricingDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const p: EPattern = parseEPattern(searchParams.get("p"));

  const setQuery = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="mx-auto w-full max-w-[1040px] px-4 py-8">
      {/* ページ主見出し（h1 は全体で1つ） */}
      <header className="text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          プラン説明（検証）
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          情報過多なプラン説明を簡潔に伝える見せ方の検証。E1（要約2カラム）と
          E2（変化ストーリー）を切り替えて比較します。
        </p>
      </header>

      {/* 簡潔化パターン（E1/E2 切替） */}
      <div className="mt-8">{p === "E1" ? <PatternE1 /> : <PatternE2 />}</div>

      {/* 確認用コントロール（本番では非表示） */}
      <div className="mt-12">
        <DevControls p={p} onP={(v) => setQuery("p", v)} />
      </div>
    </div>
  );
}
