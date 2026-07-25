"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  createClient as createSanityClient,
  type SanityClient,
} from "@sanity/client";
import { createClient as createSupabaseServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { textToPortableBlocks } from "@/lib/questions/text-format";
import { adjustBoardUserStats } from "@/lib/questions/board-user-stats";

// ---------------------------------------------------------------------------
// スレッド（掲示板の元投稿）の編集・削除 Server Actions（#147）
//
// 認可: 認証ユーザー id === Sanity ドキュメントの author.userId をサーバー側で検証する。
// 本文の書式は投稿時（/api/questions/submit）と同じく textToPortableBlocks で再変換し、
// バリデーション値も投稿時と揃える（タイトル 5-100 / 本文 20-5000）。
// ---------------------------------------------------------------------------

// 入力検証ルール（route.ts の VALIDATION_RULES と同値）
const VALIDATION_RULES = {
  title: { minLength: 5, maxLength: 100 },
  questionContent: { minLength: 20, maxLength: 5000 },
};

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

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * 認証ユーザーを取得し、対象スレッドの author.userId と一致するか検証する。
 * 一致すれば { ok: true, userId }、そうでなければエラーを返す。
 */
async function authorizeOwner(
  questionId: string,
): Promise<
  | { ok: true; userId: string }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "ログインが必要です" };

  let doc: { author?: { userId?: string } } | null = null;
  try {
    doc = await getSanityWriteClient().fetch<{
      author?: { userId?: string };
    } | null>(`*[_type == "question" && _id == $id][0]{author}`, {
      id: questionId,
    });
  } catch (error) {
    console.error("[authorizeOwner] Sanity fetch failed:", error);
    return { ok: false, error: "スレッドの取得に失敗しました" };
  }

  if (!doc) return { ok: false, error: "スレッドが見つかりません" };
  if (doc.author?.userId !== user.id) {
    return { ok: false, error: "この操作を行う権限がありません" };
  }

  return { ok: true, userId: user.id };
}

/**
 * スレッド本体（タイトル・本文）を編集する。
 * 本文は textToPortableBlocks で Portable Text に再変換して保存する。
 */
export async function updateQuestion(input: {
  questionId: string;
  slug: string;
  title: string;
  content: string;
}): Promise<{ ok: boolean; error?: string }> {
  const auth = await authorizeOwner(input.questionId);
  if (!auth.ok) return auth;

  const title = input.title.trim();
  const content = input.content.trim();

  // タイトル検証（route.ts と同値）
  if (title.length < VALIDATION_RULES.title.minLength) {
    return {
      ok: false,
      error: `タイトルは${VALIDATION_RULES.title.minLength}文字以上で入力してください`,
    };
  }
  if (title.length > VALIDATION_RULES.title.maxLength) {
    return {
      ok: false,
      error: `タイトルは${VALIDATION_RULES.title.maxLength}文字以内で入力してください`,
    };
  }

  // 本文検証（route.ts と同値）
  if (content.length < VALIDATION_RULES.questionContent.minLength) {
    return {
      ok: false,
      error: `内容は${VALIDATION_RULES.questionContent.minLength}文字以上で入力してください`,
    };
  }
  if (content.length > VALIDATION_RULES.questionContent.maxLength) {
    return {
      ok: false,
      error: `内容は${VALIDATION_RULES.questionContent.maxLength}文字以内で入力してください`,
    };
  }

  try {
    await getSanityWriteClient()
      .patch(input.questionId)
      .set({
        title,
        questionContent: textToPortableBlocks(content),
      })
      .commit();
  } catch (error) {
    console.error("[updateQuestion] Sanity patch failed:", error);
    return { ok: false, error: "スレッドの更新に失敗しました" };
  }

  revalidatePath(`/questions/${input.slug}`);
  revalidatePath("/questions");
  revalidateTag("questions", "max");
  return { ok: true };
}

/**
 * スレッド本体を削除する。関連する Supabase のコメント・リアクション・添付画像も掃除する。
 *
 * 掃除の順序（外部キー・孤児回避を意識）:
 *  1. リアクション（question 本体 + このスレッドの全コメント）を削除
 *  2. コメント（question_id）を削除
 *  3. 添付画像（attachedImage.url があれば question-attachments バケットから remove）
 *  4. Sanity ドキュメントを削除
 */
