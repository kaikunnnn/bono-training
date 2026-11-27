// @vitest-environment node
// 通知設定の「SlackのDMでのお知らせ」のオン・オフ（#327-H）の Server Action。
import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("server-only", () => ({}));
import type { SlackDmStore } from "@/lib/member-mail/slack-dm";
import { uid } from "./helpers";

const disabled = new Set<string>();
let failWrite = false;
const store = {
  async getSlackDmPreference(userId: string) {
    return { enabled: !disabled.has(userId), hasRow: false };
  },
  async setSlackDmEnabled(userId: string, enabled: boolean) {
    if (failWrite) throw new Error("slack dm preference write failed: 42P01");
    if (enabled) disabled.delete(userId);
    else disabled.add(userId);
  },
} as unknown as SlackDmStore;
let storeAvailable = true;
vi.mock("@/lib/member-mail/runtime", () => ({
  getSlackDmStore: () => (storeAvailable ? store : null),
}));

let currentUser: { id: string } | null = null;
vi.mock("@/lib/subscription", () => ({ getCurrentUser: async () => currentUser }));

beforeEach(() => {
  disabled.clear();
  failWrite = false;
  storeAvailable = true;
  currentUser = { id: uid(1) };
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("updateSlackDmSetting", () => {
  it("ログイン中の本人の設定だけを切り替える（既定はオン）", async () => {
    const { updateSlackDmSetting } = await import("@/app/account/notifications/slack-actions");
    expect((await store.getSlackDmPreference(uid(1))).enabled).toBe(true);
    expect(await updateSlackDmSetting(false)).toEqual({ success: true, enabled: false });
    expect(disabled.has(uid(1))).toBe(true);
    expect(disabled.has(uid(2))).toBe(false);
    expect(await updateSlackDmSetting(true)).toEqual({ success: true, enabled: true });
    expect(disabled.size).toBe(0);
  });

  it("ログインしていなければ変えない", async () => {
    const { updateSlackDmSetting } = await import("@/app/account/notifications/slack-actions");
    currentUser = null;
    const r = await updateSlackDmSetting(false);
    expect(r.success).toBe(false);
    expect(disabled.size).toBe(0);
  });

  it("真偽値以外は受け付けない", async () => {
    const { updateSlackDmSetting } = await import("@/app/account/notifications/slack-actions");
    const r = await updateSlackDmSetting("false" as unknown as boolean);
    expect(r.success).toBe(false);
    expect(disabled.size).toBe(0);
  });

  it("記録が無い・書けないときは失敗を返す（例外を投げない）", async () => {
    const { updateSlackDmSetting } = await import("@/app/account/notifications/slack-actions");
    storeAvailable = false;
    expect((await updateSlackDmSetting(false)).success).toBe(false);
    storeAvailable = true;
    failWrite = true;
    expect((await updateSlackDmSetting(false)).success).toBe(false);
  });
});
