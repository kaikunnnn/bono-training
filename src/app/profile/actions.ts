"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ProfileData {
  displayName: string;
  avatarUrl: string;
  bio: string;
}

export interface ProfileResult {
  error?: string;
  success?: boolean;
}

export async function updateProfile(data: ProfileData): Promise<ProfileResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      display_name: data.displayName,
      avatar_url: data.avatarUrl,
      bio: data.bio,
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/mypage");
  revalidatePath("/", "layout");

  return { success: true };
}
