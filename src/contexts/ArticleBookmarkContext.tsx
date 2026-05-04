'use client';

import { createContext, useContext } from 'react';

export interface ArticleBookmarkContextValue {
  /** BookmarkButton がトグル後に呼ぶコールバック */
  onBookmarkChange: (isBookmarked: boolean) => void;
  /** 共有されるブックマーク状態（複数ボタン同期用） */
  sharedIsBookmarked: boolean | null;
}

export const ArticleBookmarkContext =
  createContext<ArticleBookmarkContextValue | null>(null);

export function useArticleBookmark(): ArticleBookmarkContextValue {
  const ctx = useContext(ArticleBookmarkContext);
  if (!ctx) {
    throw new Error(
      'useArticleBookmark must be used within ArticleBookmarkContext.Provider'
    );
  }
  return ctx;
}

export function useArticleBookmarkOptional(): ArticleBookmarkContextValue | null {
  return useContext(ArticleBookmarkContext);
}
