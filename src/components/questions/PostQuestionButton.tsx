"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, SquarePen, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionRequiredModal } from "@/components/common/PermissionRequiredModal";

interface PostQuestionButtonProps {
  /** メンバーなら /questions/new に遷移、そうでなければモーダル */
  hasMemberAccess: boolean;
  isLoggedIn: boolean;
  /** ボタンの見た目（Empty状態のアクション促しでは secondary を使う） */
  variant?: React.ComponentProps<typeof Button>["variant"];
  /** ボタンのラベル（デフォルト: 質問を投稿する） */
  label?: string;
  /** 先頭アイコン。掲示板の「スレッドを作成」導線では SquarePen を渡す */
  icon?: "plus" | "square-pen";
}

const ICONS: Record<NonNullable<PostQuestionButtonProps["icon"]>, LucideIcon> = {
  plus: Plus,
  "square-pen": SquarePen,
};

export function PostQuestionButton({
  hasMemberAccess,
  isLoggedIn,
  variant = "default",
  label = "質問を投稿する",
  icon = "plus",
}: PostQuestionButtonProps) {
  const LeadingIcon = ICONS[icon];
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

  return (
    <>
      <Button onClick={handleClick} disabled={isPending} variant={variant}>
        {isPending ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
        ) : (
          <LeadingIcon className="mr-1 h-4 w-4" />
        )}
        {label}
      </Button>

      <PermissionRequiredModal
        open={open}
        onOpenChange={setOpen}
        isLoggedIn={isLoggedIn}
        redirectTo="/questions"
      />
    </>
  );
}
