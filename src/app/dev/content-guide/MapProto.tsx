"use client";

/**
 * A案: スキルマップ診断（12_診断UI_A案B案_仕様書 §4）。/dev/content-guide/map
 *
 * 導入（地図の全体像）→ Q1 どんなスキルの状態になりたい？（ノードをタップ → 詳細で「これを目標にする」）
 * → Q2 もうできていることは？（目標の前提だけ押せる。タップで「できる」を付け外し）→ 診断中…（約1.2秒）
 * → 診断結果（地図が結果の状態に塗られる + 要約 + 最初の一歩 + 道筋 + 会員案内 + やり直し）。
 *
 * - 詳細（元の長い文・段階・領域・無料/会員の目安）: デスクトップ（lg 以上）は地図の横のパネル、
 *   モバイルは下から出るシート（vaul Drawer）。Q2 はタップが付け外しなので、詳細はシートにせず地図の下に出す。
 *   結果（デスクトップ）は、星を押すまで詳細の枠を出さない（右の列は空けておき、押したら画面に追従するパネルで出す。閉じられる）。
 * - 見出し: h1「スキルマップ診断」/ h2 = 各画面の問い・地図・結果の各セクション / h3 = 地図の段階の行・詳細の見出し。
 * - 進捗「質問 1／2」「質問 2／2」。ブラウザの戻るで前の画面へ。
 *
 * 夜明けの表現（13_夜明けデザイン仕様書 §6）: ページのメイン領域が空（DawnSky）。地図は星空。
 * 進み具合（導入 → Q1 → Q2 の灯った数 → 日の出 → 結果の進み具合）で空が明ける。文字はすべて不透明なカード・夜空の面の上。
 * 結果は、要約と「最初の一歩」を先に、塗られた地図をその下に置く（モバイルのファーストビューに 行き先・進み具合・主ボタン）。
 */

import { useEffect, useRef, useState, type RefObject } from "react";
import { ArrowRight, ChevronLeft, Lock, X } from "lucide-react";
import { Sun1 } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { useDesktop } from "@/hooks/use-mobile";
import { SKILL_STATES, type SkillStateId } from "@/lib/content-guide/skill-states";
import { SHORT_TITLES, STAGE_GROUPS } from "@/lib/content-guide/display";
import { computePath, hasPrerequisites, prerequisitesOf } from "@/lib/content-guide/path";
import { computeSummary } from "@/lib/content-guide/summary";
import { LESSON_MAP, orderLessonsForResult } from "@/lib/content-guide/lesson-map";
import { mapNodeStates, type MapMode, type NodeState } from "@/lib/content-guide/map-state";
import { trackContentGuide } from "@/lib/content-guide/tracking";
import { cn } from "@/lib/utils";
import { DevControls } from "./DevControls";
import { DomainTag } from "./DomainTag";
import {
  DiagnosingScreen,
  FlowResult,
  QuestionProgress,
  useDiagnosing,
  useFlow,
  useStepFocus,
} from "./FlowShared";
import { LessonMeta } from "./LessonList";
import { SkillMap } from "./SkillMap";
import { DAWN_PANEL, DAWN_TEXT_OVERRIDES, DawnSky } from "./Dawn";
import type { Viewer } from "./query";

function statusNote(mode: MapMode, state: NodeState): string {
  if (state.locked) return "チェックした状態の前提なので、できている扱いです（外せません）";
  if (mode === "check") {
    if (state.status === "done") return "できている。光が灯っています（もう一度押すと外せます）";
    if (state.status === "selectable") return "できるなら、押すと星が灯ります";
    if (state.status === "goal") return "行き先（目指す状態）";
    return "今回の目標には関係しない状態";
  }
  if (mode === "result") {
    if (state.status === "current") return state.isGoal ? "行き先に、そのまま取り組めます" : "ここから始めます（最初の一歩・一番星）";
    if (state.status === "done") return "できている。もう灯っている光です";
    if (state.status === "goal") return "行き先（ゴール・太陽）";
    if (state.status === "upcoming") return "まだこれから。行き先までの光の道で身につける状態";
    return "今回の目標には関係しない状態";
  }
  return "";
}

