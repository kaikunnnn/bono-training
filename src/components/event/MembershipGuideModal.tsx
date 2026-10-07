"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import {
  Modal,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
} from "@/components/ui/modal";
import { RegistrationFlowGuide } from "@/components/auth/RegistrationFlowGuide";

/**
 * はじめての方向けの「メンバー登録の流れ」モーダル（イベントページ用）。
 *
 * Googleフォームのイベント（EventRegistrationButton）と、サイト上申込のカード
 * （EventOnsiteRegistration の未ログイン表示）の両方から開く。中身は1か所だけで持つ。
 */
export default function MembershipGuideModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [modalStep, setModalStep] = useState<"pre-register" | "post-register">(
    "pre-register"
  );

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setModalStep("pre-register");
      }}
    >
      <ModalContainer>
        <ModalHeader
          badge={
            modalStep === "post-register"
              ? "メンバー登録完了後"
              : "はじめての方へ"
          }
        >
          {modalStep === "post-register" && (
            <div className="mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          )}
          <ModalTitle>
            {modalStep === "post-register" ? (
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
  );
}
