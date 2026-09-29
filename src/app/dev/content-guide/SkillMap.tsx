"use client";

/**
 * A案: スキルマップ＝星空（12_診断UI_A案B案_仕様書 §4-1 / 13_夜明けデザイン仕様書 §6）。
 *
 * - 夜空の面（不透明な --dawn-night）の上に、段階（基礎／実践／応用）ごとの3つの星座（行）。行の中はチップ状の星が折り返す。
 * - ノード = 短い見出し（1行）+ アイコン。長い文は出さない（詳細パネル／シートでだけ）。押せるノードは高さ44px以上。
 * - 状態は色と形（アイコン・枠線の種類・塗り・順番の数字）の両方で区別し、aria-label にも状態を入れる。凡例つき:
 *   選べる = 淡い星（☆）／ゴール = 太陽（旗の意味: 行き先）／できている = 灯った星（暖色で塗り＋チェック・光が滲む）／
 *   いまここ = 明け方の一番星（白く強調・脈動）／これから = 光の道（破線の暖色の枠＋道筋の順番）／対象外 = 小さく淡く（押せない）
 * - 文字は必ず不透明な面（行・チップ）の上。水平線の光（装飾）は行の外側だけ。
 * - 動き（いまここの脈動・灯るときの光の滲み）は motion-safe のみ。
 */

import { Star1, Sun1, TickCircle } from "iconsax-react";
import { Lock } from "lucide-react";
import type { SkillStateId } from "@/lib/content-guide/skill-states";
import { SHORT_TITLES, STAGE_GROUPS } from "@/lib/content-guide/display";
import { NODE_STATUS_LABELS, type NodeState, type NodeStatus } from "@/lib/content-guide/map-state";
import { cn } from "@/lib/utils";

export type NodeInteraction = "none" | "all" | "active";

/** 凡例の言葉（夜明けの比喩 + 状態の言葉） */
export const NODE_LEGEND_LABELS: Record<NodeStatus, string> = {
  selectable: "選べる星",
  goal: "ゴール（太陽）",
  done: "できている（灯った星）",
  current: "いまここ（一番星）",
  upcoming: "これから（光の道）",
  inactive: "対象外",
};

interface SkillMapProps {
  states: Record<SkillStateId, NodeState>;
  /** none: 押せない（導入の全体像）／all: すべて押せる／active: 対象外以外だけ押せる（Q2・結果） */
  interaction: NodeInteraction;
  selectedId?: SkillStateId | null;
  onNodeClick?: (id: SkillStateId) => void;
  /** 行ごとに「灯っている n／m」を出す */
  showStageCounts?: boolean;
  /** Q2: ノードは「できる」の付け外し（aria-pressed） */
  toggleMode?: boolean;
  /** 結果: 道筋の順番（光の道）。いまここ = 1 */
  pathOrder?: Partial<Record<SkillStateId, number>>;
  /** 凡例に出す状態 */
  legend?: NodeStatus[];
  /** 夜空の面の上部に置く見出しなど（文字色は --dawn-star） */
  header?: React.ReactNode;
}

const nodeBase =
  "relative inline-flex max-w-full items-center gap-1 rounded-full border-2 text-left font-bold motion-safe:transition-[background-color,box-shadow,border-color] motion-safe:duration-300 motion-reduce:transition-none sm:gap-1.5";
const nodeSize = "min-h-11 px-2.5 py-2 text-xs leading-5 sm:px-3 sm:text-[13px]";
const nodeSizeSmall = "min-h-8 px-2 py-1 text-[11px] leading-4";

const statusClass: Record<NodeStatus, string> = {
  selectable: "border-[var(--dawn-line)] bg-[var(--dawn-predawn)] text-[var(--dawn-star)]",
  goal: "border-[var(--dawn-sun)] bg-[var(--dawn-sun-soft)] text-[var(--dawn-ink)] shadow-[var(--dawn-sun-ring)]",
  done: "border-[var(--dawn-star-lit)] bg-[var(--dawn-star-lit)] text-[var(--dawn-ink)] shadow-[var(--dawn-star-glow)]",
  current: "border-[var(--dawn-star)] bg-[var(--dawn-star)] text-[var(--dawn-ink)]",
  upcoming: "border-dashed border-[var(--dawn-sunrise)] bg-[var(--dawn-predawn)] text-[var(--dawn-star)]",
  inactive: "border-transparent bg-[var(--dawn-night)] text-[var(--dawn-star-dim)]",
};

function NodeIcon({ state, small }: { state: NodeState; small?: boolean }) {
  const size = small ? 12 : 14;
  if (state.status === "done") return <TickCircle aria-hidden size={size} color="currentColor" variant="Bold" className="shrink-0" />;
  if (state.isGoal && state.status !== "current")
    return <Sun1 aria-hidden size={size} color="currentColor" variant="Bold" className="shrink-0 text-[var(--dawn-sun)]" />;
  if (state.status === "current") return <Star1 aria-hidden size={size} color="currentColor" variant="Bold" className="shrink-0" />;
  return <Star1 aria-hidden size={size} color="currentColor" variant="Linear" className="shrink-0" />;
}

