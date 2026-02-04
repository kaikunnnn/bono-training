import React, { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import LessonCard from "@/components/lessons/LessonCard";
import type { Lesson } from "@/types/lesson";

type MotionPattern = "softLift" | "staggered" | "softScale";

const mockLessons: Lesson[] = [
  {
    id: "ui-1",
    category: "UI",
    title: "UIが上手くなる人の“デザインサイクル” ─入門編",
    description: "UIデザインの流れを手を動かしながら理解する🔰入門基礎レッスンです",
    thumbnail: "/placeholder-thumbnail.svg",
    slug: "ui-design-cycle",
  },
  {
    id: "ui-2",
    category: "UI",
    title: "UIレイアウト基礎 ─「構造の基本」",
    description: "余白・階層・視線誘導の土台を短時間で押さえるレッスンです。",
    thumbnail: "/placeholder-thumbnail.svg",
    slug: "ui-layout-basics",
  },
  {
    id: "ux-1",
    category: "UX",
    title: "ユーザー調査のはじめ方",
    description: "迷わないためのリサーチ設計と、インタビュー前の準備を学びます。",
    thumbnail: "/placeholder-thumbnail.svg",
    slug: "ux-research-start",
  },
  {
    id: "info-1",
    category: "情報設計",
    title: "情報の整理と見せ方の原則",
    description: "分類・ラベリング・ナビゲーションの基本を体系的に学びます。",
    thumbnail: "/placeholder-thumbnail.svg",
    slug: "info-architecture-basics",
  },
  {
    id: "ui-3",
    category: "UI",
    title: "UIタイポの整え方",
    description: "読みやすさと美しさを両立する文字設計のコツを学びます。",
    thumbnail: "/placeholder-thumbnail.svg",
    slug: "ui-typography",
  },
  {
    id: "ux-2",
    category: "UX",
    title: "プロトタイプ検証入門",
    description: "小さく作って早く試すための検証プロセスを紹介します。",
    thumbnail: "/placeholder-thumbnail.svg",
    slug: "prototype-validation",
  },
  {
    id: "ui-4",
    category: "UI",
    title: "コンポーネント設計の基礎",
    description: "再利用性・一貫性を保つUI部品の考え方を学びます。",
    thumbnail: "/placeholder-thumbnail.svg",
    slug: "ui-components",
  },
  {
    id: "info-2",
    category: "情報設計",
    title: "ユーザーが迷わない導線づくり",
    description: "情報の流れを意識して、迷いを減らす設計を学びます。",
    thumbnail: "/placeholder-thumbnail.svg",
    slug: "navigation-flow",
  },
];

const patternCopy: Record<MotionPattern, { title: string; detail: string }> = {
  softLift: {
    title: "Soft Lift + Fade",
    detail: "下からわずかに浮かび、透明度と一緒に表示される控えめな登場。",
  },
  staggered: {
    title: "Staggered Reveal",
    detail: "カードが順番に現れるリズム感。視線が自然に流れる。",
  },
  softScale: {
    title: "Soft Scale + Fade",
    detail: "少しだけ縮んだ状態から戻る、上質でやわらかい動き。",
  },
};

const LessonCardMotion = () => {
  const [pattern, setPattern] = useState<MotionPattern>("softLift");
  const [playKey, setPlayKey] = useState(0);
  const reduceMotion = useReducedMotion();

  const { containerVariants, itemVariants } = useMemo(() => {
    const ease = [0.22, 1, 0.36, 1] as const;
    const base = reduceMotion ? { duration: 0 } : { duration: 0.5, ease };
    const softLiftHidden = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 };
    const softScaleHidden = reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 };

    const variantsByPattern: Record<MotionPattern, { hidden: object; show: object }> = {
      softLift: {
        hidden: softLiftHidden,
        show: { opacity: 1, y: 0, transition: base },
      },
      staggered: {
        hidden: softLiftHidden,
        show: { opacity: 1, y: 0, transition: base },
      },
      softScale: {
        hidden: softScaleHidden,
        show: { opacity: 1, scale: 1, transition: base },
      },
    };

    const container: { hidden: object; show: object } = {
      hidden: {},
      show: {
        transition: {
          staggerChildren: pattern === "staggered" && !reduceMotion ? 0.06 : 0,
          delayChildren: pattern === "staggered" && !reduceMotion ? 0.04 : 0,
        },
      },
    };

    return {
      containerVariants: container,
      itemVariants: variantsByPattern[pattern],
    };
  }, [pattern, reduceMotion]);

  return (
    <div className="min-h-screen bg-[#f9f9f7]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <p className="text-sm font-medium text-gray-500">/dev/lesson-card-motion</p>
          <h1 className="mt-2 text-3xl font-bold text-[#0d221d]">
            Lesson Card Motion Playground
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            レッスンカードのアニメーション案を比較するためのテストページです。
          </p>
        </header>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          {(Object.keys(patternCopy) as MotionPattern[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setPattern(key)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                pattern === key
                  ? "border-[#0d221d] bg-[#0d221d] text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:border-[#0d221d] hover:text-[#0d221d]"
              }`}
            >
              {patternCopy[key].title}
            </button>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setPlayKey((prev) => prev + 1)}
            className="rounded-full bg-[#0d221d] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#173b33]"
          >
            Play Animation
          </button>
          <p className="text-sm text-gray-500">
            ボタンを押すと表示アニメーションを再生します。
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
          <p className="font-medium text-[#0d221d]">{patternCopy[pattern].title}</p>
          <p className="mt-1">{patternCopy[pattern].detail}</p>
        </div>

        <motion.div
          key={`lesson-motion-${playKey}`}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 auto-rows-fr items-stretch"
        >
          {mockLessons.map((lesson) => (
            <motion.div
              key={lesson.id}
              variants={itemVariants}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              transition={reduceMotion ? undefined : { duration: 0.2 }}
            >
              <LessonCard lesson={lesson} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LessonCardMotion;
