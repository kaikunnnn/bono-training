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
 * - 見出し: h1「スキルマップ診断」/ h2 = 各画面の問い・地図・結果の各セクション / h3 = 地図の段階の行・詳細の見出し。
 * - 進捗「質問 1／2」「質問 2／2」。ブラウザの戻るで前の画面へ。
 */

import { useEffect, useRef, useState, type RefObject } from "react";
import { ArrowRight, ChevronLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { useDesktop } from "@/hooks/use-mobile";
import { SKILL_STATES, type SkillStateId } from "@/lib/content-guide/skill-states";
import { SHORT_TITLES, STAGE_GROUPS } from "@/lib/content-guide/display";
import { hasPrerequisites, prerequisitesOf } from "@/lib/content-guide/path";
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
import { MapLegend, SkillMap } from "./SkillMap";
import { resultCardClass } from "./ResultSections";
import type { Viewer } from "./query";

function statusNote(mode: MapMode, state: NodeState): string {
  if (state.locked) return "チェックした状態の前提なので、できている扱いです（外せません）";
  if (mode === "check") {
    if (state.status === "done") return "できている。もう一度押すと外せます";
    if (state.status === "selectable") return "押すと「できる」になります";
    if (state.status === "goal") return "目指す状態";
    return "今回の目標には関係しない状態";
  }
  if (mode === "result") {
    if (state.status === "current") return state.isGoal ? "目指す状態に、そのまま取り組めます" : "ここから始めます（最初の一歩）";
    if (state.status === "done") return "できている";
    if (state.status === "goal") return "目指す状態（ゴール）";
    if (state.status === "upcoming") return "ゴールまでの道筋で、これから身につける状態";
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
        <p className="inline-flex items-center gap-1 text-xs font-bold text-text-secondary">
          {state.locked && <Lock aria-hidden="true" className="size-3" />}
          {note}
        </p>
      )}
      <div className="rounded-[12px] bg-muted-custom px-3 py-2.5">
        {lessons[0] ? (
          <>
            <p className="text-[11px] font-bold text-text-muted">
              {entry.coverage === "×" || entry.coverage === "△" ? "近い内容のレッスン" : "入口のレッスン"}
              {lessons.length > 1 && `（ほか${lessons.length - 1}件）`}
            </p>
            <p className="text-sm font-bold leading-6 text-text-primary">{lessons[0].title}</p>
            <LessonMeta lesson={lessons[0]} viewer={viewer} />
          </>
        ) : (
          <p className="text-xs text-text-muted">この状態にぴったりの教材は準備中です。</p>
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

  const detailPanel = (
    <aside
      aria-labelledby="content-guide-map-detail-heading"
      className={cn(resultCardClass, "lg:sticky lg:top-6")}
      data-detail-panel
    >
      {selected ? (
        <>
          <p className="text-xs font-bold text-text-muted">詳細</p>
          <h3
            id="content-guide-map-detail-heading"
            className="mt-1 font-heading text-lg font-bold leading-7 text-text-primary"
          >
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
          <p className="mt-1 text-xs leading-5 text-text-muted">
            {mode === "pick"
              ? "地図のスキルを押すと、ここに詳しい内容が出ます。"
              : mode === "check"
                ? "押したスキルの詳しい内容が、ここに出ます。"
                : "地図のスキルを押すと、詳しい内容とレッスンが出ます。"}
          </p>
        </>
      )}
    </aside>
  );

  const mapBlock = (opts: { heading: string; legend: Parameters<typeof MapLegend>[0]["statuses"]; ref?: boolean }) => (
    <section aria-labelledby="content-guide-map-heading" className="space-y-3" data-map-block>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2
          id="content-guide-map-heading"
          ref={opts.ref ? (headingRef as RefObject<HTMLHeadingElement | null>) : undefined}
          tabIndex={opts.ref ? -1 : undefined}
          className="font-heading text-lg font-bold leading-7 text-text-primary outline-none sm:text-xl"
        >
          {opts.heading}
        </h2>
      </div>
      <MapLegend statuses={opts.legend} />
      <SkillMap
        states={states}
        interaction={mode === "check" ? "active" : "all"}
        selectedId={selected}
        onNodeClick={handleNodeClick}
        showStageCounts={mode !== "pick"}
        toggleMode={mode === "check"}
      />
    </section>
  );

  let main: React.ReactNode;
  let withPanel = false;
  if (diagnosing) {
    main = <DiagnosingScreen headingRef={headingRef} />;
  } else if (query.step === "intro") {
    main = (
      <div className="space-y-6" data-screen="intro">
        <section aria-labelledby="content-guide-map-intro" className={cn(resultCardClass, "sm:p-8")}>
          <h2
            id="content-guide-map-intro"
            ref={headingRef as RefObject<HTMLHeadingElement | null>}
            tabIndex={-1}
            className="font-heading text-xl font-bold leading-8 text-text-primary outline-none sm:text-2xl"
          >
            18のスキルの地図で、いまの位置と最初の一歩を診断します
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            質問は2つ。なりたい状態を地図から選び、もうできることを押すと、地図が塗られて、最初に始めるレッスンがわかります。答えは保存されません。
          </p>
          <Button type="button" size="large" className="mt-6 w-full sm:w-auto" onClick={goPick}>
            診断をはじめる
            <ArrowRight aria-hidden="true" />
          </Button>
        </section>
        <section aria-labelledby="content-guide-map-overview" className="space-y-3">
          <h2 id="content-guide-map-overview" className="font-heading text-base font-bold leading-6 text-text-primary">
            スキルマップの全体像
          </h2>
          <SkillMap states={states} interaction="none" />
        </section>
      </div>
    );
  } else if (query.step === "goal") {
    withPanel = true;
    main = (
      <div className="space-y-4" data-screen="q1">
        <div className="space-y-1">
          <h2
            id="content-guide-map-q1"
            ref={headingRef as RefObject<HTMLHeadingElement | null>}
            tabIndex={-1}
            className="font-heading text-xl font-bold leading-8 text-text-primary outline-none sm:text-2xl"
          >
            どんなスキルの状態になりたい？
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            地図のスキルを押して、詳しく見てから「これを目標にする」を選んでください。
          </p>
        </div>
        <SkillMap states={states} interaction="all" selectedId={selected} onNodeClick={handleNodeClick} />
        <Button type="button" variant="ghost" size="large" onClick={goIntro}>
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
        <div className="rounded-[16px] bg-muted-custom px-4 py-3">
          <p className="text-xs text-text-muted">目指す状態</p>
          <p className="mt-0.5 text-sm font-bold leading-6 text-text-primary">{SHORT_TITLES[goal]}</p>
        </div>
        <div className="space-y-1">
          <h2
            id="content-guide-map-q2"
            ref={headingRef as RefObject<HTMLHeadingElement | null>}
            tabIndex={-1}
            className="font-heading text-xl font-bold leading-8 text-text-primary outline-none sm:text-2xl"
          >
            もうできていることは？
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            押せるのは、目標の前提になるスキルだけ。できるものを押してください（なくてもOK）。その前提も、できている扱いになります。
          </p>
        </div>
        <MapLegend statuses={["goal", "done", "selectable", "inactive"]} />
        <SkillMap
          states={states}
          interaction="active"
          selectedId={selected}
          onNodeClick={handleNodeClick}
          showStageCounts
          toggleMode
        />
        {/* モバイル: 押したスキルの詳細を地図の下に（Q2 はタップが付け外しのため、シートにしない） */}
        {selected && !isDesktop && (
          <div className={cn(resultCardClass, "p-4")} data-inline-detail>
            <p className="text-sm font-bold text-text-primary">{SHORT_TITLES[selected]}</p>
            <div className="mt-2">
              <NodeDetailBody id={selected} state={states[selected]} mode="check" viewer={viewer} />
            </div>
          </div>
        )}
        <p className="text-sm font-bold text-text-secondary" aria-live="polite">
          できている {doneCount}／{checkCandidates.length}
        </p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="ghost" size="large" onClick={goPick}>
            目標を選び直す
          </Button>
          <Button
            type="button"
            size="large"
            className="whitespace-normal"
            onClick={() => showResult(goal, latest.current)}
          >
            {doneCount === 0 ? "まだどれもできない。診断する" : "診断する"}
          </Button>
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
        before={mapBlock({
          heading: "診断結果: あなたのスキルマップ",
          legend: ["done", "current", "upcoming", "goal", "inactive"],
          ref: true,
        })}
        onRestart={goPick}
        onEditChecked={() => navigate({ ...query, step: "check" })}
      />
    );
  }

  const questionIndex = query.step === "goal" ? 1 : query.step === "check" ? 2 : null;
  const questionTotal = query.goal !== null && !hasPrerequisites(query.goal) ? 1 : 2;
  const selectedState = selected ? states[selected] : null;

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="mx-auto w-full min-w-0 max-w-[1120px] px-4 py-8 sm:px-6 sm:py-12">
        <div className="max-w-[752px]">
          <DevControls
            viewer={viewer}
            onViewer={handleViewer}
            variant="map"
            carry={{ goal: query.goal, checked: query.checked, isResult: query.step === "result" }}
          />
          <header className="mt-6">
            <p className="text-xs font-bold tracking-wider text-text-muted">コンテンツガイド</p>
            <h1 className="mt-1 font-heading text-2xl font-bold leading-snug text-text-primary sm:text-3xl">
              スキルマップ診断
            </h1>
          </header>
          {questionIndex !== null && !diagnosing && (
            <QuestionProgress className="mt-5" current={questionIndex} total={questionTotal} />
          )}
        </div>

        <div
          className={cn(
            "mt-6",
            withPanel && !diagnosing ? "lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-6" : "max-w-[752px]"
          )}
        >
          <div
            className="min-w-0 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300"
            key={diagnosing ? "diagnosing" : stepKey}
          >
            {main}
          </div>
          {withPanel && !diagnosing && isDesktop && <div className="hidden lg:block">{detailPanel}</div>}
        </div>
      </div>

      {/* モバイル: 下から出る詳細シート（Q1・結果） */}
      {!isDesktop && mode !== "check" && (
        <Drawer open={sheetOpen && selected !== null} onOpenChange={setSheetOpen} shouldScaleBackground={false}>
          <DrawerContent className="rounded-t-[20px] border-[var(--card-border-subtle)] bg-surface">
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
    </div>
  );
}
