"use client";

import { useEffect } from "react";
import Link from "next/link";
import { IconButton } from "@/components/ui/button/IconButton";
import { DUMMY_BOOKMARKS, DUMMY_HISTORY, PROTO_FEED_TAB, PROTO_LESSONS, PROTO_MYPAGE } from "../data";
import { FeedFullList, FeedPostList, pickPreviewPosts } from "../FeedLists";
import { LiveNowBand } from "../LiveNowBand";
import { ProtoProgressCard } from "../ProtoProgressCard";
import { useProto } from "../ProtoProvider";
import { ProtoMySection } from "./ProtoMySection";
import { ProtoBookmarkRow, ProtoHistoryRow, ProtoRowList } from "./ProtoArticleRows";

export type ProtoTabId = "all" | "progress" | "feed" | "favorite" | "history";

const TABS: { id: ProtoTabId; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "progress", label: "進捗" },
  // #251 で追加: 進捗フィードの全件。通知からの戻り先
  { id: "feed", label: "みんな" },
  { id: "favorite", label: "お気に入り" },
  { id: "history", label: "閲覧履歴" },
];

function tabHref(id: ProtoTabId): string {
  return id === "all" ? PROTO_MYPAGE : `${PROTO_MYPAGE}?tab=${id}`;
}

/**
 * マイページの複製（src/app/mypage/MyPageShell.tsx ＋ sections/*）に進捗フィードを組み込んだもの。
 * データはダミー、計測は外している。見た目のクラス・inline style は本番のまま。
 */
export function ProtoMyPage({ activeTab }: { activeTab: ProtoTabId }) {
  const { state, dispatch } = useProto();

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
        {(activeTab === "all" || activeTab === "feed") && <LiveNowBand />}

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

            <ProtoMySection
              title="みんなの進捗"
              headingId="mypage-feed"
              viewAllHref={PROTO_FEED_TAB}
              note="節目を迎えたときだけ自動で流れます"
            >
              <FeedPostList posts={pickPreviewPosts(state.posts)} />
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

        {activeTab === "feed" && (
          <section aria-labelledby="mypage-feed-full" className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2
                id="mypage-feed-full"
                className="text-slate-950"
                style={{ fontFamily: "'Rounded Mplus 1c', sans-serif", fontSize: 16, fontWeight: 600, lineHeight: "24px" }}
              >
                みんなの進捗
              </h2>
              <p className="text-xs text-text-muted">節目を迎えたときだけ自動で流れます。応援が集まった投稿は上に戻ってきます</p>
            </div>
            <FeedFullList />
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
