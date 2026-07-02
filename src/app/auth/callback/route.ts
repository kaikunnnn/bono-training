import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { reportAuthError } from "@/lib/monitoring";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  await reportAuthError({
    type: "callback_failed",
    message: "OAuth code exchange failed or code missing",
    path: "/auth/callback",
  });
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
