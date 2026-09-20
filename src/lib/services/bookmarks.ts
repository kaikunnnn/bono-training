"use server";

import { createClient, getCachedUser } from "@/lib/supabase/server";
import { getMypageArticlesByIds } from "@/lib/sanity";

// ============================================
// 型定義
// ============================================

export interface BookmarkedArticle {
  _id: string;
  title: string;
  slug: { current: string };
  thumbnailUrl?: string;
  resolvedThumbnailUrl?: string;
  videoDuration?: string | number;
  articleNumber?: number;
  excerpt?: string;
  isPremium?: boolean;
  questInfo?: {
    _id: string;
    questNumber: number;
    title: string;
    lessonInfo?: {
      _id: string;
      title: string;
      slug: {
        current: string;
      };
    };
  };
}

// ============================================
// ブックマーク管理
// ============================================

/**
 * 記事をブックマーク/解除する（トグル）
 * @param articleId 記事ID (Sanity article._id)
 * @param isPremium 記事がプレミアムかどうか（将来のサブスクリプション連携用）
 * @returns {success: boolean, isBookmarked: boolean, message: string}
 */
export async function toggleBookmark(
  articleId: string,
  isPremium: boolean = false
): Promise<{ success: boolean; isBookmarked: boolean; message: string }> {
  try {
    const supabase = await createClient();

    // 1. 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        isBookmarked: false,
        message: "ログインが必要です",
      };
    }

    // 2. プレミアム記事の場合の警告（将来の機能）
    if (isPremium) {
      console.warn(
        "Premium article bookmark - subscription check will be implemented"
      );
    }

    // 3. 既存のブックマークを確認
    const { data: existing } = await supabase
      .from("article_bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .eq("article_id", articleId)
      .maybeSingle();

    if (existing) {
      // 既にブックマーク済み → 削除
      const { error } = await supabase
        .from("article_bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("article_id", articleId);

      if (error) throw error;

      return {
        success: true,
        isBookmarked: false,
        message: "お気に入りを解除しました",
      };
    } else {
      // ブックマークされていない → 追加
      const { error } = await supabase.from("article_bookmarks").insert({
        user_id: user.id,
        article_id: articleId,
      });

      if (error) throw error;

      return {
        success: true,
        isBookmarked: true,
        message: "お気に入りしました",
      };
    }
  } catch (error) {
    console.error("Bookmark error:", error);
    return {
      success: false,
      isBookmarked: false,
      message: "エラーが発生しました",
    };
  }
}

/**
 * 記事がブックマーク済みかチェック
 * @param articleId 記事ID
 * @returns boolean
 */
export async function isBookmarked(articleId: string): Promise<boolean> {
  try {
    // 認証はリクエストスコープでメモ化された getCachedUser を使い、
    // 同一レンダー内の他の auth.getUser 呼び出しと往復を共有する
    const user = await getCachedUser();
    if (!user) return false;

    const supabase = await createClient();

    const { data } = await supabase
      .from("article_bookmarks")
      .select("article_id")
      .eq("user_id", user.id)
      .eq("article_id", articleId)
      .maybeSingle();

    return !!data;
  } catch (error) {
    console.error("Check bookmark error:", error);
    return false;
  }
}

/**
 * ユーザーのブックマーク一覧を取得
 * @param userId オプション: 認証済みユーザーID
 * @param limit オプション: 取得件数。previewでは画面に必要な件数だけ取得する
 * @returns ブックマークした記事ID一覧
 */
export async function getBookmarks(
  userId?: string,
  limit?: number
): Promise<string[]> {
  try {
    const supabase = await createClient();

    let uid = userId;
    if (!uid) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];
      uid = user.id;
    }

    let query = supabase
      .from("article_bookmarks")
      .select("article_id")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (limit !== undefined) {
      query = query.limit(Math.max(1, Math.floor(limit)));
    }

    const { data, error } = await query;

    if (error) throw error;

    return data?.map((b) => b.article_id) || [];
  } catch (error) {
    console.error("Get bookmarks error:", error);
    return [];
  }
}

/**
 * ブックマークした記事の詳細情報を取得
 * @param userId オプション: 認証済みユーザーID
 * @param limit オプション: SupabaseとSanityの両方へ渡す最大件数
 * @returns ブックマーク済み記事の配列（Sanityから取得）
 */
export async function getBookmarkedArticles(
  userId?: string,
  limit?: number
): Promise<BookmarkedArticle[]> {
  try {
    // 1. Supabaseからブックマークした記事IDを取得
    const bookmarkIds = await getBookmarks(userId, limit);

    if (bookmarkIds.length === 0) {
      return [];
    }

    // 2. 公開CMS情報だけを安定したID順で共有キャッシュから取得する。
    // 本人のブックマーク順はこの後にリクエスト内で戻す。
    const articles = await getMypageArticlesByIds([...bookmarkIds].sort());
    const bookmarkOrder = new Map(
      bookmarkIds.map((articleId, index) => [articleId, index])
    );
    return articles.sort(
      (a, b) =>
        (bookmarkOrder.get(a._id) ?? Number.MAX_SAFE_INTEGER) -
        (bookmarkOrder.get(b._id) ?? Number.MAX_SAFE_INTEGER)
    );
  } catch (error) {
    console.error("Get bookmarked articles error:", error);
    return [];
  }
}

/**
 * 複数の記事のブックマーク状態を一括取得
 * @param articleIds 記事IDの配列
 * @returns ブックマーク済みの記事IDのセット
 */
export async function getBookmarkStatus(
  articleIds: string[]
): Promise<Set<string>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new Set();

    const { data } = await supabase
      .from("article_bookmarks")
      .select("article_id")
      .eq("user_id", user.id)
      .in("article_id", articleIds);

    return new Set(data?.map((d) => d.article_id) || []);
  } catch (error) {
    console.error("Get bookmark status error:", error);
    return new Set();
  }
}
