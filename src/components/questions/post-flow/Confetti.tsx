"use client";

/**
 * Confetti — 完了アニメの花吹雪バースト（#143）
 *
 * チェックアイコンを中心に放射状に紙片を飛ばす軽量な自作 confetti。
 * ライブラリ不使用。DOM 要素 + Web Animations API（element.animate）で
 * 粒ごとに角度・距離・回転・遅延を擬似ランダムに散らす。
 *
 * - 粒: 約36個。ピル形（約4×10px・rounded・回転）とドット（6-8px円）のミックス
 * - 色: DSトークン var(--confetti-1..8) を参照（生hex/rgb を JSX/TS に書かない）
 * - 挙動: 中心から外へ弧を描いて飛び、回転しながら落下してフェードアウト（~1.2-1.6s・1回再生）
 * - 開始タイミング: マウント後 ~500ms（フラッシュのピークに同期）
 * - prefers-reduced-motion: reduce では何も描画しない
 *
 * Math.random はクライアントの useEffect 内でのみ使用し、hydration 不整合を避ける。
 */

import { useEffect, useRef } from "react";
import styles from "./Confetti.module.css";

/** 粒の総数 */
const PARTICLE_COUNT = 36;
/** バースト開始遅延（フラッシュのピークに同期） */
const BURST_DELAY_MS = 500;
/** 使用するトークン変数名（生hex は書かない） */
const CONFETTI_VARS = [
  "--confetti-1",
  "--confetti-2",
  "--confetti-3",
  "--confetti-4",
  "--confetti-5",
  "--confetti-6",
  "--confetti-7",
  "--confetti-8",
] as const;

/** [min, max) の擬似乱数 */
function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function Confetti() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // reduced-motion では花吹雪を出さない
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const timer = window.setTimeout(() => {
      const animations: Animation[] = [];

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const el = document.createElement("span");

        // 半々でピル形とドットを混ぜる
        const isPill = i % 2 === 0;
        el.className = isPill ? styles.pill : styles.dot;
        el.style.backgroundColor = `var(${CONFETTI_VARS[i % CONFETTI_VARS.length]})`;

        // ドットは 6-8px、ピルは 4×10px（module.css の基本サイズにスケールをかける）
        if (!isPill) {
          const size = rand(6, 8);
          el.style.width = `${size}px`;
          el.style.height = `${size}px`;
        }

        container.appendChild(el);

        // 放射状に散らす角度（全周） + 距離（px）。広めに散らす（#137-0715 調整）
        const angle = rand(0, Math.PI * 2);
        const distance = rand(120, 280);
        const dx = Math.cos(angle) * distance;
        // 落下量を大きめに取り、ゆっくり長く落ちる印象にする
        const gravity = rand(120, 260);
        const dyUp = Math.sin(angle) * distance;

        const rotStart = rand(-90, 90);
        const rotEnd = rotStart + rand(180, 540);
        const duration = rand(2400, 3400);
        const delay = rand(0, 180);

        // 中心 → 弧の頂点（前半45%かけてゆっくり広がる） → ゆっくり落下 → 終盤にフェードアウト
        const anim = el.animate(
          [
            {
              transform: `translate(-50%, -50%) rotate(${rotStart}deg) scale(0.6)`,
              opacity: 1,
              offset: 0,
            },
            {
              transform: `translate(calc(-50% + ${dx * 0.7}px), calc(-50% + ${
                dyUp * 0.7 - gravity * 0.1
              }px)) rotate(${rotStart + (rotEnd - rotStart) * 0.35}deg) scale(1)`,
              opacity: 1,
              offset: 0.45,
            },
            {
              transform: `translate(calc(-50% + ${dx * 0.95}px), calc(-50% + ${
                dyUp + gravity * 0.6
              }px)) rotate(${rotStart + (rotEnd - rotStart) * 0.75}deg) scale(0.95)`,
              opacity: 1,
              offset: 0.8,
            },
            {
              transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${
                dyUp + gravity
              }px)) rotate(${rotEnd}deg) scale(0.9)`,
              opacity: 0,
              offset: 1,
            },
          ],
          {
            duration,
            delay,
            // 立ち上がりを緩めたease-out（旧: 0.16,1 は初速が速すぎた）
            easing: "cubic-bezier(0.3, 0.75, 0.4, 1)",
            fill: "forwards",
          }
        );
        animations.push(anim);
      }

      // 後始末: 全アニメ完了で要素を消す
      const cleanup = () => {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      };
      Promise.allSettled(animations.map((a) => a.finished))
        .then(cleanup)
        .catch(cleanup);
    }, BURST_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={styles.container}
      aria-hidden="true"
    />
  );
}
