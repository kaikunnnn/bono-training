"use client";

import { useState } from "react";
import { LogIn, UserPlus, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { withPricingFrom } from "@/lib/activity-utils";
import { trackPricingCtaClick } from "@/lib/activity-client";
import MembershipGuideModal from "@/components/event/MembershipGuideModal";

interface EventRegistrationButtonProps {
  /**
   * Googleフォーム等の申込URL。サイト上申込（#218）のイベントでは渡さない
   * （サイト上申込のイベントは page 側で EventOnsiteRegistration を出し、このボタンは使わない）
   */
  registrationUrl?: string;
  isLoggedIn: boolean;
  hasMemberAccess: boolean;
}

/**
 * イベント参加申し込みボタンコンポーネント
 * ユーザーのログイン・サブスクリプション状態に応じて表示を切り替え
 *
 * - 未ログイン: ログイン誘導
 * - ログイン済み・サブスクなし: メンバーシップ登録誘導
 * - メンバー: 参加申し込みフォームへのリンク
 */
export default function EventRegistrationButton({
  registrationUrl,
  isLoggedIn,
  hasMemberAccess,
}: EventRegistrationButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogin = () => {
    router.push("/login");
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleMemberRegister = () => {
    trackPricingCtaClick("event");
    router.push(withPricingFrom("/subscription", "event"));
  };

  // メンバーの場合: 参加申し込みボタンを表示
  if (isLoggedIn && hasMemberAccess) {
    if (!registrationUrl) return null;
    return (
      <div className="relative overflow-hidden rounded-lg">
        <Button variant="default" size="large" asChild className="relative">
          <a
            href={registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>参加申し込みフォームへ</span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </div>
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
      <MembershipGuideModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
