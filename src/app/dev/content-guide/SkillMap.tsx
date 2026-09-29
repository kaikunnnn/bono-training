"use client";

/**
 * A案: スキルマップ（12_診断UI_A案B案_仕様書 §4-1）。
 *
 * - 段階（基礎／実践／応用）ごとの3行。行の中はチップ状のノードが折り返す（モバイルでも横スクロールなし）。
 * - ノード = 短い見出し（1行）+ 概念アイコン（iconsax）。長い文は出さない（詳細パネル／シートでだけ）。高さ44px以上。
 * - 状態は色と形（アイコン・枠線の種類・塗り）の両方で区別し、aria-label にも状態を入れる。凡例つき。
 * - 「いまここ」は軽い脈動（motion-safe のみ。reduced-motion では動かない）。
 * - 行の見出しは h3（地図の見出し h2 は呼び出し側）。ノードは見出しではない（ボタン）。
 */

import { Flag, Location, TickCircle } from "iconsax-react";
import { Lock } from "lucide-react";
import { SKILL_STATES, type SkillStateId } from "@/lib/content-guide/skill-states";
import { SHORT_TITLES, STAGE_GROUPS } from "@/lib/content-guide/display";
import { NODE_STATUS_LABELS, type NodeState, type NodeStatus } from "@/lib/content-guide/map-state";
import { cn } from "@/lib/utils";
import { DOMAIN_ICONS } from "./DomainTag";

export type NodeInteraction = "none" | "all" | "active";

interface SkillMapProps {
  states: Record<SkillStateId, NodeState>;
  /** none: 押せない（導入の全体像）／all: すべて押せる／active: 対象外以外だけ押せる（Q2） */
  interaction: NodeInteraction;
  selectedId?: SkillStateId | null;
  onNodeClick?: (id: SkillStateId) => void;
  /** 行ごとに「できている n／m」を出す */
  showStageCounts?: boolean;
  /** Q2: ノードは「できる」の付け外し（aria-pressed） */
  toggleMode?: boolean;
}

const nodeBase =
  "relative inline-flex min-h-11 max-w-full items-center gap-1 rounded-full border-2 px-2.5 py-2 text-left text-xs font-bold leading-5 transition-colors sm:gap-1.5 sm:px-3 sm:text-[13px]";

const statusClass: Record<NodeStatus, string> = {
  selectable: "border-border bg-surface text-text-primary",
  goal: "border-cta-primary-bg bg-surface text-text-primary ring-4 ring-muted-strong",
  done: "border-transparent bg-muted-strong text-text-secondary",
  current: "border-cta-primary-bg bg-cta-primary-bg text-text-inverse",
  upcoming: "border-dashed border-border-default bg-surface text-text-primary",
  inactive: "border-transparent bg-muted-custom text-text-muted opacity-60",
};

function NodeIcon({ id, state }: { id: SkillStateId; state: NodeState }) {
  const common = { "aria-hidden": true, size: 14, color: "currentColor", className: "shrink-0 sm:size-4" } as const;
  if (state.status === "done") return <TickCircle {...common} variant="Bold" />;
  if (state.status === "current") return <Location {...common} variant="Bold" />;
  if (state.isGoal) return <Flag {...common} variant="Bold" />;
  const DomainIcon = DOMAIN_ICONS[SKILL_STATES[id].domain];
  return DomainIcon ? <DomainIcon {...common} /> : null;
}

export function nodeAriaLabel(id: SkillStateId, state: NodeState): string {
  const parts = [NODE_STATUS_LABELS[state.status]];
  if (state.isGoal && state.status !== "goal") parts.push("ゴール");
  if (state.locked) parts.push("前提として連動");
  return `${SHORT_TITLES[id]}（${parts.join("・")}）`;
}

export function SkillMap({
  states,
  interaction,
  selectedId,
  onNodeClick,
  showStageCounts = false,
  toggleMode = false,
}: SkillMapProps) {
  return (
    <div className="space-y-3" data-skill-map>
      {STAGE_GROUPS.map((group) => {
        const doneCount = group.stateIds.filter((id) => states[id].status === "done").length;
        return (
          <section
            key={group.id}
            aria-labelledby={`content-guide-map-row-${group.id}`}
            className="rounded-[20px] border border-[var(--card-border-subtle)] bg-surface p-3 sm:p-5"
          >
            <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <h3
                id={`content-guide-map-row-${group.id}`}
                className="font-heading text-[15px] font-bold leading-6 text-text-primary"
              >
                {group.title}
              </h3>
              <span className="text-xs text-text-muted">
                {group.stageLabel}・{group.stateIds.length}個
              </span>
              {showStageCounts && (
                <span className="ml-auto text-xs font-bold text-text-secondary">
                  できている {doneCount}／{group.stateIds.length}
                </span>
              )}
            </div>
            <ul className="flex flex-wrap gap-1.5 sm:gap-2">
              {group.stateIds.map((id) => {
                const state = states[id];
                const clickable =
                  interaction === "all" || (interaction === "active" && state.status !== "inactive");
                const isSelected = selectedId === id;
                const inner = (
                  <>
                    {state.status === "current" && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-1 rounded-full border-2 border-cta-primary-bg/40 motion-safe:animate-pulse"
                      />
                    )}
                    <NodeIcon id={id} state={state} />
                    <span className="min-w-0">{SHORT_TITLES[id]}</span>
                    {state.locked && <Lock aria-hidden="true" className="size-3 shrink-0" />}
                  </>
                );
                return (
                  <li key={id} className="max-w-full" data-node-id={id} data-status={state.status}>
                    {clickable ? (
                      <button
                        type="button"
                        onClick={() => onNodeClick?.(id)}
                        aria-label={nodeAriaLabel(id, state)}
                        aria-pressed={toggleMode ? state.status === "done" : undefined}
                        aria-disabled={toggleMode && state.locked ? true : undefined}
                        aria-current={!toggleMode && isSelected ? "true" : undefined}
                        className={cn(
                          nodeBase,
                          statusClass[state.status],
                          "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          state.status !== "current" && state.status !== "done" && "hover:border-primary/50",
                          state.status === "done" && "hover:bg-muted-strong/80",
                          isSelected && "outline-2 outline-offset-2 outline-text-primary outline-dotted"
                        )}
                      >
                        {inner}
                      </button>
                    ) : (
                      <span
                        aria-label={nodeAriaLabel(id, state)}
                        role="img"
                        className={cn(nodeBase, statusClass[state.status])}
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
  );
}

/** 凡例（色だけに頼らない: アイコンと枠の種類を並べる） */
export function MapLegend({ statuses }: { statuses: NodeStatus[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-text-secondary">
      <span className="font-bold text-text-muted">凡例</span>
      <ul className="flex flex-wrap gap-x-3 gap-y-2">
        {statuses.map((s) => (
          <li key={s} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn(
                "inline-flex h-5 w-7 items-center justify-center rounded-full border-2",
                statusClass[s].replace("ring-4", "ring-2")
              )}
            >
              {s === "done" && <TickCircle size={11} color="currentColor" variant="Bold" />}
              {s === "current" && <Location size={11} color="currentColor" variant="Bold" />}
              {s === "goal" && <Flag size={11} color="currentColor" variant="Bold" />}
            </span>
            {NODE_STATUS_LABELS[s]}
          </li>
        ))}
      </ul>
    </div>
  );
}
