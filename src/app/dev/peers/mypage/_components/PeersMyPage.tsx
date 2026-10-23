"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit2 } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/button/IconButton";
import {
  BASE_COUNTS,
  ME,
  PEERS,
  RECEIVED,
  REACTIONS,
  assignmentLabel,
  type PatternKey,
} from "../../_data";
import type { PatternProps } from "../../_components/patterns";
import { ReceivedNote } from "../../_components/ReceivedNote";
import { ReturnDialog } from "../../_components/ReturnToTaskBar";
import { DUMMY_BOOKMARKS, DUMMY_HISTORY, PROTO_IN_PROGRESS } from "../_data";
import { CompactA, CompactB, CompactC, CompactD } from "./CompactPatterns";
import { ProtoBookmarkRow, ProtoHistoryRow, ProtoRowList } from "./ProtoArticleRows";
import { ProtoMySection } from "./ProtoMySection";
import { ProtoPatternSwitcher } from "./ProtoPatternSwitcher";
import { ProtoProgressCard } from "./ProtoProgressCard";

const TABS = [
  { id: "all", label: "すべて" },
  { id: "progress", label: "進捗" },
  { id: "favorite", label: "お気に入り" },
  { id: "history", label: "閲覧履歴" },
];

const BLOCK: Record<PatternKey, { title: string; note: string }> = {
  a: { title: `同期 ${PEERS.length}人のきょう`, note: `${ME.startedWeek}に始めた人たち` },
  b: { title: "同期のいま", note: `${ME.startedWeek}に始めた${PEERS.length}人` },
  c: { title: "あなたの1歩先にいる同期", note: `${assignmentLabel(ME.assignmentNo)}を先に終えた人` },
  d: { title: "いつもいる同期", note: "同じ週に始めた人から自動で選ばれています" },
};

const RETURN_LABEL: Record<PatternKey, string> = {
  a: "課題に戻る",
  b: "自分も作業にもどる",
  c: "課題に戻る",
  d: "課題に戻る",
};

/**
 * マイページの複製に「同期」ブロックを組み込んだ版（#255）。
 * ヘッダー・タブ・進行中/お気に入り/閲覧履歴は src/app/mypage/MyPageShell.tsx ＋ sections/* の複製（クラス・inline style は本番のまま）。
 * 足したのは、タブの下・進行中の上の「同期」ブロック、ブロック内右下の「課題に戻る」、右下のプロト用切り替えだけ。
 * マイページのタブはプロトでは「すべて」固定（押しても動かない）。
 */
export function PeersMyPage({ initialPattern }: { initialPattern: PatternKey }) {
  const [pattern, setPattern] = useState<PatternKey>(initialPattern);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [returnOpen, setReturnOpen] = useState(false);

  const selectPattern = (key: PatternKey) => {
    setPattern(key);
    // サーバーへの再取得を避けて URL だけ書き換える（Next.js は history.replaceState と連動する）
    window.history.replaceState(null, "", `?pattern=${key}`);
  };

  const props: PatternProps = {
    isActive: (p, id) => Boolean(sent[`${p}:${id}`]),
    countOf: (p, id) => (BASE_COUNTS[p][id] ?? 0) + (sent[`${p}:${id}`] ? 1 : 0),
    toggle: (p, id) => setSent((prev) => ({ ...prev, [`${p}:${id}`]: !prev[`${p}:${id}`] })),
  };

  const r = REACTIONS[pattern];
  // 本番の「すべてみる」は各タブへ。プロトではタブを動かさないので、いまのページのまま
  const selfHref = `/dev/peers/mypage?pattern=${pattern}`;
  const block = BLOCK[pattern];

  return (
    <div className="min-h-screen">
      {/* ヘッダー（MyPageShell と同じ） */}
      <div className="pt-10 pb-0 px-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold leading-6 font-rounded-mplus text-slate-950">マイページ</h1>
          <Link href="/profile">
            <IconButton icon={null} label="プロフィール" onClick={() => {}} />
          </Link>
        </div>

        {/* タブナビ（プロトでは「すべて」固定） */}
        <div
          className="p-[3px] bg-zinc-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-black/5 inline-flex items-center gap-2"
          role="tablist"
        >
          {TABS.map((tab) => {
            const isActive = tab.id === "all";
            return (
              <span
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                className={`px-2 py-1.5 rounded-md flex justify-center items-center text-xs font-bold leading-3 transition-all ${
                  isActive
                    ? "bg-white text-black shadow-[0px_2px_2px_0px_rgba(0,0,0,0.04)]"
                    : "text-black/50 hover:text-black/70"
                }`}
                style={{ fontFamily: "'Rounded Mplus 1c', sans-serif" }}
              >
                {tab.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-2 pb-8 max-w-3xl mx-auto space-y-6">
        {/* #255: 同期ブロック（進行中の上＝1画面目で見える位置） */}
        <ProtoMySection
          title={block.title}
          headingId="mypage-peers"
          note={block.note}
          viewAllHref={`/dev/peers?pattern=${pattern}`}
        >
          <ReceivedNote emoji={r.emoji} label={r.label} fromIds={RECEIVED[pattern]} />
          {pattern === "a" && <CompactA {...props} />}
          {pattern === "b" && <CompactB {...props} />}
          {pattern === "c" && <CompactC {...props} />}
          {pattern === "d" && <CompactD {...props} />}

          {/* 課題に戻る（ブロック内の右下。反応したその場から戻れる） */}
          <div className="mt-1 flex w-full flex-wrap items-center justify-end gap-x-4 gap-y-2">
            <p className="text-xs text-text-muted">
              休憩中：<span className="font-bold text-text-secondary">{assignmentLabel(ME.assignmentNo)}</span>
              ・今日は{ME.todayMinutes}分
            </p>
            <Button onClick={() => setReturnOpen(true)} aria-haspopup="dialog">
              <Edit2 size={16} color="currentColor" aria-hidden />
              {RETURN_LABEL[pattern]}
            </Button>
          </div>
        </ProtoMySection>

        <ProtoMySection title="進行中" headingId="mypage-progress" viewAllHref={selfHref}>
          <div className="flex flex-col sm:flex-row gap-[10px] w-full">
            {PROTO_IN_PROGRESS.map((lesson) => (
              <div key={lesson.id} className="flex-1 min-w-0">
                <ProtoProgressCard lesson={lesson} />
              </div>
            ))}
          </div>
        </ProtoMySection>

        <ProtoMySection title="お気に入り" headingId="mypage-bookmarks" viewAllHref={selfHref}>
          <ProtoRowList>
            {DUMMY_BOOKMARKS.map((b) => (
              <ProtoBookmarkRow key={b.id} {...b} />
            ))}
          </ProtoRowList>
        </ProtoMySection>

        <ProtoMySection title="閲覧履歴" headingId="mypage-history" viewAllHref={selfHref}>
          <ProtoRowList>
            {DUMMY_HISTORY.map((h) => (
              <ProtoHistoryRow key={h.id} {...h} />
            ))}
          </ProtoRowList>
        </ProtoMySection>
      </div>

      <ReturnDialog open={returnOpen} onOpenChange={setReturnOpen} />
      <ProtoPatternSwitcher value={pattern} onChange={selectPattern} />
    </div>
  );
}
