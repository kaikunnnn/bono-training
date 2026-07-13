"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ProfileData {
  displayName: string;
  avatarUrl: string;
  bio: string;
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

  revalidatePath("/profile");
  revalidatePath("/mypage");
  revalidatePath("/", "layout");

  return { avatarUrl };
}
