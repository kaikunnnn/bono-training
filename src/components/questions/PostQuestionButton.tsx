"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, MessageSquare, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionRequiredModal } from "@/components/common/PermissionRequiredModal";

interface PostQuestionButtonProps {
  /** メンバーなら /questions/new に遷移、そうでなければモーダル */
  hasMemberAccess: boolean;
  isLoggedIn: boolean;
  /** ボタンの見た目（Empty状態のアクション促しでは secondary を使う） */
  variant?: React.ComponentProps<typeof Button>["variant"];
  /** ボタンサイズ。掲示板トップの「スレッドを作成」は large（ログイン画面と同じ共通スタイル） */
  size?: React.ComponentProps<typeof Button>["size"];
  /** ボタンのラベル（デフォルト: 質問を投稿する） */
  label?: string;
  /** 先頭アイコン。掲示板の「スレッドを作成」導線では吹き出し（message-square）を渡す
      （記事詳細の「掲示板で聞く」と同系統のアイコンに統一） */
  icon?: "plus" | "message-square";
  /** トリガーボタンの追加クラス */
  className?: string;
}

const ICONS: Record<NonNullable<PostQuestionButtonProps["icon"]>, LucideIcon> = {
  plus: Plus,
  "message-square": MessageSquare,
};

export function PostQuestionButton({
  hasMemberAccess,
  isLoggedIn,
  variant = "default",
  size = "default",
  label = "質問を投稿する",
  icon = "plus",
  className,
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
      <Button
        onClick={handleClick}
        disabled={isPending}
        variant={variant}
        size={size}
        className={className}
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LeadingIcon className="mr-2 h-4 w-4" />
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
