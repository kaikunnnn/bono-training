/**
 * 認証フローで着地先 URL に付ける印（Server / Client 共用の定数）。
 */

/** signUp 成功時だけ付ける。SignUpTracker が GA4 `sign_up` を1回送って消す */
export const SIGNUP_MARKER_PARAM = "signup";

/** href（内部パス + query）に `signup=1` を足す */
export function withSignUpMarker(target: string): string {
  const hashIndex = target.indexOf("#");
  const hash = hashIndex >= 0 ? target.slice(hashIndex) : "";
  const base = hashIndex >= 0 ? target.slice(0, hashIndex) : target;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}${SIGNUP_MARKER_PARAM}=1${hash}`;
}
