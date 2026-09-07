/**
 * 課金完了ページ セレブレーション演出の共有部品（本番）
 *
 * - AnimatedCheckIcon: サークル出現→チェック描画→白フラッシュ＋残光ハロー
 * - AnimatedHeading:    H1 を1文字ずつ下から出す
 * - Reveal:             ブロックを後追いで下からフェードイン（カスケード）
 * - fireWelcomeConfetti / elementOrigin: チェックアイコン位置からの紙吹雪
 *
 * reduced-motion は celebration.module.css のメディアクエリで全無効・即時表示。
 * 紙吹雪だけは JS のため呼び出し側で prefersReducedMotion() を確認して抑止する。
 */

"use client";

import React from "react";
import styles from "./celebration.module.css";

// タイミング定数（ms）
export const CHARS_START = 640;
export const CHAR_STAGGER = 34;
export const REVEAL_BASE = 1000;
export const REVEAL_GAP = 90;
/** 紙吹雪をフラッシュ発光に同期させる遅延 */
export const CONFETTI_DELAY = 460;

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** アニメーション付きチェックアイコン（56px） */
export const AnimatedCheckIcon = React.forwardRef<
  HTMLDivElement,
  { className?: string }
>(function AnimatedCheckIcon({ className }, ref) {
  return (
    <div
      ref={ref}
      className={`${styles.iconWrap} relative size-14 ${className ?? ""}`}
      aria-hidden="true"
    >
      <span className={styles.halo} />
      <svg viewBox="0 0 56 56" fill="none" className="relative block text-[#102720]">
        <circle
          className={styles.circle}
          cx="28"
          cy="28"
          r="25"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          className={styles.check}
          d="M17 29l7.5 7.5L39 21"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
        />
      </svg>
      <span className={styles.flash} />
    </div>
  );
});

/** H1 を1文字ずつ下から出す見出し */
export function AnimatedHeading({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <h1 className={className} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          className={styles.char}
          style={{ animationDelay: `${CHARS_START + i * CHAR_STAGGER}ms` }}
          aria-hidden="true"
        >
          {ch}
        </span>
      ))}
    </h1>
  );
}

/** カスケード用ラッパ（reveal + delay） */
export function Reveal({
  index,
  className,
  children,
}: {
  index: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${styles.reveal} ${className ?? ""}`}
      style={{ animationDelay: `${REVEAL_BASE + index * REVEAL_GAP}ms` }}
    >
      {children}
    </div>
  );
}

/** 主CTA 光沢スイープ用ラッパ */
export function CtaSheen({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${styles.ctaSheen} ${className ?? ""}`}>{children}</div>
  );
}

/** 要素の中心を canvas-confetti の正規化座標（0..1・上端0）に変換 */
export function elementOrigin(el: HTMLElement | null): { x: number; y: number } {
  if (!el || typeof window === "undefined") return { x: 0.5, y: 0.3 };
  const r = el.getBoundingClientRect();
  return {
    x: (r.left + r.width / 2) / window.innerWidth,
    y: (r.top + r.height / 2) / window.innerHeight,
  };
}

/** 控えめな一度きりの紙吹雪。チェックアイコンの位置から発射する。 */
export async function fireWelcomeConfetti(origin: { x: number; y: number }) {
  const confetti = (await import("canvas-confetti")).default;
  const colors = ["#102720", "#8ACCA1", "#FFB721", "#F5EFE7", "#4ECDC4"];
  confetti({
    particleCount: 44,
    spread: 78,
    startVelocity: 30,
    gravity: 0.9,
    decay: 0.92,
    ticks: 120,
    scalar: 0.9,
    origin,
    colors,
    shapes: ["circle", "star"],
  });
}
