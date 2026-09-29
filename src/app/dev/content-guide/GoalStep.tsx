"use client";

/**
 * ステップ1: 目標のスキル状態を選ぶ（18個をそのまま選択肢にする）。
 *
 * 11_UI改善仕様書 §2A:
 * - 段階（基礎／実践／応用）でグループ化し、平易な見出し（h2）と状態の数を添える（Hick's Law: チャンクに分ける）。
 * - カード = 短い見出し（h3）+ 元の状態の文（補足）+ 領域タグ（iconsax）。デスクトップ2列／モバイル1列。
 * - モバイルでもグループへ飛べるチップ。
 * - DS patterns.md §3「選択で前進」: 選んだら即次へ。カード全体が押せる（見出し内の button を全面に広げる）。
 */

import type { RefObject } from "react";
import { ArrowRight } from "lucide-react";
import { SKILL_STATES, type SkillStateId } from "@/lib/content-guide/skill-states";
import { SHORT_TITLES, STAGE_GROUPS } from "@/lib/content-guide/display";
import { DomainTag } from "./DomainTag";

interface GoalStepProps {
  headingRef: RefObject<HTMLElement | null>;
  onSelect: (goal: SkillStateId) => void;
}

export function GoalStep({ headingRef, onSelect }: GoalStepProps) {
  return (
    <section aria-labelledby="content-guide-goal-question" className="space-y-6">
      <div className="space-y-1">
        {/* 問い（h2 は段階グループに使うため、問いは段落。ステップ切り替え時のフォーカス先） */}
        <p
          id="content-guide-goal-question"
          ref={headingRef as RefObject<HTMLParagraphElement | null>}
          tabIndex={-1}
          className="font-heading text-lg font-bold leading-7 text-text-primary outline-none sm:text-xl"
        >
          どんなスキルの状態になりたいですか？
        </p>
        <p className="text-sm text-text-secondary">ひとつ選べばOK。あとで変えられます。</p>
      </div>

      {/* グループへ飛ぶチップ */}
      <nav aria-label="段階へ移動">
        <ul className="flex flex-wrap gap-2">
          {STAGE_GROUPS.map((g) => (
            <li key={g.id}>
              <a
                href={`#content-guide-group-${g.id}`}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--card-border-subtle)] bg-surface px-3 text-xs font-bold text-text-secondary transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {g.title}
                <span className="font-medium text-text-muted">{g.stateIds.length}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-8">
        {STAGE_GROUPS.map((group) => (
          <section key={group.id} aria-labelledby={`content-guide-group-${group.id}`}>
            <div className="mb-3 flex items-baseline gap-2">
              <h2
                id={`content-guide-group-${group.id}`}
                className="scroll-mt-24 font-heading text-base font-bold leading-6 text-text-primary sm:text-lg"
              >
                {group.title}
              </h2>
              <span className="text-xs text-text-muted">
                {group.stageLabel}・{group.stateIds.length}個
              </span>
            </div>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {group.stateIds.map((id) => {
                const state = SKILL_STATES[id];
                return (
                  <li
                    key={id}
                    className="group relative flex min-h-11 flex-col gap-2 rounded-[16px] border-2 border-border bg-surface p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 hover:border-primary/50 hover:bg-muted/30"
                  >
                    <h3 className="pr-7 text-[15px] font-bold leading-6 text-text-primary">
                      {/* カード全面を押せるように、button の疑似要素をカード全体に広げる */}
                      <button
                        type="button"
                        onClick={() => onSelect(id)}
                        className="text-left after:absolute after:inset-0 after:rounded-[14px] after:content-[''] focus-visible:outline-none"
                      >
                        {SHORT_TITLES[id]}
                      </button>
                    </h3>
                    <p className="text-xs leading-5 text-text-secondary">{state.label}</p>
                    <DomainTag domain={state.domain} className="self-start" />
                    <ArrowRight
                      aria-hidden="true"
                      className="absolute right-4 top-4 size-4 text-text-muted transition-transform motion-safe:group-hover:translate-x-0.5"
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
