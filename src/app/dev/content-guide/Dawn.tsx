"use client";

/**
 * 診断「夜明け」の表現（13_夜明けデザイン仕様書 §2・§3・§7・§8）。A案・B案で共通。
 *
 * - DawnSky: 診断ページのメイン領域の背景だけを空にする（サイドバー・フッターは既存のまま）。
 *   進み具合 progress（0〜1）で、夜 → 暁 → 朝のグラデーションの重なり・星の見え方・太陽の高さが変わる。
 *   CSS グラデーション3枚 + 太陽の光1つ + CSS の星 28 個のみ（画像・canvas・ライブラリなし）。
 * - 文字は空の上に直接置かない。空の上には DAWN_PANEL（不透明なカード）を置き、その上に文字を置く。
 * - 装飾はすべて aria-hidden。動きは motion-safe のみ（reduced-motion では transition-none・アニメなし。色は状態で切り替わるだけ）。
 */

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 空の上に置く、不透明で読みやすいカード（文字はこの上） */
/**
 * 夜明けの画面の中だけで、共有部品（現行の一覧型と共用）の文字を読みやすくする上書き。空の中と、空の外に出るシート（ポータル）の両方に付ける。
 * - 淡い面（bg-muted-custom）の上の補助文字は AA（4.5:1）を満たす濃さにする
 * - data-cg-text="body"（本文・説明文）は 14px 以上、data-cg-text="aux"（補助のラベル・チップ）は 12px 以上
 */
export const DAWN_TEXT_OVERRIDES =
  "[&_.bg-muted-custom_.text-text-muted]:text-text-secondary [&_[data-cg-text=body]]:text-sm [&_[data-cg-text=body]]:leading-6 [&_[data-cg-text=aux]]:text-xs";

export const DAWN_PANEL =
  "rounded-[24px] border border-[var(--card-border-subtle)] bg-surface p-5 shadow-[var(--dawn-card-glow)] sm:p-6";

/** 星の位置（%）。決定的な並び（ハイドレーションでずれないように乱数は使わない）。twinkle はまたたく少数の星 */
const STARS: { x: number; y: number; s: 1 | 2 | 3; twinkle?: boolean }[] = [
  { x: 6, y: 4, s: 2 }, { x: 14, y: 11, s: 1 }, { x: 22, y: 3, s: 1, twinkle: true }, { x: 31, y: 9, s: 2 },
  { x: 39, y: 2, s: 1 }, { x: 47, y: 7, s: 3, twinkle: true }, { x: 55, y: 13, s: 1 }, { x: 63, y: 5, s: 2 },
  { x: 71, y: 10, s: 1, twinkle: true }, { x: 79, y: 3, s: 2 }, { x: 87, y: 8, s: 1 }, { x: 94, y: 14, s: 2 },
  { x: 4, y: 19, s: 1 }, { x: 18, y: 23, s: 2, twinkle: true }, { x: 27, y: 17, s: 1 }, { x: 43, y: 21, s: 1 },
  { x: 58, y: 25, s: 2 }, { x: 67, y: 19, s: 1 }, { x: 83, y: 22, s: 1, twinkle: true }, { x: 97, y: 27, s: 1 },
  { x: 10, y: 33, s: 1 }, { x: 35, y: 31, s: 2 }, { x: 51, y: 36, s: 1 }, { x: 75, y: 33, s: 2 },
  { x: 91, y: 38, s: 1, twinkle: true }, { x: 24, y: 44, s: 1 }, { x: 62, y: 46, s: 1 }, { x: 86, y: 50, s: 1 },
];

const clamp = (v: number) => Math.max(0, Math.min(1, v));

interface DawnSkyProps {
  /** 夜明けの進み具合（0 = 夜明け前 〜 1 = 朝） */
  progress: number;
  /** 空の色の遷移の長さ（診断中の日の出だけ長くする） */
  durationMs?: number;
  children: ReactNode;
}

