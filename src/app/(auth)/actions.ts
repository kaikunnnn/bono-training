"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { translateAuthError } from "@/lib/auth-error-messages";
import { reportAuthError } from "@/lib/monitoring";
import { withSignUpMarker } from "@/lib/auth-markers";
import { sanitizeRedirect } from "@/lib/safe-redirect";
import { PASSWORD_TOO_SHORT_MESSAGE, isPasswordLongEnough } from "@/lib/auth-password";

export interface AuthResult {
  error?: string;
  success?: boolean;
}

/** ネットワーク・接続エラーをわかりやすいメッセージに変換 */
function translateConnectionError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);

  // 開発者向けのヒントは開発環境だけで出す（本番の利用者に見せない）
  if (process.env.NODE_ENV !== "production") {
    if (msg.includes("fetch failed") || msg.includes("ECONNREFUSED")) {
      return "サーバーに接続できません。開発環境の場合は Supabase が起動しているか確認してください（npx supabase start）";
    }
    return `接続エラーが発生しました: ${msg}`;
  }

  return "通信がうまくいきませんでした。時間をおいて、もう一度お試しください。";
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirectTo") as string | null;

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください" };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      await reportAuthError({
        type: "login_failed",
        email,
        message: error.message,
        path: "/login",
      });
      return { error: translateAuthError(error.message) };
    }
  } catch (err) {
    return { error: translateConnectionError(err) };
  }

  revalidatePath("/", "layout");
  redirect(sanitizeRedirect(redirectTo));
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const redirectTo = formData.get("redirectTo") as string | null;

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください" };
  }

  if (password !== confirmPassword) {
    return { error: "パスワードが一致しません" };
  }

  if (!isPasswordLongEnough(password)) {
    return { error: PASSWORD_TOO_SHORT_MESSAGE };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      await reportAuthError({
        type: "signup_failed",
        email,
        message: error.message,
        path: "/signup",
      });
      return { error: translateAuthError(error.message) };
    }
  } catch (err) {
    // Supabase に届かなかった登録も数えられるように記録する（#321 S5）
    await reportAuthError({
      type: "signup_failed",
      email,
      message: `connection: ${err instanceof Error ? err.message : String(err)}`,
      path: "/signup",
    });
    return { error: translateConnectionError(err) };
  }

  // 登録成功後、自動ログインしてリダイレクト
  revalidatePath("/", "layout");

  // 通常のsignup（intentなし）のみ、着地先に welcome フラグを付ける。
  // 着地ページ側の WelcomeToast がこれを検知して歓迎トーストを一度だけ表示する。
  // intentフロー（redirectTo に intent_plan を含む）では登録直後に自動でStripe
  // Checkout へ遷移するためトーストが見えない/一瞬で流れる → フラグを付けない。
  // 注意: redirect() は NEXT_REDIRECT を throw して動作するため try/catch の外で呼ぶ。
  // オープンリダイレクト対策（F-5）: 外部URLは "/" に落とす。内部パス+queryは保持。
  // GA4 sign_up（#213 A1）: 新規作成の着地だけに `signup=1` を付け、SignUpTracker が
  // 1回だけ送って消す。ログインには付かないので二重発火しない。intentフローも計測する。
  const target = withSignUpMarker(sanitizeRedirect(redirectTo));
  if (target.includes("intent_plan")) {
    redirect(target);
  }
  const separator = target.includes("?") ? "&" : "?";
  redirect(`${target}${separator}welcome=1`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function resetPassword(email: string): Promise<AuthResult> {
  if (!email) {
    return { error: "メールアドレスを入力してください" };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      await reportAuthError({
        type: "password_reset_failed",
        email,
        message: error.message,
        path: "/forgot-password",
      });
      return { error: translateAuthError(error.message) };
    }
  } catch (err) {
    return { error: translateConnectionError(err) };
  }

  return { success: true };
}

export async function verifyEmailOtp(
  email: string,
  token: string
): Promise<AuthResult> {
  if (!email || !token) {
    return { error: "メールアドレスと確認コードを入力してください" };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      return {
        error: "確認コードが正しくないか、有効期限が切れています。もう一度お試しください。",
      };
    }
  } catch (err) {
    return { error: translateConnectionError(err) };
  }

  redirect("/auth/update-password");
}

// 移行ユーザーかどうかをチェックする関数
export async function checkMigratedUser(
  email: string
): Promise<{ exists: boolean; isMigrated: boolean }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase env vars");
      return { exists: false, isMigrated: false };
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/check-migrated-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 新しい公開鍵は JWT ではないため Authorization には入れず apikey で送る。
          // check-migrated-user は verify_jwt = false（supabase/config.toml）なのでこの形で通る。
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok) {
      console.error("Failed to check migrated user:", response.status);
      return { exists: false, isMigrated: false };
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking migrated user:", error);
    return { exists: false, isMigrated: false };
  }
}
