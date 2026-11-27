// @vitest-environment node
// store.ts の30分相談の予約まわり（#327-F）が、DB 関数の返す形が想定と違うときに黙らず失敗するか（偽の Supabase クライアント）。
// 形はローカル DB で確かめたもの: member_mail_consult_booked_user_ids → uuid の文字列の配列 / member_mail_record_consult_booking → "booked" | "cancelled"
import { describe, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseMailStore } from "@/lib/member-mail/store";
import { uid } from "./helpers";

function fakeClient(result: { data: unknown; error: { code?: string } | null }) {
  const calls: { fn: string; args: unknown }[] = [];
  const client = {
    rpc: async (fn: string, args: unknown) => {
      calls.push({ fn, args });
      return result;
    },
  } as unknown as SupabaseClient;
  return { client, calls };
}

describe("listConsultBookedUserIds", () => {
  it("uuid の配列を Set にする", async () => {
    const { client, calls } = fakeClient({ data: [uid(1)], error: null });
    const store = createSupabaseMailStore(client);
    expect(await store.listConsultBookedUserIds([uid(1), uid(2)])).toEqual(new Set([uid(1)]));
    expect(calls).toEqual([{ fn: "member_mail_consult_booked_user_ids", args: { p_user_ids: [uid(1), uid(2)] } }]);
  });

  it.each([
    ["null", null],
    ["配列でない", { member_mail_consult_booked_user_ids: uid(1) }],
    ["行がオブジェクト", [{ member_mail_consult_booked_user_ids: uid(1) }]],
    ["行が uuid でない", ["not-a-uuid"]],
    ["行が数値", [1]],
  ])("返り値が想定と違えば失敗する（%s）", async (_label, data) => {
    const store = createSupabaseMailStore(fakeClient({ data, error: null }).client);
    await expect(store.listConsultBookedUserIds([uid(1)])).rejects.toThrow(/^consult bookings read failed: unexpected_/);
  });

  it("DB のエラーはコードだけの文言で失敗する", async () => {
    const store = createSupabaseMailStore(fakeClient({ data: null, error: { code: "42883" } }).client);
    await expect(store.listConsultBookedUserIds([uid(1)])).rejects.toThrow("consult bookings read failed: 42883");
  });
});

describe("recordConsultBooking", () => {
  const input = { bookingUid: "bk-1", attendeeEmail: " Member1@Example.invalid ", status: "booked" as const, startTime: null };

  it("小文字にして渡し、記録後の状態を返す", async () => {
    const { client, calls } = fakeClient({ data: "cancelled", error: null });
    expect(await createSupabaseMailStore(client).recordConsultBooking(input)).toBe("cancelled");
    expect(calls[0]).toEqual({
      fn: "member_mail_record_consult_booking",
      args: { p_booking_uid: "bk-1", p_attendee_email: "member1@example.invalid", p_status: "booked", p_start_time: null },
    });
  });

  it.each([[null], ["BOOKED"], [["booked"]], [{ status: "booked" }]])("返り値が想定と違えば失敗する（%j）", async (data) => {
    const store = createSupabaseMailStore(fakeClient({ data, error: null }).client);
    const err = await store.recordConsultBooking(input).catch((e: Error) => e);
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toBe("consult booking record failed: unexpected_result");
    expect((err as Error).message).not.toContain("example.invalid");
  });
});
