// 通知設定の「SlackのDMでのお知らせ」スイッチ（#327-H）。MemberMailToggle のテストと同じ確かめ方
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const updateSlackDmSetting = vi.fn();
// 例外で失敗させるときだけ使う（MemberMailToggle.test.tsx と同じ理由）
let throwOnCall: Error | null = null;
vi.mock("@/app/account/notifications/slack-actions", () => ({
  updateSlackDmSetting: async (...a: unknown[]) => {
    const result = updateSlackDmSetting(...a);
    if (throwOnCall) throw throwOnCall;
    return result;
  },
}));

import { SlackDmToggle } from "@/components/account/SlackDmToggle";

const toggle = () => screen.getByRole("switch", { name: "SlackのDMでのお知らせ" });

describe("SlackDmToggle", () => {
  beforeEach(() => {
    updateSlackDmSetting.mockReset();
    throwOnCall = null;
  });

  it("オフにすると保存し、保存後の状態を出す", async () => {
    updateSlackDmSetting.mockResolvedValue({ success: true, enabled: false });
    render(<SlackDmToggle initialEnabled />);
    expect(toggle()).toHaveAttribute("aria-checked", "true");
    fireEvent.click(toggle());
    expect(updateSlackDmSetting).toHaveBeenCalledWith(false);
    await waitFor(() => expect(toggle()).toHaveAttribute("aria-checked", "false"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("保存に失敗したら表示を元に戻し、理由を出す", async () => {
    updateSlackDmSetting.mockResolvedValue({ success: false, error: "保存できませんでした" });
    render(<SlackDmToggle initialEnabled />);
    fireEvent.click(toggle());
    expect(await screen.findByRole("alert")).toHaveTextContent("保存できませんでした");
    await waitFor(() => expect(toggle()).toHaveAttribute("aria-checked", "true"));
    expect(toggle()).not.toBeDisabled();
  });

  it("通信が例外で失敗しても表示を元に戻す", async () => {
    throwOnCall = new Error("network");
    render(<SlackDmToggle initialEnabled={false} />);
    fireEvent.click(toggle());
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    await waitFor(() => expect(toggle()).toHaveAttribute("aria-checked", "false"));
  });

  it("保存中に連打しても二重に送らない", async () => {
    let resolve!: (v: unknown) => void;
    updateSlackDmSetting.mockReturnValue(new Promise((r) => (resolve = r)));
    render(<SlackDmToggle initialEnabled />);
    fireEvent.click(toggle());
    fireEvent.click(toggle());
    fireEvent.click(toggle());
    expect(updateSlackDmSetting).toHaveBeenCalledTimes(1);
    resolve({ success: true, enabled: false });
    await waitFor(() => expect(toggle()).not.toBeDisabled());
  });
});
