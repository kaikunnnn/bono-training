"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { trackSignUp } from "@/lib/analytics";
import { SIGNUP_MARKER_PARAM } from "@/lib/auth-markers";

/**
 * GA4 `sign_up` を「アカウントを新規作成した直後の着地」で1回だけ送る。
 * signUp Server Action が着地先 URL に `signup=1` を付ける（通常フロー・intent フロー両方）。
 * ログインでは付かないので二重発火しない。送ったら URL から印を消す。
 *
 * useSearchParams を使うため、呼び出し側で <Suspense> に包む（WelcomeToast と同じ）。
 */
export function SignUpTracker() {
  const searchParams = useSearchParams();
  const handled = useRef(false);
  const isSignUp = searchParams.get(SIGNUP_MARKER_PARAM) === "1";

  useEffect(() => {
    if (!isSignUp || handled.current) return;
    handled.current = true;

    trackSignUp("email");

    try {
      const params = new URLSearchParams(window.location.search);
      if (!params.has(SIGNUP_MARKER_PARAM)) return;
      params.delete(SIGNUP_MARKER_PARAM);
      const query = params.toString();
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname +
          (query ? `?${query}` : "") +
          window.location.hash
      );
    } catch {
      // URL の掃除に失敗しても計測には影響しない
    }
  }, [isSignUp]);

  return null;
}
