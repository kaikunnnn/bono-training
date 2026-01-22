/**
 * 会員登録フロー説明コンポーネント
 *
 * bo-no.designでの会員登録を案内するための共通コンポーネント
 * ペイウォールのモーダルと新規登録ページで使用
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

// bo-no.designのプランページURL
const BO_NO_DESIGN_PLAN_URL = 'https://www.bo-no.design/plan';

interface RegistrationFlowGuideProps {
  /** 表示バリエーション: modal=モーダル内、page=ページ内 */
  variant?: 'modal' | 'page';
  /** bo-no.designに遷移時のコールバック（トラッキング等） */
  onNavigate?: () => void;
}

/**
 * 会員登録フロー説明コンポーネント
 */
export const RegistrationFlowGuide: React.FC<RegistrationFlowGuideProps> = ({
  variant = 'page',
  onNavigate,
}) => {
  const handleClick = () => {
    onNavigate?.();
    window.open(BO_NO_DESIGN_PLAN_URL, '_blank');
  };

  return (
    <div className={variant === 'modal' ? '' : 'p-6 border rounded-lg bg-muted/30'}>
      <h3 className="font-bold text-lg mb-4 font-noto-sans-jp">会員登録の流れ</h3>

      <ol className="space-y-4 mb-6">
        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            1
          </span>
          <div>
            <p className="font-medium font-noto-sans-jp">bo-no.design で会員登録</p>
            <p className="text-sm text-muted-foreground font-noto-sans-jp">
              決済もこちらで完了します
            </p>
          </div>
        </li>
        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            2
          </span>
          <div>
            <p className="font-medium font-noto-sans-jp">このページに戻ってログイン</p>
            <p className="text-sm text-muted-foreground font-noto-sans-jp">
              同じメールアドレスでログインできます
            </p>
          </div>
        </li>
        <li className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            3
          </span>
          <div>
            <p className="font-medium font-noto-sans-jp">すべてのレッスンが見れるようになります</p>
          </div>
        </li>
      </ol>

      <Button onClick={handleClick} className="w-full font-noto-sans-jp">
        bo-no.design で会員登録する
        <ExternalLink className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default RegistrationFlowGuide;
