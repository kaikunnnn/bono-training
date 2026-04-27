"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================
// 型定義
// ============================================

export interface ArticleProgress {
  user_id: string;
  article_id: string;
  lesson_id: string;
  status: "not_started" | "in_progress" | "completed";
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonProgress {
  lessonId: string;
  totalArticles: number;
  completedArticles: number;
  percentage: number; // 0-100
  completedArticleIds: string[];
  lastUpdatedAt: string | null;
}

export type LessonStatus = "not_started" | "in_progress" | "completed";

// ============================================
// 記事の進捗管理
// ============================================

/**
 * 記事を完了状態にする（トグル）
 * @param articleId 記事ID (Sanity article._id)
 * @param lessonId レッスンID (Sanity lesson._id)
 * @returns {success: boolean, isCompleted: boolean, message: string}
 */
export async function toggleArticleCompletion(
  articleId: string,
  lessonId: string
): Promise<{ success: boolean; isCompleted: boolean; message: string }> {
  try {
    const supabase = await createClient();

    // 1. 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        isCompleted: false,
        message: "ログインが必要です",
      };
    }

    // 2. 既存の進捗を確認
    const { data: existing } = await supabase
      .from("article_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("article_id", articleId)
      .maybeSingle();

    if (existing && existing.status === "completed") {
      // 既に完了済み → 未完了に戻す
      const { error } = await supabase
        .from("article_progress")
        .update({
          status: "not_started",
          completed_at: null,
        })
        .eq("user_id", user.id)
        .eq("article_id", articleId);

      if (error) throw error;

      return {
        success: true,
        isCompleted: false,
        message: "未完了に戻しました",
      };
    } else if (existing) {
      // 進行中 → 完了にする
      const { error } = await supabase
        .from("article_progress")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("article_id", articleId);

      if (error) throw error;

      return {
        success: true,
        isCompleted: true,
        message: "完了にしました",
      };
    } else {
      // 未記録 → 完了として新規作成
      const { error } = await supabase.from("article_progress").insert({
        user_id: user.id,
        article_id: articleId,
        lesson_id: lessonId,
        status: "completed",
        completed_at: new Date().toISOString(),
      });

      if (error) throw error;

      return {
        success: true,
        isCompleted: true,
        message: "完了にしました",
      };
    }
  } catch (error) {
    console.error("Article progress error:", error);
    return {
      success: false,
      isCompleted: false,
      message: "エラーが発生しました",
    };
  }
}

/**
 * 記事の進捗状態を取得
 * @param articleId 記事ID
 * @returns 進捗状態（completed, in_progress, not_started）
 */
export async function getArticleProgress(
  articleId: string
): Promise<"completed" | "in_progress" | "not_started"> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return "not_started";

    const { data } = await supabase
      .from("article_progress")
      .select("status")
      .eq("user_id", user.id)
      .eq("article_id", articleId)
      .maybeSingle();

    return data?.status || "not_started";
  } catch (error) {
    console.error("Get article progress error:", error);
    return "not_started";
  }
}

/**
 * 記事IDが完了済みかどうかをチェック
 */
export async function isArticleCompleted(articleId: string): Promise<boolean> {
  const status = await getArticleProgress(articleId);
  return status === "completed";
}

// ============================================
// レッスンの進捗管理
// ============================================

/**
 * レッスンの進捗状況を取得
 * @param lessonId レッスンID
 * @param articleIds そのレッスンに含まれる全記事ID
 * @returns レッスンの進捗情報
 */
export async function getLessonProgress(
  lessonId: string,
  articleIds: string[]
): Promise<LessonProgress> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || articleIds.length === 0) {
      return {
        lessonId,
        totalArticles: articleIds.length,
        completedArticles: 0,
        percentage: 0,
        completedArticleIds: [],
        lastUpdatedAt: null,
      };
    }

    // そのレッスンの記事で完了しているものを取得
    const { data } = await supabase
      .from("article_progress")
      .select("article_id, updated_at")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .eq("status", "completed")
      .in("article_id", articleIds)
      .order("updated_at", { ascending: false });

    const completedArticleIds = data?.map((item) => item.article_id) || [];
    const completedCount = completedArticleIds.length;
    const percentage = Math.round((completedCount / articleIds.length) * 100);
    const lastUpdatedAt = data && data.length > 0 ? data[0].updated_at : null;

    return {
      lessonId,
      totalArticles: articleIds.length,
      completedArticles: completedCount,
      percentage,
      completedArticleIds,
      lastUpdatedAt,
    };
  } catch (error) {
    console.error("Get lesson progress error:", error);
    return {
      lessonId,
      totalArticles: articleIds.length,
      completedArticles: 0,
      percentage: 0,
      completedArticleIds: [],
      lastUpdatedAt: null,
    };
  }
}

/**
 * 複数のレッスンの進捗を一括取得（バッチクエリ版）
 * @param lessons レッスン情報の配列 { lessonId, articleIds }
 * @param userId オプション: 認証済みユーザーID
 * @returns レッスン進捗のマップ
 */
