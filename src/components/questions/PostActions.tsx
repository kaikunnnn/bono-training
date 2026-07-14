"use client";

/**
 * スレッド（掲示板の元投稿）の編集・削除 UI（#147）。
 *
 * 詳細ページの「タイトル + 元投稿カード」を包む Client Component。
 * - 閲覧時: サーバーで描画済みの表示（title / body 部分）を children として素通しし、
 *   本人（currentUserId === authorUserId）のときだけカード右上に 3 点リーダーを重ねる。
 * - 編集時: タイトル Input + 本文 FormattingTextarea に切り替える
 *   （本文の初期値は portableBlocksToText で復元）。保存で router.refresh。
 * - 削除: AlertDialog で確認 → 成功で /questions へ遷移。
 *
 * 表示（PortableText / linkify / 添付画像 等）は既存の Server 描画をそのまま使うため、
 * 閲覧側のロジックはこのコンポーネントに持ち込まない。
 */

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormattingTextarea } from "@/components/questions/FormattingTextarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { updateQuestion, deleteQuestion } from "@/app/questions/[slug]/actions";

const TITLE_MAX = 100;
const CONTENT_MAX = 5000;

interface PostActionsProps {
  questionId: string;
  slug: string;
  /** 現在のスレッド作成者の userId（本人判定用） */
  authorUserId: string | null;
  /** ログイン中ユーザーの id（本人判定用） */
  currentUserId: string | null;
  /** 編集フォームの初期タイトル */
  initialTitle: string;
  /** 編集フォームの初期本文（portableBlocksToText で復元済みのプレーンテキスト） */
  initialContent: string;
  /** タイトルブロック（H1）の閲覧用サーバー描画 */
  titleView: ReactNode;
  /** 元投稿カードの閲覧用サーバー描画（アバター・本文・フッター等） */
  cardView: ReactNode;
}

export function PostActions({
  questionId,
  slug,
  authorUserId,
  currentUserId,
  initialTitle,
  initialContent,
  titleView,
  cardView,
}: PostActionsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isOwner =
    currentUserId !== null &&
    authorUserId !== null &&
    currentUserId === authorUserId;

  const startEdit = () => {
    setTitle(initialTitle);
    setContent(initialContent);
    setError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setTitle(initialTitle);
    setContent(initialContent);
    setError(null);
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const res = await updateQuestion({
        questionId,
        slug,
        title,
        content,
      });
      if (!res.ok) {
        setError(res.error || "更新に失敗しました");
        return;
      }
      setIsEditing(false);
      router.refresh();
    });
  };

  const handleDelete = () => {
    setConfirmingDelete(false);
    setError(null);
    startTransition(async () => {
      const res = await deleteQuestion({ questionId, slug });
      if (!res.ok) {
        setError(res.error || "削除に失敗しました");
        return;
      }
      router.push("/questions");
    });
  };

  // 編集モード：タイトル Input + 本文 FormattingTextarea に切り替える
  if (isEditing) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 pt-8">
          <label
            htmlFor="post-edit-title"
            className="px-2 text-[13px] font-medium text-muted-foreground"
          >
            タイトル
          </label>
          <Input
            id="post-edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={TITLE_MAX}
            disabled={isPending}
            placeholder="タイトルを入力"
            className="mx-2"
          />
        </div>

        <div className="flex w-full flex-col gap-3 rounded-[24px] border border-border bg-surface p-8">
          <FormattingTextarea
            ariaLabel="本文編集"
            value={content}
            onChange={setContent}
            rows={8}
            maxLength={CONTENT_MAX}
            disabled={isPending}
            containerClassName="rounded-[16px] border border-input bg-white p-4"
            className="min-h-[160px] text-base"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              onClick={cancelEdit}
              disabled={isPending}
            >
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  保存中
                </>
              ) : (
                "保存"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 閲覧モード：サーバー描画をそのまま表示し、本人にのみ 3 点リーダーを重ねる
  return (
    <>
      {titleView}
      <div className="relative">
        {isOwner && (
          <div className="absolute right-4 top-4 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label="メニュー"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={startEdit}>編集</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setConfirmingDelete(true)}
                  className="text-destructive focus:text-destructive"
                >
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {cardView}
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>

      <AlertDialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>スレッドを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              このスレッドに寄せられたコメントやスタンプもすべて削除され、元に戻せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
