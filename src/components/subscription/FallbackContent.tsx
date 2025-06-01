import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentAccessType } from '@/utils/subscriptionPlans';
import FeatureList from './FeatureList';

// コンテンツタイプに応じた説明を返す
function getContentTypeDescription(contentType: ContentAccessType, customDescription?: string): string {
  if (customDescription) return customDescription;
  
  switch (contentType) {
    case 'learning':
      return 'この学習コンテンツを閲覧するには、プランのアップグレードが必要です。';
    case 'member':
      return 'このメンバー限定コンテンツ（トレーニングプログラム含む）を閲覧するには、プランのアップグレードが必要です。';
    default:
      return 'このコンテンツを閲覧するには、プランのアップグレードが必要です。';
  }
}

interface FallbackContentProps {
  contentType: ContentAccessType;
  contentDescription?: string;
  confirmMessage?: string;
  redirectTo?: string;
  onRedirect?: () => void;
}

const FallbackContent: React.FC<FallbackContentProps> = ({
  contentType,
  contentDescription,
  confirmMessage,
  redirectTo,
  onRedirect
}) => {
  // 確認メッセージがある場合は表示
  if (confirmMessage && redirectTo) {
    return (
      <Card className="max-w-md mx-auto my-8">
        <CardHeader>
          <CardTitle className="text-center">アクセス制限</CardTitle>
          <CardDescription className="text-center">
            このコンテンツを閲覧するには、より上位のプランが必要です。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{confirmMessage}</p>
          <div className="flex space-x-4">
            <Button
              onClick={onRedirect}
            >
              プラン選択へ
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // デフォルトのサブスクリプション促進画面
  return (
    <Card className="max-w-md mx-auto my-8">
      <CardHeader>
        <CardTitle className="text-center">プランのアップグレードが必要です</CardTitle>
        <CardDescription className="text-center">
          {getContentTypeDescription(contentType, contentDescription)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FeatureList contentType={contentType} />

          <div className="mt-6 flex flex-wrap gap-3">
            <Button 
              className="bg-amber-500 hover:bg-amber-600 text-white flex-grow" 
              asChild
            >
              <Link to="/subscription">メンバーに登録する</Link>
            </Button>
            
            <Button variant="outline" asChild className="flex-grow">
              <Link to="/pricing">料金プランを見る</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FallbackContent;
