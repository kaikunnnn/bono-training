import { trackEvent } from "@/lib/analytics";

/**
 * 登録ボタンを押したあと、サーバーとの通信そのものが失敗したとき（#321 S5）。
 * 通信切れ・デプロイ直後の Server Action の食い違いなど。
 * 以前は画面に何も出ず、記録も残らなかった。
 */
export const SIGNUP_REQUEST_FAILED_MESSAGE =
  "登録の通信がうまくいきませんでした。通信状態を確かめて、もう一度「アカウントを作成」を押してください。";

/**
 * 登録ボタンのどこで止まったかを GA4 で数える（#320）。
 * - signup_click: ボタンを押した（ブラウザの入力チェックより前）
 * - signup_submit: ブラウザの入力チェックを通り、送信処理に入った
 * - signup_error: 止まった理由（reason）。ブラウザのチェック・文字数・不一致・サーバー・通信
 * 個人情報（メールアドレス等）は送らない。
 */
export type SignupErrorReason =
  | "invalid_email"
  | "invalid_password"
  | "invalid_confirm"
  | "password_too_short"
  | "password_mismatch"
  | "server"
  | "request_failed";

export function trackSignupStep(
  step: "signup_click" | "signup_submit",
  hasPlan: boolean,
): void {
  try {
    trackEvent(step, { has_plan: hasPlan });
  } catch {
    // 計測の失敗は無視
  }
}

export function trackSignupError(reason: SignupErrorReason, hasPlan: boolean): void {
  try {
    trackEvent("signup_error", { reason, has_plan: hasPlan });
  } catch {
    // 計測の失敗は無視
  }
}

/** ブラウザの入力チェックで止まった欄の id → 理由 */
export function invalidFieldReason(fieldId: string): SignupErrorReason | null {
  if (fieldId === "signup-email") return "invalid_email";
  if (fieldId === "signup-password") return "invalid_password";
  if (fieldId === "signup-confirm") return "invalid_confirm";
  return null;
}

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
export function reportSignupRequestFailed(err: unknown, email: string, hasPlan = false): void {
  const message = (err instanceof Error ? err.message : String(err)).slice(0, 300);

  trackSignupError("request_failed", hasPlan);

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
