import 'server-only'
import { cache } from 'react'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User } from '@supabase/supabase-js'

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
 * リクエストスコープでメモ化した auth.getUser()。
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
export const getCachedUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient()
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch {
    // セッションが stale 等で auth が落ちた場合は未ログイン扱い
    return null
  }
})
