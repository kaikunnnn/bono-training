"use client";

/**
 * B 行き先を選ぶ（#243）: 3問の簡単な診断 ＋ 6本のカード
 * 診断はクライアント側の単純な対応表（モック）。答えると1本をおすすめして強調する。
 * 白はクリックできるカード・選択肢だけ。
 */

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Field } from "../../../data/types";
import { T } from "../../../template/kari";

export interface RoadmapCardData {
  slug: string;
  name: string;
  audience: Field;
  outcome: Field;
  period: Field;
  stops: number;
  planned: number;
  stopLabels: string[];
}

type Exp = "none" | "web" | "ui";
type Goal = "job" | "ai" | "portfolio" | "ux" | "proposal";
type Pain = "start" | "visual" | "ai" | "explain" | "user";

const Q1: { value: Exp; label: string }[] = [
  { value: "none", label: "デザインの仕事はしたことがない" },
  { value: "web", label: "Web・グラフィックのデザイン経験がある" },
  { value: "ui", label: "UIデザイナーとして働いている" },
];
const Q2: { value: Goal; label: string }[] = [
  { value: "job", label: "UIデザイナーに転職したい" },
  { value: "ai", label: "AIを使ってデザイン力を上げたい" },
  { value: "portfolio", label: "ポートフォリオを強くしたい" },
  { value: "ux", label: "ユーザーから考えてサービスをつくりたい" },
  { value: "proposal", label: "デザインを納得してもらえるようになりたい" },
];
const Q3: { value: Pain; label: string }[] = [
  { value: "start", label: "何から始めればいいか分からない" },
  { value: "visual", label: "見た目の判断に自信がない" },
  { value: "ai", label: "AIをどこで使えばいいか分からない" },
  { value: "explain", label: "自分のデザインを説明できない" },
  { value: "user", label: "ユーザーのことを考えきれていない" },
];

/** 対応表: 経験 × 目的 → 1本。困りごとはおすすめの理由の一言に使う */
function recommend(exp: Exp, goal: Goal): string {
  if (goal === "ai") return "ai-design";
  if (goal === "ux") return "user-centered";
  if (goal === "proposal") return "proposal";
  if (goal === "portfolio") return exp === "ui" ? "strong-portfolio" : exp === "web" ? "web-graphic-to-ui" : "career-change";
  // 転職
  if (exp === "web") return "web-graphic-to-ui";
  if (exp === "ui") return "strong-portfolio";
  return "career-change";
}

const PAIN_REASON: Record<Pain, string> = {
  start: "最初に何をやるかが、道のりの1つ目で決まります。",
  visual: "見た目を判断する目を、途中のコースで身につけられます。",
  ai: "AIを使う場面を、コースの中で具体的に決めていきます。",
  explain: "考えた過程を説明できるように、最後に形にまとめます。",
  user: "ユーザーから考える進め方を、道のりの中で練習します。",
};

function Question<V extends string>({
  no,
  title,
  options,
  value,
  onChange,
}: {
  no: number;
  title: string;
  options: { value: V; label: string }[];
  value: V | null;
  onChange: (v: V) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-bold text-text-primary">
        <span className="mr-2 font-latin text-text-muted">Q{no}</span>
        {title}
      </legend>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o.value)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-[13px] font-bold transition-colors",
                on
                  ? "border-text-primary bg-text-primary text-text-inverse"
                  : "border-border-light bg-surface text-text-secondary hover:border-border-default"
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function RoadmapChooser({ cards, base }: { cards: RoadmapCardData[]; base: string }) {
  const [exp, setExp] = useState<Exp | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [pain, setPain] = useState<Pain | null>(null);
  const picked = exp && goal && pain ? recommend(exp, goal) : null;
  const pickedCard = cards.find((c) => c.slug === picked) ?? null;

  return (
    <>
      {/* 診断 */}
      <section
        aria-labelledby="chooser-title"
        className="mt-10 rounded-[24px] bg-[var(--persona-hero-surface)] px-5 py-6 md:px-8 md:py-7"
      >
        <h2 id="chooser-title" className="font-heading text-xl font-bold tracking-[-0.03em]">
          3つの質問で、行き先を選ぶ
        </h2>
        <p className="mt-1 text-[13px] text-text-secondary">当てはまるものを1つずつ選ぶと、6本の中から1本をおすすめします。</p>
        <div className="mt-5 flex flex-col gap-5">
          <Question no={1} title="いまの経験は？" options={Q1} value={exp} onChange={setExp} />
          <Question no={2} title="いちばんの目的は？" options={Q2} value={goal} onChange={setGoal} />
          <Question no={3} title="いま困っていることは？" options={Q3} value={pain} onChange={setPain} />
        </div>
        {pickedCard && pain ? (
          <div className="mt-6 border-t border-text-primary/10 pt-5">
            <p className="text-xs font-bold text-text-muted">あなたへのおすすめ</p>
            <p className="mt-1 font-heading text-lg font-bold">{pickedCard.name}</p>
            <p className="mt-1 text-[13px] leading-[1.8] text-text-secondary">{PAIN_REASON[pain]}</p>
            <a href={`#rm-${pickedCard.slug}`} className="mt-2 inline-flex items-center gap-1 text-sm font-bold hover:underline">
              下のカードを見る
              <ArrowRight size={14} />
            </a>
          </div>
        ) : (
          <p className="mt-6 text-xs text-text-muted">3つとも選ぶと、おすすめが出ます。</p>
        )}
      </section>

      {/* 6本のカード */}
      <section aria-labelledby="cards-title" className="mt-12">
        <h2 id="cards-title" className="font-heading text-xl font-bold tracking-[-0.03em]">
          6つの行き先
        </h2>
        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {cards.map((c) => {
            const on = c.slug === picked;
            return (
              <li key={c.slug} id={`rm-${c.slug}`} className="scroll-mt-24">
                <Link
                  href={`${base}/${c.slug}`}
                  className={cn(
                    "group flex h-full flex-col rounded-[20px] border bg-surface p-5 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow,opacity] hover:shadow-[var(--shadow-md)]",
                    on ? "border-text-primary ring-2 ring-text-primary/15" : "border-border-light hover:border-border-default",
                    picked && !on && "opacity-60"
                  )}
                >
                  {on ? (
                    <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-text-primary px-2 py-0.5 text-[11px] font-bold text-text-inverse">
                      <Check size={11} strokeWidth={3.5} />
                      おすすめ
                    </span>
                  ) : null}
                  <h3 className="font-heading text-lg font-bold leading-[1.5]">{c.name}</h3>
                  <p className="mt-1 text-[13px] font-bold leading-[1.7] text-text-secondary">
                    <T f={c.audience} />
                  </p>
                  <p className="mt-2 text-[13px] leading-[1.8] text-text-secondary">
                    <T f={c.outcome} />
                  </p>
                  <p className="mt-3 text-[11px] leading-[1.7] text-text-muted">{c.stopLabels.join(" → ")}</p>
                  <p className="mt-auto flex flex-wrap items-center gap-x-3 pt-3 text-xs font-bold text-text-secondary">
                    <span>
                      期間の目安 <T f={c.period} />
                    </span>
                    <span>
                      区切り {c.stops}
                      {c.planned > 0 ? `（うち準備中のコース ${c.planned}）` : ""}
                    </span>
                    <ArrowRight size={15} className="ml-auto transition-transform group-hover:translate-x-0.5" />
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
