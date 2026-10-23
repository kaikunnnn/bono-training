"use client";

import { LampOn, People, Timer1 } from "iconsax-react";
import { cn } from "@/lib/utils";
import {
  ASSIGNMENTS,
  ME,
  ONE_STEP_AHEAD,
  PEERS,
  RECEIVED,
  REACTIONS,
  REGULAR_PEER_IDS,
  assignmentLabel,
  findPeer,
  formatAgo,
  lastActivityMinutes,
  statusLabel,
  type PatternKey,
  type Peer,
  type TodayStatus,
} from "../_data";
import { PeerAvatar } from "./PeerAvatar";
import { ReactionButton } from "./ReactionButton";
import { ReceivedNote } from "./ReceivedNote";
import { Thumb } from "./Thumb";

export interface PatternProps {
  isActive: (pattern: PatternKey, peerId: string) => boolean;
  countOf: (pattern: PatternKey, peerId: string) => number;
  toggle: (pattern: PatternKey, peerId: string) => void;
}

const CARD =
  "rounded-[20px] border border-[var(--card-border-subtle)] bg-surface shadow-[var(--shadow-board-card)]";

function PatternHeader({
  pattern,
  titleId,
  title,
  lead,
  icon,
  showReceived = true,
}: {
  pattern: PatternKey;
  titleId: string;
  title: React.ReactNode;
  lead?: string;
  icon: React.ReactNode;
  showReceived?: boolean;
}) {
  const r = REACTIONS[pattern];
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div>
        <h2
          id={titleId}
          className="flex items-center gap-2 font-heading text-[26px] font-bold leading-tight text-text-primary"
        >
          {icon}
          {title}
        </h2>
        {lead && <p className="mt-1.5 text-sm text-text-muted">{lead}</p>}
      </div>
      {showReceived && (
        <ReceivedNote
          emoji={r.emoji}
          label={r.label}
          fromIds={RECEIVED[pattern]}
        />
      )}
    </header>
  );
}

function Reaction({
  pattern,
  peer,
  props,
}: {
  pattern: PatternKey;
  peer: Peer;
  props: PatternProps;
}) {
  const r = REACTIONS[pattern];
  return (
    <ReactionButton
      emoji={r.emoji}
      label={r.label}
      count={props.countOf(pattern, peer.id)}
      active={props.isActive(pattern, peer.id)}
      onToggle={() => props.toggle(pattern, peer.id)}
      targetName={peer.name}
    />
  );
}

/* ------------------------------------------------------------------ */
/* A 同期フィード：タイムライン縦1列（約640px）＋右に小さなサイド欄 */

