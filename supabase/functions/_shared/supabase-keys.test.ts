/**
 * _shared/supabase-keys.ts のユニットテスト
 *
 * 実行: deno test supabase/functions/_shared/supabase-keys.test.ts
 * 鍵はすべて架空の値。
 */

import { assertEquals } from "jsr:@std/assert@1";
import {
  getSupabasePublishableKey,
  getSupabaseSecretKey,
} from "./supabase-keys.ts";

const envOf = (vars: Record<string, string>) => (name: string) => vars[name];

const LEGACY = "legacy-key";
const NEW = "new-key";

const cases: [string, typeof getSupabaseSecretKey, string, string][] = [
  [
    "secret",
    getSupabaseSecretKey,
    "SUPABASE_SECRET_KEYS",
    "SUPABASE_SERVICE_ROLE_KEY",
  ],
  [
    "publishable",
    getSupabasePublishableKey,
    "SUPABASE_PUBLISHABLE_KEYS",
    "SUPABASE_ANON_KEY",
  ],
];

for (const [label, getKey, newVar, legacyVar] of cases) {
  Deno.test(`${label}: 新しい鍵が無ければ legacy 鍵を返す（今と同じ動き）`, () => {
    assertEquals(getKey(envOf({ [legacyVar]: LEGACY })), LEGACY);
  });

  Deno.test(`${label}: 新しい鍵があれば優先する`, () => {
    const env = envOf({
      [newVar]: JSON.stringify({ default: NEW }),
      [legacyVar]: LEGACY,
    });
    assertEquals(getKey(env), NEW);
  });

  Deno.test(`${label}: 壊れた値や default が無い値では legacy 鍵へ戻る`, () => {
    for (
      const broken of [
        "",
        "not json",
        "null",
        "[]",
        "{}",
        '{"default":""}',
        '{"default":1}',
        '{"billing":"other-key"}',
      ]
    ) {
      const env = envOf({ [newVar]: broken, [legacyVar]: LEGACY });
      assertEquals(getKey(env), LEGACY, `入力: ${broken}`);
    }
  });

  Deno.test(`${label}: どちらも無ければ空文字を返す`, () => {
    assertEquals(getKey(envOf({})), "");
  });
}
