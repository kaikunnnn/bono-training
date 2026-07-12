"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  profileIncomplete = false,
}: QuestionCommentsSectionProps) {
  const [comments, setComments] = useState(initialComments);
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
    <Card className="mt-6 rounded-3xl border border-white/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          コメント {comments.length}件
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div className="border-t pt-4">
          <QuestionCommentForm
            questionId={questionId}
            questionSlug={questionSlug}
            onAdded={handleAdded}
          />
        </div>
      </CardContent>

      <ProfileSetupPromptModal
        open={showProfilePrompt}
        onOpenChange={setShowProfilePrompt}
      />
    </Card>
  );
}
