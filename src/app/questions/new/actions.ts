"use server";

import { createClient } from "@/lib/supabase/server";

// 投稿添付画像のアップロード設定（クライアント側の image-utils と揃える）
const ATTACHMENT_BUCKET = "question-attachments";
// クライアントで長辺1200px WebP に縮小済みの想定。縮小後は数百KBに収まるため
// バケット側の 5MB より厳しい 1MB をサーバー側ガードとして設定する。
const ATTACHMENT_MAX_BYTES = 1 * 1024 * 1024; // 1MB
const ATTACHMENT_ALLOWED_MIME = ["image/webp", "image/jpeg", "image/png"];

export interface UploadQuestionImageResult {
  error?: string;
  imageUrl?: string;
}

/**
 * 投稿に添付する画像をアップロードする（1投稿1枚）。
 *
 * クライアントで長辺1200px WebP に縮小済みの Blob を FormData("file") で受け取り、
 * question-attachments/{uid}/{uuid}.webp にアップロード → 公開URLを返す。
 *
 * 権限は投稿API（/api/questions/submit）と揃える:
 *   認証済み かつ アクティブなサブスクリプション（環境フィルタ付き）を持つメンバーのみ。
 *
 * NOTE: 孤児ファイルについて — このアップロードは投稿の「送信」より前に実行されるため、
 * ユーザーが画像添付後に送信をキャンセルすると Storage 上にファイルだけが残り得る。
 * Free プラン枠（1GB）に対し投稿画像は数百KB×少量のため許容範囲とし、Phase 3 の
 * モデレーション/クリーンアップ動線で回収する方針（issue #145 に記録）。
 */
export async function uploadQuestionImage(
  formData: FormData
): Promise<UploadQuestionImageResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  // メンバー確認（/api/questions/submit と同じ is_active + environment フィルタ）
  const environment = process.env.NODE_ENV === "production" ? "live" : "test";
  const { data: subscription, error: subError } = await supabase
    .from("user_subscriptions")
    .select("is_active")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .eq("environment", environment)
    .maybeSingle();

  if (subError || !subscription) {
    return { error: "画像の添付にはメンバー登録が必要です" };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "画像ファイルが見つかりません" };
  }

  // サーバー側でも MIME / サイズを再検証（クライアント縮小済み前提の二重防御）
  if (!ATTACHMENT_ALLOWED_MIME.includes(file.type)) {
    return { error: "対応していない画像形式です" };
  }
  if (file.size > ATTACHMENT_MAX_BYTES) {
    return { error: "画像サイズが大きすぎます" };
  }

  const path = `${user.id}/${crypto.randomUUID()}.webp`;

  const { error: uploadError } = await supabase.storage
    .from(ATTACHMENT_BUCKET)
    .upload(path, file, {
      upsert: false,
      contentType: "image/webp",
      cacheControl: "3600",
    });

  if (uploadError) {
    return { error: "画像のアップロードに失敗しました" };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(path);

  return { imageUrl: publicUrl };
}
