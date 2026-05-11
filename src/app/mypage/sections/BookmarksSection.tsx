import { getBookmarkedArticles } from "@/lib/services/bookmarks";
import { BookmarksPreview, BookmarksFull } from "./BookmarksSectionClient";

export async function BookmarksSection({
  userId,
  mode,
}: {
  userId: string;
  mode: "preview" | "full";
}) {
  console.time("[mypage section] Bookmarks total");
  const bookmarks = await getBookmarkedArticles(userId);
  console.timeEnd("[mypage section] Bookmarks total");

  if (mode === "preview") {
    return <BookmarksPreview bookmarks={bookmarks} />;
  }
  return <BookmarksFull bookmarks={bookmarks} />;
}
