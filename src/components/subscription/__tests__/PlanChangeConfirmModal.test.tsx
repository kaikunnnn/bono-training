/**
 * PlanChangeConfirmModal のユニットテスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PlanChangeConfirmModal } from '../PlanChangeConfirmModal';
import * as pricing from '@/services/pricing';

// getPlanPrices のモック
vi.mock('@/services/pricing', () => ({
  getPlanPrices: vi.fn(),
}));

describe('PlanChangeConfirmModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

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

  it('Stripe動的料金を使用してプロレーションを計算する（Standard → Feedback アップグレード）', async () => {
    const currentPeriodEnd = new Date('2025-12-13');

    render(
      <PlanChangeConfirmModal
        currentPlan={{ type: 'standard', duration: 1 }}
        newPlan={{ type: 'feedback', duration: 1 }}
        currentPeriodEnd={currentPeriodEnd}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // getPlanPrices が呼ばれたことを確認
    expect(pricing.getPlanPrices).toHaveBeenCalledTimes(1);

    // ローディング完了を待つ
    await waitFor(() => {
      expect(screen.getByText('プラン変更の確認')).toBeInTheDocument();
    });

    // 現在のプラン料金が正しいStripe料金（¥1,980）で表示される
    await waitFor(() => {
      expect(screen.getByText(/¥1,980\/月/)).toBeInTheDocument();
    });

    // 新しいプラン料金が正しいStripe料金（¥9,800）で表示される
    await waitFor(() => {
      expect(screen.getByText(/¥9,800\/月/)).toBeInTheDocument();
    });

    // プロレーションが表示される
    expect(screen.getByText(/今回のお支払い/)).toBeInTheDocument();
  });

  it('Stripe動的料金を使用してプロレーションを計算する（Feedback → Standard ダウングレード）', async () => {
    const currentPeriodEnd = new Date('2025-12-13');

    render(
      <PlanChangeConfirmModal
        currentPlan={{ type: 'feedback', duration: 1 }}
        newPlan={{ type: 'standard', duration: 1 }}
        currentPeriodEnd={currentPeriodEnd}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // ローディング完了を待つ
    await waitFor(() => {
      expect(screen.getByText('プラン変更の確認')).toBeInTheDocument();
    });

    // 現在のプラン料金が正しいStripe料金（¥9,800）で表示される
    await waitFor(() => {
      expect(screen.getByText(/¥9,800\/月/)).toBeInTheDocument();
    });

    // 新しいプラン料金が正しいStripe料金（¥1,980）で表示される
    await waitFor(() => {
      expect(screen.getByText(/¥1,980\/月/)).toBeInTheDocument();
    });
  });

  it('期間変更（1ヶ月 → 3ヶ月）で正しい料金を表示する', async () => {
    const currentPeriodEnd = new Date('2025-12-13');

    render(
      <PlanChangeConfirmModal
        currentPlan={{ type: 'standard', duration: 1 }}
        newPlan={{ type: 'standard', duration: 3 }}
        currentPeriodEnd={currentPeriodEnd}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('プラン変更の確認')).toBeInTheDocument();
    });

    // 1ヶ月プラン: ¥1,980
    await waitFor(() => {
      expect(screen.getByText(/¥1,980\/月/)).toBeInTheDocument();
    });

    // 3ヶ月プラン: ¥1,782（割引適用）
    await waitFor(() => {
      expect(screen.getByText(/¥1,782\/月/)).toBeInTheDocument();
    });
  });

  it('getPlanPrices エラー時はモーダルを表示しない', async () => {
    // エラーを返すようにモック
    vi.mocked(pricing.getPlanPrices).mockResolvedValue({
      prices: null,
      source: 'error',
      error: 'Failed to fetch prices',
    });

    const currentPeriodEnd = new Date('2025-12-13');

    const { container } = render(
      <PlanChangeConfirmModal
        currentPlan={{ type: 'standard', duration: 1 }}
        newPlan={{ type: 'feedback', duration: 1 }}
        currentPeriodEnd={currentPeriodEnd}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // ローディング完了を待つ
    await waitFor(() => {
      expect(pricing.getPlanPrices).toHaveBeenCalled();
    });

    // モーダルが表示されない（null を返す）
    expect(container.firstChild).toBeNull();
  });

  it('ローディング中は何も表示しない', () => {
    // getPlanPrices を遅延させる
    vi.mocked(pricing.getPlanPrices).mockImplementation(
      () => new Promise(() => {}) // 永遠に完了しない
    );

    const currentPeriodEnd = new Date('2025-12-13');

    const { container } = render(
      <PlanChangeConfirmModal
        currentPlan={{ type: 'standard', duration: 1 }}
        newPlan={{ type: 'feedback', duration: 1 }}
        currentPeriodEnd={currentPeriodEnd}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // ローディング中は何も表示されない
    expect(container.firstChild).toBeNull();
  });
});
