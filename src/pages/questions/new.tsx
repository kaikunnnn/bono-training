import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { createPrototypeQuestion } from "@/data/questionsPrototype";

const QuestionNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id ?? "user-demo";
  const currentUserName = user?.user_metadata?.name || user?.email || "あなた";
  const currentUserAvatar = user?.user_metadata?.avatar_url || "/avatars/avatar-06.svg";

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const exampleBody =
    "学習用のダッシュボードを作っているのですが、色が全然決まらず悩んでます。\n\n安心できる雰囲気にしたくてブルー系とグリーン系で2案作ってみたものの、どっちもしっくり来ない感じです。\nブランドカラーはまだなくて、ロゴはグレー基調。アクセントは1色だけで考えています。\n\nみなさんなら、こういう時どうやって色相を決めますか？アクセント1色で失敗しにくいコツがあれば教えてほしいです。";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!title.trim() || !body.trim()) return;

    setIsSubmitting(true);
    const newQuestion = createPrototypeQuestion({
      title: title.trim(),
      body: body.trim(),
      authorId: currentUserId,
      authorName: currentUserName,
      authorAvatar: currentUserAvatar,
    });

    navigate(`/questions/${newQuestion.id}?created=1`);
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col gap-4">
          <Button variant="ghost" size="sm" asChild className="w-fit">
            <Link to="/questions">一覧へ戻る</Link>
          </Button>

          <Card>
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">スレッドを立てる</CardTitle>
              <p className="text-sm text-muted-foreground">
                タイトルと本文のみのシンプルな投稿フォームです。送信すると
                プロトタイプ用にブラウザ内へ保存されます。
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUserAvatar} alt={currentUserName} />
                  <AvatarFallback>{currentUserName.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold">{currentUserName}</div>
                  <div className="text-xs text-muted-foreground">
                    ログイン中のユーザーとして投稿されます
                  </div>
                </div>
              </div>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="question-title">
                    タイトル
                  </label>
                  <Input
                    id="question-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="例: 配色が決めきれず迷ってます"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    ひと目で状況が分かる短めのタイトルがおすすめです。
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="question-body">
                    本文
                  </label>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>書き方のヒント:</span>
                    <span>今の状況</span>
                    <span>・</span>
                    <span>やりたいこと</span>
                    <span>・</span>
                    <span>試したこと</span>
                    <span>・</span>
                    <span>聞きたいこと</span>
                  </div>
                  <Textarea
                    id="question-body"
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    placeholder="会話っぽく書いてOKです。いまの状況・やりたいこと・試したこと・聞きたいことが入ると、答えやすくなります。"
                    rows={10}
                    required
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setBody(exampleBody)}
                    >
                      例文を入れる
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      そのまま編集して使えます
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    投稿する
                  </Button>
                  <Button variant="ghost" type="button" asChild>
                    <Link to="/questions">キャンセル</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default QuestionNew;
