import { getBookmarkedArticles } from "@/lib/services/bookmarks";
import { traceServerStep } from "@/lib/performance/server-trace";
import { BookmarksPreview, BookmarksFull } from "./BookmarksSectionClient";

const PREVIEW_LIMIT = 4;

export async function BookmarksSection({
  userId,
  mode,
}: {
  userId: string;
  mode: "preview" | "full";
}) {
  const bookmarks = await traceServerStep("mypage.bookmarks", () =>
    getBookmarkedArticles(
      userId,
      mode === "preview" ? PREVIEW_LIMIT : undefined
    )
  );

  if (mode === "preview") {
    return <BookmarksPreview bookmarks={bookmarks} />;
  }
  return <BookmarksFull bookmarks={bookmarks} />;
}