export function DawnSky({ progress, durationMs = 900, children }: DawnSkyProps) {
  const p = clamp(progress);
  const layer = "pointer-events-none absolute inset-0 motion-safe:transition-opacity motion-safe:ease-out motion-reduce:transition-none";
  const dur: CSSProperties = { transitionDuration: `${durationMs}ms` };
  return (
    <div
      className={cn(
        // overflow-clip: はみ出しは切るが、スクロールの箱にはしない（中の sticky がページのスクロールで効くように）
        "relative isolate min-h-screen overflow-clip bg-[var(--dawn-night)]",
        // reduced-motion: 空の中の動き（トランジション）をすべて止める（13_ §8）
        "motion-reduce:[&_*]:transition-none!",
        // 共有部品は現行の一覧型と共用のため、部品自体の見た目は変えずにこの画面の中だけで上書きする（AA の補助文字・文字サイズ）
        DAWN_TEXT_OVERRIDES
      )}
      style={{ "--dawn-progress": p } as CSSProperties}
      data-dawn-sky
      data-dawn-progress={p.toFixed(2)}
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className={layer} style={{ backgroundImage: "var(--dawn-sky-night)" }} />
        <div className={layer} style={{ ...dur, backgroundImage: "var(--dawn-sky-dawn)", opacity: clamp(p * 1.8) }} />
        <div
          className={layer}
          style={{ ...dur, backgroundImage: "var(--dawn-sky-morning)", opacity: clamp((p - 0.55) / 0.35) }}
        />
        {/* 太陽の光: 進むほど、水平線（下）から昇る */}
        <div
          className="pointer-events-none absolute left-1/2 aspect-square w-[140vmax] max-w-[1600px] -translate-x-1/2 motion-safe:transition-[top,opacity] motion-safe:ease-out motion-reduce:transition-none"
          style={{
            ...dur,
            transitionDuration: `${durationMs}ms`,
            top: `${100 - p * 70}%`,
            opacity: clamp(0.25 + p),
            backgroundImage: "var(--dawn-sun-glow)",
          }}
        />
        {/* 星: 明けるほど消える。またたくのは少数の星だけ（motion-safe） */}
        <div className={layer} style={{ ...dur, opacity: clamp(1 - p * 1.25) }}>
          {STARS.map((st, i) => (
            <span
              key={i}
              className={cn(
                "absolute rounded-full bg-[var(--dawn-star)]",
                st.s === 1 && "size-px",
                st.s === 2 && "size-0.5",
                st.s === 3 && "size-1 shadow-[var(--dawn-star-glow)]",
                st.twinkle && "motion-safe:animate-pulse"
              )}
              style={{ left: `${st.x}%`, top: `${st.y}%`, animationDuration: st.twinkle ? `${3 + (i % 3)}s` : undefined }}
            />
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ---------- モチーフ（SVG・aria-hidden。色は --dawn-* トークン） ---------- */

/** 一番星（まず基本を身につけたい） */
export function MotifFirstStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("size-12", className)}>
      <rect width="48" height="48" rx="14" className="fill-[var(--dawn-night)]" />
      <circle cx="12" cy="36" r="1" className="fill-[var(--dawn-star-dim)]" />
      <circle cx="38" cy="12" r="1" className="fill-[var(--dawn-star-dim)]" />
      <path
        d="M24 11 L27 21 L37 24 L27 27 L24 37 L21 27 L11 24 L21 21 Z"
        className="fill-[var(--dawn-star)]"
      />
      <circle cx="24" cy="24" r="4" className="fill-[var(--dawn-star-lit)]" />
    </svg>
  );
}

/** 水平線の光（使える力にしたい） */
export function MotifHorizon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("size-12", className)}>
      <rect width="48" height="48" rx="14" className="fill-[var(--dawn-predawn)]" />
      <circle cx="24" cy="34" r="12" className="fill-[var(--dawn-sunrise)]" />
      <rect x="0" y="34" width="48" height="14" className="fill-[var(--dawn-night-raised)]" />
      <rect x="6" y="33" width="36" height="2" rx="1" className="fill-[var(--dawn-star-lit)]" />
    </svg>
  );
}

/** 昇る太陽（さらに伸ばしたい） */
export function MotifRisingSun({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("size-12", className)}>
      <rect width="48" height="48" rx="14" className="fill-[var(--dawn-sun-soft)]" />
      {[0, 45, 90, 135, 180].map((deg) => (
        <rect
          key={deg}
          x="23"
          y="6"
          width="2"
          height="6"
          rx="1"
          transform={`rotate(${deg - 90} 24 26)`}
          className="fill-[var(--dawn-sun)]"
        />
      ))}
      <circle cx="24" cy="26" r="8" className="fill-[var(--dawn-sun)]" />
      <rect x="6" y="36" width="36" height="2" rx="1" className="fill-[var(--dawn-sun)]" />
    </svg>
  );
}

/**
 * 質問の進捗: 太陽が弧を描いて昇る（B案）。数字「質問 n／m」も残す（情報は数字で伝え、弧は装飾）。
 */
export function SunArcProgress({ current, total, className }: { current: number; total: number; className?: string }) {
  const t = total > 0 ? current / total : 0;
  // 半円の弧（左の水平線 → 右上へ）。t=0 で左端、t=1 で頂点より少し右
  const angle = Math.PI * (1 - t * 0.85);
  const cx = 60 + 48 * Math.cos(angle);
  const cy = 56 - 48 * Math.sin(angle);
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg viewBox="0 0 120 60" aria-hidden="true" className="h-10 w-20 shrink-0">
        <path d="M12 56 A48 48 0 0 1 108 56" fill="none" strokeWidth="2" strokeDasharray="3 4" className="stroke-[var(--dawn-line)]" />
        <path
          d={`M12 56 A48 48 0 0 1 ${cx.toFixed(1)} ${cy.toFixed(1)}`}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          className="stroke-[var(--dawn-sunrise)]"
        />
        <line x1="4" y1="56" x2="116" y2="56" strokeWidth="2" className="stroke-[var(--dawn-line)]" />
        <circle
          cx={cx}
          cy={cy}
          r="7"
          className="fill-[var(--dawn-sun)] motion-safe:transition-all motion-safe:duration-700 motion-reduce:transition-none"
        />
      </svg>
      <p className="text-xs font-bold text-text-secondary">
        質問 <span className="font-latin">{current}</span>／<span className="font-latin">{total}</span>
      </p>
    </div>
  );
}

/** 診断中の日の出（約1.2秒）。太陽が水平線から昇る。reduced-motion ではこの画面自体を省略する */
export function SunriseArt() {
  const [risen, setRisen] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setRisen(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <svg viewBox="0 0 200 90" aria-hidden="true" className="h-24 w-full max-w-xs overflow-visible">
      <defs>
        <clipPath id="content-guide-horizon-clip">
          <rect x="0" y="-40" width="200" height="110" />
        </clipPath>
      </defs>
      <g clipPath="url(#content-guide-horizon-clip)">
        <circle
          cx="100"
          cy="70"
          r="24"
          className="fill-[var(--dawn-sun)] motion-safe:transition-transform motion-safe:duration-1000 motion-safe:ease-out motion-reduce:transition-none"
          style={{ transform: risen ? "translateY(-34px)" : "translateY(26px)" }}
        />
      </g>
      <rect x="0" y="70" width="200" height="20" className="fill-surface" />
      <rect x="10" y="69" width="180" height="2" rx="1" className="fill-[var(--dawn-sunrise)]" />
    </svg>
  );
}
