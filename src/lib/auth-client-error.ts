import { trackEvent } from "@/lib/analytics";

/**
 * 登録ボタンを押したあと、サーバーとの通信そのものが失敗したとき（#321 S5）。
 * 通信切れ・デプロイ直後の Server Action の食い違いなど。
 * 以前は画面に何も出ず、記録も残らなかった。
 */
export const SIGNUP_REQUEST_FAILED_MESSAGE =
  "登録の通信がうまくいきませんでした。通信状態を確かめて、もう一度「アカウントを作成」を押してください。";

/** Next.js 内部の制御用エラー（redirect 等）は失敗として扱わない */
export function isNextInternalError(err: unknown): boolean {
  if (!err || typeof err !== "object" || !("digest" in err)) return false;
  const digest = String((err as { digest?: unknown }).digest ?? "");
  return digest.startsWith("NEXT_");
}

/**
 * ブラウザで検知した登録の失敗を、Vercel のログ（/api/auth/client-error）と GA4 に残す。
 * 通信が不安定でも届きやすい sendBeacon を使い、失敗しても画面の動きは止めない。
 */
export function reportSignupRequestFailed(err: unknown, email: string): void {
  const message = (err instanceof Error ? err.message : String(err)).slice(0, 300);

  try {
    trackEvent("signup_error", { reason: "request_failed" });
  } catch {
    // 計測の失敗は無視
  }

  try {
    const body = JSON.stringify({ type: "signup_request_failed", email, message });
    const blob = new Blob([body], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/auth/client-error", blob)) {
      void fetch("/api/auth/client-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // 記録の失敗は無視
  }
}
