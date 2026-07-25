import { getBookmarkedArticles } from "@/lib/services/bookmarks";
import { BookmarksPreview, BookmarksFull } from "./BookmarksSectionClient";

export async function BookmarksSection({
  userId,
  mode,
}: {
  userId: string;
  mode: "preview" | "full";
}) {
  const bookmarks = await getBookmarkedArticles(userId);

  if (mode === "preview") {
    return <BookmarksPreview bookmarks={bookmarks} />;
  }
  return <BookmarksFull bookmarks={bookmarks} />;
}
