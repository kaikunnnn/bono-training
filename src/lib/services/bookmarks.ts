"use server";

import { createClient } from "@/lib/supabase/server";
import { client as getClient } from "@/lib/sanity";

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
        message: "ブックマークを解除しました",
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
        message: "ブックマークに追加しました",
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

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
 * @returns ブックマークした記事ID一覧
 */
export async function getBookmarks(userId?: string): Promise<string[]> {
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

    const { data, error } = await supabase
      .from("article_bookmarks")
      .select("article_id")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

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
 * @returns ブックマーク済み記事の配列（Sanityから取得）
 */
export async function getBookmarkedArticles(
  userId?: string
): Promise<BookmarkedArticle[]> {
  try {
    // 1. Supabaseからブックマークした記事IDを取得
    const bookmarkIds = await getBookmarks(userId);

    if (bookmarkIds.length === 0) {
      return [];
    }

    // 2. SanityからArticle情報を取得
    const query = `*[_type == "article" && _id in $ids] {
      _id,
      title,
      slug,
      thumbnail,
      thumbnailUrl,
      "resolvedThumbnailUrl": coalesce(
        thumbnailUrl,
        thumbnail.asset->url
      ),
      videoDuration,
      articleNumber,
      excerpt,
      isPremium,
      "questInfo": *[_type == "quest" && references(^._id)][0] {
        _id,
        questNumber,
        title,
        "lessonInfo": *[_type == "lesson" && references(^._id)][0] {
          _id,
          title,
          slug
        }
      }
    } | order(_createdAt desc)`;

    const articles = await getClient().fetch(query, { ids: bookmarkIds });
    return articles;
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
