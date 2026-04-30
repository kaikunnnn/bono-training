import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  SettingsPageLayout,
  SettingsPageTitle,
  SettingsCard,
  SettingsField,
} from "@/components/common/SettingsPageLayout";

describe("SettingsPageLayout", () => {
  it("子要素をレンダリングする", () => {
    render(
      <SettingsPageLayout>
        <p>テスト内容</p>
      </SettingsPageLayout>
    );
    expect(screen.getByText("テスト内容")).toBeInTheDocument();
  });

  it("min-h-screenのラッパーを生成する", () => {
    const { container } = render(
      <SettingsPageLayout>
        <p>内容</p>
      </SettingsPageLayout>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("min-h-screen");
  });
});

describe("SettingsPageTitle", () => {
  it("h1要素でタイトルをレンダリングする", () => {
    render(<SettingsPageTitle>アカウント情報</SettingsPageTitle>);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("アカウント情報");
  });
});

describe("SettingsCard", () => {
  it("titleを指定すると見出しが表示される", () => {
    render(
      <SettingsCard title="基本情報">
        <p>内容</p>
      </SettingsCard>
    );
    const heading = screen.getByRole("heading", { name: "基本情報" });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText("内容")).toBeInTheDocument();
  });

  it("titleなしの場合見出しは表示されない", () => {
    render(
      <SettingsCard>
        <p>内容のみ</p>
      </SettingsCard>
    );
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getByText("内容のみ")).toBeInTheDocument();
  });

  it("追加のclassNameが適用される", () => {
    const { container } = render(
      <SettingsCard className="border-red-100">
        <p>内容</p>
      </SettingsCard>
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("border-red-100");
    expect(card.className).toContain("bg-card");
  });
});

describe("SettingsField", () => {
  it("ラベルと値を表示する", () => {
    render(
      <SettingsField label="メールアドレス:">
        test@example.com
      </SettingsField>
    );
    expect(screen.getByText("メールアドレス:")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });
});