export async function deleteQuestion(input: {
  questionId: string;
  slug: string;
}): Promise<{ ok: boolean; error?: string }> {
  const auth = await authorizeOwner(input.questionId);
  if (!auth.ok) return auth;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[deleteQuestion] Supabase service config missing");
    return { ok: false, error: "サーバー設定エラー" };
  }

  // 添付画像の URL を先に取得（Sanity 削除後は参照できないため）
  let attachedImageUrl: string | null = null;
  try {
    const doc = await getSanityWriteClient().fetch<{
      attachedImage?: { url?: string };
    } | null>(`*[_type == "question" && _id == $id][0]{attachedImage}`, {
      id: input.questionId,
    });
    attachedImageUrl = doc?.attachedImage?.url ?? null;
  } catch (error) {
    // 取得失敗しても削除自体は続行（画像掃除だけスキップ）
    console.error("[deleteQuestion] fetch attachedImage failed:", error);
  }

  const service = createSupabaseServiceClient(supabaseUrl, supabaseServiceKey);

  // 1. このスレッドの全コメント id を取得（リアクションの target 収集用）
  let commentIds: string[] = [];
  try {
    const { data, error } = await service
      .from("question_comments")
      .select("id")
      .eq("question_id", input.questionId);
    if (error) throw error;
    commentIds = (data ?? []).map((r) => r.id as string);
  } catch (error) {
    console.error("[deleteQuestion] fetch comment ids failed:", error);
    return { ok: false, error: "スレッドの削除に失敗しました" };
  }

  // 2. リアクションを削除（question 本体 + コメント群）
  try {
    // question 本体へのリアクション
    const { error: qReactErr } = await service
      .from("question_reactions")
      .delete()
      .eq("target_type", "question")
      .eq("target_id", input.questionId);
    if (qReactErr) throw qReactErr;

    // コメントへのリアクション
    if (commentIds.length > 0) {
      const { error: cReactErr } = await service
        .from("question_reactions")
        .delete()
        .eq("target_type", "comment")
        .in("target_id", commentIds);
      if (cReactErr) throw cReactErr;
    }
  } catch (error) {
    console.error("[deleteQuestion] delete reactions failed:", error);
    return { ok: false, error: "スレッドの削除に失敗しました" };
  }

  // 3. コメントを削除
  try {
    const { error } = await service
      .from("question_comments")
      .delete()
      .eq("question_id", input.questionId);
    if (error) throw error;
  } catch (error) {
    console.error("[deleteQuestion] delete comments failed:", error);
    return { ok: false, error: "スレッドの削除に失敗しました" };
  }

  // 4. 添付画像を Storage から削除（ベストエフォート）
  if (attachedImageUrl) {
    try {
      const path = extractAttachmentPath(attachedImageUrl);
      if (path) {
        const { error } = await service.storage
          .from("question-attachments")
          .remove([path]);
        if (error) {
          console.error("[deleteQuestion] storage remove failed:", error);
        }
      }
    } catch (error) {
      console.error("[deleteQuestion] storage remove threw:", error);
    }
  }

  // 5. Sanity ドキュメントを削除
  try {
    await getSanityWriteClient().delete(input.questionId);
  } catch (error) {
    console.error("[deleteQuestion] Sanity delete failed:", error);
    return { ok: false, error: "スレッドの削除に失敗しました" };
  }

  // 投稿数カウントを減算（#149・ベストエフォート。0未満にはしない）
  await adjustBoardUserStats(auth.userId, { postDelta: -1 });

  revalidatePath("/questions");
  revalidatePath(`/questions/${input.slug}`);
  revalidateTag("questions", "max");
  return { ok: true };
}

/**
 * question-attachments バケットの公開URLから、バケット内パス（{uid}/{uuid}.webp）を抽出する。
 * 公開URL形式: {supabaseUrl}/storage/v1/object/public/question-attachments/{path}
 */
function extractAttachmentPath(url: string): string | null {
  const marker = "/question-attachments/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  // クエリ（?v=...）が付いていても除去
  const rest = url.slice(idx + marker.length);
  const path = rest.split("?")[0];
  return path || null;
}
