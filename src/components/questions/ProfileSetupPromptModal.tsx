"use client";

/**
 * プロフィール設定促しモーダル（#142）。
 *
 * 投稿完了・コメント完了時に、表示名やアイコンが未設定なら表示する共通モーダル。
 * 既存 `components/ui/modal.tsx` のパターン（PostQuestionButton 前例）を踏襲する。
 *
 * 「あとで」は 30 日抑制（dismissProfilePrompt）。「設定する」は /profile へ遷移。
 */

import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalAction,
} from "@/components/ui/modal";
import { dismissProfilePrompt } from "@/lib/profile-utils";

interface ProfileSetupPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSetupPromptModal({
  open,
  onOpenChange,
}: ProfileSetupPromptModalProps) {
  const router = useRouter();

  const handleSetup = () => {
    onOpenChange(false);
    router.push("/profile");
  };

  // 「あとで」= 閉じて 30 日抑制
  const handleLater = () => {
    dismissProfilePrompt();
    onOpenChange(false);
  };

  // ✕ / オーバーレイで閉じた場合も「あとで」と同じく抑制する
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      dismissProfilePrompt();
    }
    onOpenChange(next);
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContainer>
        <ModalHeader badge="プロフィール">
          <ModalTitle>名前とアイコンを設定しよう</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <div className="mt-4 flex flex-col items-center gap-3 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <UserRound className="h-7 w-7 text-blue-600" strokeWidth={2} />
            </div>
            <p className="text-sm text-muted-foreground">
              投稿やコメントにはあなたの名前とアイコンが表示されます。
              設定しておくと、誰の発言か伝わりやすくなります。
            </p>
          </div>
        </ModalContent>
        <ModalAction>
          <Button type="button" onClick={handleSetup}>
            プロフィールを設定する
          </Button>
          <Button type="button" variant="ghost" onClick={handleLater}>
            あとで
          </Button>
        </ModalAction>
      </ModalContainer>
    </Modal>
  );
}
