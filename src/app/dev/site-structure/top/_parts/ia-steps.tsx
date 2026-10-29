/**
 * #267 悩みの項目「情報設計のやり方」の作り込み部分 — 267-J 3章の 001 の中身
 *
 * 確かめる順番①〜⑥。各ステップに、div とトークンだけで描いた小さな画面の図を添える。
 * 例は同じ題材（社内の本の貸し出し）で通す。練習のお題「社内本貸し出しシステムをデザインしよう」と同じ題材にして、
 * 読んだあとそのまま手を動かせるようにする。
 * 本文の途中の一文リンクは1本だけ（③の中。レッスン「ゼロからはじめるUI情報設計」へ）。
 * 文言はすべて仮。
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDown, ArrowRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Kari } from "../../_parts/shared";
import { lessonHref, lessonInfo } from "../_data/hierarchy";
import { FOCUS, PHRASE } from "./hub-parts";

const MAIN_LESSON = "ui-architect-beginner";

// ------------------------------------------------------------
// 小さな画面の図
// ------------------------------------------------------------

type Tone = "focus" | "mid" | "low" | "ghost";

const TONE: Record<Tone, string> = {
  focus: "bg-cta-primary-bg text-text-inverse",
  mid: "bg-muted-strong text-text-secondary",
  low: "bg-muted-custom text-text-muted",
  ghost: "border border-dashed border-border-default text-text-disabled",
};

function Block({ tone, label, n, className }: { tone: Tone; label?: string; n?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5 rounded-[6px] px-2 text-[10px] font-bold leading-[1.3]", TONE[tone], className)}>
      {n ? (
        <span
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-full font-latin text-[9px]",
            tone === "focus" ? "bg-surface text-text-primary" : "bg-surface text-text-secondary"
          )}
        >
          {n}
        </span>
      ) : null}
      {label ? <span className="truncate">{label}</span> : null}
    </div>
  );
}

function Screen({ children, caption, className }: { children: ReactNode; caption?: string; className?: string }) {
  return (
    <figure className={cn("flex flex-col items-center gap-2", className)}>
      <div className="flex aspect-[9/16] w-[118px] flex-col gap-1.5 rounded-[16px] border border-border-default bg-surface p-2 shadow-[var(--shadow-xs)]">
        <span className="mx-auto mb-0.5 h-1 w-8 shrink-0 rounded-full bg-muted-strong" aria-hidden="true" />
        {children}
      </div>
      {caption ? <figcaption className="font-noto-sans-jp text-[11px] font-bold text-text-muted">{caption}</figcaption> : null}
    </figure>
  );
}

function Panel({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="flex min-h-[260px] items-center justify-center gap-3 rounded-[20px] bg-muted-custom px-4 py-6"
    >
      {children}
    </div>
  );
}

// ------------------------------------------------------------
// ①〜⑥
// ------------------------------------------------------------

interface Step {
  no: string;
  title: string;
  body: ReactNode;
  check: string;
  figure: ReactNode;
}

function steps(): Step[] {
  const lesson = lessonInfo(MAIN_LESSON);
  return [
    {
      no: "①",
      title: "誰が・何をしに来た画面か、1文で書く",
      body: "画面を開く前に、使う人と目的を1文にします。ここがあいまいなままだと、何を置いても「これでいいのかな」が残ります。",
      check: "1文の中に「誰が」と「何をしに」が両方入っているか",
      figure: (
        <Panel label="1文の例: 本を借りたい社員が、借りられる本を探しに来た画面">
          <div className="w-full max-w-[240px] rounded-[14px] bg-surface p-4 shadow-[var(--shadow-xs)]">
            <p className="font-noto-sans-jp text-[11px] font-bold text-text-muted">この画面は</p>
            <p className="mt-2 font-noto-sans-jp text-sm font-bold leading-[2] text-text-primary">
              <span className="rounded-[4px] bg-cta-primary-bg/[0.08] px-1 py-0.5 text-cta-primary-hover">本を借りたい社員</span>が、
              <span className="rounded-[4px] bg-cta-primary-bg/[0.08] px-1 py-0.5 text-cta-primary-hover">借りられる本を探し</span>
              に来た画面
            </p>
            <div className="mt-3 flex gap-3 border-t border-border-light pt-2 text-[10px] text-text-muted">
              <span>誰が</span>
              <span aria-hidden="true">/</span>
              <span>何をしに</span>
            </div>
          </div>
        </Panel>
      ),
    },
    {
      no: "②",
      title: "その人がいちばん先に見たいものを、1つだけ決める",
      body: "①の目的に、いちばん近い情報を1つ選びます。2つ以上を「どれも大事」にすると、画面の中で目が止まる場所がなくなります。",
      check: "画面をぱっと見たとき、最初に目が行くのがその1つになっているか",
      figure: (
        <Panel label="図: 画面の上半分を「借りられる本」が大きく占めている">
          <Screen caption="いちばん先に見たいもの">
            <Block tone="focus" label="借りられる本" className="h-[46%] items-start pt-2" />
            <Block tone="ghost" className="h-[12%]" />
            <Block tone="ghost" className="h-[12%]" />
            <Block tone="ghost" className="h-[12%]" />
          </Screen>
        </Panel>
      ),
    },
    {
      no: "③",
      title: "それ以外を、並べる順番を決める",
      body: (
        <>
          残りの情報に、見てほしい順で番号を振ります。番号が小さいものほど上に、大きく置きます。
          この並べ方は、
          <Link
            href={lessonHref(MAIN_LESSON)}
            className={cn(
              "mx-0.5 rounded-[2px] font-bold text-text-primary underline decoration-border-strong underline-offset-4 hover:decoration-text-primary",
              FOCUS
            )}
          >
            レッスン「{lesson?.title ?? "ゼロからはじめるUI情報設計"}」
          </Link>
          で、実際の画面を使って練習できます。
        </>
      ),
      check: "番号の順と、画面の上から下の順がそろっているか",
      figure: (
        <Panel label="図: 1 検索、2 借りられる本、3 借りている本、4 お知らせ の順に上から並んだ画面">
          <Screen caption="見てほしい順に上から">
            <Block tone="mid" n={1} label="検索" className="h-[12%]" />
            <Block tone="focus" n={2} label="借りられる本" className="h-[36%] items-start pt-2" />
            <Block tone="mid" n={3} label="借りている本" className="h-[18%]" />
            <Block tone="low" n={4} label="お知らせ" className="h-[10%]" />
          </Screen>
        </Panel>
      ),
    },
    {
      no: "④",
      title: "1画面に入れすぎていないか見る",
      body: "③で番号が5つを超えたら、入れすぎの合図です。①の目的に使わないものは、別の画面か次の版に回します。",
      check: "①の1文に関係しない情報が、画面に残っていないか",
      figure: (
        <Panel label="図: 左は小さな箱が8つ並んだ入れすぎの画面、右は3つに絞った画面">
          <Screen caption="入れすぎ">
            {["ランキング", "新着", "レビュー", "お知らせ", "統計", "おすすめ", "イベント", "借りている本"].map((l) => (
              <Block key={l} tone="low" label={l} className="h-[9%]" />
            ))}
            <span className="mt-auto flex items-center justify-center gap-1 text-[10px] font-bold text-text-muted">
              <X size={12} aria-hidden="true" />
              目が止まらない
            </span>
          </Screen>
          <Screen caption="絞った">
            <Block tone="mid" label="検索" className="h-[12%]" />
            <Block tone="focus" label="借りられる本" className="h-[40%] items-start pt-2" />
            <Block tone="mid" label="借りている本" className="h-[18%]" />
            <span className="mt-auto flex items-center justify-center gap-1 text-[10px] font-bold text-cta-primary-hover">
              <Check size={12} aria-hidden="true" />
              目的に集中
            </span>
          </Screen>
        </Panel>
      ),
    },
    {
      no: "⑤",
      title: "画面を分けるなら、どこで分けるか決める",
      body: "1画面に収まらないときは、ユーザーの「次にやること」の手前で分けます。一覧で選び、詳しい画面で借りる、のように1画面1つの仕事にします。",
      check: "分けたそれぞれの画面にも、①の1文が書けるか",
      figure: (
        <Panel label="図: 本の一覧の画面から、本の詳しい画面へ矢印でつながっている">
          <Screen caption="一覧で選ぶ">
            <Block tone="mid" label="検索" className="h-[11%]" />
            <Block tone="low" label="本A" className="h-[13%]" />
            <Block tone="focus" label="本B" className="h-[13%]" />
            <Block tone="low" label="本C" className="h-[13%]" />
            <Block tone="low" label="本D" className="h-[13%]" />
          </Screen>
          <ArrowRight size={18} aria-hidden="true" className="shrink-0 text-text-muted" />
          <Screen caption="詳しく見て借りる">
            <Block tone="low" label="本Bの表紙" className="h-[34%] items-start pt-2" />
            <Block tone="mid" label="あらすじ" className="h-[18%]" />
            <Block tone="focus" label="借りる" className="mt-auto h-[11%] justify-center" />
          </Screen>
        </Panel>
      ),
    },
    {
      no: "⑥",
      title: "それでも決められないときは、2案を並べて人に見てもらう",
      body: "迷っている2つの並べ方を、両方作って並べます。自分で選べないときは、どちらが①の目的に近いかを人に聞くのがいちばん早いです。",
      check: "2案の違いを、1文で説明できるか",
      figure: (
        <Panel label="図: 案Aと案Bの2つの画面を並べて、人に見てもらう">
          <Screen caption="案A">
            <Block tone="focus" label="借りられる本" className="h-[36%] items-start pt-2" />
            <Block tone="mid" label="検索" className="h-[12%]" />
            <Block tone="low" label="借りている本" className="h-[16%]" />
          </Screen>
          <Screen caption="案B">
            <Block tone="mid" label="検索" className="h-[12%]" />
            <Block tone="mid" label="借りている本" className="h-[16%]" />
            <Block tone="focus" label="借りられる本" className="h-[36%] items-start pt-2" />
          </Screen>
        </Panel>
      ),
    },
  ];
}

export function IaSteps() {
  const list = steps();
  return (
    <section id="steps" aria-labelledby="steps-title" className="scroll-mt-24">
      <h2 id="steps-title" className={cn("font-heading text-[26px] font-bold leading-[1.4] text-text-primary lg:text-[32px]", PHRASE)}>
        確かめる順番
      </h2>
      <p className="mt-3 font-noto-sans-jp text-base leading-[1.8] text-text-secondary">
        上から順に確かめて、止まったところがあなたの直すところです。
        <Kari />
      </p>
      <ol className="mt-10 flex flex-col">
        {list.map((s, i) => (
          <li key={s.no} className="relative">
            {i > 0 ? (
              <span className="flex justify-start py-4 pl-[18px]" aria-hidden="true">
                <ArrowDown size={16} className="text-border-strong" />
              </span>
            ) : null}
            <div className="grid grid-cols-1 gap-6 rounded-[24px] border border-border-light bg-surface p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,300px)] md:gap-8 md:p-8">
              <div className="min-w-0">
                <h3 className={cn("flex items-start gap-3 font-heading text-[20px] font-bold leading-[1.5] text-text-primary md:text-[22px]", PHRASE)}>
                  <span className="shrink-0 text-cta-primary-hover">{s.no}</span>
                  <span className="min-w-0">{s.title}</span>
                </h3>
                <p className="mt-3 font-noto-sans-jp text-base leading-[1.9] text-text-secondary">
                  {s.body}
                  <Kari />
                </p>
                <p className="mt-5 flex items-start gap-2 rounded-[12px] bg-muted-custom px-4 py-3 font-noto-sans-jp text-sm leading-[1.7] text-text-primary">
                  <Check size={16} aria-hidden="true" className="mt-1 shrink-0 text-cta-primary-hover" />
                  <span>
                    <span className="mr-1.5 font-bold">確かめること</span>
                    {s.check}
                  </span>
                </p>
              </div>
              {s.figure}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
