/**
 * プラン変更確認モーダル
 *
 * ユーザーがプラン変更時にプロレーション（差額）を確認できるモーダル
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  calculateProration,
  type PlanInfo,
} from '@/utils/prorationCalculator';
import {
  getPlanMonthlyPrice,
  getPlanDisplayName,
  type PlanType,
  type PlanDuration,
} from '@/utils/subscriptionPlans';

interface PlanChangeConfirmModalProps {
  /** 現在のプラン情報 */
  currentPlan: {
    type: PlanType;
    duration: PlanDuration;
  };
  /** 新しいプラン情報 */
  newPlan: {
    type: PlanType;
    duration: PlanDuration;
  };
  /** 現在のサブスクリプション期間終了日 */
  currentPeriodEnd: Date;
  /** 確定ボタンクリック時のコールバック */
  onConfirm: () => void;
  /** キャンセルボタンクリック時のコールバック */
  onCancel: () => void;
}

/**
 * プラン変更確認モーダルコンポーネント
 *
 * @example
 * ```tsx
 * <PlanChangeConfirmModal
 *   currentPlan={{ type: 'standard', duration: 1 }}
 *   newPlan={{ type: 'feedback', duration: 1 }}
 *   currentPeriodEnd={new Date('2025-12-13')}
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export const PlanChangeConfirmModal: React.FC<PlanChangeConfirmModalProps> = ({
  currentPlan,
  newPlan,
  currentPeriodEnd,
  onConfirm,
  onCancel,
}) => {
  // プラン情報を構築
  const currentPlanInfo: PlanInfo = {
    type: currentPlan.type,
    duration: currentPlan.duration,
    monthlyPrice: getPlanMonthlyPrice(currentPlan.type, currentPlan.duration),
  };

  const newPlanInfo: PlanInfo = {
    type: newPlan.type,
    duration: newPlan.duration,
    monthlyPrice: getPlanMonthlyPrice(newPlan.type, newPlan.duration),
  };

  // プロレーション計算
  const proration = calculateProration(
    currentPlanInfo,
    newPlanInfo,
    currentPeriodEnd
  );

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>プラン変更の確認</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 現在のプラン */}
          <div>
            <p className="text-sm text-gray-600">現在のプラン</p>
            <p className="font-bold text-lg">
              {getPlanDisplayName(currentPlan.type)} {currentPlan.duration}ヶ月プラン
            </p>
            <p className="text-sm text-gray-700">
              ¥{currentPlanInfo.monthlyPrice.toLocaleString()}/月
            </p>
          </div>

          {/* 矢印 */}
          <div className="flex justify-center">
            <ArrowDown className="h-6 w-6 text-gray-400" />
          </div>

          {/* 新しいプラン */}
          <div>
            <p className="text-sm text-gray-600">変更後のプラン</p>
            <p className="font-bold text-lg">
              {getPlanDisplayName(newPlan.type)} {newPlan.duration}ヶ月プラン
            </p>
            <p className="text-sm text-gray-700">
              ¥{newPlanInfo.monthlyPrice.toLocaleString()}/月
            </p>
          </div>

          <Separator />

          {/* プロレーション（差額）表示 */}
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm font-semibold mb-3">📊 今回のお支払い</p>

            {/* 残り期間の返金 */}
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700">
                現在のプラン返金（{proration.daysRemaining}日分）
              </span>
              <span className="text-green-600 font-medium">
                -¥{Math.abs(proration.refund).toLocaleString()}
              </span>
            </div>

            {/* 新プランの日割り */}
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-700">
                新プラン（{proration.daysRemaining}日分）
              </span>
              <span className="font-medium">
                +¥{proration.newCharge.toLocaleString()}
              </span>
            </div>

            <Separator className="my-2" />

            {/* 合計 */}
            <div className="flex justify-between font-bold">
              <span>今回のお支払い合計</span>
              <span
                className={
                  proration.total >= 0 ? 'text-red-600' : 'text-green-600'
                }
              >
                {proration.total >= 0 ? '+' : ''}
                ¥{Math.abs(proration.total).toLocaleString()}
                {proration.total < 0 ? ' 返金' : ''}
              </span>
            </div>
          </div>

          {/* 次回以降の請求 */}
          <div>
            <p className="text-sm text-gray-600">
              次回請求日:{' '}
              {format(currentPeriodEnd, 'yyyy年M月d日', { locale: ja })}
            </p>
            <p className="text-sm text-gray-600">
              次回以降: ¥{newPlanInfo.monthlyPrice.toLocaleString()}/月
            </p>
          </div>

          {/* 注意事項 */}
          <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
            <p className="text-xs text-gray-700">
              ⚠️ プラン変更を確定すると、現在のプランはキャンセルされ、新しいプランに切り替わります。
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button onClick={onConfirm}>プラン変更を確定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
