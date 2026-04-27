"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthResult {
  error?: string;
  success?: boolean;
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirectTo") as string | null;

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "メールアドレスまたはパスワードが正しくありません" };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo || "/");
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください" };
  }

  if (password !== confirmPassword) {
    return { error: "パスワードが一致しません" };
  }

  if (password.length < 8) {
    return { error: "パスワードは8文字以上で入力してください" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "このメールアドレスは既に登録されています" };
    }
    return { error: error.message };
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function resetPassword(email: string): Promise<AuthResult> {
  const supabase = await createClient();

  if (!email) {
    return { error: "メールアドレスを入力してください" };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/update-password`,
  });

  if (error) {
    return { error: error.message };
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
