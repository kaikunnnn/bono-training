"use client";

/**
 * ステップ3: 結果画面（10_仕様書 §4 / 11_UI改善仕様書 §2C）。
 *
 * 構成（見出し: h2=各セクション / h3=状態）:
 * 1. 要約バー: 目指す状態（短い見出し）・「全n ステップ・できている k・あと約w週間」・進捗バー
 * 2. 最初の一歩: 最初の状態と、主ボタン「このレッスンから始める」（無料の入口）。ほかのレッスンは小さなリスト
 * 3. 未ログイン かつ 入口レッスンが会員限定の割合が高いときだけ、会員登録の案内（最初の一歩の直下）
 * 4. ゴールまでの道筋: 縦のステッパー。できている（淡く）／いまここ（強調）／これから（折りたたみ。タップで展開）
 * 5. やり直し
 * モバイルでは画面下に「最初のレッスンから始める」を固定表示。
 *
 * 各セクションは ResultSections.tsx に切り出し（A案・B案と共通）。DOM・クラスは変えていない。
 *
 * 重複の削除: 最初の状態のレッスンは「最初の一歩」にだけ出す。道筋が1つだけ（前提なしの目標）のときは道筋を出さない。
 * 「何を作るか（課題の中身）」は表示しない。
 */

import type { RefObject } from "react";
import { Flag } from "iconsax-react";
import { SKILL_STATES, type SkillStateId } from "@/lib/content-guide/skill-states";
import { isMemberHeavy } from "@/lib/content-guide/lesson-map";
import { SHORT_TITLES } from "@/lib/content-guide/display";
import { MemberNotice } from "./MemberNotice";
import { ProgressBar } from "./ResultParts";
import {
  FirstStepSection,
  PathSection,
  RestartActions,
  StickyStartBar,
  computeResultModel,
  resultCardClass,
  useRedirectTo,
  useResultViewTracking,
} from "./ResultSections";
import type { Viewer } from "./query";

interface ResultViewProps {
  headingRef: RefObject<HTMLElement | null>;
  goal: SkillStateId;
  checked: SkillStateId[];
  viewer: Viewer;
  onRestart: () => void;
  onEditChecked: () => void;
}

export function ResultView({ headingRef, goal, checked, viewer, onRestart, onEditChecked }: ResultViewProps) {
  const redirectTo = useRedirectTo();
  const model = computeResultModel(goal, checked);
  const { weeks, doneInRequired, total, entryLesson } = model;
  const showMemberNotice = viewer === "guest" && entryLesson !== undefined && isMemberHeavy(entryLesson);
  useResultViewTracking(model, viewer, "list");

  return (
    <div className="space-y-5 pb-28 md:pb-0">
      {/* 1. 要約バー */}
      <section aria-labelledby="content-guide-summary-heading" className={resultCardClass}>
        <p className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
          <Flag aria-hidden="true" size={14} color="currentColor" />
          目指す状態
        </p>
        <h2
          id="content-guide-summary-heading"
          ref={headingRef as RefObject<HTMLHeadingElement | null>}
          tabIndex={-1}
          className="mt-1 font-heading text-xl font-bold leading-8 text-text-primary outline-none sm:text-2xl"
        >
          {SHORT_TITLES[goal]}
        </h2>
        <p className="mt-1 text-xs leading-5 text-text-secondary">{SKILL_STATES[goal].label}</p>
        <div className="mt-4 space-y-2">
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-text-primary">
            <span>
              全<span className="font-bold">{total}</span>ステップ
            </span>
            <span>
              できている <span className="font-bold">{doneInRequired.length}</span>つ
            </span>
            <span>
              あと約<span className="font-bold">{weeks}</span>週間
            </span>
          </p>
          <ProgressBar value={doneInRequired.length} max={total} label="目指す状態までの進み具合" />
        </div>
      </section>

      {/* 2. 最初の一歩 */}
      <FirstStepSection model={model} viewer={viewer} variant="list" />

      {/* 3. 会員登録の案内（未ログイン かつ 入口レッスンが会員限定の割合が高いとき） */}
      {showMemberNotice && <MemberNotice redirectTo={redirectTo} />}

      {/* 4. ゴールまでの道筋（状態が2つ以上のときだけ） */}
      {total > 1 && <PathSection model={model} viewer={viewer} variant="list" />}

      {/* 5. やり直し */}
      <RestartActions goal={goal} onEditChecked={onEditChecked} onRestart={onRestart} />

      {/* モバイルの固定ボタン（セーフエリア分の余白をとる） */}
      <StickyStartBar model={model} viewer={viewer} variant="list" />
    </div>
  );
}
