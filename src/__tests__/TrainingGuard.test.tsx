
import React from 'react';
import { render, screen } from '@testing-library/react';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import TrainingGuard from '@/components/training/TrainingGuard';
import { SubscriptionState } from '@/hooks/useSubscription';

// テストケース定義
const testCases = [
  ['free', false],
  ['community', true],
  ['standard', true],
  ['growth', true],
] as const;

describe('TrainingGuard Access Control', () => {
  test.each(testCases)('Plan %s should have access: %s', (planType, expectAccess) => {
    // モックのサブスクリプション状態を生成
    const mockSubscription: SubscriptionState = {
      planType: planType === 'free' ? null : planType as any,
      isSubscribed: planType !== 'free',
      hasMemberAccess: ['standard', 'growth', 'community'].includes(planType),
      hasLearningAccess: ['standard', 'growth'].includes(planType),
      loading: false,
      error: null,
      refresh: async () => {}
    };

    render(
      <SubscriptionProvider overrideValue={mockSubscription}>
        <TrainingGuard isPremium={true}>
          <div data-testid="protected-content">Protected Training Content</div>
        </TrainingGuard>
      </SubscriptionProvider>
    );

    const protectedContent = screen.queryByTestId('protected-content');
    
    if (expectAccess) {
      expect(protectedContent).toBeInTheDocument();
    } else {
      expect(protectedContent).not.toBeInTheDocument();
      // プレミアムバナーが表示されることを確認
      expect(screen.getByText(/プレビュー表示/)).toBeInTheDocument();
    }
  });

  test('Free content should always be accessible', () => {
    const mockSubscription: SubscriptionState = {
      planType: null,
      isSubscribed: false,
      hasMemberAccess: false,
      hasLearningAccess: false,
      loading: false,
      error: null,
      refresh: async () => {}
    };

    render(
      <SubscriptionProvider overrideValue={mockSubscription}>
        <TrainingGuard isPremium={false}>
          <div data-testid="free-content">Free Training Content</div>
        </TrainingGuard>
      </SubscriptionProvider>
    );

    expect(screen.getByTestId('free-content')).toBeInTheDocument();
  });

  test('Loading state should show loader', () => {
    const mockSubscription: SubscriptionState = {
      planType: null,
      isSubscribed: false,
      hasMemberAccess: false,
      hasLearningAccess: false,
      loading: true,
      error: null,
      refresh: async () => {}
    };

    render(
      <SubscriptionProvider overrideValue={mockSubscription}>
        <TrainingGuard isPremium={true}>
          <div data-testid="protected-content">Protected Content</div>
        </TrainingGuard>
      </SubscriptionProvider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
