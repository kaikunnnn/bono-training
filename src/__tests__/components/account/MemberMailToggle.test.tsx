// 通知設定の「BONOからのお知らせメール」スイッチ（#327-C）
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const updateMemberMailSetting = vi.fn();
// 例外で失敗させるときだけ使う（vi.fn の中で reject させると、この環境ではコンポーネントが受け止めてもテストが失敗扱いになったため）
let throwOnCall: Error | null = null;
vi.mock("@/app/account/notifications/mail-actions", () => ({
  updateMemberMailSetting: async (...a: unknown[]) => {
    const result = updateMemberMailSetting(...a);
    if (throwOnCall) throw throwOnCall;
    return result;
  },
}));

import { MemberMailToggle } from "@/components/account/MemberMailToggle";

const toggle = () => screen.getByRole("switch", { name: "BONOからのお知らせメール" });

describe("MemberMailToggle", () => {
  beforeEach(() => {
    updateMemberMailSetting.mockReset();
    throwOnCall = null;
  });

  it("保存に失敗したら表示を元に戻し、理由を出す", async () => {
    updateMemberMailSetting.mockResolvedValue({ success: false, error: "保存できませんでした" });
    render(<MemberMailToggle initialEnabled />);
    expect(toggle()).toHaveAttribute("aria-checked", "true");
    fireEvent.click(toggle());
    expect(updateMemberMailSetting).toHaveBeenCalledWith(false);
    expect(await screen.findByRole("alert")).toHaveTextContent("保存できませんでした");
    await waitFor(() => expect(toggle()).toHaveAttribute("aria-checked", "true"));
    expect(toggle()).not.toBeDisabled();
  });

  it("通信が例外で失敗しても表示を元に戻す", async () => {
    throwOnCall = new Error("network");
    render(<MemberMailToggle initialEnabled={false} />);
    fireEvent.click(toggle());
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    await waitFor(() => expect(toggle()).toHaveAttribute("aria-checked", "false"));
  });

  it("読み込めないときは切り替えられない表示になり、押しても送らない", () => {
    render(<MemberMailToggle initialEnabled={null} />);
    expect(toggle()).toBeDisabled();
    expect(toggle()).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText(/設定を読み込めません/)).toBeInTheDocument();
    fireEvent.click(toggle());
    expect(updateMemberMailSetting).not.toHaveBeenCalled();
  });

  it("保存中に連打しても二重に送らない", async () => {
    let resolve!: (v: unknown) => void;
    updateMemberMailSetting.mockReturnValue(new Promise((r) => (resolve = r)));
    render(<MemberMailToggle initialEnabled />);
    fireEvent.click(toggle());
    fireEvent.click(toggle());
    fireEvent.click(toggle());
    expect(updateMemberMailSetting).toHaveBeenCalledTimes(1);
    resolve({ success: true, enabled: false });
    await waitFor(() => expect(toggle()).not.toBeDisabled());
    expect(toggle()).toHaveAttribute("aria-checked", "false");
    expect(updateMemberMailSetting).toHaveBeenCalledTimes(1);
  });
});