/** 詳細の中身（パネル・シート共通） */
function NodeDetailBody({
  id,
  state,
  mode,
  viewer,
}: {
  id: SkillStateId;
  state: NodeState;
  mode: MapMode;
  viewer: Viewer;
}) {
  const skill = SKILL_STATES[id];
  const stage = STAGE_GROUPS.find((g) => g.stateIds.includes(id));
  const entry = LESSON_MAP[id];
  const lessons = orderLessonsForResult(entry.lessons);
  const note = statusNote(mode, state);
  return (
    <div className="space-y-3">
      <p className="text-sm leading-6 text-text-primary">{skill.label}</p>
      <div className="flex flex-wrap items-center gap-2">
        {stage && <span className="text-xs text-text-muted">{stage.stageLabel}</span>}
        <DomainTag domain={skill.domain} />
      </div>
      {note && (
        <p className="inline-flex items-center gap-1 text-sm font-bold leading-6 text-text-secondary">
          {state.locked && <Lock aria-hidden="true" className="size-3.5 shrink-0" />}
          {note}
        </p>
      )}
      <div className="rounded-[12px] bg-muted-custom px-3 py-2.5">
        {lessons[0] ? (
          <>
            <p className="text-xs font-bold text-text-muted">
              {entry.coverage === "×" || entry.coverage === "△" ? "近い内容のレッスン" : "入口のレッスン"}
              {lessons.length > 1 && `（ほか${lessons.length - 1}件）`}
            </p>
            <p className="text-sm font-bold leading-6 text-text-primary">{lessons[0].title}</p>
            <LessonMeta lesson={lessons[0]} viewer={viewer} />
          </>
        ) : (
          <p className="text-sm leading-6 text-text-muted">この状態にぴったりの教材は準備中です。</p>
        )}
      </div>
    </div>
  );
}

