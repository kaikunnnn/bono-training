/**
 * 未経験から転職 v3 の部品（#243）
 * - PortfolioStrip: ポートフォリオの帯。区切りを進むごとに1つずつ埋まる
 * - PathMap: 最初の画面の地図（5つの区切り＋つくるものの小さな画像）
 * - StageStatusTag: 完了／いまここ
 */

import Link from "next/link";
import { ArrowRight, Check, Plus } from "lucide-react";
import { Flag } from "iconsax-react";
import { cn } from "@/lib/utils";
import {
  EXPLAIN_AT,
  PORTFOLIO_PIECES,
  type PortfolioPiece,
  type V3Stage,
} from "../../../data/roadmap-career-change-v3";
import { T } from "../../../template/kari";
import { pad2 } from "../../../template/shared";
import WorkMock from "./WorkMock";

export const CLICKABLE =
  "border border-border-light bg-surface shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-border-default hover:shadow-[var(--shadow-md)]";

export type StageStatus = "plain" | "done" | "current" | "todo";

export function stageStatus(i: number, done: number | null): StageStatus {
  if (done === null) return "plain";
  if (i < done) return "done";
  if (i === done) return "current";
  return "todo";
}

export function StageStatusTag({ status }: { status: StageStatus }) {
  if (status === "done")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-text-success px-2 py-0.5 text-[11px] font-bold text-text-inverse">
        <Check size={11} strokeWidth={3.5} />
        完了
      </span>
    );
  if (status === "current")
    return <span className="rounded-full bg-text-primary px-2 py-0.5 text-[11px] font-bold text-text-inverse">いまここ</span>;
  return null;
}

/* ---------- ポートフォリオの帯 ---------- */

type PieceState = "filled" | "new" | "empty";

function PieceTile({
  piece,
  state,
  explained,
  explainedNew,
  size,
}: {
  piece: PortfolioPiece;
  state: PieceState;
  explained: boolean;
  explainedNew: boolean;
  size: "sm" | "lg";
}) {
  const empty = state === "empty";
  return (
    <li className={cn("flex shrink-0 snap-start flex-col gap-2", size === "lg" ? "w-[46%] sm:w-auto" : "w-[42%] sm:w-auto")}>
      <div className="relative">
        {empty ? (
          <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[12px] border-2 border-dashed border-border-default text-text-disabled">
            <Plus size={18} strokeWidth={2} />
          </div>
        ) : (
          <WorkMock
            kind={piece.mock}
            compact
            rounded="rounded-[12px]"
            className={cn(state === "new" && "outline outline-2 outline-offset-2 outline-text-primary")}
          />
        )}
        {state === "new" ? (
          <span className="absolute -top-2 left-2 rounded-full bg-text-primary px-2 py-0.5 text-[10px] font-bold text-text-inverse">
            ＋ ここで入る
          </span>
        ) : null}
        {explained && !empty ? (
          <span
            className={cn(
              "absolute bottom-1.5 right-1.5 rounded-full px-1.5 py-px text-[10px] font-bold",
              explainedNew ? "bg-text-primary text-text-inverse" : "bg-[var(--bg-base)] text-text-secondary"
            )}
          >
            説明ページつき
          </span>
        ) : null}
      </div>
      <div className="min-w-0">
        <p className={cn("text-xs font-bold leading-[1.5]", empty ? "text-text-disabled" : "text-text-primary")}>{piece.label}</p>
        <p className={cn("text-[11px] leading-[1.5]", empty ? "text-text-disabled" : "text-text-muted")}>
          <T f={piece.sub} />
        </p>
      </div>
    </li>
  );
}

/**
 * mode
 * - stage: その区切りの時点（それより前＝入っている、その区切り＝新しく入る、後＝空き）
 * - progress: 会員の今（done 個の区切りを終えた時点）
 * - final: 完成
 */
