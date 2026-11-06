/**
 * Edge Functions で使う Supabase の鍵を1か所で取得する。
 *
 * 新しい鍵（publishable / secret）があればそれを使い、無ければ legacy 鍵
 * （anon / service_role）へ戻る。新しい鍵は Supabase が環境変数へ JSON で自動的に入れる:
 *   SUPABASE_SECRET_KEYS      = {"default":"sb_secret_..."}
 *   SUPABASE_PUBLISHABLE_KEYS = {"default":"sb_publishable_..."}
 * 出典: https://supabase.com/docs/guides/functions/secrets
 *
 * 【重要】
 * - 外部 import を持たない（deno test をオフラインで回せるようにする）。
 * - 鍵の値は一切ログに出さない（先頭の一部も出さない）。
 * - どちらの鍵も無いときは "" を返す。呼び出し側の createClient が今と同じくエラーにする。
 */

const NEW_KEY_NAME = "default";

type EnvGetter = (name: string) => string | undefined;

function readDefaultKey(json: string | undefined): string | undefined {
  if (!json) return undefined;
  try {
    const key = JSON.parse(json)?.[NEW_KEY_NAME];
    return typeof key === "string" && key.length > 0 ? key : undefined;
  } catch {
    return undefined;
  }
}

/** 管理者用の鍵（RLS を通らない）。サーバー側でのみ使う。 */
export function getSupabaseSecretKey(
  getEnv: EnvGetter = (name) => Deno.env.get(name),
): string {
  return readDefaultKey(getEnv("SUPABASE_SECRET_KEYS")) ??
    getEnv("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}

/** 公開用の鍵（RLS の対象）。 */
export function getSupabasePublishableKey(
  getEnv: EnvGetter = (name) => Deno.env.get(name),
): string {
  return readDefaultKey(getEnv("SUPABASE_PUBLISHABLE_KEYS")) ??
    getEnv("SUPABASE_ANON_KEY") ?? "";
}
