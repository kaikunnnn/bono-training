import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
  addPrototypeComment,
  addPrototypeReaction,
  deletePrototypeComment,
  getPrototypeQuestionById,
  type ReactionKey,
  updatePrototypeComment,
  type QuestionComment,
  type QuestionItem,
} from "@/data/questionsPrototype";
import { formatDate } from "@/utils/dateFormat";
import { Heart, Info, Star } from "@/lib/icons";

const QuestionDetail = () => {
  const { questionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id ?? "user-demo";
  const currentUserName = user?.user_metadata?.name || user?.email || "あなた";
  const currentUserAvatar =
    user?.user_metadata?.avatar_url || "/avatars/avatar-06.svg";

  const [question, setQuestion] = useState<QuestionItem | null>(null);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    if (!questionId) return;
    const loaded = getPrototypeQuestionById(questionId);
    setQuestion(loaded ?? null);
  }, [questionId]);

  const myComment = useMemo(() => {
    return question?.comments.find(
      (comment) => comment.authorId === currentUserId
    );
  }, [question, currentUserId]);

  const createdBanner = searchParams.get("created");

  const reactionItems: Array<{
    key: ReactionKey;
    label: string;
    icon: typeof Heart;
  }> = [
    { key: "cheer", label: "応援", icon: Star },
    { key: "thanks", label: "ありがとう", icon: Heart },
    { key: "insight", label: "いいね", icon: Info },
  ];

  const handleReaction = (reaction: ReactionKey) => {
    if (!questionId) return;
    const updated = addPrototypeReaction({ questionId, reaction });
    if (updated) {
      setQuestion(updated);
    }
  };

  const handleAddComment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!questionId) return;
    const trimmed = commentText.trim();
    if (!trimmed) return;

    const updated = addPrototypeComment({
      questionId,
      content: trimmed,
      authorId: currentUserId,
      authorName: currentUserName,
      authorAvatar: currentUserAvatar,
    });
    if (updated) {
      setQuestion(updated);
      setCommentText("");
    }
  };

  const handleStartEdit = (comment: QuestionComment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.content);
  };

  const handleUpdateComment = () => {
    if (!questionId || !editingCommentId) return;
    const trimmed = editingText.trim();
    if (!trimmed) return;

    const updated = updatePrototypeComment({
      questionId,
      commentId: editingCommentId,
      content: trimmed,
    });

    if (updated) {
      setQuestion(updated);
      setEditingCommentId(null);
      setEditingText("");
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (!questionId) return;
    const confirmed = window.confirm("コメントを削除しますか？");
    if (!confirmed) return;

    const updated = deletePrototypeComment({ questionId, commentId });
    if (updated) {
      setQuestion(updated);
    }
  };

  if (!questionId) {
    return (
      <Layout>
        <div className="container py-12">
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              質問が見つかりませんでした。
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!question) {
    return (
      <Layout>
        <div className="container py-12">
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              質問が見つかりませんでした。
            </CardContent>
          </Card>
          <div className="mt-4">
            <Button variant="ghost" onClick={() => navigate("/questions")}> 
              一覧へ戻る
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col gap-4">
          <Button variant="ghost" size="sm" asChild className="w-fit">
            <Link to="/questions">一覧へ戻る</Link>
          </Button>

          {createdBanner && (
            <Card className="border-primary/30 bg-primary/5 rounded-2xl">
              <CardContent className="py-4 text-sm text-primary">
                スレッドを投稿しました。コメントを集めてみましょう。
              </CardContent>
            </Card>
          )}

          <Card className="rounded-2xl border border-border/60 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">スレッド</Badge>
                {myComment && <Badge variant="secondary">コメント済み</Badge>}
              </div>
              <div className="flex items-start gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarImage
                    src={question.authorAvatar}
                    alt={question.authorName}
                  />
                  <AvatarFallback>
                    {question.authorName.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-2xl">{question.title}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {question.authorName} ・ {formatDate(question.createdAt)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="whitespace-pre-line text-base leading-7 text-foreground">
                {question.body}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {reactionItems.map((reaction) => {
                  const Icon = reaction.icon;
                  return (
                    <button
                      key={reaction.key}
                      type="button"
                      onClick={() => handleReaction(reaction.key)}
                      className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-white px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm transition hover:text-foreground"
                    >
                      <Icon size={14} variant="Bold" />
                      <span>{reaction.label}</span>
                      <span className="rounded-full bg-muted px-1.5 text-[11px] text-foreground">
                        {question.reactions[reaction.key]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

          <div className="mt-8 grid gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">コメント</h2>
              <Badge variant="secondary">{question.comments.length}件</Badge>
            </div>

          {question.comments.length === 0 && (
            <Card className="rounded-2xl border border-border/60 bg-white">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                まだコメントがありません。最初のコメントを投稿してみましょう。
              </CardContent>
            </Card>
          )}

          {question.comments.map((comment) => {
            const isMine = comment.authorId === currentUserId;
            const isEditing = editingCommentId === comment.id;

            return (
              <Card
                key={comment.id}
                className="rounded-2xl border border-border/60 bg-white"
              >
                <CardHeader className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={comment.authorAvatar}
                          alt={comment.authorName}
                        />
                        <AvatarFallback>
                          {comment.authorName.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-semibold">
                          {comment.authorName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                          {comment.updatedAt ? "（編集済み）" : ""}
                        </div>
                      </div>
                    </div>
                    {isMine && !isEditing && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(comment)}
                        >
                          編集
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          削除
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {isEditing ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editingText}
                        onChange={(event) => setEditingText(event.target.value)}
                        rows={4}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={handleUpdateComment}>
                          保存する
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingText("");
                          }}
                        >
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-line text-sm leading-6">
                      {comment.content}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}

          <Card className="rounded-2xl border border-border/60 bg-white">
            <CardHeader>
              <CardTitle className="text-base">コメントを書く</CardTitle>
            </CardHeader>
            <CardContent>
              {myComment ? (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    すでにコメント済みです。編集または削除で内容を調整できます。
                  </p>
                </div>
              ) : (
                <form className="space-y-3" onSubmit={handleAddComment}>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={currentUserAvatar}
                        alt={currentUserName}
                      />
                      <AvatarFallback>
                        {currentUserName.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <Textarea
                        value={commentText}
                        onChange={(event) => setCommentText(event.target.value)}
                        placeholder="質問に対するヒントや経験を共有しましょう"
                        rows={4}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button type="submit" disabled={!commentText.trim()}>
                          コメントする
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default QuestionDetail;
