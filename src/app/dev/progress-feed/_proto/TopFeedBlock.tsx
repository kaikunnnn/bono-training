"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PROTO_FEED_TAB, PROTO_LESSONS } from "./data";
import { FeedPostList, pickPreviewPosts } from "./FeedLists";
import { LiveNowBand } from "./LiveNowBand";
import { ProtoProgressCard } from "./ProtoProgressCard";
import { useProto } from "./ProtoProvider";

const headingStyle = {
  fontFamily: "'Rounded Mplus 1c', sans-serif",
  fontSize: 16,
  fontWeight: 600,
  lineHeight: "24px",
} as const;

/**
 * /top（会員表示）のヒーロー直下に置く進捗フィードのかたまり。
 * 会員は入会ボタンが出ないので、ヒーローの下が空く。そこに「今やっている人」「みんなの進捗」「続きから」を置く。
 * 左右の余白はヒーロー・PurposeNav と同じ px-6 lg:px-12。
 */
export function TopFeedBlock() {
  const { state, dispatch } = useProto();

  useEffect(() => {
    dispatch({ type: "visitMypage" });
  }, [dispatch]);

  const continueLesson =
    PROTO_LESSONS.find((l) => state.learning?.lessonId === l.id) ??
    PROTO_LESSONS.find((l) => l.quests.some((q) => q.articles.some((a) => !state.completedArticleIds.includes(a.id))));

  return (
    <div className="px-6 pb-10 lg:px-12">
      <LiveNowBand />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-[21px]">
        <section aria-labelledby="top-feed-heading" className="flex min-w-0 flex-col gap-3 lg:col-span-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <h2 id="top-feed-heading" className="text-slate-950" style={headingStyle}>
                みんなの進捗
              </h2>
              <span className="text-xs text-text-muted">節目を迎えたときだけ自動で流れます</span>
            </div>
            <Link
              href={PROTO_FEED_TAB}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-950/65 transition-colors hover:text-blue-600"
            >
              すべてみる
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <FeedPostList posts={pickPreviewPosts(state.posts)} />
        </section>

        {continueLesson && (
          <section aria-labelledby="top-continue-heading" className="flex min-w-0 flex-col gap-3">
            <h2 id="top-continue-heading" className="text-slate-950" style={headingStyle}>
              続きから
            </h2>
            <ProtoProgressCard lesson={continueLesson} />
          </section>
        )}
      </div>
    </div>
  );
}
