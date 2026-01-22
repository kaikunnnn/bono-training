import { useState } from 'react';
import { Lock, LogIn, UserPlus, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { RegistrationFlowGuide } from '@/components/auth/RegistrationFlowGuide';

// bo-no.designのプランページURL
const BO_NO_DESIGN_PLAN_URL = 'https://www.bo-no.design/plan';

/**
 * コンテンツプレビューオーバーレイコンポーネント
 * プレミアムコンテンツの続きをロックする際に表示
 *
 * ユーザー状態による表示分岐:
 * - 未ログイン: 「ログインする」+「初めての方はこちら」
 * - ログイン済み・サブスクなし: 「メンバー登録」への導線（bo-no.designへ）
 */
export default function ContentPreviewOverlay() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isLoggedIn = !!user;

  const handleLogin = () => {
    navigate('/auth');
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleMemberRegister = () => {
    window.open(BO_NO_DESIGN_PLAN_URL, '_blank');
  };

  return (
    <>
      <div className="relative -mt-20">
        {/* グラデーション */}
        <div
          className="absolute inset-x-0 top-0 h-40 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,1) 100%)'
          }}
        />

        {/* CTA */}
        <div className="relative bg-white pt-24 pb-16 text-center z-20 border-t-2 border-gray-100">
          {/* ロックアイコン */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
            <Lock className="w-8 h-8 text-blue-600" strokeWidth={2} />
          </div>

          {/* メッセージ */}
          <h3 className="font-noto-sans-jp font-bold text-xl text-gray-800 mb-2">
            {isLoggedIn
              ? '続きを読むにはメンバー登録が必要です'
              : '続きを読むにはログインが必要です'}
          </h3>
          <p className="font-noto-sans-jp text-sm text-gray-600 mb-6 leading-relaxed max-w-md mx-auto">
            スタンダードプラン以上で、<br />
            全てのレッスンと記事コンテンツにアクセスできます
          </p>

          {/* CTAボタン - ユーザー状態で分岐 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto px-4">
            {isLoggedIn ? (
              /* ログイン済み・サブスクなし */
              <Button
                onClick={handleMemberRegister}
                className="flex-1 font-noto-sans-jp"
              >
                メンバー登録する
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              /* 未ログイン */
              <>
                <Button
                  onClick={handleLogin}
                  className="flex-1 font-noto-sans-jp"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  ログインする
                </Button>
                <Button
                  onClick={handleOpenModal}
                  variant="outline"
                  className="flex-1 font-noto-sans-jp"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  初めての方はこちら
                </Button>
              </>
            )}
          </div>

          {/* 補足テキスト */}
          <div className="mt-6 pt-6 border-t border-gray-200 max-w-md mx-auto">
            <p className="font-noto-sans-jp text-xs text-gray-500">
              スタンダードプランの特典
            </p>
            <ul className="mt-3 space-y-2 text-left px-4">
              <li className="flex items-start gap-2 text-xs text-gray-600">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>全ての動画レッスンとテキストコンテンツ</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-gray-600">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>進捗管理とTODO機能</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-gray-600">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>新規コンテンツの優先アクセス</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 初めての方向けモーダル */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-noto-sans-jp">会員登録の流れ</DialogTitle>
            <DialogDescription className="sr-only">
              bo-no.designでの会員登録手順を説明します
            </DialogDescription>
          </DialogHeader>
          <RegistrationFlowGuide variant="modal" />
        </DialogContent>
      </Dialog>
    </>
  );
}
