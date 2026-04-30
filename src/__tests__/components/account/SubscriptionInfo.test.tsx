import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SubscriptionInfo from "@/components/account/SubscriptionInfo";

// Stripe service のモック
vi.mock("@/lib/services/stripe", () => ({
  getCustomerPortalUrl: vi.fn().mockResolvedValue("https://billing.stripe.com/test"),
}));

describe("SubscriptionInfo", () => {
  const subscribedProps = {
    planType: "standard" as const,
    duration: 1,
    isSubscribed: true,
    cancelAtPeriodEnd: false,
    cancelAt: null,
    renewalDate: "2026-06-01T00:00:00Z",
  };

  const freeProps = {
    planType: null,
    duration: null,
    isSubscribed: false,
    cancelAtPeriodEnd: false,
    cancelAt: null,
    renewalDate: null,
  };

  const canceledProps = {
    planType: "feedback" as const,
    duration: 3,
    isSubscribed: true,
    cancelAtPeriodEnd: true,
    cancelAt: "2026-07-01T00:00:00Z",
    renewalDate: "2026-07-01T00:00:00Z",
  };

  // ── 購読中ユーザー ──

  it("購読中: プラン名と期間が表示される", () => {
    render(<SubscriptionInfo {...subscribedProps} />);
    expect(screen.getByText("スタンダード（1ヶ月）")).toBeInTheDocument();
  });

  it("購読中: 次回更新日が表示される", () => {
    render(<SubscriptionInfo {...subscribedProps} />);
    expect(screen.getByText("次回更新日:")).toBeInTheDocument();
    expect(screen.getByText("2026年6月1日")).toBeInTheDocument();
  });

  it("購読中: サブスクリプション管理ボタンが表示される", () => {
    render(<SubscriptionInfo {...subscribedProps} />);
    expect(screen.getByText("サブスクリプションを管理")).toBeInTheDocument();
  });

  it("購読中: プランを見るボタンは表示されない", () => {
    render(<SubscriptionInfo {...subscribedProps} />);
    expect(screen.queryByText("プランを見る")).toBeNull();
  });

  // ── 無料ユーザー ──

  it("無料: 「無料」と表示される", () => {
    render(<SubscriptionInfo {...freeProps} />);
    expect(screen.getByText("無料")).toBeInTheDocument();
  });

  it("無料: プランを見るボタンが表示される", () => {
    render(<SubscriptionInfo {...freeProps} />);
    expect(screen.getByText("プランを見る")).toBeInTheDocument();
  });

  it("無料: サブスクリプション管理ボタンは表示されない", () => {
    render(<SubscriptionInfo {...freeProps} />);
    expect(screen.queryByText("サブスクリプションを管理")).toBeNull();
  });

  // ── キャンセル済みユーザー ──

  it("キャンセル済み: キャンセル済みバッジが表示される", () => {
    render(<SubscriptionInfo {...canceledProps} />);
    expect(screen.getByText("【キャンセル済み】")).toBeInTheDocument();
  });

  it("キャンセル済み: 利用期限ラベルが表示される（次回更新日ではない）", () => {
    render(<SubscriptionInfo {...canceledProps} />);
    expect(screen.getByText("利用期限:")).toBeInTheDocument();
    expect(screen.queryByText("次回更新日:")).toBeNull();
  });

  it("キャンセル済み: 警告バナーとプラン再開リンクが表示される", () => {
    render(<SubscriptionInfo {...canceledProps} />);
    expect(
      screen.getByText("⚠️ サブスクリプションがキャンセルされています")
    ).toBeInTheDocument();
    expect(screen.getByText("プランを再開する →")).toBeInTheDocument();
  });

  it("キャンセル済み: フィードバック3ヶ月と表示される", () => {
    render(<SubscriptionInfo {...canceledProps} />);
    expect(screen.getByText("フィードバック（3ヶ月）")).toBeInTheDocument();
  });

  // ── 3ヶ月プラン ──

  it("3ヶ月プラン: 期間が正しく表示される", () => {
    render(
      <SubscriptionInfo
        {...subscribedProps}
        planType="standard"
        duration={3}
      />
    );
    expect(screen.getByText("スタンダード（3ヶ月）")).toBeInTheDocument();
  });
});
