import { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/subscription";
import { MyPageShell, type TabId } from "./MyPageShell";
import { ProgressSection } from "./sections/ProgressSection";
import { BookmarksSection } from "./sections/BookmarksSection";
import { HistorySection } from "./sections/HistorySection";
import { ProgressSkeleton } from "./skeletons/ProgressSkeleton";
import { BookmarksSkeleton } from "./skeletons/BookmarksSkeleton";
import { HistorySkeleton } from "./skeletons/HistorySkeleton";

export const metadata: Metadata = {
  title: "マイページ",
  description: "あなたの学習ダッシュボード",
};

const VALID_TABS = new Set<TabId>(["all", "progress", "favorite", "history"]);

function parseTab(value: string | string[] | undefined): TabId {
  const t = typeof value === "string" ? value : "all";
  return VALID_TABS.has(t as TabId) ? (t as TabId) : "all";
}

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?reauth=1&redirectTo=/mypage");
  }

  const params = await searchParams;
  const tab = parseTab(params.tab);

  const showProgress = tab === "all" || tab === "progress";
  const showBookmarks = tab === "all" || tab === "favorite";
  const showHistory = tab === "all" || tab === "history";

  const progressMode: "preview" | "full" = tab === "progress" ? "full" : "preview";
  const bookmarksMode: "preview" | "full" = tab === "favorite" ? "full" : "preview";
  const historyMode: "preview" | "full" = tab === "history" ? "full" : "preview";

  return (
    <MyPageShell activeTab={tab}>
      {showProgress && (
        <Suspense fallback={<ProgressSkeleton mode={progressMode} />}>
          <ProgressSection userId={user.id} mode={progressMode} />
        </Suspense>
      )}
      {showBookmarks && (
        <Suspense fallback={<BookmarksSkeleton mode={bookmarksMode} />}>
          <BookmarksSection userId={user.id} mode={bookmarksMode} />
        </Suspense>
      )}
      {showHistory && (
        <Suspense fallback={<HistorySkeleton mode={historyMode} />}>
          <HistorySection userId={user.id} mode={historyMode} />
        </Suspense>
      )}
    </MyPageShell>
  );
}
