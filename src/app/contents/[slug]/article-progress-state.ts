export type ArticleCompletionOverrides = ReadonlyMap<string, boolean>;

/**
 * Merge a deferred server snapshot with completion changes made while it was
 * loading. This prevents a late response from undoing the optimistic UI.
 */
export function mergeCompletedArticleIds(
  serverCompletedArticleIds: readonly string[],
  overrides: ArticleCompletionOverrides,
): string[] {
  const completed = new Set(serverCompletedArticleIds);

  for (const [articleId, isCompleted] of overrides) {
    if (isCompleted) completed.add(articleId);
    else completed.delete(articleId);
  }

  return [...completed];
}
