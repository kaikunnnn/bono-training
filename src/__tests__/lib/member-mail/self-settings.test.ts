// @vitest-environment node
// 通知設定の「BONOからのお知らせメール」のオン・オフ（#327-C）と、配信停止画面の「受け取りを再開する」。
import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("server-only", () => ({}));
import { MAIL_CATEGORIES } from "@/lib/member-mail/types";
import { createUnsubscribeToken } from "@/lib/member-mail/unsubscribe-token";
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

  it("ログイン中の本人しか書き換えない（他人の id を渡しても無視する）", async () => {
    const { updateMemberMailSetting } = await import("@/app/account/notifications/mail-actions");
    await store.unsubscribe(uid(2), ALL, "one_click");
    // 引数に他人の id を足しても、使うのはログイン中の本人（uid(1)）
    const call = updateMemberMailSetting as unknown as (enabled: boolean, other: unknown) => Promise<unknown>;
    await call(true, { userId: uid(2) });
    expect(await store.listStoppedCategories(uid(2))).toEqual(ALL);

    await call(false, uid(3));
    expect(await store.listStoppedCategories(uid(3))).toEqual([]);
    expect(await store.listStoppedCategories(uid(1))).toEqual(ALL);
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
    const t = createUnsubscribeToken(SECRET, uid(1), "comeback");
    expect(await restartMemberMail(null, form(t))).toEqual({ status: "updated", stopped: false });
    expect(await store.listStoppedCategories(uid(1))).toEqual([]);
  });

  it("偽のトークンでは何も戻さない", async () => {
    const { restartMemberMail } = await import("@/app/mail/unsubscribe/actions");
    await store.unsubscribe(uid(1), ALL, "link");
    const t = createUnsubscribeToken(`${SECRET}-other`, uid(1), "notice");
    expect(await restartMemberMail(null, form(t))).toEqual({ status: "invalid" });
    expect(await store.listStoppedCategories(uid(1))).toEqual(ALL);
  });

  it("「受け取りをやめる」は全カテゴリを止め、止めているかどうかだけ返す", async () => {
    const { stopMemberMail } = await import("@/app/mail/unsubscribe/actions");
    const t = createUnsubscribeToken(SECRET, uid(1), "notice");
    expect(await stopMemberMail(null, form(t))).toEqual({ status: "stopped", stopped: true });
    expect(await store.listStoppedCategories(uid(1))).toEqual(ALL);
  });
});
