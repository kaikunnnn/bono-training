'use client';

import { createContext, useContext } from 'react';

export type CompletionLevel = 'article' | 'quest' | 'lesson';

export interface ArticleCompletionContextValue {
  /** CompletionButton が完了トグル後に呼ぶコールバック */
  onCompletionChange: (isCompleted: boolean) => void;
  /** 直近の完了検知レベル（null = 未検知 / セレブレーション消費済み） */
  completionLevel: CompletionLevel | null;
  /** クエスト完了時のクエストタイトル */
  completedQuestTitle: string | null;
  /** レッスン完了時のレッスンタイトル */
  completedLessonTitle: string | null;
  /** セレブレーション消費後にリセット（BON-136 で使用） */
  resetCompletionLevel: () => void;
}

export const ArticleCompletionContext =
  createContext<ArticleCompletionContextValue | null>(null);

export function useArticleCompletion(): ArticleCompletionContextValue {
  const ctx = useContext(ArticleCompletionContext);
  if (!ctx) {
    throw new Error(
      'useArticleCompletion must be used within ArticleCompletionContext.Provider'
    );
  }
  return ctx;
}

export function useArticleCompletionOptional(): ArticleCompletionContextValue | null {
  return useContext(ArticleCompletionContext);
}