export function MapProto() {
  const { query, navigate } = useFlow("map");
  const stepKey = `${query.step}:${query.goal ?? ""}`;
  const headingRef = useStepFocus(stepKey);
  const { diagnosing, start } = useDiagnosing(stepKey);
  const isDesktop = useDesktop();
  const viewer = query.viewer;

  // 詳細で見ているノード（画面が変わったらリセット。URL には持たない）
  const [selected, setSelected] = useState<SkillStateId | null>(null);
  const [selectedFor, setSelectedFor] = useState(stepKey);
  if (selectedFor !== stepKey) {
    setSelectedFor(stepKey);
    setSelected(null);
  }
  const [sheetOpen, setSheetOpen] = useState(false);

  const mode: MapMode = query.step === "check" ? "check" : query.step === "result" ? "result" : "pick";
  const states = mapNodeStates(mode, query.goal, query.checked);

  const goIntro = () => navigate({ goal: null, checked: [], step: "intro", stage: null, viewer });
  const goPick = () => navigate({ goal: null, checked: [], step: "goal", stage: null, viewer });
  const showResult = (goal: SkillStateId, checked: SkillStateId[]) =>
    start(() => navigate({ goal, checked, step: "result", stage: null, viewer }));

  const chooseGoal = (goal: SkillStateId) => {
    setSheetOpen(false);
    trackContentGuide("content_guide_goal_select", {
      goal_state_id: goal,
      has_prerequisites: hasPrerequisites(goal),
      viewer,
      variant: "map",
    });
    if (hasPrerequisites(goal)) navigate({ goal, checked: [], step: "check", stage: null, viewer });
    else showResult(goal, []);
  };

  // Q2: 最新のチェック（URL の反映を待たずに次のタップへ使う。CheckStep と同じ考え方）
  const latest = useRef<SkillStateId[]>(query.checked);
  useEffect(() => {
    latest.current = query.checked;
  }, [query.checked]);

  const toggleDone = (id: SkillStateId) => {
    if (!query.goal) return;
    setSelected(id);
    const state = states[id];
    if (state.locked || state.status === "goal" || state.status === "inactive") return;
    const candidates = prerequisitesOf(query.goal);
    const set = new Set(latest.current);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    const next = candidates.filter((c) => set.has(c));
    latest.current = next;
    navigate({ ...query, checked: next }, "replace");
  };

  const handleNodeClick = (id: SkillStateId) => {
    if (mode === "check") {
      toggleDone(id);
      return;
    }
    setSelected(id);
    if (!isDesktop) setSheetOpen(true);
  };

  const handleViewer = (v: Viewer) => navigate({ ...query, viewer: v }, "replace");

  const checkCandidates = query.goal ? prerequisitesOf(query.goal) : [];
  const doneCount = checkCandidates.filter((id) => states[id]?.status === "done").length;

  // 夜明けの進み具合（13_ §2）: 導入 → Q1 → Q2（灯った数）→ 日の出 → 結果（ゴールまでの進み具合）
  let dawn = 0.05;
  if (diagnosing) dawn = 1;
  else if (query.step === "goal") dawn = 0.18;
  else if (query.step === "check") dawn = 0.3 + 0.35 * (checkCandidates.length ? doneCount / checkCandidates.length : 0);
  else if (query.step === "result" && query.goal) dawn = 0.8 + 0.2 * computeSummary(query.goal, query.checked).progress;

  // 結果: 道筋の順番（光の道）
  const pathOrder =
    mode === "result" && query.goal
      ? Object.fromEntries(computePath(query.goal, query.checked).path.map((id, i) => [id, i + 1]))
      : undefined;

  const detailPanel = (
    <aside aria-labelledby="content-guide-map-detail-heading" className={cn(DAWN_PANEL, "lg:sticky lg:top-6")} data-detail-panel>
      {selected ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-text-muted">詳細</p>
            {mode === "result" && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="-my-2 -mr-2 size-11"
                aria-label="詳細を閉じる"
                onClick={() => {
                  // 閉じたら、押した星へフォーカスを戻す（ボタンが消えてフォーカスが迷子にならないように）
                  const id = selected;
                  setSelected(null);
                  requestAnimationFrame(() =>
                    document.querySelector<HTMLButtonElement>(`[data-node-id="${id}"] button`)?.focus()
                  );
                }}
              >
                <X aria-hidden="true" />
              </Button>
            )}
          </div>
          <h3 id="content-guide-map-detail-heading" className="mt-1 font-heading text-lg font-bold leading-7 text-text-primary">
            {SHORT_TITLES[selected]}
          </h3>
          <div className="mt-3">
            <NodeDetailBody id={selected} state={states[selected]} mode={mode} viewer={viewer} />
          </div>
          {mode === "pick" && (
            <Button type="button" size="large" className="mt-4 w-full" onClick={() => chooseGoal(selected)}>
              これを目標にする
            </Button>
          )}
        </>
      ) : (
        <>
          <h3 id="content-guide-map-detail-heading" className="text-sm font-bold text-text-primary">
            詳細
          </h3>
          <p className="mt-1 text-sm leading-6 text-text-muted">
            {mode === "pick"
              ? "星を押すと、ここに詳しい内容が出ます。"
              : mode === "check"
                ? "押した星の詳しい内容が、ここに出ます。"
                : "星を押すと、詳しい内容とレッスンが出ます。"}
          </p>
        </>
      )}
    </aside>
  );

  const questionHeading = (id: string, text: string, desc: React.ReactNode) => (
    <div className="space-y-1">
      <h2
        id={id}
        ref={headingRef as RefObject<HTMLHeadingElement | null>}
        tabIndex={-1}
        className="font-heading text-xl font-bold leading-8 text-text-primary outline-none sm:text-2xl"
      >
        {text}
      </h2>
      <p className="text-sm leading-relaxed text-text-secondary">{desc}</p>
    </div>
  );

  let main: React.ReactNode;
  let withPanel = false;
  if (diagnosing) {
    main = <DiagnosingScreen headingRef={headingRef} />;
  } else if (query.step === "intro") {
    main = (
      <div className="space-y-5" data-screen="intro">
        <section aria-labelledby="content-guide-map-intro" className={cn(DAWN_PANEL, "sm:p-8")}>
          <h2
            id="content-guide-map-intro"
            ref={headingRef as RefObject<HTMLHeadingElement | null>}
            tabIndex={-1}
            className="font-heading text-xl font-bold leading-8 text-text-primary outline-none sm:text-2xl"
          >
            18のスキルの星空から、あなたの行き先と最初の一歩を見つけます
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            質問は2つ。なりたい状態（行き先）を選び、もうできることを押すと、星が灯り、夜が明けていきます。答えは保存されません。
          </p>
          <Button type="button" size="large" className="mt-6 w-full sm:w-auto" onClick={goPick}>
            診断をはじめる
            <ArrowRight aria-hidden="true" />
          </Button>
        </section>
        <SkillMap
          states={states}
          interaction="none"
          header={
            <h2 className="font-heading text-base font-bold leading-6 text-[var(--dawn-star)]">スキルの星空（全体像）</h2>
          }
        />
      </div>
    );
  } else if (query.step === "goal") {
    withPanel = true;
    main = (
      <div className="space-y-4" data-screen="q1">
        <div className={DAWN_PANEL}>
          {questionHeading(
            "content-guide-map-q1",
            "どんなスキルの状態になりたい？",
            "星を押して、詳しく見てから「これを目標にする」を選んでください。行き先が決まると、東の空が色づきます。"
          )}
        </div>
        <SkillMap states={states} interaction="all" selectedId={selected} onNodeClick={handleNodeClick} />
        <Button type="button" variant="outline" size="large" onClick={goIntro}>
          <ChevronLeft aria-hidden="true" />
          はじめに戻る
        </Button>
      </div>
    );
  } else if (query.goal && query.step === "check") {
    withPanel = true;
    const goal = query.goal;
    main = (
      <div className="space-y-4" data-screen="q2">
        <div className={DAWN_PANEL}>
          <div className="mb-4 flex items-center gap-2 rounded-[16px] bg-[var(--dawn-sun-soft)] px-4 py-3">
            <Sun1 aria-hidden="true" size={20} color="currentColor" variant="Bold" className="shrink-0 text-[var(--dawn-sun)]" />
            <div className="min-w-0">
              <p className="text-xs text-[var(--dawn-ink)]">行き先</p>
              <p className="text-sm font-bold leading-6 text-[var(--dawn-ink)]">{SHORT_TITLES[goal]}</p>
            </div>
          </div>
          {questionHeading(
            "content-guide-map-q2",
            "もうできていることは？",
            "押せるのは、行き先の前提になる星だけ。できることを押すと、星が灯ります（なくてもOK）。その前提も、一緒に灯ります。"
          )}
        </div>
        <SkillMap
          states={states}
          interaction="active"
          selectedId={selected}
          onNodeClick={handleNodeClick}
          showStageCounts
          toggleMode
          legend={["goal", "done", "selectable", "inactive"]}
        />
        {/* モバイル: 押したスキルの詳細を地図の下に（Q2 はタップが付け外しのため、シートにしない） */}
        {selected && !isDesktop && (
          <div className={cn(DAWN_PANEL, "p-4")} data-inline-detail>
            <p className="text-sm font-bold text-text-primary">{SHORT_TITLES[selected]}</p>
            <div className="mt-2">
              <NodeDetailBody id={selected} state={states[selected]} mode="check" viewer={viewer} />
            </div>
          </div>
        )}
        <div className={cn(DAWN_PANEL, "space-y-4")}>
          <p className="text-sm font-bold text-text-secondary" aria-live="polite">
            灯っている光 {doneCount}／{checkCandidates.length}
            <span className="ml-2 font-normal text-text-muted">
              {doneCount === 0 ? "まだこれから。ここから灯していけます" : "もう光があります"}
            </span>
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" size="large" onClick={goPick}>
              目標を選び直す
            </Button>
            <Button type="button" size="large" className="whitespace-normal" onClick={() => showResult(goal, latest.current)}>
              {doneCount === 0 ? "ここから始める。診断する" : "診断する"}
            </Button>
          </div>
        </div>
      </div>
    );
  } else if (query.goal && query.step === "result") {
    withPanel = true;
    main = (
      <FlowResult
        goal={query.goal}
        checked={query.checked}
        viewer={viewer}
        variant="map"
        headingRef={headingRef}
        afterFirstStep={
          <section aria-labelledby="content-guide-map-heading" data-map-block>
            <SkillMap
              states={states}
              interaction="active"
              selectedId={selected}
              onNodeClick={handleNodeClick}
              showStageCounts
              pathOrder={pathOrder}
              legend={["done", "current", "upcoming", "goal", "inactive"]}
              header={
                <div>
                  <h2
                    id="content-guide-map-heading"
                    className="font-heading text-lg font-bold leading-7 text-[var(--dawn-star)] sm:text-xl"
                  >
                    夜明けのスキルマップ
                  </h2>
                  <p className="mt-0.5 text-sm leading-6 text-[var(--dawn-star-dim)]">
                    灯った星が、あなたのいまの光。数字の順に、行き先の太陽まで光の道がつながります。
                  </p>
                </div>
              }
            />
          </section>
        }
        onRestart={goPick}
        onEditChecked={() => navigate({ ...query, step: "check" })}
      />
    );
  }

  const questionIndex = query.step === "goal" ? 1 : query.step === "check" ? 2 : null;
  const questionTotal = query.goal !== null && !hasPrerequisites(query.goal) ? 1 : 2;
  const selectedState = selected ? states[selected] : null;

  return (
    <DawnSky progress={dawn} durationMs={diagnosing ? 1200 : 900}>
      <div className="mx-auto w-full min-w-0 max-w-[1120px] px-4 py-8 sm:px-6 sm:py-12">
        <div className="max-w-[752px] space-y-3">
          <DevControls
            viewer={viewer}
            onViewer={handleViewer}
            variant="map"
            carry={{ goal: query.goal, checked: query.checked, isResult: query.step === "result" }}
          />
          <header className={cn(DAWN_PANEL, "py-4 sm:py-5")}>
            <p className="text-xs font-bold tracking-wider text-text-muted">コンテンツガイド</p>
            <h1 className="mt-1 font-heading text-2xl font-bold leading-snug text-text-primary sm:text-3xl">
              スキルマップ診断
            </h1>
            {questionIndex !== null && !diagnosing && (
              <QuestionProgress className="mt-3" current={questionIndex} total={questionTotal} />
            )}
          </header>
        </div>

        <div
          className={cn(
            "mt-5",
            withPanel && !diagnosing ? "lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-6" : "max-w-[752px]"
          )}
        >
          <div
            className="min-w-0 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500"
            key={diagnosing ? "diagnosing" : stepKey}
          >
            {main}
          </div>
          {/* 結果は星を押したときだけ出す（列は空けたまま＝メインの幅・位置は変わらない）。列を行の高さまで伸ばし、パネルを画面に追従させる */}
          {withPanel && !diagnosing && isDesktop && (mode !== "result" || selected !== null) && (
            <div className={cn("hidden lg:block", mode === "result" && "lg:self-stretch")}>{detailPanel}</div>
          )}
        </div>
      </div>

      {/* モバイル: 下から出る詳細シート（Q1・結果） */}
      {!isDesktop && mode !== "check" && (
        <Drawer open={sheetOpen && selected !== null} onOpenChange={setSheetOpen} shouldScaleBackground={false}>
          <DrawerContent
            className={cn(
              "rounded-t-[20px] border-[var(--card-border-subtle)] bg-surface",
              // シートは空の外（ポータル）に出るため、空と同じ上書きをここにも付ける（AA の補助文字・文字サイズ・reduced-motion）
              DAWN_TEXT_OVERRIDES,
              "motion-reduce:transition-none! motion-reduce:animate-none!"
            )}
            overlayClassName="motion-reduce:animate-none! motion-reduce:transition-none!"
          >
            {selected && selectedState && (
              <div className="max-h-[75vh] overflow-y-auto px-5 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
                <DrawerTitle className="font-heading text-lg font-bold leading-7 text-text-primary">
                  {SHORT_TITLES[selected]}
                </DrawerTitle>
                <DrawerDescription className="sr-only">スキルの詳しい内容</DrawerDescription>
                <div className="mt-3">
                  <NodeDetailBody id={selected} state={selectedState} mode={mode} viewer={viewer} />
                </div>
                <div className="mt-5 flex flex-col gap-2">
                  {mode === "pick" && (
                    <Button type="button" size="large" className="w-full" onClick={() => chooseGoal(selected)}>
                      これを目標にする
                    </Button>
                  )}
                  <Button type="button" variant="outline" size="large" className="w-full" onClick={() => setSheetOpen(false)}>
                    閉じる
                  </Button>
                </div>
              </div>
            )}
          </DrawerContent>
        </Drawer>
      )}
    </DawnSky>
  );
}
