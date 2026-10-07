import "server-only";

/**
 * イベント参加申込（#218）のサーバー専用データ取得。
 * 純粋な定数・検証は `@/lib/events/onsite-registration` にある。
 */
import { createClient as createSupabaseServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type {
  EventParticipant,
  EventParticipantSummary,
} from "@/lib/events/onsite-registration";

export interface MyEventRegistration {
  comment: string;
  updatedAt: string;
}

/**
 * ログイン中ユーザー自身の申込（取り消し済みを除く）を取得する。
 * getEvent の unstable_cache とは別に、リクエストごとに最新を読む。
 * ユーザーのセッション（RLS適用）で読むので、他人の行は返らない。
 * 取得に失敗したときは「未申込」として扱い、ページは描画を続ける（ログのみ）。
 */
export async function getMyEventRegistration(
  eventId: string,
  userId: string,
): Promise<MyEventRegistration | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_registrations")
    .select("comment, updated_at")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("[getMyEventRegistration] fetch failed:", error);
    return null;
  }
  if (!data) return null;
  return {
    comment: data.comment as string,
    updatedAt: data.updated_at as string,
  };
}

// ---------------------------------------------------------------------------
// 参加者の表示（#218 スライスD）
//
// 表示するのは「いま有料会員の参加者」だけ。他人が会員かどうかは RLS で絞れないため、
// SQL 関数（20261006100000_create_event_participant_functions.sql）で
// public.is_active_member と同じ定義を使って絞り込む。関数は service_role 専用なので、
// ここ（サーバー）からだけ呼ぶ。
// getEvent の unstable_cache とは別に毎回最新を読む（申込・取り消しは revalidatePath で反映）。
// 失敗してもページは壊さない（ログを出して「表示なし」として扱う）。
// ---------------------------------------------------------------------------

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getServiceClient() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createSupabaseServiceClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const EMPTY_SUMMARY: EventParticipantSummary = { totalCount: 0, avatarUrls: [] };

/**
 * 誰にでも見せる参加者の要約（アイコン最大4件＋人数）。名前・コメントは取得もしない。
 */
export async function getEventParticipantSummary(
  eventId: string,
): Promise<EventParticipantSummary> {
  const service = getServiceClient();
  if (!service) {
    console.error("[getEventParticipantSummary] Supabase service config missing");
    return EMPTY_SUMMARY;
  }
  try {
    const { data, error } = await service
      .rpc("get_event_participant_summary", { p_event_id: eventId })
      .maybeSingle<{ total_count: number; avatar_urls: (string | null)[] | null }>();
    if (error) {
      console.error("[getEventParticipantSummary] rpc failed:", error);
      return EMPTY_SUMMARY;
    }
    if (!data) return EMPTY_SUMMARY;
    return {
      totalCount: data.total_count ?? 0,
      avatarUrls: data.avatar_urls ?? [],
    };
  } catch (error) {
    console.error("[getEventParticipantSummary] threw:", error);
    return EMPTY_SUMMARY;
  }
}

/**
 * 会員だけに見せる参加者一覧（名前・アイコン・コメント、新しい申込順）。
 * 呼び出し側で閲覧者の hasMemberAccess を確かめてから呼ぶこと（非会員の props に渡さない）。
 */
export async function getEventParticipantsForMember(
  eventId: string,
): Promise<EventParticipant[]> {
  const service = getServiceClient();
  if (!service) {
    console.error("[getEventParticipantsForMember] Supabase service config missing");
    return [];
  }
  try {
    const { data, error } = await service.rpc("get_event_participants", {
      p_event_id: eventId,
    });
    if (error) {
      console.error("[getEventParticipantsForMember] rpc failed:", error);
      return [];
    }
    const rows = (data ?? []) as Array<{
      id: string;
      author_name: string;
      author_avatar_url: string | null;
      comment: string;
      created_at: string;
    }>;
    return rows.map((row) => ({
      id: row.id,
      name: row.author_name,
      avatarUrl: row.author_avatar_url,
      comment: row.comment,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error("[getEventParticipantsForMember] threw:", error);
    return [];
  }
}
