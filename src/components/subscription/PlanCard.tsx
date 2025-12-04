
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { PlanType, getPlanBenefits } from '@/utils/subscriptionPlans';

interface PlanCardProps {
  id: string;
  name: string;
  description: string;
  price: number; // 選択された期間の価格
  priceLabel: string; // 価格ラベル
  duration: 1 | 3; // 選択された期間
  features: {
    learning: boolean;
    member: boolean;
    training: boolean;
  };
  recommended: boolean;
  isCurrentPlan: boolean;
  isCanceled?: boolean; // キャンセル済み（期間終了で解約予定）かどうか
  onSubscribe: (planType: PlanType) => void;
  isLoading: boolean;
  isSubscribed?: boolean; // 現在サブスクリプション契約中かどうか
}

const PlanCard: React.FC<PlanCardProps> = ({
  id,
  name,
  description,
  price,
  priceLabel,
  duration,
  features,
  recommended,
  isCurrentPlan,
  isCanceled = false,
  onSubscribe,
  isLoading,
  isSubscribed = false
}) => {
  const planBenefits = getPlanBenefits(id as PlanType);

  const handleClick = () => {
    // プランタイプを渡す（期間は親で管理）
    onSubscribe(id as PlanType);
  };

  // ボタンのテキストを決定
  const getButtonText = () => {
    if (isLoading) return '処理中...';
    if (isCurrentPlan) return '現在のプラン';
    if (isSubscribed) return 'プラン変更';
    return '選択する';
  };
  
  return (
    <Card
      className={`
        flex flex-col
        ${recommended ? 'border-primary shadow-lg relative' : ''}
        ${isCurrentPlan ? (isCanceled ? 'border-orange-500' : 'border-green-500') : ''}
      `}
    >
      {recommended && (
        <div className="absolute -top-3 left-0 right-0 flex justify-center">
          <Badge className="bg-primary text-white px-3 py-1">おすすめ</Badge>
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-3 left-0 right-0 flex justify-center">
          {isCanceled ? (
            <Badge className="bg-orange-500 text-white px-3 py-1">現在のプラン【キャンセル済み】</Badge>
          ) : (
            <Badge className="bg-green-500 text-white px-3 py-1">現在のプラン</Badge>
          )}
        </div>
      )}
      <CardHeader className={recommended ? 'pt-8' : ''}>
        <CardTitle className="font-noto-sans-jp">{name}</CardTitle>
        <CardDescription className="mt-2 font-noto-sans-jp">{description}</CardDescription>

        {/* 価格表示 */}
        <div className="mt-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900">
              {/* 3ヶ月プランの場合は月額換算（合計÷3）、1ヶ月プランはそのまま */}
              {duration === 3 ? Math.floor(price / 3).toLocaleString() : price.toLocaleString()}
            </span>
            <span className="text-lg text-gray-600">円/月</span>
          </div>
          {duration === 3 && (
            <div className="text-sm text-gray-500 mt-2 font-noto-sans-jp">
              {/* 3ヶ月一括の合計金額を表示 */}
              3ヶ月一括 {price.toLocaleString()}円
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div className="space-y-2">
            {planBenefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <Button
              className={`w-full ${recommended ? 'bg-primary' : ''}`}
              disabled={isLoading || isCurrentPlan}
              onClick={handleClick}
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanCard;
