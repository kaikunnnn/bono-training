"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { translateAuthError } from "@/lib/auth-error-messages";

export interface AuthResult {
  error?: string;
  success?: boolean;
}

/** ネットワーク・接続エラーをわかりやすいメッセージに変換 */
function translateConnectionError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);

  if (msg.includes("fetch failed") || msg.includes("ECONNREFUSED")) {
    return "サーバーに接続できません。開発環境の場合は Supabase が起動しているか確認してください（npx supabase start）";
  }

  return `接続エラーが発生しました: ${msg}`;
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
      return { error: translateAuthError(error.message) };
    }
  } catch (err) {
    return { error: translateConnectionError(err) };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo || "/");
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

  if (password.length < 8) {
    return { error: "パスワードは8文字以上で入力してください" };
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
      return { error: translateAuthError(error.message) };
    }
  } catch (err) {
    return { error: translateConnectionError(err) };
  }

  // 登録成功後、自動ログインしてリダイレクト
  revalidatePath("/", "layout");
  redirect(redirectTo || "/");
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

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
    });

    if (error) {
      return { error: translateAuthError(error.message) };
    }
  } catch (err) {
    return { error: translateConnectionError(err) };
  }

  return { success: true };
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
          Authorization: `Bearer ${supabaseAnonKey}`,
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
