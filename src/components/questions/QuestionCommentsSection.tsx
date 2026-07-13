"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import type { QuestionComment, ReactionKey } from "@/lib/services/questions";
import { emptyReactionCounts } from "@/lib/services/questions-utils";
import { QuestionCommentForm } from "./QuestionCommentForm";
import { QuestionCommentItem } from "./QuestionCommentItem";
import { ProfileSetupPromptModal } from "./ProfileSetupPromptModal";
import { shouldShowProfilePrompt } from "@/lib/profile-utils";

interface QuestionCommentsSectionProps {
  questionId: string;
  questionSlug: string;
  initialComments: QuestionComment[];
  commentReactionCounts: Record<string, Record<ReactionKey, number>>;
  myCommentReactions: Record<string, ReactionKey[]>;
  currentUserId: string | null;
  /** ログインユーザーのアバターURL（入力フォームのアバター表示用） */
  currentUserAvatarUrl?: string | null;
  /** ログインユーザーの表示名（入力フォームのイニシャルfallback用） */
  currentUserName?: string;
  /** 表示名・アイコンが未設定か。コメント完了後に設定を促す（#142） */
  profileIncomplete?: boolean;
}

/**
 * コメント一覧 + 投稿フォーム。
 * サーバーから受けた initialComments を state に持ち、投稿/削除を待たずに
 * 画面へ即時反映する（裏で router.refresh によりサーバー状態と再同期）。
 */
export function QuestionCommentsSection({
  questionId,
  questionSlug,
  initialComments,
  commentReactionCounts,
  myCommentReactions,
  currentUserId,
  currentUserAvatarUrl,
  currentUserName = "",
  profileIncomplete = false,
}: QuestionCommentsSectionProps) {
  const [comments, setComments] = useState(initialComments);
  // サブ導線（一覧下部の枠線ボタン）を押すとメインと同じ入力フォームへ展開する。
  // 一方向の切り替えでよい（リロードするまで戻せなくてOK）。
  const [subFormOpen, setSubFormOpen] = useState(false);
  // プロフィール設定促しモーダルの開閉（#142）
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  // このマウント中に一度でも促したか。2回目以降のコメントで連続表示しないためのガード
  const promptedRef = useRef(false);

  // router.refresh() 後に届く最新のサーバー状態で上書きする
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleAdded = (comment: QuestionComment) => {
    setComments((prev) =>
      prev.some((c) => c.id === comment.id) ? prev : [...prev, comment],
    );
    // コメント完了後、表示名・アイコンが未設定なら設定を促す（#142）。
    // 30日抑制中や、このマウント中に一度promptした後は出さない。
    if (
      profileIncomplete &&
      !promptedRef.current &&
      shouldShowProfilePrompt()
    ) {
      promptedRef.current = true;
      setShowProfilePrompt(true);
    }
  };

  const handleDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return (
    // Figma 20:2845: 白カード包みを廃止し、本文カード下の区切り線付きフラットセクションに。
    // border-t で区切り / pt-8 pb-6 / gap-8。
    <section className="mt-8 flex flex-col gap-8 border-t border-border pt-8 pb-6">
      {/* 見出し：アイコン20px + 「コメント N件」 Rounded Mplus Bold 18px/leading-7 */}
      <h2 className="flex items-center gap-[5px] font-rounded-mplus text-[18px] font-bold leading-7 text-foreground">
        <MessageSquare className="h-5 w-5" />
        コメント {comments.length}件
      </h2>

      {/* メイン入力：コメント一覧の先頭（元の投稿のすぐ下） */}
      <QuestionCommentForm
        questionId={questionId}
        questionSlug={questionSlug}
        onAdded={handleAdded}
        authorAvatarUrl={currentUserAvatarUrl}
        authorName={currentUserName}
      />

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          まだコメントがありません。最初のコメントを書きましょう。
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <QuestionCommentItem
              key={c.id}
              comment={c}
              questionSlug={questionSlug}
              currentUserId={currentUserId}
              reactionCounts={
                commentReactionCounts[c.id] ?? emptyReactionCounts()
              }
              myReactions={myCommentReactions[c.id] ?? []}
              onDeleted={handleDeleted}
            />
          ))}
        </ul>
      )}

      {/* サブ導線：一覧下部の枠線ボタン → 押すとメインと同じ入力フォームに展開（一方向）。
          コメント0件のときはメイン入力だけで十分なので非表示。 */}
      {comments.length > 0 && (
        <div className="border-t pt-4">
          {subFormOpen ? (
            <QuestionCommentForm
              questionId={questionId}
              questionSlug={questionSlug}
              onAdded={handleAdded}
              authorAvatarUrl={currentUserAvatarUrl}
              authorName={currentUserName}
              autoFocus
            />
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setSubFormOpen(true)}
            >
              コメントを書く
            </Button>
          )}
        </div>
      )}

      <ProfileSetupPromptModal
        open={showProfilePrompt}
        onOpenChange={setShowProfilePrompt}
      />
    </section>
  );
}
