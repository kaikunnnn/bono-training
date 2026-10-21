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

function PatternHeader({
  pattern,
  titleId,
  title,
  lead,
  icon,
}: {
  pattern: PatternKey;
  titleId: string;
  title: React.ReactNode;
  lead?: string;
  icon: React.ReactNode;
}) {
  const r = REACTIONS[pattern];
  return (
    <header className="px-4 pb-4 pt-5">
      <h2
        id={titleId}
        className="flex items-center gap-2 font-heading text-[22px] font-bold leading-tight text-text-primary"
      >
        {icon}
        {title}
      </h2>
      {lead && <p className="mt-1.5 text-xs text-text-muted">{lead}</p>}
      <div className="mt-3">
        <ReceivedNote
          emoji={r.emoji}
          label={r.label}
          fromIds={RECEIVED[pattern]}
        />
      </div>
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
/* A 同期フィード */

export function PatternA(props: PatternProps) {
  const feed = PEERS.filter(
    (p) => p.status.kind !== "notYet" && p.todayWork,
  ).sort(
    (x, y) => lastActivityMinutes(x.status) - lastActivityMinutes(y.status),
  );
  return (
    <section aria-labelledby="pattern-a-title">
      <PatternHeader
        pattern="a"
        titleId="pattern-a-title"
        icon={
          <People size={24} color="currentColor" variant="Bulk" aria-hidden />
        }
        title={`同期 ${PEERS.length}人のきょう`}
        lead={`${ME.startedWeek}に始めた人たちです`}
      />
      <ul className="flex flex-col gap-3 px-4 pb-6">
        {feed.map((peer) => (
          <li
            key={peer.id}
            className="rounded-[20px] border border-[var(--card-border-subtle)] bg-surface p-4 shadow-[var(--shadow-board-card)]"
          >
            <div className="flex items-start gap-3">
              <PeerAvatar person={peer} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-sm font-bold text-text-primary">
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
            <p className="mt-3 text-sm text-text-primary">{peer.todayWork}</p>
            <Thumb
              className="mt-3"
              caption={assignmentLabel(peer.assignmentNo)}
            />
            <div className="mt-3">
              <Reaction pattern="a" peer={peer} props={props} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* B いま作業中 */

function restLabel(status: TodayStatus) {
  return status.kind === "done" ? "今日は終了" : "今日はまだ";
}

export function PatternB(props: PatternProps) {
  const working = PEERS.filter((p) => p.status.kind === "working");
  const resting = PEERS.filter((p) => p.status.kind !== "working");
  return (
    <section aria-labelledby="pattern-b-title" className="pb-6">
      <div className="px-4 pb-2 pt-6 text-center">
        <div className="flex justify-center -space-x-2" aria-hidden>
          {working.map((p) => (
            <PeerAvatar
              key={p.id}
              person={p}
              size="sm"
              className="ring-2 ring-base"
            />
          ))}
        </div>
        <h2
          id="pattern-b-title"
          className="mt-3 font-heading text-[26px] font-bold leading-snug text-text-primary"
        >
          同期の <span className="text-success">{working.length}人</span>が
          <br />
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

      <ul className="mt-4 flex flex-col gap-3 px-4">
        {working.map((peer) => {
          const since =
            peer.status.kind === "working" ? peer.status.sinceMinutes : 0;
          return (
            <li
              key={peer.id}
              className="flex items-center gap-4 rounded-[20px] border border-[var(--card-border-subtle)] bg-surface p-4 shadow-[var(--shadow-board-card)]"
            >
              <PeerAvatar person={peer} size="md" live />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-text-primary">
                  {peer.name}
                </h3>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-text-success">
                  <Timer1 size={14} color="currentColor" aria-hidden />
                  {since}分前から
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-text-muted">
                  課題{peer.assignmentNo} {ASSIGNMENTS[peer.assignmentNo]}
                </p>
              </div>
              <Reaction pattern="b" peer={peer} props={props} />
            </li>
          );
        })}
      </ul>

      <h3 className="mt-6 px-4 text-xs font-bold text-text-muted">
        いま作業していない同期（{resting.length}人）
      </h3>
      <ul className="mt-3 grid grid-cols-5 gap-1 px-4">
        {resting.map((peer) => (
          <li
            key={peer.id}
            className="flex flex-col items-center gap-1 text-center"
          >
            <PeerAvatar person={peer} size="sm" dim />
            <span className="text-xs text-text-muted">{peer.name}</span>
            <span className="text-[length:var(--text-2xs)] text-text-muted">
              {restLabel(peer.status)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* C 1歩先の人 */

export function PatternC(props: PatternProps) {
  return (
    <section aria-labelledby="pattern-c-title">
      <PatternHeader
        pattern="c"
        titleId="pattern-c-title"
        icon={
          <LampOn size={24} color="currentColor" variant="Bulk" aria-hidden />
        }
        title="あなたの1歩先にいる同期"
        lead={`いまのあなたと同じ ${assignmentLabel(ME.assignmentNo)} を先に終えた人です`}
      />
      <ul className="flex flex-col gap-4 px-4 pb-6">
        {ONE_STEP_AHEAD.map((item) => {
          const peer = findPeer(item.peerId);
          if (!peer) return null;
          return (
            <li
              key={peer.id}
              className="rounded-[20px] border border-[var(--card-border-subtle)] bg-surface p-4 shadow-[var(--shadow-board-card)]"
            >
              <div className="flex items-center gap-3">
                <PeerAvatar person={peer} size="sm" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-text-primary">
                    {peer.name}
                  </h3>
                  <p className="text-xs text-text-muted">
                    課題{ME.assignmentNo}を{item.finishedDaysAgo}
                    日前に終えました
                  </p>
                </div>
              </div>
              <Thumb
                className="mt-3 aspect-[4/3]"
                caption={`${peer.name}さんの完成品｜${assignmentLabel(ME.assignmentNo)}`}
              />
              <div className="mt-3 rounded-[14px] border border-[var(--reaction-active-border)] bg-[var(--reaction-active-bg)] p-3.5">
                <p className="text-xs font-bold text-text-link">
                  詰まったところ
                </p>
                <p className="mt-1 text-[15px] font-bold leading-relaxed text-text-primary">
                  {item.stuckNote}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                  → {item.howSolved}
                </p>
              </div>
              <div className="mt-3">
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
/* D いつもいる人 */

const DAY_LABELS = [
  "6日前",
  "5日前",
  "4日前",
  "3日前",
  "2日前",
  "昨日",
  "今日",
];

function DayDots({ days }: { days: boolean[] }) {
  const doneCount = days.filter(Boolean).length;
  return (
    <span className="flex items-center gap-1">
      <span className="sr-only">直近7日のうち{doneCount}日やった</span>
      {days.map((d, i) => (
        <span
          key={DAY_LABELS[i]}
          aria-hidden
          className={cn(
            "h-2.5 w-2.5 rounded-full",
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

function StatusChip({ status }: { status: TodayStatus | "me" }) {
  if (status === "me") {
    return (
      <span className="rounded-full bg-muted px-2 py-0.5 text-[length:var(--text-2xs)] font-bold text-text-secondary">
        今日{ME.todayMinutes}分・休憩中
      </span>
    );
  }
  const label = status.kind === "working" ? "いま作業中" : statusLabel(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[length:var(--text-2xs)] font-bold",
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
          <People size={24} color="currentColor" variant="Bulk" aria-hidden />
        }
        title="いつもいる同期"
        lead="同じ週に始めた人から自動で選ばれています"
      />
      <div className="px-4 pb-6">
        <div className="mb-2 flex justify-end pr-1 text-[length:var(--text-2xs)] text-text-muted">
          直近7日（右が今日）
        </div>
        <ul className="overflow-hidden rounded-[20px] border border-[var(--card-border-subtle)] bg-surface shadow-[var(--shadow-board-card)]">
          <li className="flex items-center gap-3 border-b border-[var(--card-border-subtle)] bg-muted/50 p-4">
            <PeerAvatar person={ME} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-text-primary">
                  あなた（{ME.name}）
                </h3>
                <DayDots days={ME.last7Days} />
              </div>
              <div className="mt-1.5">
                <StatusChip status="me" />
              </div>
            </div>
          </li>
          {regulars.map((peer) => (
            <li
              key={peer.id}
              className="flex items-center gap-3 border-b border-[var(--card-border-subtle)] p-4 last:border-b-0"
            >
              <PeerAvatar
                person={peer}
                size="sm"
                dim={peer.status.kind === "notYet"}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-text-primary">
                    {peer.name}
                  </h3>
                  <DayDots days={peer.last7Days} />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <StatusChip status={peer.status} />
                  <Reaction pattern="d" peer={peer} props={props} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
