import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  addPrototypeComment,
  addPrototypeReaction,
  getPrototypeQuestions,
  type ReactionKey,
  type QuestionItem,
} from "@/data/questionsPrototype";
import { formatDate } from "@/utils/dateFormat";
import { Heart, Info, Star } from "@/lib/icons";

const QuestionsIndex = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [focusedQuestionId, setFocusedQuestionId] = useState<string | null>(null);
  const currentUserId = user?.id ?? "user-demo";
  const currentUserName = user?.user_metadata?.name || user?.email || "あなた";
  const currentUserAvatar = user?.user_metadata?.avatar_url || "/avatars/avatar-06.svg";

  useEffect(() => {
    setQuestions(getPrototypeQuestions());
  }, []);

  const updateQuestion = (updated?: QuestionItem) => {
    if (!updated) return;
    setQuestions((prev) =>
      prev.map((question) => (question.id === updated.id ? updated : question))
    );
  };

  const reactionItems: Array<{
    key: ReactionKey;
    label: string;
    icon: typeof Heart;
  }> = [
    { key: "cheer", label: "応援", icon: Star },
    { key: "thanks", label: "ありがとう", icon: Heart },
    { key: "insight", label: "いいね", icon: Info },
  ];

  const handleReaction = (questionId: string, reaction: ReactionKey) => {
    const updated = addPrototypeReaction({ questionId, reaction });
    updateQuestion(updated);
  };

  const handleCommentSubmit = (questionId: string) => {
    const draft = commentDrafts[questionId]?.trim();
    if (!draft) return;

    const updated = addPrototypeComment({
      questionId,
      content: draft,
      authorId: currentUserId,
      authorName: currentUserName,
      authorAvatar: currentUserAvatar,
    });

    updateQuestion(updated);
    setCommentDrafts((prev) => ({ ...prev, [questionId]: "" }));
  };

  const people = useMemo(() => {
    const map = new Map<string, { id: string; name: string; avatar?: string }>();
    questions.forEach((question) => {
      map.set(question.authorId, {
        id: question.authorId,
        name: question.authorName,
        avatar: question.authorAvatar,
      });
      question.comments.forEach((comment) => {
        map.set(comment.authorId, {
          id: comment.authorId,
          name: comment.authorName,
          avatar: comment.authorAvatar,
        });
      });
    });
    return Array.from(map.values()).slice(0, 12);
  }, [questions]);

  return (
    <Layout>
      <div className="container py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">みんなの掲示板</h1>
              <Badge variant="secondary" className="text-xs">
                Prototype
              </Badge>
            </div>
            <p className="mt-2 text-muted-foreground">
              学習や制作の気づきを共有して、メンバー同士で励まし合う場所です。
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="-space-x-2 flex items-center">
                {people.slice(0, 6).map((person) => (
                  <Avatar
                    key={person.id}
                    className="h-9 w-9 border-2 border-white shadow-sm"
                  >
                    <AvatarImage src={person.avatar} alt={person.name} />
                    <AvatarFallback>{person.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                いま交流しているメンバー
              </span>
            </div>
          </div>
          <Button asChild>
            <Link to="/questions/new">スレッドを立てる</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid gap-4">
            {questions.map((question) => {
              const hasMyComment = question.comments.some(
                (comment) => comment.authorId === currentUserId
              );
              const latestComment = question.comments[question.comments.length - 1];
              const participants = [
                {
                  id: question.authorId,
                  name: question.authorName,
                  avatar: question.authorAvatar,
                },
                ...question.comments.map((comment) => ({
                  id: comment.authorId,
                  name: comment.authorName,
                  avatar: comment.authorAvatar,
                })),
              ].filter(
                (person, index, array) =>
                  array.findIndex((item) => item.id === person.id) === index
              );

              return (
                <Card
                  key={question.id}
                  className="rounded-3xl border border-white/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur"
                >
                  <CardHeader className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">スレッド</Badge>
                      {hasMyComment && (
                        <Badge variant="secondary">コメント済み</Badge>
                      )}
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
                      <div className="flex-1 space-y-1">
                        <CardTitle className="text-xl">
                          <Link
                            to={`/questions/${question.id}`}
                            className="transition-colors hover:text-primary"
                          >
                            {question.title}
                          </Link>
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                          {question.authorName} ・ {formatDate(question.createdAt)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-base text-muted-foreground leading-7 line-clamp-2">
                      {question.body}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="-space-x-2 flex items-center">
                        {participants.slice(0, 5).map((person) => (
                          <Avatar
                            key={person.id}
                            className="h-8 w-8 border-2 border-white shadow-sm"
                          >
                            <AvatarImage src={person.avatar} alt={person.name} />
                            <AvatarFallback>{person.name.slice(0, 1)}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        コメント {question.comments.length}件
                      </div>
                    </div>
                    {latestComment && (
                      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#F1F4F8] px-4 py-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={latestComment.authorAvatar}
                            alt={latestComment.authorName}
                          />
                          <AvatarFallback>
                            {latestComment.authorName.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 rounded-2xl bg-white/90 px-4 py-3">
                          <div className="text-xs text-muted-foreground">
                            {latestComment.authorName} ・{" "}
                            {formatDate(latestComment.createdAt)}
                          </div>
                          <p className="mt-1 text-sm text-foreground line-clamp-2">
                            {latestComment.content}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {reactionItems.map((reaction) => {
                        const Icon = reaction.icon;
                        return (
                          <button
                            key={reaction.key}
                            type="button"
                            onClick={() => handleReaction(question.id, reaction.key)}
                            className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm transition hover:text-foreground"
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
                    <div className="mt-4">
                      {hasMyComment ? (
                        <p className="text-sm text-muted-foreground">
                          すでにコメント済みです。詳細から編集・削除ができます。
                        </p>
                      ) : (
                        <form
                          className="flex items-center gap-3"
                          onSubmit={(event) => {
                            event.preventDefault();
                            handleCommentSubmit(question.id);
                          }}
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={currentUserAvatar}
                              alt={currentUserName}
                            />
                            <AvatarFallback>
                              {currentUserName.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          <Input
                            value={commentDrafts[question.id] || ""}
                            onChange={(event) =>
                              setCommentDrafts((prev) => ({
                                ...prev,
                                [question.id]: event.target.value,
                              }))
                            }
                            placeholder="ひとことコメントを書く"
                            className="h-10 rounded-full border-transparent bg-white/90 shadow-sm focus-visible:ring-1"
                            onFocus={() => setFocusedQuestionId(question.id)}
                            onBlur={() => {
                              window.setTimeout(() => {
                                setFocusedQuestionId((prev) =>
                                  prev === question.id ? null : prev
                                );
                              }, 100);
                            }}
                          />
                          {focusedQuestionId === question.id && (
                            <Button
                              type="submit"
                              size="sm"
                              variant="ghost"
                              disabled={!commentDrafts[question.id]?.trim()}
                              onMouseDown={(event) => event.preventDefault()}
                            >
                              送信
                            </Button>
                          )}
                        </form>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/questions/${question.id}`}>詳細を見る</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {questions.length === 0 && (
              <Card className="rounded-2xl border border-border/60 bg-white">
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  まだ質問がありません。最初の質問を投稿してみましょう。
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="space-y-4">
            <Card className="rounded-3xl border border-white/80 bg-white/90 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <CardTitle className="text-base">今日のメンバー</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-3">
                  {people.map((person) => (
                    <div key={person.id} className="flex flex-col items-center gap-2">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage src={person.avatar} alt={person.name} />
                        <AvatarFallback>{person.name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <span className="text-[11px] text-muted-foreground">
                        {person.name}
                      </span>
                    </div>
                  ))}
                  {people.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      参加メンバーはこれから増えます。
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-white/80 bg-white/90 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <CardTitle className="text-base">使い方のヒント</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground space-y-2">
                <p>質問はタイトルと本文だけでOKです。</p>
                <p>コメントは「編集・削除」まで体験できます。</p>
                <p>気になる投稿は「詳細を見る」から確認できます。</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default QuestionsIndex;
