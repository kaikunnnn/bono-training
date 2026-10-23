"use client";

import { useState } from "react";
import { DocumentText } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { findPendingLog } from "./state";
import { useDesignTogether } from "./ProtoProvider";

function formatClock(ms: number): string {
  const d = new Date(ms);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * 押し忘れの案内（機能A）。
 * 「作業を終える」を押さずに3時間たつと自動で終わりにし、次にマイページを開いたときにここで知らせる。
 * 「前回の日報を書く」は S2 で日報の入力につなぐ（S1 では仮）。
 */
export function PendingReportNotice() {
  const { state, dispatch } = useDesignTogether();
  const [showNote, setShowNote] = useState(false);
  const log = findPendingLog(state);
  if (!log) return null;

  return (
    <section
      aria-labelledby="pending-report-heading"
      className="flex flex-col gap-3 rounded-[20px] border border-[var(--card-border-subtle)] bg-surface p-4 sm:px-5"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-text-secondary" aria-hidden>
          <DocumentText size={20} color="currentColor" />
        </span>
        <div className="min-w-0">
          <h2 id="pending-report-heading" className="font-heading text-sm font-bold text-text-primary">
            前回の作業を、自動で終わりにしました
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">
            {formatClock(log.startedAt)}に始めた作業が3時間たったので、作業を終えたことにしました。
            {log.declaration && <>（今日やること: {log.declaration}）</>}
            どこまで進んだか、一言だけ残しておきませんか。
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:pl-8">
        <Button size="sm" onClick={() => setShowNote(true)}>
          前回の日報を書く
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-text-muted"
          onClick={() => dispatch({ type: "dismissPendingReport" })}
        >
          書かずに閉じる
        </Button>
        {showNote && (
          <p role="status" className="text-xs text-text-muted">
            日報の入力は次のスライスで作ります
          </p>
        )}
      </div>
    </section>
  );
}
