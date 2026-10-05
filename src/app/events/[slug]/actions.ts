"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient, getCachedUser } from "@/lib/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { getEvent } from "@/lib/sanity";
import {
  isOnsiteRegistrationEvent,
  validateRegistrationComment,
} from "@/lib/events/onsite-registration";

// ---------------------------------------------------------------------------
// イベントのサイト上参加申込 Server Actions（#218 スライスC）
//
// 認可は各アクションの中で毎回やり直す（ボタンを会員にしか出していなくても省略しない）:
//   ログイン → 有料会員（getSubscriptionStatus().hasMemberAccess）→ slug がサイト上申込の対象
//   → イベント _id はクライアントから受け取らず、slug から Sanity で引く。
// 書き込みはユーザーのセッション（RLS適用）で行い、service_role は使わない。
// useActionState から呼ぶので (prevState, formData) の形にしている。
// ---------------------------------------------------------------------------

export type EventRegistrationActionResult =
  | { ok: true }
  | { ok: false; error: string };

type Authorized = {
  ok: true;
  user: User;
  slug: string;
  event: { _id: string; title: string };
};

async function authorize(
  formData: FormData,
): Promise<Authorized | { ok: false; error: string }> {
  const slug = formData.get("slug");
  if (typeof slug !== "string" || slug === "") {
    return { ok: false, error: "イベントが見つかりません" };
  }

  const user = await getCachedUser();
  if (!user) return { ok: false, error: "ログインが必要です" };

  let hasMemberAccess = false;
  try {
    hasMemberAccess = (await getSubscriptionStatus()).hasMemberAccess;
  } catch (error) {
    console.error("[event-registration] subscription check failed:", error);
  }
  if (!hasMemberAccess) {
    return {
      ok: false,
      error: "イベントに参加するにはメンバーシップ登録が必要です",
    };
  }

  if (!isOnsiteRegistrationEvent(slug)) {
    return { ok: false, error: "このイベントはサイト上での申込に対応していません" };
  }

  let event: { _id?: string; title?: string } | null = null;
  try {
    event = await getEvent(slug);
  } catch (error) {
    console.error("[event-registration] getEvent failed:", error);
    return { ok: false, error: "イベントの取得に失敗しました" };
  }
  if (!event?._id) return { ok: false, error: "イベントが見つかりません" };

  return {
    ok: true,
    user,
    slug,
    event: { _id: event._id, title: event.title ?? slug },
  };
}

/** DB エラーを利用者向けの文言に変換する（Postgres の生メッセージは出さない） */
function toUserError(
  error: { code?: string } | null,
  fallback: string,
): string {
  if (error?.code === "42501") {
    return "イベントに参加するにはメンバーシップ登録が必要です";
  }
  if (error?.code === "23514") {
    return "コメントは1〜300文字で入力してください";
  }
  return fallback;
}

/** 申込者プロフィール（question_comments の addComment と同じ導出） */
function authorProfile(user: User) {
  const meta = user.user_metadata ?? {};
  return {
    authorName:
      (meta.display_name as string | undefined) ||
      (meta.name as string | undefined) ||
      user.email?.split("@")[0] ||
      "メンバー",
    authorAvatarUrl: (meta.avatar_url as string | undefined) ?? null,
  };
}

/** Slack の mrkdwn 制御文字をエスケープする */
function escapeSlack(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * 申込を運営の Slack（SLACK_OPS_WEBHOOK_URL）に知らせる。
 * レスポンス後に after() で送るので、利用者の操作は待たせない。失敗してもログのみ。
 * SLACK_WEBHOOK_URL（質問・コメントも流れる共有ch）へはフォールバックしない。
 */
function notifyRegistrationToSlack(input: {
  name: string;
  eventTitle: string;
  comment: string;
}) {
  after(async () => {
    const webhookUrl = process.env.SLACK_OPS_WEBHOOK_URL;
    if (!webhookUrl) {
      console.log(
        "[event-registration] SLACK_OPS_WEBHOOK_URL not configured, skipping Slack notification",
      );
      return;
    }
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text:
            `イベント申込: ${escapeSlack(input.name)} さん（${escapeSlack(input.eventTitle)}）\n` +
            `コメント: ${escapeSlack(input.comment)}`,
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        console.error(
          "[event-registration] Slack notification failed:",
          res.status,
        );
      }
    } catch (error) {
      console.error("[event-registration] Slack notification threw:", error);
    }
  });
}