export function PatternA(props: PatternProps) {
  const feed = PEERS.filter(
    (p) => p.status.kind !== "notYet" && p.todayWork,
  ).sort(
    (x, y) => lastActivityMinutes(x.status) - lastActivityMinutes(y.status),
  );
  const notYet = PEERS.filter((p) => p.status.kind === "notYet");
  return (
    <section aria-labelledby="pattern-a-title">
      <PatternHeader
        pattern="a"
        titleId="pattern-a-title"
        icon={
          <People size={26} color="currentColor" variant="Bulk" aria-hidden />
        }
        title={`同期 ${PEERS.length}人のきょう`}
        lead="新しい順に流れます"
        showReceived={false}
      />
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <ul className="flex w-full max-w-[640px] flex-col gap-4">
          {feed.map((peer) => (
            <li key={peer.id} className={cn(CARD, "p-5")}>
              <div className="flex items-start gap-3">
                <PeerAvatar person={peer} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-base font-bold text-text-primary">
                      {peer.name}
                    </h3>
                    <span className="text-xs text-text-muted">
                      {peer.status.kind === "working"
                        ? `${peer.status.sinceMinutes}分前から作業中`
                        : formatAgo(lastActivityMinutes(peer.status))}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-text-muted">
                    {assignmentLabel(peer.assignmentNo)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[15px] text-text-primary">
                {peer.todayWork}
              </p>
              <Thumb
                className="mt-3 aspect-video"
                caption={assignmentLabel(peer.assignmentNo)}
              />
              <div className="mt-4">
                <Reaction pattern="a" peer={peer} props={props} />
              </div>
            </li>
          ))}
        </ul>

        <aside
          aria-label="あなたへの反応と同期"
          className="flex w-full flex-col gap-4 lg:sticky lg:top-6 lg:w-[280px]"
        >
          <div className={cn(CARD, "p-4")}>
            <p className="text-xs font-bold text-text-muted">あなたへの反応</p>
            <div className="mt-2">
              <ReceivedNote
                emoji={REACTIONS.a.emoji}
                label={REACTIONS.a.label}
                fromIds={RECEIVED.a}
              />
            </div>
          </div>
          <div className={cn(CARD, "p-4")}>
            <p className="text-xs font-bold text-text-muted">
              {ME.startedWeek}に始めた同期
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {PEERS.map((p) => (
                <li
                  key={p.id}
                  className="flex w-12 flex-col items-center gap-1"
                >
                  <PeerAvatar
                    person={p}
                    size="sm"
                    dim={p.status.kind === "notYet"}
                  />
                  <span className="text-[length:var(--text-2xs)] text-text-muted">
                    {p.name}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[length:var(--text-2xs)] text-text-muted">
              今日はまだ：{notYet.map((p) => p.name).join("・")}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* B いま作業中：作業中3人を3列のカード、作業していない5人は下に小さく */

export function restLabel(status: TodayStatus) {
  return status.kind === "done" ? "今日は終了" : "今日はまだ";
}

export function PatternB(props: PatternProps) {
  const working = PEERS.filter((p) => p.status.kind === "working");
  const resting = PEERS.filter((p) => p.status.kind !== "working");
  return (
    <section aria-labelledby="pattern-b-title">
      <div className="text-center">
        <h2
          id="pattern-b-title"
          className="font-heading text-[34px] font-bold leading-snug text-text-primary"
        >
          同期の <span className="text-success">{working.length}人</span>が
          いま作業中
        </h2>
        <div className="mt-3 flex justify-center">
          <ReceivedNote
            emoji={REACTIONS.b.emoji}
            label={REACTIONS.b.label}
            fromIds={RECEIVED.b}
          />
        </div>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {working.map((peer) => {
          const since =
            peer.status.kind === "working" ? peer.status.sinceMinutes : 0;
          return (
            <li
              key={peer.id}
              className={cn(
                CARD,
                "flex flex-col items-center px-5 py-7 text-center",
              )}
            >
              <PeerAvatar person={peer} size="lg" live />
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {peer.name}
              </h3>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-text-success">
                <Timer1 size={16} color="currentColor" aria-hidden />
                {since}分前から
              </p>
              <p className="mt-1 text-xs leading-snug text-text-muted">
                課題{peer.assignmentNo} {ASSIGNMENTS[peer.assignmentNo]}
              </p>
              <div className="mt-5">
                <Reaction pattern="b" peer={peer} props={props} />
              </div>
            </li>
          );
        })}
      </ul>

      <h3 className="mt-10 text-sm font-bold text-text-muted">
        いま作業していない同期（{resting.length}人）
      </h3>
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-4">
        {resting.map((peer) => (
          <li key={peer.id} className="flex items-center gap-2">
            <PeerAvatar person={peer} size="sm" dim />
            <span className="flex flex-col">
              <span className="text-sm text-text-muted">{peer.name}</span>
              <span className="text-[length:var(--text-2xs)] text-text-muted">
                {restLabel(peer.status)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* C 1歩先の人：カード2枚を横並び（大きいサムネ＋目立つ詰まりメモ） */

export function PatternC(props: PatternProps) {
  return (
    <section aria-labelledby="pattern-c-title">
      <PatternHeader
        pattern="c"
        titleId="pattern-c-title"
        icon={
          <LampOn size={26} color="currentColor" variant="Bulk" aria-hidden />
        }
        title="あなたの1歩先にいる同期"
        lead={`いまのあなたと同じ ${assignmentLabel(ME.assignmentNo)} を先に終えた人です`}
      />
      <ul className="mt-6 grid gap-5 md:grid-cols-2">
        {ONE_STEP_AHEAD.map((item) => {
          const peer = findPeer(item.peerId);
          if (!peer) return null;
          return (
            <li key={peer.id} className={cn(CARD, "flex flex-col p-5")}>
              <div className="flex items-center gap-3">
                <PeerAvatar person={peer} size="md" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-text-primary">
                    {peer.name}
                  </h3>
                  <p className="text-sm text-text-muted">
                    課題{ME.assignmentNo}を{item.finishedDaysAgo}
                    日前に終えました
                  </p>
                </div>
              </div>
              <Thumb
                className="mt-4 aspect-[4/3]"
                caption={`${peer.name}さんの完成品｜${assignmentLabel(ME.assignmentNo)}`}
              />
              <div className="mt-4 flex-1 rounded-[16px] border border-[var(--reaction-active-border)] bg-[var(--reaction-active-bg)] p-4">
                <p className="text-xs font-bold text-text-link">
                  詰まったところ
                </p>
                <p className="mt-1.5 text-lg font-bold leading-relaxed text-text-primary">
                  {item.stuckNote}
                </p>
                <p className="mt-1 text-[15px] leading-relaxed text-text-secondary">
                  → {item.howSolved}
                </p>
              </div>
              <div className="mt-4">
                <Reaction pattern="c" peer={peer} props={props} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* D いつもいる人：横に広い行（アバター・名前・7日ドット・今日の状態・反応） */

const DAY_LABELS = [
  "6日前",
  "5日前",
  "4日前",
  "3日前",
  "2日前",
  "昨日",
  "今日",
];

export function DayDots({ days }: { days: boolean[] }) {
  const doneCount = days.filter(Boolean).length;
  return (
    <span className="flex items-center gap-1.5">
      <span className="sr-only">直近7日のうち{doneCount}日やった</span>
      {days.map((d, i) => (
        <span
          key={DAY_LABELS[i]}
          aria-hidden
          className={cn(
            "h-3 w-3 rounded-full",
            d
              ? "bg-success"
              : "border border-[var(--reaction-border)] bg-surface",
            i === days.length - 1 && "ring-2 ring-success/25",
          )}
        />
      ))}
    </span>
  );
}

export function StatusChip({ status }: { status: TodayStatus | "me" }) {
  if (status === "me") {
    return (
      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-text-secondary">
        今日{ME.todayMinutes}分・休憩中
      </span>
    );
  }
  const label = status.kind === "working" ? "いま作業中" : statusLabel(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
        status.kind === "working" && "bg-success-feedback text-text-success",
        status.kind === "done" && "bg-muted text-text-secondary",
        status.kind === "notYet" &&
          "bg-surface text-text-muted ring-1 ring-[var(--reaction-border)]",
      )}
    >
      {status.kind === "working" && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-success motion-safe:animate-pulse"
          aria-hidden
        />
      )}
      {label}
    </span>
  );
}

const ROW =
  "grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 px-5 py-4 md:grid-cols-[auto_minmax(120px,1fr)_160px_150px_170px]";

export function PatternD(props: PatternProps) {
  const regulars = REGULAR_PEER_IDS.map(findPeer).filter((p): p is Peer =>
    Boolean(p),
  );
  return (
    <section aria-labelledby="pattern-d-title">
      <PatternHeader
        pattern="d"
        titleId="pattern-d-title"
        icon={
          <People size={26} color="currentColor" variant="Bulk" aria-hidden />
        }
        title="いつもいる同期"
        lead="同じ週に始めた人から自動で選ばれています"
      />
      <div className={cn(CARD, "mt-6 overflow-hidden")}>
        <div
          aria-hidden
          className={cn(
            ROW,
            "hidden border-b border-[var(--card-border-subtle)] py-2.5 text-xs text-text-muted md:grid",
          )}
        >
          <span className="w-9" />
          <span>名前</span>
          <span>直近7日（右が今日）</span>
          <span>今日</span>
          <span />
        </div>
        <ul>
          <li
            className={cn(
              ROW,
              "border-b border-[var(--card-border-subtle)] bg-muted/50",
            )}
          >
            <PeerAvatar person={ME} size="sm" />
            <h3 className="text-base font-bold text-text-primary">
              あなた（{ME.name}）
            </h3>
            <DayDots days={ME.last7Days} />
            <span className="col-start-2 md:col-start-auto">
              <StatusChip status="me" />
            </span>
            <span className="hidden md:block" />
          </li>
          {regulars.map((peer) => (
            <li
              key={peer.id}
              className={cn(
                ROW,
                "border-b border-[var(--card-border-subtle)] last:border-b-0",
              )}
            >
              <PeerAvatar
                person={peer}
                size="sm"
                dim={peer.status.kind === "notYet"}
              />
              <h3 className="text-base font-bold text-text-primary">
                {peer.name}
              </h3>
              <DayDots days={peer.last7Days} />
              <span className="col-start-2 md:col-start-auto">
                <StatusChip status={peer.status} />
              </span>
              <span className="justify-self-end">
                <Reaction pattern="d" peer={peer} props={props} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
