"use client";

import { useEffect } from "react";
import Link from "next/link";
import { IconButton } from "@/components/ui/button/IconButton";
import { ProtoMySection } from "../../../progress-feed/_proto/mypage/ProtoMySection";
import { DT_MYPAGE, DUMMY_BOOKMARKS, DUMMY_HISTORY, PROTO_LESSONS } from "../data";
import { useDesignTogether } from "../ProtoProvider";
import { WorkingNowBand } from "../WorkingNowBand";
import { PendingReportNotice } from "../PendingReportNotice";
import { ProtoProgressCard } from "./ProtoProgressCard";
import { ProtoBookmarkRow, ProtoHistoryRow, ProtoRowList } from "./ProtoArticleRows";

export type ProtoTabId = "all" | "progress" | "favorite" | "history";

const TABS: { id: ProtoTabId; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "progress", label: "進捗" },
  { id: "favorite", label: "お気に入り" },
  { id: "history", label: "閲覧履歴" },
];

function tabHref(id: ProtoTabId): string {
  return id === "all" ? DT_MYPAGE : `${DT_MYPAGE}?tab=${id}`;
}

/**
 * マイページの複製（#251 の progress-feed/_proto/mypage/ProtoMyPage.tsx をコピー。元は src/app/mypage/MyPageShell.tsx ＋ sections/*）。
 * #251 で足した「今やっている人」「みんなの進捗」「みんな」タブは外し、
 * 見出しのすぐ下（スクロールせずに見える位置）に #253 の「いま作業中」の帯を入れた。
 * データはダミー、計測は外している。見た目のクラス・inline style は本番のまま。
 */
export function ProtoMyPage({ activeTab }: { activeTab: ProtoTabId }) {
  const { state, dispatch } = useDesignTogether();

  useEffect(() => {
    dispatch({ type: "visitMypage" });
  }, [dispatch]);

  const inProgress = PROTO_LESSONS.filter((l) =>
    l.quests.some((q) => q.articles.some((a) => !state.completedArticleIds.includes(a.id))),
  );

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

        {/* #253: いま作業中（見出しのすぐ下） */}
        <div className="mb-6 flex flex-col gap-3">
          <WorkingNowBand />
          <PendingReportNotice />
        </div>

        <div
          className="p-[3px] bg-zinc-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-black/5 inline-flex flex-wrap items-center gap-2"
          role="tablist"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tabHref(tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? "page" : undefined}
                scroll={false}
                className={`px-2 py-1.5 rounded-md flex justify-center items-center text-xs font-bold leading-3 transition-all ${
                  isActive
                    ? "bg-white text-black shadow-[0px_2px_2px_0px_rgba(0,0,0,0.04)]"
                    : "text-black/50 hover:text-black/70"
                }`}
                style={{ fontFamily: "'Rounded Mplus 1c', sans-serif" }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-8 max-w-3xl mx-auto space-y-6">
        {activeTab === "all" && (
          <>
            <ProtoMySection title="進行中" headingId="mypage-progress" viewAllHref={tabHref("progress")}>
              <div className="flex flex-col sm:flex-row gap-[10px] w-full">
                {inProgress.slice(0, 2).map((lesson) => (
                  <div key={lesson.id} className="flex-1 min-w-0">
                    <ProtoProgressCard lesson={lesson} />
                  </div>
                ))}
              </div>
            </ProtoMySection>

            <ProtoMySection title="お気に入り" headingId="mypage-bookmarks" viewAllHref={tabHref("favorite")}>
              <ProtoRowList>
                {DUMMY_BOOKMARKS.map((b) => (
                  <ProtoBookmarkRow key={b.id} {...b} />
                ))}
              </ProtoRowList>
            </ProtoMySection>

            <ProtoMySection title="閲覧履歴" headingId="mypage-history" viewAllHref={tabHref("history")}>
              <ProtoRowList>
                {DUMMY_HISTORY.map((h) => (
                  <ProtoHistoryRow key={h.id} {...h} />
                ))}
              </ProtoRowList>
            </ProtoMySection>
          </>
        )}

        {activeTab === "progress" && (
          <section aria-labelledby="mypage-progress-full" className="space-y-3">
            <h2 id="mypage-progress-full" className="text-sm font-semibold text-black/60 font-rounded-mplus">
              取り組み中
            </h2>
            {inProgress.map((lesson) => (
              <ProtoProgressCard key={lesson.id} lesson={lesson} />
            ))}
          </section>
        )}

        {activeTab === "favorite" && (
          <section aria-labelledby="mypage-bookmarks-full">
            <h2 id="mypage-bookmarks-full" className="sr-only">
              お気に入り
            </h2>
            <ProtoRowList>
              {DUMMY_BOOKMARKS.map((b) => (
                <ProtoBookmarkRow key={b.id} {...b} />
              ))}
            </ProtoRowList>
          </section>
        )}

        {activeTab === "history" && (
          <section aria-labelledby="mypage-history-full">
            <h2 id="mypage-history-full" className="sr-only">
              閲覧履歴
            </h2>
            <ProtoRowList>
              {DUMMY_HISTORY.map((h) => (
                <ProtoHistoryRow key={h.id} {...h} />
              ))}
            </ProtoRowList>
          </section>
        )}
      </div>
    </div>
  );
}
