import { useState } from 'react';
import { Lock, LogIn, UserPlus, ExternalLink, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Modal,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
} from '@/components/ui/modal';
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
  const [modalStep, setModalStep] = useState<'pre-register' | 'post-register'>('pre-register');

  const isLoggedIn = !!user;

  const handleLogin = () => {
    navigate('/login');
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setModalStep('pre-register');
  };

  const handleMemberRegister = () => {
    window.open(BO_NO_DESIGN_PLAN_URL, '_blank');
  };

  return (
    <>
      <div className="relative w-full">
        {/* グラデーション（コンテンツにかぶせる） */}
        <div
          className="absolute inset-x-0 -top-20 h-20 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'
          }}
        />

        {/* CTA */}
        <div className="bg-white py-12 text-center">
          {/* ロックアイコン */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
            <Lock className="w-8 h-8 text-blue-600" strokeWidth={2} />
          </div>

          {/* メッセージ */}
          <h3 className="font-noto-sans-jp font-bold text-xl text-gray-800 mb-6">
            続きを読むにはメンバーシップの登録が必要です
          </h3>

          {/* CTAボタン - ユーザー状態で分岐 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto px-4">
            {isLoggedIn ? (
              /* ログイン済み・サブスクなし */
              <Button
                onClick={handleMemberRegister}
                size="large"
                className="flex-1 font-noto-sans-jp text-base"
              >
                メンバーシップ登録へ
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              /* 未ログイン */
              <>
                <Button
                  onClick={handleLogin}
                  size="large"
                  className="flex-1 font-noto-sans-jp text-base"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  ログインする
                </Button>
                <Button
                  onClick={handleOpenModal}
                  variant="outline"
                  size="large"
                  className="flex-1 font-noto-sans-jp text-base"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  メンバーシップ登録へ
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 初めての方向けモーダル */}
      <Modal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setModalStep('pre-register');
        }}
      >
        <ModalContainer>
          <ModalHeader badge={modalStep === 'post-register' ? 'メンバー登録完了後' : 'はじめての方へ'}>
            {modalStep === 'post-register' && (
              <div className="mb-4">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            )}
            <ModalTitle>
              {modalStep === 'post-register' ? (
                <>
                  ログインページから
                  <br />
                  <span className="font-bold">パスワードを設定しましょう</span>
                </>
              ) : (
                <>
                  BONO本サイトで
                  <br />
                  メンバー登録をすると
                  <br />
                  <span className="font-bold">コンテンツが閲覧できます</span>
                </>
              )}
            </ModalTitle>
            <ModalDescription className="sr-only">
              bo-no.designでの会員登録手順を説明します
            </ModalDescription>
          </ModalHeader>
          <ModalContent>
            <RegistrationFlowGuide
              variant="modal"
              showLoginLink
              onStepChange={(step) => setModalStep(step)}
            />
          </ModalContent>
        </ModalContainer>
      </Modal>
    </>
  );
}