export function nodeAriaLabel(id: SkillStateId, state: NodeState, order?: number): string {
  const parts: string[] = [NODE_STATUS_LABELS[state.status]];
  if (state.isGoal && state.status !== "goal") parts.push("ゴール");
  if (state.locked) parts.push("前提として連動");
  if (order !== undefined) parts.push(`道筋の${order}番目`);
  return `${SHORT_TITLES[id]}（${parts.join("・")}）`;
}

/** 凡例（色だけに頼らない: アイコンと枠の種類を並べる）。夜空の面の上に置く */
export function MapLegend({ statuses }: { statuses: NodeStatus[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[var(--dawn-star-dim)]">
      <span className="font-bold">凡例</span>
      <ul className="flex flex-wrap gap-x-3 gap-y-2">
        {statuses.map((s) => (
          <li key={s} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn("inline-flex h-5 w-7 items-center justify-center rounded-full border-2 shadow-none", statusClass[s])}
            >
              <NodeIcon state={{ status: s, isGoal: s === "goal", locked: false }} small />
            </span>
            <span className="text-[var(--dawn-star)]">{NODE_LEGEND_LABELS[s]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SkillMap({
  states,
  interaction,
  selectedId,
  onNodeClick,
  showStageCounts = false,
  toggleMode = false,
  pathOrder,
  legend,
  header,
}: SkillMapProps) {
  return (
    <div className="relative isolate overflow-hidden rounded-[24px] bg-[var(--dawn-night)] p-2.5 sm:p-4" data-skill-map>
      {/* 水平線の光（装飾。行の外側の下端だけ） */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24"
        style={{ backgroundImage: "var(--dawn-horizon-glow)" }}
      />
      {header && <div className="px-1.5 pb-2 pt-1">{header}</div>}
      {legend && legend.length > 0 && (
        <div className="px-1.5 pb-2.5 pt-1">
          <MapLegend statuses={legend} />
        </div>
      )}
      <div className="space-y-2">
        {STAGE_GROUPS.map((group) => {
          const doneCount = group.stateIds.filter((id) => states[id].status === "done").length;
          return (
            <section
              key={group.id}
              aria-labelledby={`content-guide-map-row-${group.id}`}
              className="rounded-[18px] bg-[var(--dawn-night-raised)] p-3 sm:p-4"
            >
              <div className="mb-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <h3
                  id={`content-guide-map-row-${group.id}`}
                  className="font-heading text-[15px] font-bold leading-6 text-[var(--dawn-star)]"
                >
                  {group.title}
                </h3>
                <span className="text-xs text-[var(--dawn-star-dim)]">
                  {group.stageLabel}・{group.stateIds.length}個
                </span>
                {showStageCounts && (
                  <span className="ml-auto text-xs font-bold text-[var(--dawn-star-dim)]">
                    灯っている {doneCount}／{group.stateIds.length}
                  </span>
                )}
              </div>
              <ul className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {group.stateIds.map((id) => {
                  const state = states[id];
                  const clickable =
                    interaction === "all" || (interaction === "active" && state.status !== "inactive");
                  const small = state.status === "inactive" && interaction !== "all";
                  const isSelected = selectedId === id;
                  const order = pathOrder?.[id];
                  const inner = (
                    <>
                      {state.status === "current" && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -inset-1 rounded-full border-2 border-[var(--dawn-star)]/50 motion-safe:animate-pulse"
                        />
                      )}
                      <NodeIcon state={state} small={small} />
                      <span className="min-w-0">{SHORT_TITLES[id]}</span>
                      {order !== undefined && state.status !== "current" && (
                        <span
                          aria-hidden="true"
                          className="ml-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--dawn-night)] font-latin text-[10px] text-[var(--dawn-star)]"
                        >
                          {order}
                        </span>
                      )}
                      {state.locked && <Lock aria-hidden="true" className="size-3 shrink-0" />}
                    </>
                  );
                  return (
                    <li key={id} className="max-w-full" data-node-id={id} data-status={state.status}>
                      {clickable ? (
                        <button
                          type="button"
                          onClick={() => onNodeClick?.(id)}
                          aria-label={nodeAriaLabel(id, state, order)}
                          aria-pressed={toggleMode ? state.status === "done" : undefined}
                          aria-disabled={toggleMode && state.locked ? true : undefined}
                          aria-current={!toggleMode && isSelected ? "true" : undefined}
                          className={cn(
                            nodeBase,
                            nodeSize,
                            statusClass[state.status],
                            "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dawn-star)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dawn-night-raised)]",
                            state.status === "selectable" && "hover:border-[var(--dawn-star-dim)]",
                            isSelected && "outline-2 outline-offset-2 outline-dotted outline-[var(--dawn-star)]"
                          )}
                        >
                          {inner}
                        </button>
                      ) : (
                        <span
                          aria-label={nodeAriaLabel(id, state, order)}
                          role="img"
                          className={cn(nodeBase, small ? nodeSizeSmall : nodeSize, statusClass[state.status])}
                        >
                          {inner}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
