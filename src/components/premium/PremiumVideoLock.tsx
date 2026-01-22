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
 * プレミアム動画ロック表示コンポーネント
 * プレミアムコンテンツで未契約の場合に動画プレイヤーの代わりに表示
 *
 * ユーザー状態による表示分岐:
 * - 未ログイン: 「ログインする」+「初めての方はこちら」
 * - ログイン済み・サブスクなし: 「メンバー登録」への導線（bo-no.designへ）
 */
export default function PremiumVideoLock() {
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
      <div className="relative w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
        {/* 背景パターン */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* コンテンツ */}
        <div className="relative z-10 text-center px-8 max-w-md">
          {/* ロックアイコン */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-6">
            <Lock className="w-10 h-10 text-blue-600" strokeWidth={2} />
          </div>

          {/* メッセージ */}
          <h3 className="font-noto-sans-jp font-bold text-xl text-gray-800 mb-3">
            プレミアムコンテンツ
          </h3>
          <p className="font-noto-sans-jp text-sm text-gray-600 mb-6 leading-relaxed">
            {isLoggedIn
              ? 'この動画を視聴するにはメンバー登録が必要です'
              : 'この動画を視聴するにはログインが必要です'}
          </p>

          {/* CTAボタン - ユーザー状態で分岐 */}
          <div className="flex flex-col gap-3">
            {isLoggedIn ? (
              /* ログイン済み・サブスクなし */
              <Button
                onClick={handleMemberRegister}
                className="font-noto-sans-jp"
              >
                メンバー登録する
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              /* 未ログイン */
              <>
                <Button
                  onClick={handleLogin}
                  className="font-noto-sans-jp"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  ログインする
                </Button>
                <Button
                  onClick={handleOpenModal}
                  variant="outline"
                  className="font-noto-sans-jp bg-white/80"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  初めての方はこちら
                </Button>
              </>
            )}
          </div>

          {/* 補足テキスト */}
          <p className="font-noto-sans-jp text-xs text-gray-500 mt-4">
            スタンダードプランで全ての動画とコンテンツにアクセス
          </p>
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
