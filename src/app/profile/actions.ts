"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  createClient as createSanityClient,
  type SanityClient,
} from "@sanity/client";
import { createClient } from "@/lib/supabase/server";

export interface ProfileData {
  displayName: string;
  avatarUrl: string;
  bio: string;
}

// ---------------------------------------------------------------------------
// プロフィール変更を掲示板（Sanity の投稿 author / Supabase のコメント）へ伝播
// ---------------------------------------------------------------------------

// Sanity write client（遅延初期化：ビルド時の env 未設定エラーを防ぐ。route.ts と同じ）
let _sanityWriteClient: SanityClient | null = null;

function getSanityWriteClient(): SanityClient {
  if (!_sanityWriteClient) {
    _sanityWriteClient = createSanityClient({
      projectId:
        process.env.SANITY_PROJECT_ID ||
        process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset:
        process.env.SANITY_DATASET ||
        process.env.NEXT_PUBLIC_SANITY_DATASET ||
        "production",
      apiVersion: "2024-01-01",
      token: process.env.SANITY_WRITE_TOKEN,
      useCdn: false,
    });
  }
  return _sanityWriteClient;
}

/**
 * 表示名 / アバターURL の変更を、その userId が過去に投稿した掲示板データへ書き戻す。
 *
 * - Sanity: `question` ドキュメントの author.displayName / author.avatarUrl を patch
 * - Supabase: 自分の question_comments の author_name / author_avatar_url を update
 *
 * 投稿者情報は投稿時のスナップショットを非正規化保存する設計のため、プロフィール変更を
 * 明示的に伝播する必要がある。渡された項目のみ更新する（displayName だけ / avatarUrl だけ も可）。
 *
 * ベストエフォート：失敗しても console.error のみでプロフィール保存自体は成功扱い。
 */
async function propagateProfileToBoard(
  userId: string,
  fields: { displayName?: string; avatarUrl?: string },
): Promise<void> {
  if (fields.displayName === undefined && fields.avatarUrl === undefined) {
    return;
  }

  // --- Sanity: 自分の投稿 author を patch ---
  try {
    const docs = await getSanityWriteClient().fetch<Array<{ _id: string }>>(
      `*[_type == "question" && author.userId == $uid]{_id}`,
      { uid: userId },
    );
    if (docs.length > 0) {
      const tx = getSanityWriteClient().transaction();
      for (const doc of docs) {
        const setFields: Record<string, string> = {};
        if (fields.displayName !== undefined) {
          setFields["author.displayName"] = fields.displayName;
        }
        if (fields.avatarUrl !== undefined) {
          setFields["author.avatarUrl"] = fields.avatarUrl;
        }
        tx.patch(doc._id, { set: setFields });
      }
      await tx.commit();
    }
  } catch (error) {
    console.error("[propagateProfileToBoard] Sanity patch failed:", error);
  }

  // --- Supabase: 自分のコメント author 情報を update（RLS の owner update 内）---
  try {
    const supabase = await createClient();
    const updateFields: { author_name?: string; author_avatar_url?: string } = {};
    if (fields.displayName !== undefined) {
      updateFields.author_name = fields.displayName;
    }
    if (fields.avatarUrl !== undefined) {
      updateFields.author_avatar_url = fields.avatarUrl;
    }
    const { error } = await supabase
      .from("question_comments")
      .update(updateFields)
      .eq("user_id", userId)
      .is("deleted_at", null);
    if (error) {
      console.error("[propagateProfileToBoard] Supabase update failed:", error);
    }
  } catch (error) {
    console.error("[propagateProfileToBoard] Supabase update threw:", error);
  }

  // 掲示板一覧・詳細のキャッシュを無効化（次アクセスで反映）
  revalidatePath("/questions");
  revalidateTag("questions", "max");
}

export interface ProfileResult {
  error?: string;
  success?: boolean;
}

export async function updateProfile(data: ProfileData): Promise<ProfileResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      display_name: data.displayName,
      avatar_url: data.avatarUrl,
      bio: data.bio,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // 表示名・アバターURL を過去の掲示板投稿/コメントへ伝播（ベストエフォート）。
  // avatarUrl も保持しているため合わせて渡し、スナップショットのズレを解消する。
  await propagateProfileToBoard(user.id, {
    displayName: data.displayName,
    avatarUrl: data.avatarUrl,
  });

  revalidatePath("/profile");
  revalidatePath("/mypage");
  revalidatePath("/", "layout");

  return { success: true };
}

// アバターアップロード用の設定（クライアント側の image-utils と揃える）
const AVATAR_BUCKET = "avatars";
const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2MB（バケット側 file_size_limit と一致）
const AVATAR_ALLOWED_MIME = ["image/webp", "image/jpeg", "image/png"];

export interface UploadAvatarResult {
  error?: string;
  avatarUrl?: string;
}

/**
 * アバター画像をアップロードする。
 * クライアントで 512px WebP に縮小済みの Blob を FormData("file") で受け取り、
 * avatars/{uid}/avatar.webp に upsert → 公開URL（?v=timestamp でキャッシュバスト）を
 * user_metadata.avatar_url に保存する。
 * displayName / bio の保存（updateProfile）とは独立して即時反映される。
 */
export async function uploadAvatar(
  formData: FormData
): Promise<UploadAvatarResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "画像ファイルが見つかりません" };
  }

  // サーバー側でも MIME / サイズを再検証（クライアント検証の二重防御）
  if (!AVATAR_ALLOWED_MIME.includes(file.type)) {
    return { error: "対応していない画像形式です" };
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return { error: "画像サイズが大きすぎます" };
  }

  const path = `${user.id}/avatar.webp`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: "image/webp",
      cacheControl: "3600",
    });

  if (uploadError) {
    return { error: "画像のアップロードに失敗しました" };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  // upsert で URL が変わらないため、キャッシュバスト用のクエリを付与する
  const avatarUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl },
  });

  if (updateError) {
    return { error: updateError.message };
  }

  // 新しいアバターURL を過去の掲示板投稿/コメントへ伝播（ベストエフォート）
  await propagateProfileToBoard(user.id, { avatarUrl });

  revalidatePath("/profile");
  revalidatePath("/mypage");
  revalidatePath("/", "layout");

  return { avatarUrl };
}
