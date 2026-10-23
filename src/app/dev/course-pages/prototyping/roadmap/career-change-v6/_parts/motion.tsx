"use client";

/**
 * v6 の動き（Client の末端だけ）— #243 / 243-C 計画 §2
 *
 * - Reveal: 画面に入ったら1回だけ opacity 0→1・y 8px→0（240ms, cubic-bezier(0.2,0,0,1)）。index×40ms ずらす
 * - DrawLine: 全体図の線を左から引く（scaleX 0→1, 500ms, 1回だけ）
 *
 * SSR と最初の描画では常に表示したまま（JSが遅くても白くならない）。
 * 最初の IntersectionObserver の結果が「まだ画面の外」のときだけ隠し、入ってきたら出す。
 * もう画面に見えているもの（ファーストビュー）は動かさない。
 * 動きを減らす設定（useReducedMotion）では位置を動かさず、フェードだけ。線は引かない。
 */

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const EASE = [0.2, 0, 0, 1] as const;

type Phase = "idle" | "hidden" | "shown";

function useRevealPhase<T extends Element>() {
  const ref = useRef<T | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let first = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // 最初から見えている → 動かさない（idle のまま）
          if (!first) setPhase("shown");
          io.disconnect();
        } else if (first) {
          setPhase("hidden");
        }
        first = false;
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, phase };
}

export function Reveal({
  children,
  index = 0,
  as = "div",
  className,
  id,
}: {
  children: React.ReactNode;
  /** 並ぶカードの順番（40ms ずつずらす。最大 6 つ分） */
  index?: number;
  as?: "div" | "li" | "section";
  className?: string;
  id?: string;
}) {
  const reduce = useReducedMotion();
  const { ref, phase } = useRevealPhase<HTMLElement>();
  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 8, transition: { duration: 0 } },
    shown: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.24, ease: EASE, delay: Math.min(index, 6) * 0.04 },
    },
  };
  const Comp = as === "li" ? motion.li : as === "section" ? motion.section : motion.div;
  return (
    <Comp
      ref={ref as never}
      id={id}
      className={className}
      initial={false}
      animate={phase === "hidden" ? "hidden" : "shown"}
      variants={variants}
    >
      {children}
    </Comp>
  );
}

/** 全体図の線（左から引く）。親を relative にして置く */
export function DrawLine({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const { ref, phase } = useRevealPhase<HTMLSpanElement>();
  const hidden = phase === "hidden" && !reduce;
  return (
    <motion.span
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ originX: 0 }}
      initial={false}
      animate={{ scaleX: hidden ? 0 : 1 }}
      transition={hidden ? { duration: 0 } : { duration: 0.5, ease: EASE }}
    />
  );
}