export async function getMultipleLessonProgress(
  lessons: Array<{ lessonId: string; articleIds: string[] }>,
  userId?: string
): Promise<Record<string, LessonProgress>> {
  const progressMap: Record<string, LessonProgress> = {};

  // デフォルト値を設定
  lessons.forEach((lesson) => {
    progressMap[lesson.lessonId] = {
      lessonId: lesson.lessonId,
      totalArticles: lesson.articleIds.length,
      completedArticles: 0,
      percentage: 0,
      completedArticleIds: [],
      lastUpdatedAt: null,
    };
  });

  try {
    const supabase = await createClient();

    let uid = userId;
    if (!uid) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return progressMap;
      uid = user.id;
    }

    const lessonIds = lessons.map((l) => l.lessonId);
    if (lessonIds.length === 0) return progressMap;

    // 1回のクエリで全レッスンの完了記事を取得
    const { data } = await supabase
      .from("article_progress")
      .select("lesson_id, article_id, updated_at")
      .eq("user_id", uid)
      .eq("status", "completed")
      .in("lesson_id", lessonIds)
      .order("updated_at", { ascending: false });

    if (!data) return progressMap;

    // レッスンごとにグループ化
    const groupedByLesson: Record<
      string,
      Array<{ article_id: string; updated_at: string }>
    > = {};
    data.forEach((item) => {
      if (!groupedByLesson[item.lesson_id]) {
        groupedByLesson[item.lesson_id] = [];
      }
      groupedByLesson[item.lesson_id].push({
        article_id: item.article_id,
        updated_at: item.updated_at,
      });
    });

    // 各レッスンの進捗を計算
    lessons.forEach((lesson) => {
      const completedItems = groupedByLesson[lesson.lessonId] || [];
      const validCompleted = completedItems.filter((item) =>
        lesson.articleIds.includes(item.article_id)
      );
      const completedArticleIds = validCompleted.map((item) => item.article_id);
      const completedCount = completedArticleIds.length;
      const percentage =
        lesson.articleIds.length > 0
          ? Math.round((completedCount / lesson.articleIds.length) * 100)
          : 0;
      const lastUpdatedAt =
        validCompleted.length > 0 ? validCompleted[0].updated_at : null;

      progressMap[lesson.lessonId] = {
        lessonId: lesson.lessonId,
        totalArticles: lesson.articleIds.length,
        completedArticles: completedCount,
        percentage,
        completedArticleIds,
        lastUpdatedAt,
      };
    });

    return progressMap;
  } catch (error) {
    console.error("Get multiple lesson progress error:", error);
    return progressMap;
  }
}

/**
 * レッスンを完了状態にする
 * 100%達成後にユーザーが「レッスンを完了する」ボタンをクリックした時に呼ばれる
 */
export async function markLessonAsCompleted(
  lessonId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: "ログインが必要です" };
    }

    const now = new Date().toISOString();
    const { error } = await supabase.from("lesson_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        status: "completed",
        completed_at: now,
        updated_at: now,
      },
      {
        onConflict: "user_id,lesson_id",
      }
    );

    if (error) throw error;

    return { success: true, message: "レッスンを完了しました！" };
  } catch (error) {
    console.error("Mark lesson as completed error:", error);
    return { success: false, message: "エラーが発生しました" };
  }
}

/**
 * レッスンの完了ステータスを取得
 */
export async function getLessonStatus(lessonId: string): Promise<LessonStatus> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return "not_started";

    const { data } = await supabase
      .from("lesson_progress")
      .select("status")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    return (data?.status as LessonStatus) || "not_started";
  } catch (error) {
    console.error("Get lesson status error:", error);
    return "not_started";
  }
}

/**
 * 複数レッスンの完了ステータスを一括取得
 */
export async function getMultipleLessonStatus(
  lessonIds: string[],
  userId?: string
): Promise<Record<string, LessonStatus>> {
  const statusMap: Record<string, LessonStatus> = {};

  lessonIds.forEach((id) => {
    statusMap[id] = "not_started";
  });

  try {
    const supabase = await createClient();

    let uid = userId;
    if (!uid) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return statusMap;
      uid = user.id;
    }

    if (lessonIds.length === 0) return statusMap;

    const { data } = await supabase
      .from("lesson_progress")
      .select("lesson_id, status")
      .eq("user_id", uid)
      .in("lesson_id", lessonIds);

    if (data) {
      data.forEach((item) => {
        statusMap[item.lesson_id] = item.status as LessonStatus;
      });
    }

    return statusMap;
  } catch (error) {
    console.error("Get multiple lesson status error:", error);
    return statusMap;
  }
}

/**
 * レッスンの完了状態を解除する
 */
export async function removeLessonCompletion(
  lessonId: string
): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false };
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("lesson_progress")
      .update({
        status: "in_progress",
        completed_at: null,
        updated_at: now,
      })
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Remove lesson completion error:", error);
    return { success: false };
  }
}