/**
 * 参加申込。初回は行を作り、取り消し済みの行があれば同じ行を復活させる
 * （UNIQUE (event_id, user_id) の upsert。deleted_at を NULL に戻し、コメントと名前・アイコンを更新）。
 * 新規・復活のときだけ Slack に通知する（申込済みの再送信はコメント更新扱いで通知しない）。
 */
export async function registerForEvent(
  _prev: EventRegistrationActionResult | null,
  formData: FormData,
): Promise<EventRegistrationActionResult> {
  const auth = await authorize(formData);
  if (!auth.ok) return auth;

  const validated = validateRegistrationComment(formData.get("comment"));
  if (!validated.ok) return validated;

  const supabase = await createClient();

  // 既に有効な申込があるか（Slack 通知の要否だけに使う。RLS で本人の行は取り消し済みも読める）
  const { data: existing, error: existingError } = await supabase
    .from("event_registrations")
    .select("deleted_at")
    .eq("event_id", auth.event._id)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (existingError) {
    console.error("[registerForEvent] fetch existing failed:", existingError);
  }
  const wasActive = !!existing && existing.deleted_at === null;

  const { authorName, authorAvatarUrl } = authorProfile(auth.user);
  const { error } = await supabase.from("event_registrations").upsert(
    {
      event_id: auth.event._id,
      user_id: auth.user.id,
      author_name: authorName,
      author_avatar_url: authorAvatarUrl,
      comment: validated.comment,
      deleted_at: null,
    },
    { onConflict: "event_id,user_id" },
  );

  if (error) {
    console.error("[registerForEvent] upsert failed:", error);
    return {
      ok: false,
      error: toUserError(error, "参加申込に失敗しました。時間をおいてもう一度お試しください"),
    };
  }

  if (!wasActive) {
    notifyRegistrationToSlack({
      name: authorName,
      eventTitle: auth.event.title,
      comment: validated.comment,
    });
  }

  revalidatePath(`/events/${auth.slug}`);
  return { ok: true };
}

/** 申込済みのコメントを編集する */
export async function updateRegistrationComment(
  _prev: EventRegistrationActionResult | null,
  formData: FormData,
): Promise<EventRegistrationActionResult> {
  const auth = await authorize(formData);
  if (!auth.ok) return auth;

  const validated = validateRegistrationComment(formData.get("comment"));
  if (!validated.ok) return validated;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_registrations")
    .update({ comment: validated.comment })
    .eq("event_id", auth.event._id)
    .eq("user_id", auth.user.id)
    .is("deleted_at", null)
    .select("id");

  if (error) {
    console.error("[updateRegistrationComment] update failed:", error);
    return {
      ok: false,
      error: toUserError(error, "コメントの更新に失敗しました。時間をおいてもう一度お試しください"),
    };
  }
  if (!data || data.length === 0) {
    revalidatePath(`/events/${auth.slug}`);
    return { ok: false, error: "参加申込が見つかりません。ページを再読み込みしてください" };
  }

  revalidatePath(`/events/${auth.slug}`);
  return { ok: true };
}

/** 参加を取り消す（deleted_at をセットする論理削除） */
export async function cancelRegistration(
  _prev: EventRegistrationActionResult | null,
  formData: FormData,
): Promise<EventRegistrationActionResult> {
  const auth = await authorize(formData);
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const { error } = await supabase
    .from("event_registrations")
    .update({ deleted_at: new Date().toISOString() })
    .eq("event_id", auth.event._id)
    .eq("user_id", auth.user.id)
    .is("deleted_at", null);

  if (error) {
    console.error("[cancelRegistration] update failed:", error);
    return {
      ok: false,
      error: toUserError(error, "参加の取り消しに失敗しました。時間をおいてもう一度お試しください"),
    };
  }

  // 既に取り消し済み（0行）でも結果は同じなので成功扱い
  revalidatePath(`/events/${auth.slug}`);
  return { ok: true };
}
