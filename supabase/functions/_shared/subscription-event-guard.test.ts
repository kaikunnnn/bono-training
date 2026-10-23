/**
 * decideSubscriptionEventApply / isFeeMigrationSubscription（#250）のユニットテスト
 *   - オフライン・外部import無し
 *
 * 実行: deno test supabase/functions/_shared/subscription-event-guard.test.ts
 */

import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import {
  decideSubscriptionEventApply,
  isFeeMigrationSubscription,
  isLiveSubscriptionStatus,
} from "./subscription-event-guard.ts";

const OLD = { id: "sub_old", created: 1_700_000_000 };
const NEW = { id: "sub_new", created: 1_760_000_000 };

Deno.test("行が無い → 反映", () => {
  assertEquals(
    decideSubscriptionEventApply({ kind: "deleted", eventSubscription: OLD, currentSubscriptionId: null }),
    { apply: true, reason: "no_current" }
  );
});

Deno.test("今の契約と同じ（通常の解約・解約予約・プラン変更）→ 反映", () => {
  for (const kind of ["deleted", "updated", "invoice_paid"] as const) {
    assertEquals(
      decideSubscriptionEventApply({ kind, eventSubscription: OLD, currentSubscriptionId: "sub_old" }),
      { apply: true, reason: "matches_current" }
    );
  }
});

Deno.test("移行: 古い契約の終了（deleted）で、今の新しい契約が active → 見送り", () => {
  assertEquals(
    decideSubscriptionEventApply({
      kind: "deleted",
      eventSubscription: OLD,
      currentSubscriptionId: "sub_new",
      currentSubscription: { status: "active", created: NEW.created },
    }),
    { apply: false, reason: "current_still_live" }
  );
});

Deno.test("移行: 古い契約の解約予約（updated）で、今の新しい契約が active → 見送り", () => {
  assertEquals(
    decideSubscriptionEventApply({
      kind: "updated",
      eventSubscription: OLD,
      currentSubscriptionId: "sub_new",
      currentSubscription: { status: "active", created: NEW.created },
    }),
    { apply: false, reason: "current_still_live" }
  );
});

Deno.test("今の契約が past_due / trialing でも生きている扱い → deleted は見送り", () => {
  for (const status of ["past_due", "trialing"]) {
    assertEquals(
      decideSubscriptionEventApply({
        kind: "deleted",
        eventSubscription: OLD,
        currentSubscriptionId: "sub_new",
        currentSubscription: { status, created: NEW.created },
      }).apply,
      false
    );
  }
});

Deno.test("新しい契約の updated が created より先に届いた（DBはまだ古い契約）→ 新しいので反映", () => {
  assertEquals(
    decideSubscriptionEventApply({
      kind: "updated",
      eventSubscription: NEW,
      currentSubscriptionId: "sub_old",
      currentSubscription: { status: "active", created: OLD.created },
    }),
    { apply: true, reason: "newer_than_current" }
  );
});

Deno.test("deleted は新しさに関係なく、今の契約が生きていれば見送り", () => {
  assertEquals(
    decideSubscriptionEventApply({
      kind: "deleted",
      eventSubscription: NEW,
      currentSubscriptionId: "sub_old",
      currentSubscription: { status: "active", created: OLD.created },
    }).apply,
    false
  );
});

Deno.test("解約後の再入会: 今の契約（DB）が canceled → 反映", () => {
  for (const kind of ["deleted", "updated", "invoice_paid"] as const) {
    assertEquals(
      decideSubscriptionEventApply({
        kind,
        eventSubscription: NEW,
        currentSubscriptionId: "sub_old",
        currentSubscription: { status: "canceled", created: OLD.created },
      }),
      { apply: true, reason: "current_not_live" }
    );
  }
});

Deno.test("今の契約が Stripe に存在しない → 反映", () => {
  assertEquals(
    decideSubscriptionEventApply({
      kind: "deleted",
      eventSubscription: OLD,
      currentSubscriptionId: "sub_gone",
      currentSubscription: "missing",
    }),
    { apply: true, reason: "current_not_live" }
  );
});

Deno.test("今の契約の取得に失敗 → 見送り（誤って無効にしない）", () => {
  assertEquals(
    decideSubscriptionEventApply({
      kind: "deleted",
      eventSubscription: OLD,
      currentSubscriptionId: "sub_new",
      currentSubscription: "unavailable",
    }),
    { apply: false, reason: "current_unavailable" }
  );
});

Deno.test("isLiveSubscriptionStatus", () => {
  assertEquals(isLiveSubscriptionStatus("active"), true);
  assertEquals(isLiveSubscriptionStatus("past_due"), true);
  assertEquals(isLiveSubscriptionStatus("canceled"), false);
  assertEquals(isLiveSubscriptionStatus("incomplete_expired"), false);
  assertEquals(isLiveSubscriptionStatus(undefined), false);
});

Deno.test("isFeeMigrationSubscription", () => {
  assertEquals(
    isFeeMigrationSubscription({ bono_migration: "ms_fee_removal", migrated_from_subscription: "sub_old" }),
    true
  );
  assertEquals(isFeeMigrationSubscription({ bono_migration: "other" }), false);
  assertEquals(isFeeMigrationSubscription({}), false);
  assertEquals(isFeeMigrationSubscription(null), false);
});
