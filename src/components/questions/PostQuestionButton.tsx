"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogIn, UserPlus, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalAction,
} from "@/components/ui/modal";

interface PostQuestionButtonProps {
  /** メンバーなら /questions/new に遷移、そうでなければモーダル */
  hasMemberAccess: boolean;
  isLoggedIn: boolean;
  /** ボタンの見た目（Empty状態のアクション促しでは secondary を使う） */
  variant?: React.ComponentProps<typeof Button>["variant"];
  /** ボタンのラベル（デフォルト: 質問を投稿する） */
  label?: string;
}

export function PostQuestionButton({
  hasMemberAccess,
  isLoggedIn,
  variant = "default",
  label = "質問を投稿する",
}: PostQuestionButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // 遷移完了まで押した応答が無く不安になるため、pending中はスピナーを出す（#137-A）
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (hasMemberAccess) {
      startTransition(() => {
        router.push("/questions/new");
      });
      return;
    }
    setOpen(true);
  };

  const goTo = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <Button onClick={handleClick} disabled={isPending} variant={variant}>
        {isPending ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
        ) : (
          <Plus className="mr-1 h-4 w-4" />
        )}
        {label}
      </Button>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContainer>
          <ModalHeader badge="メンバー限定">
            <ModalTitle>
              質問の投稿はメンバー登録が必要です
            </ModalTitle>
          </ModalHeader>
          <ModalContent>
            <div className="mt-4 flex flex-col items-center gap-3 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                <Lock className="h-7 w-7 text-blue-600" strokeWidth={2} />
              </div>
              <p className="text-sm text-muted-foreground">
                みんなの掲示板への投稿・コメント・スタンプはメンバー限定です。
                メンバーになると、デザインの悩みをメンバーと共有できます。
              </p>
            </div>
          </ModalContent>
          <ModalAction>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
              {!isLoggedIn && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => goTo("/login?redirectTo=/questions")}
                >
                  <LogIn className="mr-1 h-4 w-4" />
                  ログインする
                </Button>
              )}
              <Button type="button" onClick={() => goTo("/subscription")}>
                <UserPlus className="mr-1 h-4 w-4" />
                メンバー登録へ
              </Button>
            </div>
          </ModalAction>
        </ModalContainer>
      </Modal>
    </>
  );
}
