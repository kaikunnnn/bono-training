/**
 * Subscription Page のユニットテスト
 * Phase 5-3: フロントエンド分岐ロジックのテスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SubscriptionPage from '../Subscription';
import * as SubscriptionContext from '@/contexts/SubscriptionContext';
import * as pricing from '@/services/pricing';

// モック設定
vi.mock('@/contexts/SubscriptionContext', () => ({
  useSubscriptionContext: vi.fn(),
}));

vi.mock('@/services/pricing', () => ({
  getPlanPrices: vi.fn(),
}));

vi.mock('@/services/stripe', () => ({
  createCheckoutSession: vi.fn(),
  updateSubscription: vi.fn(),
}));

describe('Subscription Page - Phase 5フロー分岐テスト', () => {
  const mockPrices = {
    standard_1m: { unit_amount: 1980, currency: 'jpy' },
    standard_3m: { unit_amount: 1782, currency: 'jpy' },
    feedback_1m: { unit_amount: 9800, currency: 'jpy' },
    feedback_3m: { unit_amount: 8910, currency: 'jpy' },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトで正しい料金を返す
    vi.mocked(pricing.getPlanPrices).mockResolvedValue({
      prices: mockPrices,
      source: 'frontend_cache',
      error: null,
    });
  });

  it('Test 3: subscribed = false で「選択する」ボタンが表示される', async () => {
    // 未登録ユーザーのコンテキストをモック
    vi.mocked(SubscriptionContext.useSubscriptionContext).mockReturnValue({
      isSubscribed: false,
      planType: null,
      duration: null,
      renewalDate: null,
      isLoading: false,
      isCanceled: false,
    });

    render(
      <BrowserRouter>
        <SubscriptionPage />
      </BrowserRouter>
    );

    // 料金プランが読み込まれるまで待つ
    await waitFor(() => {
      expect(screen.queryByText('料金プランを読み込み中...')).not.toBeInTheDocument();
    });

    // 「選択する」ボタンが表示されることを確認
    const selectButtons = screen.getAllByRole('button', { name: /選択する/i });
    expect(selectButtons.length).toBeGreaterThan(0);

    // 「プラン変更」ボタンは表示されないことを確認
    const changePlanButtons = screen.queryAllByRole('button', { name: /プラン変更/i });
    expect(changePlanButtons.length).toBe(0);

    console.log('✅ Test 3 passed: 未登録ユーザーで「選択する」ボタンが表示された');
  });

  it('Test 4: subscribed = true で「プラン変更」ボタンが表示される', async () => {
    // 既存契約者のコンテキストをモック
    vi.mocked(SubscriptionContext.useSubscriptionContext).mockReturnValue({
      isSubscribed: true,
      planType: 'standard',
      duration: 1,
      renewalDate: '2025-12-31',
      isLoading: false,
      isCanceled: false,
    });

    render(
      <BrowserRouter>
        <SubscriptionPage />
      </BrowserRouter>
    );

    // 料金プランが読み込まれるまで待つ
    await waitFor(() => {
      expect(screen.queryByText('料金プランを読み込み中...')).not.toBeInTheDocument();
    });

    // 「プラン変更」ボタンが表示されることを確認
    const changePlanButtons = screen.getAllByRole('button', { name: /プラン変更/i });
    expect(changePlanButtons.length).toBeGreaterThan(0);

    // 「選択する」ボタンは表示されないことを確認
    const selectButtons = screen.queryAllByRole('button', { name: /^選択する$/i });
    expect(selectButtons.length).toBe(0);

    console.log('✅ Test 4 passed: 既存契約者で「プラン変更」ボタンが表示された');
  });

  it('Test 5: 現在のプランには「現在のプラン」バッジが表示される', async () => {
    // Standard 1ヶ月プランの既存契約者をモック
    vi.mocked(SubscriptionContext.useSubscriptionContext).mockReturnValue({
      isSubscribed: true,
      planType: 'standard',
      duration: 1,
      renewalDate: '2025-12-31',
      isLoading: false,
      isCanceled: false,
    });

    render(
      <BrowserRouter>
        <SubscriptionPage />
      </BrowserRouter>
    );

    // 料金プランが読み込まれるまで待つ
    await waitFor(() => {
      expect(screen.queryByText('料金プランを読み込み中...')).not.toBeInTheDocument();
    });

    // 「現在のプラン」バッジが表示されることを確認
    const currentPlanBadge = screen.getByText('現在のプラン');
    expect(currentPlanBadge).toBeInTheDocument();

    console.log('✅ Test 5 passed: 現在のプランに「現在のプラン」バッジが表示された');
  });

  it('Test 6: 期間タブ（1ヶ月/3ヶ月）が正しく表示される', async () => {
    vi.mocked(SubscriptionContext.useSubscriptionContext).mockReturnValue({
      isSubscribed: false,
      planType: null,
      duration: null,
      renewalDate: null,
      isLoading: false,
      isCanceled: false,
    });

    render(
      <BrowserRouter>
        <SubscriptionPage />
      </BrowserRouter>
    );

    // 料金プランが読み込まれるまで待つ
    await waitFor(() => {
      expect(screen.queryByText('料金プランを読み込み中...')).not.toBeInTheDocument();
    });

    // 期間タブが表示されることを確認
    const oneMonthTab = screen.getByRole('tab', { name: /1ヶ月/i });
    const threeMonthTab = screen.getByRole('tab', { name: /3ヶ月/i });

    expect(oneMonthTab).toBeInTheDocument();
    expect(threeMonthTab).toBeInTheDocument();

    console.log('✅ Test 6 passed: 期間タブが正しく表示された');
  });

  it('Test 7: 料金プラン（Standard, Feedback）が表示される', async () => {
    vi.mocked(SubscriptionContext.useSubscriptionContext).mockReturnValue({
      isSubscribed: false,
      planType: null,
      duration: null,
      renewalDate: null,
      isLoading: false,
      isCanceled: false,
    });

    render(
      <BrowserRouter>
        <SubscriptionPage />
      </BrowserRouter>
    );

    // 料金プランが読み込まれるまで待つ
    await waitFor(() => {
      expect(screen.queryByText('料金プランを読み込み中...')).not.toBeInTheDocument();
    });

    // プラン名が表示されることを確認
    const standardPlan = screen.getByText('スタンダード');
    const feedbackPlan = screen.getByText('フィードバック');

    expect(standardPlan).toBeInTheDocument();
    expect(feedbackPlan).toBeInTheDocument();

    // 「おすすめ」バッジが表示されることを確認（Feedbackプラン）
    const recommendedBadge = screen.getByText('おすすめ');
    expect(recommendedBadge).toBeInTheDocument();

    console.log('✅ Test 7 passed: 料金プランが正しく表示された');
  });
});

console.log("\n========================================");
console.log("✅ All Subscription Page tests completed!");
console.log("========================================");
