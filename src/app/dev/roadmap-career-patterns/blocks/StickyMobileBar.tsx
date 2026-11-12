"use client";

/**
 * パターンF：スマホだけ画面下に固定の小さなバー（#282, H4）
 *
 * - ヒーロー（料金枠）が画面外に出てから出す。RoadmapHero の中には手を入れられないので、
 *   ヒーロー直後に置いた目印（sentinelId）が画面の上に抜けたかで判定する（料金枠の位置の近似）
 * - 下に読むときは隠れ、上に戻すと出る（NN/g「Sticky Headers」の半分固定。出る動きは 300ms）
 * - prefers-reduced-motion では動きなしで出し入れする
 * - safe-area-inset-bottom 対応。押せる大きさは 48px（44px 以上）。バーの高さは pt-2 + h-12 + pb-2 = 64px
 *   （ページ側で同じ高さの余白を最後に置く）
 * - 試作なので料金ボタンの計測（pricing_cta_click / withPricingFrom）は呼ばない
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** 方向を切り替えるまでのスクロール量（指の小さなぶれで出入りしないように） */
const DIRECTION_THRESHOLD = 8;

export default function StickyMobileBar({ sentinelId }: { sentinelId: string }) {
  const [pastHero, setPastHero] = useState(false);
  const [scrollingDown, setScrollingDown] = useState(false);
  const lastY = useRef(0);

  // ヒーローを過ぎたか
  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) {
      console.warn(`[StickyMobileBar] 目印 #${sentinelId} が見つかりません`);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setPastHero(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelId]);

  // スクロールの向き
  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;
        if (Math.abs(delta) >= DIRECTION_THRESHOLD) {
          setScrollingDown(delta > 0);
          lastY.current = y;
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visible = pastHero && !scrollingDown;

  return (
    <div
      inert={!visible}
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 md:hidden",
        "border-t border-border-light bg-white/95 backdrop-blur-sm",
        "px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]",
        "transition-transform duration-300 ease-out motion-reduce:transition-none",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="flex gap-2">
        <Button asChild size="large" className="flex-1">
          <Link href="/subscription">料金を見る</Link>
        </Button>
        <Button asChild variant="outline" size="large" className="flex-1">
          <a href="#curriculum">カリキュラムへ</a>
        </Button>
      </div>
    </div>
  );
}
