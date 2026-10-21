"use client";

import { Timer1 } from "iconsax-react";
import { cn } from "@/lib/utils";
import {
  ASSIGNMENTS,
  ME,
  ONE_STEP_AHEAD,
  PEERS,
  REACTIONS,
  REGULAR_PEER_IDS,
  assignmentLabel,
  findPeer,
  formatAgo,
  lastActivityMinutes,
  type PatternKey,
  type Peer,
} from "../../_data";
import { PeerAvatar } from "../../_components/PeerAvatar";
import { ReactionButton } from "../../_components/ReactionButton";
import { Thumb } from "../../_components/Thumb";
import {
  DayDots,
  StatusChip,
  restLabel,
  type PatternProps,
} from "../../_components/patterns";

const CARD =
  "rounded-[16px] border border-[var(--card-border-subtle)] bg-surface shadow-[var(--shadow-board-card)]";

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

/** A: 同期の投稿を3件（小さめサムネ） */
export function CompactA(props: PatternProps) {
  const feed = PEERS.filter((p) => p.status.kind !== "notYet" && p.todayWork)
    .sort(
      (x, y) => lastActivityMinutes(x.status) - lastActivityMinutes(y.status),
    )
    .slice(0, 3);
  return (
    <ul className="grid w-full gap-[10px] sm:grid-cols-3">
      {feed.map((peer) => (
        <li key={peer.id} className={cn(CARD, "flex flex-col p-3.5")}>
          <div className="flex items-center gap-2">
            <PeerAvatar person={peer} size="xs" />
            <h3 className="text-sm font-bold text-text-primary">{peer.name}</h3>
            <span className="truncate text-[length:var(--text-2xs)] text-text-muted">
              {peer.status.kind === "working"
                ? `${peer.status.sinceMinutes}分前から作業中`
                : formatAgo(lastActivityMinutes(peer.status))}
            </span>
          </div>
          <p className="mt-2 line-clamp-1 text-[13px] text-text-primary">
            {peer.todayWork}
          </p>
          <Thumb
            className="mt-2 aspect-[16/9] [&_svg]:hidden"
            caption={assignmentLabel(peer.assignmentNo)}
          />
          <div className="mt-2.5">
            <Reaction pattern="a" peer={peer} props={props} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** B: 同期の 3人が いま作業中 */
export function CompactB(props: PatternProps) {
  const working = PEERS.filter((p) => p.status.kind === "working");
  const resting = PEERS.filter((p) => p.status.kind !== "working");
  return (
    <div className="w-full">
      <p className="font-heading text-xl font-bold text-text-primary">
        同期の <span className="text-success">{working.length}人</span>が
        いま作業中
      </p>
      <ul className="mt-3 grid gap-[10px] sm:grid-cols-3">
        {working.map((peer) => {
          const since =
            peer.status.kind === "working" ? peer.status.sinceMinutes : 0;
          return (
            <li
              key={peer.id}
              className={cn(CARD, "flex items-start gap-3 p-3.5")}
            >
              <PeerAvatar person={peer} size="sm" live className="mt-1" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-text-primary">
                  {peer.name}
                </h3>
                <p className="inline-flex items-center gap-1 text-xs font-bold text-text-success">
                  <Timer1 size={13} color="currentColor" aria-hidden />
                  {since}分前から
                </p>
                <p className="truncate text-[length:var(--text-2xs)] text-text-muted">
                  課題{peer.assignmentNo} {ASSIGNMENTS[peer.assignmentNo]}
                </p>
                <div className="mt-2">
                  <Reaction pattern="b" peer={peer} props={props} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-xs text-text-muted">いま作業していない</span>
        {resting.map((peer) => (
          <span key={peer.id} className="inline-flex items-center gap-1.5">
            <PeerAvatar person={peer} size="xs" dim />
            <span className="text-xs text-text-muted">
              {peer.name}
              <span className="ml-1 text-[length:var(--text-2xs)]">
                {restLabel(peer.status)}
              </span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** C: 1歩先の人のカード2枚 */
export function CompactC(props: PatternProps) {
  return (
    <ul className="grid w-full gap-[10px] sm:grid-cols-2">
      {ONE_STEP_AHEAD.map((item) => {
        const peer = findPeer(item.peerId);
        if (!peer) return null;
        return (
          <li key={peer.id} className={cn(CARD, "flex flex-col p-4")}>
            <div className="flex items-center gap-2.5">
              <PeerAvatar person={peer} size="sm" />
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-text-primary">
                  {peer.name}
                </h3>
                <p className="text-xs text-text-muted">
                  課題{ME.assignmentNo}を{item.finishedDaysAgo}日前に終えました
                </p>
              </div>
            </div>
            <Thumb
              className="mt-3 aspect-[2/1]"
              caption={`${peer.name}さんの完成品｜${assignmentLabel(ME.assignmentNo)}`}
            />
            <div className="mt-3 flex-1 rounded-[12px] border border-[var(--reaction-active-border)] bg-[var(--reaction-active-bg)] px-3.5 py-3">
              <p className="text-[length:var(--text-2xs)] font-bold text-text-link">
                詰まったところ
              </p>
              <p className="mt-0.5 text-sm font-bold leading-relaxed text-text-primary">
                {item.stuckNote}
              </p>
              <p className="text-[13px] leading-relaxed text-text-secondary">
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
  );
}

const ROW =
  "grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1.5 px-4 py-3 sm:grid-cols-[auto_minmax(100px,1fr)_130px_130px_150px]";

/** D: 自分＋いつもいる3人の行 */
export function CompactD(props: PatternProps) {
  const regulars = REGULAR_PEER_IDS.map(findPeer).filter((p): p is Peer =>
    Boolean(p),
  );
  return (
    <div className={cn(CARD, "w-full overflow-hidden")}>
      <ul>
        <li
          className={cn(
            ROW,
            "border-b border-[var(--card-border-subtle)] bg-muted/50",
          )}
        >
          <PeerAvatar person={ME} size="xs" />
          <h3 className="text-sm font-bold text-text-primary">
            あなた（{ME.name}）
          </h3>
          <DayDots days={ME.last7Days} />
          <span className="col-start-2 sm:col-start-auto">
            <StatusChip status="me" />
          </span>
          <span className="hidden sm:block" />
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
              size="xs"
              dim={peer.status.kind === "notYet"}
            />
            <h3 className="text-sm font-bold text-text-primary">{peer.name}</h3>
            <DayDots days={peer.last7Days} />
            <span className="col-start-2 sm:col-start-auto">
              <StatusChip status={peer.status} />
            </span>
            <span className="justify-self-end">
              <Reaction pattern="d" peer={peer} props={props} />
            </span>
          </li>
        ))}
      </ul>
      <p className="border-t border-[var(--card-border-subtle)] px-4 py-2 text-right text-[length:var(--text-2xs)] text-text-muted">
        ドットは直近7日（右が今日）
      </p>
    </div>
  );
}
