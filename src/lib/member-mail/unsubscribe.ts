/**
 * 会員メール（#264 §5-7・§5-8）の配信停止の共通処理。
 * 画面（/mail/unsubscribe の「止める」ボタン）とワンクリック（POST /api/mail/unsubscribe）の両方から呼ぶ。
 * 決済・契約・ログインのメール（Stripe・Supabase 認証・ウェルカム等）は止めない（この仕組みの外）。
 */
import {
  MAIL_CATEGORIES,
  UNSUBSCRIBE_SCOPE,
  type MailCategory,
  type UnsubscribeMethod,
  type UnsubscribeStore,
} from "./types";
import { verifyUnsubscribeToken } from "./unsubscribe-token";

/**
 * 止めるカテゴリ（UNSUBSCRIBE_SCOPE が all ならお知らせ系の全カテゴリ）。
 * 新しいトークン（v2）はカテゴリを持たないので、カテゴリが無いときも全カテゴリを止める。
 */
export function categoriesToStop(category: MailCategory | null): readonly MailCategory[] {
  return UNSUBSCRIBE_SCOPE === "all" || category === null ? MAIL_CATEGORIES : [category];
}

export type UnsubscribeOutcome = "stopped" | "invalid_token";

export async function unsubscribeByToken(
  store: UnsubscribeStore,
  secret: string,
  token: unknown,
  method: UnsubscribeMethod,
  now: Date,
): Promise<UnsubscribeOutcome> {
  const verified = verifyUnsubscribeToken(secret, token);
  if (!verified) return "invalid_token";
  await store.unsubscribe(verified.userId, categoriesToStop(verified.category), method, now);
  console.log("[member-mail] unsubscribed", { method, category: verified.category ?? "all" });
  return "stopped";
}
