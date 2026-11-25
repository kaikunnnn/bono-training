/**
 * 会員メール（#264）の「BONOからのお知らせメール」1項目のオン・オフ（#327-C）。
 * 通知設定（/account/notifications）と配信停止の画面（/mail/unsubscribe）の両方から使う。
 *
 * 会員から見えるのは1項目だけ。内部のカテゴリ（notice / comeback / signup / winback）はまとめて扱い、
 * どのカテゴリがあるかは画面にもブラウザにも渡さない（会員の様子で送り分けていることを見せないため）。
 *
 * - オン: 全カテゴリを戻す
 * - オフ: 全カテゴリを止める
 * - 1つでも止まっていれば「止めている」とみなす（送る処理はカテゴリごとに止まりを見るため）
 *
 * userId を受け取るので "use server" のファイルには置かない（呼び出し側で本人を確かめてから渡す）。
 */
import { MAIL_CATEGORIES, type UnsubscribeMethod, type UnsubscribeStore } from "./types";

/**
 * 通知設定の画面で止めたときの method。
 * DB の制約（member_mail_unsubscribes.method）は link / one_click / reply / manual だけを許す。
 * 設定画面用の値は無いので、会員が自分で画面のボタンを押した点が同じ "link" で代用する（#327-C）。
 */
export const SETTINGS_UNSUBSCRIBE_METHOD: UnsubscribeMethod = "link";

/** お知らせメールを受け取っているか（止めた記録が無ければ受け取っている） */
export async function isMemberMailEnabled(store: UnsubscribeStore, userId: string): Promise<boolean> {
  const stopped = await store.listStoppedCategories(userId);
  return stopped.length === 0;
}

/**
 * 全カテゴリが止まっているか（配信停止の画面用）。
 * 1つでも受け取っているカテゴリがあれば false。画面は「受け取りをやめる」を出し、全部を止められるようにする
 * （一部だけ止まっている人が、メール本文のリンクから止められなくならないように）。
 */
export async function isMemberMailFullyStopped(store: UnsubscribeStore, userId: string): Promise<boolean> {
  const stopped = new Set(await store.listStoppedCategories(userId));
  return MAIL_CATEGORIES.every((c) => stopped.has(c));
}

/** 全カテゴリを戻す */
export async function resubscribeAllMemberMail(store: UnsubscribeStore, userId: string, at: Date): Promise<void> {
  for (const category of MAIL_CATEGORIES) {
    await store.resubscribe(userId, category, at);
  }
}

/** オン・オフを切り替え、切り替えたあとの状態を返す */
export async function setMemberMailEnabled(
  store: UnsubscribeStore,
  userId: string,
  enabled: boolean,
  method: UnsubscribeMethod,
  at: Date,
): Promise<boolean> {
  if (enabled) {
    await resubscribeAllMemberMail(store, userId, at);
  } else {
    await store.unsubscribe(userId, MAIL_CATEGORIES, method, at);
  }
  return isMemberMailEnabled(store, userId);
}
