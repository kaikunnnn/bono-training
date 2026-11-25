/**
 * 戻り先（redirectTo）の安全確認。サーバー（ログイン・登録の Server Action）と
 * クライアント（signup ページの「ログイン済みなら移動」）の両方から使う。
 * "use server" ファイルは同期関数を export できないため、ここに置く。
 */

/**
 * オープンリダイレクト対策（F-5）。
 * 内部パスのみ許可する。外部URL・プロトコル相対（//）・バックスラッシュ回避（/\）・
 * スキーム付き絶対URL（http:/javascript: 等）・制御文字は "/" に落とす。
 * 内部パス + クエリ文字列（?intent_plan=... 等）はそのまま保持し intent フローを壊さない。
 */
export function sanitizeRedirect(value: string | null): string {
  if (!value) return "/";
  // 制御文字（改行・タブ・NUL 等）を含む値は拒否
  if (/[\x00-\x1f\x7f]/.test(value)) return "/";
  // "/" 始まりのみ許可（絶対URLはスキームを持つため new URL が成功する→拒否）
  if (!value.startsWith("/")) return "/";
  // プロトコル相対（//host）・バックスラッシュ回避（/\host）を拒否
  if (value.startsWith("//") || value.startsWith("/\\")) return "/";
  // 念のため: base 無しで絶対URLとして解釈できてしまう値（スキーム付き）を拒否
  try {
    // 相対パスなら new URL(value) は TypeError で失敗する（＝安全）。
    // 成功する＝絶対URL（スキーム有）なので拒否。
    new URL(value);
    return "/";
  } catch {
    return value;
  }
}
