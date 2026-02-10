import { useState } from 'react';
import { LogIn, UserPlus, ExternalLink, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
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

interface EventRegistrationButtonProps {
  registrationUrl: string;
}

/**
 * イベント参加申し込みボタンコンポーネント
 * ユーザーのログイン・サブスクリプション状態に応じて表示を切り替え
 *
 * - 未ログイン: ログイン誘導
 * - ログイン済み・サブスクなし: メンバーシップ登録誘導
 * - メンバー: 参加申し込みフォームへのリンク
 */
export default function EventRegistrationButton({ registrationUrl }: EventRegistrationButtonProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasMemberAccess, loading } = useSubscriptionContext();
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

  // ローディング中
  if (loading) {
    return (
      <Button variant="default" size="large" disabled className="opacity-50">
        <span>読み込み中...</span>
      </Button>
    );
  }

  // メンバーの場合: 参加申し込みボタンを表示
  if (isLoggedIn && hasMemberAccess) {
    return (
      <motion.div
        className="relative overflow-hidden rounded-lg"
        whileHover="hover"
        initial="rest"
      >
        <Button
          variant="default"
          size="large"
          asChild
          className="relative"
        >
          <a
            href={registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>参加申し込みフォームへ</span>
            <ExternalLink className="w-4 h-4" />
            {/* シマー効果（キラン） */}
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
              variants={{
                rest: { x: "-150%", transition: { duration: 0 } },
                hover: { x: "150%", transition: { duration: 0.6, ease: "easeInOut" } },
              }}
            />
          </a>
        </Button>
      </motion.div>
    );
  }

  // ログイン済み・サブスクなしの場合: メンバーシップ登録誘導
  if (isLoggedIn && !hasMemberAccess) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-gray-600 text-center">
          イベントに参加するにはメンバーシップ登録が必要です
        </p>
        <Button
          onClick={handleMemberRegister}
          size="large"
          className="font-noto-sans-jp"
        >
          メンバーシップ登録へ
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  // 未ログインの場合: ログイン・登録誘導
  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-gray-600 text-center">
          イベントに参加するにはログインが必要です
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleLogin}
            size="large"
            className="font-noto-sans-jp"
          >
            <LogIn className="mr-2 h-4 w-4" />
            ログインする
          </Button>
          <Button
            onClick={handleOpenModal}
            variant="outline"
            size="large"
            className="font-noto-sans-jp"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            メンバーシップ登録へ
          </Button>
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
                  <span className="font-bold">イベントに参加できます</span>
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
