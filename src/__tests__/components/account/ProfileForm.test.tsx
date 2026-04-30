import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProfileForm } from "@/app/profile/ProfileForm";

// Server Action のモック
vi.mock("@/app/profile/actions", () => ({
  updateProfile: vi.fn().mockResolvedValue({ success: true }),
}));

// SettingsCard のモック（server-onlyの依存回避）
vi.mock("@/components/common/SettingsPageLayout", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  return {
    SettingsCard: ({ title, children }: { title?: string; children: React.ReactNode }) =>
      React.createElement("div", { "data-testid": "settings-card" }, [
        title && React.createElement("h2", { key: "title" }, title),
        children,
      ]),
  };
});

describe("ProfileForm", () => {
  const defaultValues = {
    displayName: "テストユーザー",
    avatarUrl: "https://example.com/avatar.png",
    bio: "自己紹介テスト",
  };

  it("デフォルト値がフォームに表示される", () => {
    render(<ProfileForm defaultValues={defaultValues} />);

    const nameInput = screen.getByLabelText("表示名") as HTMLInputElement;
    expect(nameInput.defaultValue).toBe("テストユーザー");

    const avatarInput = screen.getByLabelText("アバターURL") as HTMLInputElement;
    expect(avatarInput.defaultValue).toBe("https://example.com/avatar.png");

    const bioInput = screen.getByLabelText("自己紹介") as HTMLTextAreaElement;
    expect(bioInput.defaultValue).toBe("自己紹介テスト");
  });

  it("保存ボタンが表示される", () => {
    render(<ProfileForm defaultValues={defaultValues} />);
    expect(screen.getByText("保存する")).toBeInTheDocument();
  });

  it("空のデフォルト値でもレンダリングされる", () => {
    render(
      <ProfileForm
        defaultValues={{ displayName: "", avatarUrl: "", bio: "" }}
      />
    );
    expect(screen.getByLabelText("表示名")).toBeInTheDocument();
  });

  it("アバターのフォールバック文字が表示名の先頭文字になる", () => {
    render(
      <ProfileForm
        defaultValues={{ displayName: "ABC", avatarUrl: "", bio: "" }}
      />
    );
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("フォーム送信で成功メッセージが表示される", async () => {
    const { updateProfile } = await import("@/app/profile/actions");
    (updateProfile as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });

    render(<ProfileForm defaultValues={defaultValues} />);

    const submitButton = screen.getByText("保存する");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("プロフィールを更新しました")).toBeInTheDocument();
    });
  });

  it("フォーム送信でエラーが返された場合エラーメッセージが表示される", async () => {
    const { updateProfile } = await import("@/app/profile/actions");
    (updateProfile as ReturnType<typeof vi.fn>).mockResolvedValue({
      error: "更新に失敗しました",
    });

    render(<ProfileForm defaultValues={defaultValues} />);

    const submitButton = screen.getByText("保存する");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("更新に失敗しました")).toBeInTheDocument();
    });
  });
});
