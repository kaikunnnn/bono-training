"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Lock, LogIn, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal, ModalContainer, ModalClose } from "@/components/ui/modal";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface PermissionRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** A/B出し分け: false=未ログイン（ログイン+登録の2ボタン） / true=ログイン済み非メンバー（登録1ボタン） */
  isLoggedIn: boolean;
  /** ログイン後の戻り先。省略時 /questions */
  redirectTo?: string;
  title?: string;
  description?: string;
  /** null で非表示 */
  badgeLabel?: string | null;
  /** アイコンエリアの中身。省略時 Lock */
  icon?: React.ReactNode;
}

const DEFAULT_TITLE = "投稿にはメンバーシップが必要です";
const DEFAULT_DESCRIPTION =
  "みんなの掲示板への投稿・コメント・スタンプはメンバー限定です。メンバーになると、デザインの悩みをメンバーと共有できます。";

export function PermissionRequiredModal({
  open,
  onOpenChange,
  isLoggedIn,
  redirectTo = "/questions",
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  badgeLabel = "メンバー限定",
  icon,
}: PermissionRequiredModalProps) {
  const router = useRouter();

  const goTo = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContainer className="gap-0 px-6 py-6">
        {/* ✕クローズ（右上・既存Modalの流儀） */}
        <ModalClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 h-11 w-11 rounded-full text-muted-foreground/60 hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
            <span className="sr-only">閉じる</span>
          </Button>
        </ModalClose>

        <div className="flex flex-col items-start gap-4 pr-8">
          {/* 1. アイコンエリア */}
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            {icon ?? <Lock className="h-7 w-7 text-primary" strokeWidth={2} />}
          </div>

          {/* 2. バッジ */}
          {badgeLabel && (
            <span className="inline-flex self-start rounded-full border border-primary/30 px-3 py-1 text-[12px] font-bold text-primary">
              {badgeLabel}
            </span>
          )}

          {/* 3. タイトル */}
          <DialogPrimitive.Title className="w-full text-[22px] font-semibold leading-[1.4] text-foreground font-noto-sans-jp">
            {title}
          </DialogPrimitive.Title>

          {/* 4. 説明文 */}
          <DialogPrimitive.Description className="w-full text-[14px] leading-[1.68] text-muted-foreground">
            {description}
          </DialogPrimitive.Description>

          {/* 5. ボタン行 */}
          <div className="mt-2 flex w-full gap-3">
            {isLoggedIn ? (
              <Button
                type="button"
                className="h-10 w-full"
                onClick={() => goTo("/subscription")}
              >
                <UserRoundPlus className="h-4 w-4" />
                メンバー登録へ
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 flex-1"
                  onClick={() =>
                    goTo(`/login?redirectTo=${encodeURIComponent(redirectTo)}`)
                  }
                >
                  <LogIn className="h-4 w-4" />
                  ログインする
                </Button>
                <Button
                  type="button"
                  variant="default"
                  className="h-10 flex-1"
                  onClick={() => goTo("/subscription")}
                >
                  <UserRoundPlus className="h-4 w-4" />
                  メンバー登録へ
                </Button>
              </>
            )}
          </div>
        </div>
      </ModalContainer>
    </Modal>
  );
}
