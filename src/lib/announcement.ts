/**
 * お知らせバー（#220）の設定と、閉じた状態の記録（localStorage）。
 *
 * - 純粋関数・定数のみ（サーバー/クライアントどちらからも import 可）。
 * - 告知を差し替えるときは CURRENT_ANNOUNCEMENT を書き換える。id を変えると
 *   「閉じた」記録も別キーになるので、新しい告知は全員に再表示される。
 * - 告知をやめるときは CURRENT_ANNOUNCEMENT を null にする（endsAt 経過でも自動で消える）。
 */

export interface Announcement {
  /** 閉じた記録のキーに使う。告知ごとに一意にする */
  id: string;
  /** 左の小さなラベル（例: 募集中） */
  label: string;
  /** 本文（1文） */
  text: string;
  /** バー全体のリンク先 */
  href: string;
  /** この時刻（ISO 8601）以降は表示しない */
  endsAt: string;
}

/** 現在表示するお知らせ。#218 イベント（申込締切 2026-10-21 23:59:59 JST） */
export const CURRENT_ANNOUNCEMENT: Announcement | null = {
  id: "event-2026-10",
  label: "募集中",
  text: "10/21スタート！BONOの数字を見てUIを改善する1ヶ月チャレンジ",
  href: "/events/uidesign-challenge-2026-10",
  endsAt: "2026-10-21T15:00:00.000Z",
};

/** 閉じた状態が変わったことを同じタブ内に知らせるイベント名 */
export const ANNOUNCEMENT_CHANGE_EVENT = "bono:announcement-change";

export function announcementDismissKey(id: string): string {
  return `bono:announcement-dismissed:${id}`;
}

/** 表示期間内か（endsAt より前なら true） */
export function isAnnouncementActive(
  announcement: Announcement,
  now: number = Date.now()
): boolean {
  const endsAt = Date.parse(announcement.endsAt);
  if (Number.isNaN(endsAt)) return false;
  return now < endsAt;
}

/** このブラウザで閉じ済みか。localStorage が使えない環境では false（表示する） */
export function isAnnouncementDismissed(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(announcementDismissKey(id)) !== null;
  } catch {
    return false;
  }
}

function notifyChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ANNOUNCEMENT_CHANGE_EVENT));
}

/** ❌ を押したときに記録する（以後このブラウザでは表示しない） */
export function dismissAnnouncement(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(announcementDismissKey(id), String(Date.now()));
  } catch {
    // 書き込めなくても致命的ではない（次回また表示されるだけ）
  }
  notifyChange();
}

/** 閉じた記録を消す（/dev の確認用） */
export function resetAnnouncementDismissal(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(announcementDismissKey(id));
  } catch {
    // 何もしない
  }
  notifyChange();
}

/** useSyncExternalStore 用: 別タブ（storage）と同タブ（独自イベント）の変化を購読 */
export function subscribeAnnouncementChange(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(ANNOUNCEMENT_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(ANNOUNCEMENT_CHANGE_EVENT, callback);
  };
}

/**
 * 初回描画前に「閉じ済み/期限切れ」のバーを隠すインラインスクリプト。
 *
 * バー要素の直後に置き、直前の兄弟要素（バー）に hidden を付ける。
 * サーバーHTMLの段階で隠すので、閉じ済みの人にバーが一瞬見える（→消える）ことがない。
 * 埋め込む値は定数のみ（ユーザー入力を混ぜないこと）。
 */
export function buildAnnouncementPrePaintScript(
  announcement: Announcement
): string {
  const key = JSON.stringify(announcementDismissKey(announcement.id));
  const endsAt = Date.parse(announcement.endsAt);
  return (
    "(function(){var s=document.currentScript;var el=s&&s.previousElementSibling;if(!el)return;" +
    `var h=Date.now()>=${Number.isNaN(endsAt) ? 0 : endsAt};` +
    `try{h=h||window.localStorage.getItem(${key})!==null}catch(e){}` +
    "if(h)el.hidden=true})()"
  );
}
