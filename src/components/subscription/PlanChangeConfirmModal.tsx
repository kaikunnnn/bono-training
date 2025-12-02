/**
 * プラン変更確認モーダル
 *
 * ユーザーがプラン変更時にプロレーション（差額）を確認できるモーダル
 * 処理中・エラー状態の表示にも対応
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowDown, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  calculateProration,
  type PlanInfo,
} from '@/utils/prorationCalculator';
import {
  getPlanDisplayName,
  type PlanType,
  type PlanDuration,
} from '@/utils/subscriptionPlans';
import { getPlanPrices, type PlanPrices } from '@/services/pricing';

export type ModalState = 'confirm' | 'processing' | 'error';

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
  /** モーダルの状態 */
  modalState?: ModalState;
  /** エラーメッセージ */
  errorMessage?: string;
}

/**
 * プラン変更確認モーダルコンポーネント
 */
export const PlanChangeConfirmModal: React.FC<PlanChangeConfirmModalProps> = ({
  currentPlan,
  newPlan,
  currentPeriodEnd,
  onConfirm,
  onCancel,
  modalState = 'confirm',
  errorMessage,
}) => {
  // Stripe動的料金を取得
  const [planPrices, setPlanPrices] = React.useState<PlanPrices | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPrices() {
      const { prices, error } = await getPlanPrices();
      if (!error && prices) {
        setPlanPrices(prices);
      }
      setLoading(false);
    }
    fetchPrices();
  }, []);

  // ローディング中は何も表示しない
  if (loading || !planPrices) {
    return null;
  }

  // Stripe料金からプラン情報を構築
  const currentPriceKey = `${currentPlan.type}_${currentPlan.duration}m` as keyof PlanPrices;
  const newPriceKey = `${newPlan.type}_${newPlan.duration}m` as keyof PlanPrices;

  const currentPlanInfo: PlanInfo = {
    type: currentPlan.type,
    duration: currentPlan.duration,
    monthlyPrice: planPrices[currentPriceKey]?.unit_amount || 0,
  };

  const newPlanInfo: PlanInfo = {
    type: newPlan.type,
    duration: newPlan.duration,
    monthlyPrice: planPrices[newPriceKey]?.unit_amount || 0,
  };

  // プロレーション計算
  const proration = calculateProration(
    currentPlanInfo,
    newPlanInfo,
    currentPeriodEnd
  );

  const newPlanDisplayName = `${getPlanDisplayName(newPlan.type)} ${newPlan.duration}ヶ月`;

  // 処理中の表示
  if (modalState === 'processing') {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-center">プラン変更中</DialogTitle>
            <DialogDescription className="sr-only">
              プラン変更処理を実行中です
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-center font-noto-sans-jp">
              {newPlanDisplayName}プランへの<br />更新処理をしています
            </p>
            <p className="text-sm text-muted-foreground">
              しばらくお待ちください...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // エラーの表示
  if (modalState === 'error') {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-red-600 flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5" />
              エラーが発生しました
            </DialogTitle>
            <DialogDescription className="sr-only">
              プラン変更中にエラーが発生しました
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">
                {errorMessage || 'プラン変更に失敗しました。もう一度お試しください。'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={onCancel} className="w-full">
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // 確認画面（デフォルト）
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>プラン変更の確認</DialogTitle>
          <DialogDescription className="sr-only">
            プラン変更の詳細を確認してください
          </DialogDescription>
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
            <p className="text-sm font-semibold mb-3">今回のお支払い</p>

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
              プラン変更を確定すると、現在のプランはキャンセルされ、新しいプランに切り替わります。
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
