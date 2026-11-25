// @vitest-environment node
// 通知設定の「BONOからのお知らせメール」のオン・オフ（#327-C）と、配信停止画面の「受け取りを再開する」。
import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("server-only", () => ({}));
import { MAIL_CATEGORIES } from "@/lib/member-mail/types";
import { createLegacyUnsubscribeTokenV1 } from "@/lib/member-mail/unsubscribe-token";
import { MemStore, SECRET, uid } from "./helpers";

const store = new MemStore();
let storeAvailable = true;
vi.mock("@/lib/member-mail/runtime", () => ({
  getMailStore: () => (storeAvailable ? store : null),
  getUnsubscribeSecret: () => SECRET,
}));

let currentUser: { id: string } | null = null;
vi.mock("@/lib/subscription", () => ({ getCurrentUser: async () => currentUser }));

const ALL = [...MAIL_CATEGORIES];

beforeEach(() => {
  store.unsubscribes.clear();
  storeAvailable = true;
  currentUser = { id: uid(1) };
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("通知設定のメールのオン・オフ（updateMemberMailSetting）", () => {
  it("オフで4カテゴリすべて止まる（method は link）", async () => {
    const { updateMemberMailSetting } = await import("@/app/account/notifications/mail-actions");
    expect(await updateMemberMailSetting(false)).toEqual({ success: true, enabled: false });
    expect(await store.listStoppedCategories(uid(1))).toEqual(ALL);
    for (const c of ALL) expect(store.unsubscribes.get(`${uid(1)}:${c}`)?.method).toBe("link");
  });

  it("オンで全部戻る（一部だけ止まっていた人も）", async () => {
    const { updateMemberMailSetting } = await import("@/app/account/notifications/mail-actions");
    await store.unsubscribe(uid(1), ["comeback", "winback"], "one_click");
    expect(await updateMemberMailSetting(true)).toEqual({ success: true, enabled: true });
    expect(await store.listStoppedCategories(uid(1))).toEqual([]);

    await updateMemberMailSetting(false);
    expect(await updateMemberMailSetting(true)).toEqual({ success: true, enabled: true });
    expect(await store.listStoppedCategories(uid(1))).toEqual([]);
  });

  it("書き込みはすべて getCurrentUser の本人の id で行い、他人の記録は変わらない", async () => {
    const { updateMemberMailSetting } = await import("@/app/account/notifications/mail-actions");
    await store.unsubscribe(uid(2), ALL, "one_click");
    const unsub = vi.spyOn(store, "unsubscribe");
    const resub = vi.spyOn(store, "resubscribe");
    try {
      currentUser = { id: uid(1) };
      await updateMemberMailSetting(false);
      await updateMemberMailSetting(true);
      expect(unsub).toHaveBeenCalled();
      expect(resub).toHaveBeenCalled();
      for (const [userId] of [...unsub.mock.calls, ...resub.mock.calls]) expect(userId).toBe(uid(1));

      // ログイン中の人が変われば、書き込む先もその人に変わる（引数では決まらない）
      unsub.mockClear();
      currentUser = { id: uid(3) };
      await updateMemberMailSetting(false);
      expect(unsub.mock.calls.map(([userId]) => userId)).toEqual([uid(3)]);
    } finally {
      unsub.mockRestore();
      resub.mockRestore();
    }
    expect(await store.listStoppedCategories(uid(2))).toEqual(ALL);
  });

  it("ログインしていなければ何も書き換えない", async () => {
    const { updateMemberMailSetting } = await import("@/app/account/notifications/mail-actions");
    currentUser = null;
    expect(await updateMemberMailSetting(false)).toMatchObject({ success: false });
    expect(store.unsubscribes.size).toBe(0);
  });

  it("オン・オフ以外の値は受け付けない", async () => {
    const { updateMemberMailSetting } = await import("@/app/account/notifications/mail-actions");
    const call = updateMemberMailSetting as unknown as (enabled: unknown) => Promise<unknown>;
    expect(await call("false")).toMatchObject({ success: false });
    expect(store.unsubscribes.size).toBe(0);
  });

  it("記録の仕組みが使えないときは失敗を返す", async () => {
    const { updateMemberMailSetting } = await import("@/app/account/notifications/mail-actions");
    storeAvailable = false;
    expect(await updateMemberMailSetting(false)).toMatchObject({ success: false });
    expect(store.unsubscribes.size).toBe(0);
  });
});

describe("配信停止画面の「受け取りを再開する」（restartMemberMail）", () => {
  function form(t: string): FormData {
    const fd = new FormData();
    fd.set("t", t);
    return fd;
  }

  it("トークンだけで全カテゴリを戻し、返すのは止めているかどうかだけ", async () => {
    const { restartMemberMail } = await import("@/app/mail/unsubscribe/actions");
    await store.unsubscribe(uid(1), ALL, "link");
    const t = createLegacyUnsubscribeTokenV1(SECRET, uid(1), "comeback");
    expect(await restartMemberMail(null, form(t))).toEqual({ status: "updated", stopped: false });
    expect(await store.listStoppedCategories(uid(1))).toEqual([]);
  });

  it("偽のトークンでは何も戻さない", async () => {
    const { restartMemberMail } = await import("@/app/mail/unsubscribe/actions");
    await store.unsubscribe(uid(1), ALL, "link");
    const t = createLegacyUnsubscribeTokenV1(`${SECRET}-other`, uid(1), "notice");
    expect(await restartMemberMail(null, form(t))).toEqual({ status: "invalid" });
    expect(await store.listStoppedCategories(uid(1))).toEqual(ALL);
  });

  it("一部だけ止まっている人は「止めている」扱いにしない（全部止めると止めている）", async () => {
    const { isMemberMailFullyStopped, isMemberMailEnabled } = await import("@/lib/member-mail/self-settings");
    await store.unsubscribe(uid(1), ["comeback"], "link");
    expect(await isMemberMailFullyStopped(store, uid(1))).toBe(false);
    // 設定画面のスイッチは、1つでも止まっていればオフのまま
    expect(await isMemberMailEnabled(store, uid(1))).toBe(false);
    await store.unsubscribe(uid(1), ALL, "link");
    expect(await isMemberMailFullyStopped(store, uid(1))).toBe(true);
  });

  it("一部だけ止まっている人も「受け取りをやめる」で全カテゴリを止められる", async () => {
    const { stopMemberMail } = await import("@/app/mail/unsubscribe/actions");
    await store.unsubscribe(uid(1), ["comeback"], "one_click");
    const t = createLegacyUnsubscribeTokenV1(SECRET, uid(1), "notice");
    expect(await stopMemberMail(null, form(t))).toEqual({ status: "stopped", stopped: true });
    expect(await store.listStoppedCategories(uid(1))).toEqual(ALL);
  });

  it("「受け取りをやめる」は全カテゴリを止め、止めているかどうかだけ返す", async () => {
    const { stopMemberMail } = await import("@/app/mail/unsubscribe/actions");
    const t = createLegacyUnsubscribeTokenV1(SECRET, uid(1), "notice");
    expect(await stopMemberMail(null, form(t))).toEqual({ status: "stopped", stopped: true });
    expect(await store.listStoppedCategories(uid(1))).toEqual(ALL);
  });
});
