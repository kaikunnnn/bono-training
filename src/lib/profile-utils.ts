/**
 * プロフィール設定促し（#142）の判定・抑制ユーティリティ。
 *
 * 純粋関数 + localStorage ヘルパのみ。DB/cookies/headers に触れないので
 * Server / Client どちらからも import してよい（server-only 不要）。
 */

/** user_metadata のうち、表示名・アイコン判定に使うキーだけを抜き出した型 */
interface ProfileMeta {
  display_name?: string | null;
  name?: string | null;
  avatar_url?: string | null;
}

/**
 * 表示名が未設定（自動生成のまま）か、アイコンが未設定なら true（#142）。
 *
 * - 名前未設定 = display_name も name も trim 後に空
 * - アイコン未設定 = avatar_url が trim 後に空
 * - どちらか一方でも未設定なら true
 */
export function isProfileIncomplete(
  meta: ProfileMeta | undefined | null,
): boolean {
  const displayName = (meta?.display_name ?? "").trim();
  const name = (meta?.name ?? "").trim();
  const avatarUrl = (meta?.avatar_url ?? "").trim();

  const nameMissing = displayName === "" && name === "";
  const avatarMissing = avatarUrl === "";

  return nameMissing || avatarMissing;
}

/** 「あとで」で抑制した時刻を保存する localStorage キー */
const DISMISS_KEY = "bono-profile-prompt-dismissed-at";
/** 抑制期間（30日） */
const SUPPRESS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * プロフィール設定促しモーダルを表示してよいか。
 * 「あとで」で抑制してから 30 日以内なら false。
 * SSR / プライベートモードなど localStorage が使えない環境では true（＝表示側）。
 */
export function shouldShowProfilePrompt(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return true;
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return true;
    return Date.now() - dismissedAt >= SUPPRESS_MS;
  } catch {
    // プライベートモード等で localStorage が使えない場合は抑制状態を持てないため表示を許可
    return true;
  }
}

/** 「あとで」を選んだ時に抑制開始時刻を記録する（30日抑制） */
export function dismissProfilePrompt(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // 書き込めなくても致命的ではない（次回また促されるだけ）
  }
}
