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
  // "/" 始まりのみ許可（スキーム付きの絶対URL・相対パスを拒否）
  if (!value.startsWith("/")) return "/";
  // プロトコル相対（//host）・バックスラッシュ回避（/\host）を拒否
  if (value.startsWith("//") || value.startsWith("/\\")) return "/";
  // 文字列の先頭だけでは足りない: "/.//evil" や "/%2e//evil" は URL として読むと
  // パスが "//evil" に正規化され、ブラウザや Next の router が外のサイトとして開く。
  // ダミーの基準URLで読み直し、同じ場所にとどまり、正規化後のパスも "//" で始まらないものだけ通す。
  const BASE = "http://internal.invalid";
  let url: URL;
  try {
    url = new URL(value, BASE);
  } catch {
    return "/";
  }
  if (url.origin !== BASE) return "/";
  if (url.pathname.startsWith("//") || url.pathname.startsWith("/\\")) return "/";
  // 正規化後の値を返す（"/./x" のような書き方をそのまま後段に渡さない）
  return `${url.pathname}${url.search}${url.hash}`;
}
