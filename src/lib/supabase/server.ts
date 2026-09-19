import 'server-only'
import { cache } from 'react'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User } from '@supabase/supabase-js'
import { traceServerStep } from '@/lib/performance/server-trace'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * リクエストスコープでメモ化した auth.getUser() とセッションエラー分類。
 *
 * 掲示板詳細ページでは getSubscriptionStatus / getCurrentUser / getMyReactions が
 * それぞれ独立に supabase.auth.getUser() を呼んでおり、1リクエストで最大4回
 * 認証往復が発生していた（waterfall の一因）。React の cache() でラップすることで
 * 同一 Server Component レンダー内では初回のみ実行し、2回目以降はキャッシュを返す。
 *
 * 注意: これは React の cache()（リクエストごとにリセットされ、ユーザー間で共有され
 * ない）であり、Next.js の unstable_cache（デプロイ全体で共有）とは別物。したがって
 * 別ユーザーのリクエスト間でユーザー情報が漏洩することはない。
 */
export interface CachedAuthResult {
  user: User | null;
  invalidSession: boolean;
}

export const getCachedAuth = cache(async (): Promise<CachedAuthResult> => {
  // Keep client initialization outside the catch: existing getCachedUser callers
  // still see configuration/cookie-store failures. UserProvider handles those.
  const supabase = await createClient()
  try {
    const {
      data: { user },
      error,
    } = await traceServerStep("auth.get_user", () => supabase.auth.getUser())
    if (user) return { user, invalidSession: false }
    return {
      user: null,
      invalidSession: !!error && typeof error.status === 'number' && [400, 401, 403].includes(error.status),
    }
  } catch {
    // Do not clear otherwise valid cookies on transient/unknown failures.
    return { user: null, invalidSession: false }
  }
})

/** Layout and page/service callers must use the same request-scoped gateway. */
export async function getCachedUser(): Promise<User | null> {
  return (await getCachedAuth()).user
}