export function PortfolioStrip({
  mode,
  at = 0,
  size = "sm",
  className,
}: {
  mode: "stage" | "progress" | "final";
  at?: number;
  size?: "sm" | "lg";
  className?: string;
}) {
  return (
    <ol
      className={cn(
        "-mx-1 flex snap-x scroll-px-1 gap-3 overflow-x-auto px-1 pb-2 pt-3 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0",
        className
      )}
    >
      {PORTFOLIO_PIECES.map((piece) => {
        let state: PieceState;
        let explained: boolean;
        let explainedNew = false;
        if (mode === "final") {
          state = "filled";
          explained = piece.featured;
        } else if (mode === "progress") {
          state = piece.addedAt < at ? "filled" : "empty";
          explained = at > EXPLAIN_AT && piece.featured;
        } else {
          state = piece.addedAt < at ? "filled" : piece.addedAt === at ? "new" : "empty";
          explained = at >= EXPLAIN_AT && piece.featured;
          explainedNew = at === EXPLAIN_AT;
        }
        return (
          <PieceTile key={piece.id} piece={piece} state={state} explained={explained} explainedNew={explainedNew} size={size} />
        );
      })}
    </ol>
  );
}

/** 区切りで新しく入るもの（地図の1行に使う） */
export function piecesAddedAt(i: number) {
  return PORTFOLIO_PIECES.filter((p) => p.addedAt === i);
}

/* ---------- 地図 ---------- */

/** スマホは2列（5つ＋行き先で3段）、PCは横に5つ並べて行き先を下に */
export function PathMap({ stages, done, destination }: { stages: V3Stage[]; done: number | null; destination: React.ReactNode }) {
  return (
    <ol className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
      {stages.map((stage, i) => {
        const status = stageStatus(i, done);
        const added = piecesAddedAt(i);
        const addLine =
          added.length > 0 ? added.map((p) => p.label).join("、") : i === EXPLAIN_AT ? "3作品に説明ページ" : "";
        return (
          <li key={stage.short} className="min-w-0">
            <a
              href={`#stage-${i + 1}`}
              className={cn(
                "group flex h-full flex-col gap-2 rounded-[16px] p-2.5 md:gap-3 md:rounded-[20px] md:p-3",
                CLICKABLE,
                status === "current" && "border-text-primary hover:border-text-primary",
                status === "done" && "opacity-80"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-latin text-[13px] font-bold tracking-[0.06em] text-text-muted">{pad2(i + 1)}</span>
                <StageStatusTag status={status} />
                <span className="ml-auto hidden text-[11px] text-text-muted sm:inline">
                  <T f={stage.period} />
                </span>
              </div>
              <WorkMock kind={stage.make.mock} compact rounded="rounded-[12px]" />
              <div>
                <p className="font-heading text-[15px] font-bold leading-[1.4]">{stage.short}</p>
                <p className="text-[11px] text-text-muted">{stage.kind === "course" ? "コース" : "コースの外"}</p>
              </div>
              {addLine ? (
                <p className="mt-auto flex items-start gap-1 border-t border-border-light pt-2 text-[11px] font-bold leading-[1.5] text-text-primary md:text-[12px]">
                  <Plus size={13} strokeWidth={3} className="mt-[3px] shrink-0" />
                  {addLine}
                </p>
              ) : null}
            </a>
          </li>
        );
      })}
      <li className="min-w-0 md:col-span-5">
        <div className="flex h-full flex-col gap-2 rounded-[16px] bg-[var(--persona-hero-surface)] p-3 md:flex-row md:items-center md:gap-3 md:rounded-[20px] md:px-4">
          <Flag size={20} color="currentColor" variant="Bold" className="shrink-0" />
          <div>
            <p className="text-[11px] font-bold text-text-muted">行き先</p>
            <p className="text-[13px] font-bold leading-[1.6] md:text-[15px]">{destination}</p>
          </div>
        </div>
      </li>
    </ol>
  );
}

/** 外部・内部リンクのチップ（押せる＝白） */
export function LinkChip({ label, href }: { label: string; href: string }) {
  const external = href.startsWith("http");
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      className={cn("group inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold", CLICKABLE)}
    >
      {label}
      <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
