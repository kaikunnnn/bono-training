/**
 * derivePlanFromPrice（S4）のユニットテスト
 *   - オフライン・外部import無し（deno test で高速に回る）
 *   - 現行4価格 + legacy + 未知(fail loud=null) を網羅
 *
 * 実行: deno test supabase/functions/_shared/plan-utils.test.ts
 */

import {
  assertEquals,
} from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { derivePlanFromPrice, type StripePriceLike } from "./plan-utils.ts";

// ---- Tier 3: unit_amount 完全一致（現行4価格） ----

Deno.test("現行 standard 1ヶ月(680000)→ standard/1", () => {
  const price: StripePriceLike = {
    id: "price_x",
    unit_amount: 680000,
    recurring: { interval: "month", interval_count: 1 },
  };
  assertEquals(derivePlanFromPrice(price), { planType: "standard", duration: 1 });
});

Deno.test("現行 standard 3ヶ月(1740000)→ standard/3", () => {
  const price: StripePriceLike = {
    id: "price_x",
    unit_amount: 1740000,
    recurring: { interval: "month", interval_count: 3 },
  };
  assertEquals(derivePlanFromPrice(price), { planType: "standard", duration: 3 });
});

Deno.test("現行 feedback 1ヶ月(1580000)→ feedback/1", () => {
  const price: StripePriceLike = {
    id: "price_x",
    unit_amount: 1580000,
    recurring: { interval: "month", interval_count: 1 },
  };
  assertEquals(derivePlanFromPrice(price), { planType: "feedback", duration: 1 });
});

Deno.test("現行 feedback 3ヶ月(4140000)→ feedback/3", () => {
  const price: StripePriceLike = {
    id: "price_x",
    unit_amount: 4140000,
    recurring: { interval: "month", interval_count: 3 },
  };
  assertEquals(derivePlanFromPrice(price), { planType: "feedback", duration: 3 });
});

// ---- Tier 3: legacy（確証のある金額のみ） ----

Deno.test("legacy standard 3ヶ月(1194000)→ standard/3", () => {
  const price: StripePriceLike = {
    id: "price_legacy",
    unit_amount: 1194000,
    recurring: { interval: "month", interval_count: 3 },
  };
  assertEquals(derivePlanFromPrice(price), { planType: "standard", duration: 3 });
});

// ---- Tier 2: product名 / nickname キーワード ----

Deno.test("product名に feedback → feedback、duration は interval_count(3)", () => {
  const price: StripePriceLike = {
    id: "price_unknown_amount",
    unit_amount: 999999, // amountテーブルに無い
    recurring: { interval: "month", interval_count: 3 },
    product: { name: "BONO Feedback Plan" },
  };
  assertEquals(derivePlanFromPrice(price), { planType: "feedback", duration: 3 });
});

Deno.test("legacy product名 Growth → feedback（旧名Growth＝feedback）", () => {
  const price: StripePriceLike = {
    id: "price_growth",
    unit_amount: 777777,
    recurring: { interval: "month", interval_count: 1 },
    product: { name: "Growthプラン" },
  };
  assertEquals(derivePlanFromPrice(price), { planType: "feedback", duration: 1 });
});

Deno.test("nickname に standard → standard、duration 既定1", () => {
  const price: StripePriceLike = {
    id: "price_nick",
    unit_amount: 555555,
    nickname: "Standard Monthly (legacy)",
    recurring: { interval: "month", interval_count: 1 },
  };
  assertEquals(derivePlanFromPrice(price), { planType: "standard", duration: 1 });
});

Deno.test("キーワードが amount より優先される（product feedback だが amount は standard の金額）", () => {
  const price: StripePriceLike = {
    id: "price_conflict",
    unit_amount: 680000, // これはstandardの金額だが…
    recurring: { interval: "month", interval_count: 1 },
    product: { name: "Feedback (special)" }, // 名称はfeedback
  };
  // Tier2(名称)が先に効くので feedback
  assertEquals(derivePlanFromPrice(price), { planType: "feedback", duration: 1 });
});

Deno.test("deleted な product は name を無視して amount へ落ちる", () => {
  const price: StripePriceLike = {
    id: "price_deleted_prod",
    unit_amount: 680000,
    recurring: { interval: "month", interval_count: 1 },
    product: { deleted: true },
  };
  assertEquals(derivePlanFromPrice(price), { planType: "standard", duration: 1 });
});

// ---- 未知(fail loud): null を返す ----

Deno.test("未知の金額(26,400=2640000・plan_type不明)→ null（standard/1に握り潰さない）", () => {
  const price: StripePriceLike = {
    id: "price_ambiguous",
    unit_amount: 2640000,
    recurring: { interval: "month", interval_count: 3 },
  };
  assertEquals(derivePlanFromPrice(price), null);
});

Deno.test("金額もキーワードも手がかり無し → null", () => {
  const price: StripePriceLike = {
    id: "price_mystery",
    unit_amount: 123456,
    recurring: { interval: "month", interval_count: 1 },
  };
  assertEquals(derivePlanFromPrice(price), null);
});

Deno.test("product が未展開(文字列ID)かつ amount不明 → null", () => {
  const price: StripePriceLike = {
    id: "price_str_prod",
    unit_amount: 424242,
    product: "prod_ABC123",
  };
  assertEquals(derivePlanFromPrice(price), null);
});

Deno.test("price が null/undefined → null", () => {
  assertEquals(derivePlanFromPrice(null), null);
  assertEquals(derivePlanFromPrice(undefined), null);
});

Deno.test("standard と feedback の両キーワードが混在 → Tier2を諦め amount へ", () => {
  const price: StripePriceLike = {
    id: "price_both",
    unit_amount: 1580000, // feedback 1M の金額
    recurring: { interval: "month", interval_count: 1 },
    product: { name: "Standard→Feedback upgrade" }, // 両方含む
  };
  // 名称は曖昧 → amountテーブルで feedback/1
  assertEquals(derivePlanFromPrice(price), { planType: "feedback", duration: 1 });
});
