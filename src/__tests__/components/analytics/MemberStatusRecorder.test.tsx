import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemberStatusRecorder } from "@/components/analytics/MemberStatusRecorder";
import { isAnalyticsHost } from "@/lib/analytics/config";
import { LAST_PAYING_AT_STORAGE_KEY } from "@/lib/analytics/member-status";

// jsdom の hostname は localhost なので、本番ホスト判定だけ true にする（GA を有効扱いにする）
vi.mock("@/lib/analytics/config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/analytics/config")>();
  return { ...actual, isAnalyticsHost: vi.fn(() => true) };
});

const gtagCalls = () => vi.mocked(window.gtag).mock.calls.map((args) => [...args]);

describe("MemberStatusRecorder（#213 T4 / #266 S1）", () => {
  beforeEach(() => {
    vi.mocked(isAnalyticsHost).mockReturnValue(true);
    window.gtag = vi.fn();
    window.localStorage.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("user_properties（従来の系列）とイベント単位の set の両方を呼ぶ", () => {
    render(<MemberStatusRecorder status="free" />);
    expect(gtagCalls()).toEqual([
      ["set", "user_properties", { member_status: "free" }],
      ["set", { member_status_at_event: "free" }],
    ]);
  });

  it("初回 page_view 用の隠し要素を描画する", () => {
    const { container } = render(<MemberStatusRecorder status="anonymous" />);
    const el = container.querySelector("[data-ga-member-status]") as HTMLElement;
    expect(el.getAttribute("data-ga-member-status")).toBe("anonymous");
    expect(el.hidden).toBe(true);
  });

  it("paying で表示すると印（日時だけ）を書く", () => {
    render(<MemberStatusRecorder status="paying" />);
    const raw = window.localStorage.getItem(LAST_PAYING_AT_STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(Number.isFinite(Date.parse(raw!))).toBe(true);
    expect(gtagCalls()).toContainEqual(["set", { member_status_at_event: "paying" }]);
  });

  it("印のある端末で未ログインなら anonymous_member（ユーザープロパティは anonymous のまま）", () => {
    window.localStorage.setItem(LAST_PAYING_AT_STORAGE_KEY, new Date(Date.now() - 1000).toISOString());
    render(<MemberStatusRecorder status="anonymous" />);
    expect(gtagCalls()).toEqual([
      ["set", "user_properties", { member_status: "anonymous" }],
      ["set", { member_status_at_event: "anonymous_member" }],
    ]);
  });

  it("状態が変わると両方を再設定する（ログアウト直後は anonymous_member）", () => {
    const { rerender } = render(<MemberStatusRecorder status="paying" />);
    vi.mocked(window.gtag).mockClear();
    rerender(<MemberStatusRecorder status="anonymous" />);
    expect(gtagCalls()).toEqual([
      ["set", "user_properties", { member_status: "anonymous" }],
      ["set", { member_status_at_event: "anonymous_member" }],
    ]);
  });

  it("GA 無効のホストでは何も送らない", () => {
    vi.mocked(isAnalyticsHost).mockReturnValue(false);
    render(<MemberStatusRecorder status="free" />);
    expect(window.gtag).not.toHaveBeenCalled();
  });
});
