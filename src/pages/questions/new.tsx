import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { QuestionForm } from "@/components/questions/QuestionForm";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";

const QuestionNew = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { hasActiveSubscription, loading: subLoading } = useSubscriptionContext();
  const [submitted, setSubmitted] = useState(false);

  const currentUserName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "ゲスト";
  const currentUserAvatar =
    user?.user_metadata?.avatar_url || "/avatars/avatar-06.svg";

  const handleSuccess = (questionId: string, slug: string) => {
    setSubmitted(true);
  };

  const handleCancel = () => {
    navigate("/questions");
  };

  // ローディング中
  if (authLoading || subLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </div>
      </Layout>
    );
  }

  // 未ログイン
  if (!user) {
    return (
      <Layout>
        <div className="container py-8">
          <Card className="mx-auto max-w-lg">
            <CardContent className="pt-6 text-center">
              <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="mb-2 text-lg font-semibold">ログインが必要です</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                質問を投稿するにはログインしてください
              </p>
              <Button asChild>
                <Link to="/login" state={{ from: "/questions/new" }}>
                  ログイン
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // 有料会員でない
  if (!hasActiveSubscription) {
    return (
      <Layout>
        <div className="container py-8">
          <Card className="mx-auto max-w-lg">
            <CardContent className="pt-6 text-center">
              <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="mb-2 text-lg font-semibold">
                有料会員限定の機能です
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                質問投稿は有料会員のみご利用いただけます
              </p>
              <Button asChild>
                <Link to="/subscription">プランを確認する</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // 投稿完了
  if (submitted) {
    return (
      <Layout>
        <div className="container py-8">
          <Card className="mx-auto max-w-lg">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <h2 className="mb-2 text-lg font-semibold">
                質問を投稿しました！
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                カイくんが確認後、回答とともに公開されます。
                <br />
                回答までしばらくお待ちください。
              </p>
              <div className="flex justify-center gap-3">
                <Button asChild variant="outline">
                  <Link to="/questions">質問一覧へ</Link>
                </Button>
                <Button onClick={() => setSubmitted(false)}>
                  もう1つ質問する
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/questions">
              <ArrowLeft className="mr-2 h-4 w-4" />
              一覧へ戻る
            </Link>
          </Button>

          <Card>
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">質問を投稿する</CardTitle>
              <p className="text-sm text-muted-foreground">
                UIデザインに関する質問をカイくんに直接聞くことができます
              </p>
            </CardHeader>
            <CardContent>
              {/* 投稿者情報 */}
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUserAvatar} alt={currentUserName} />
                  <AvatarFallback>{currentUserName.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold">{currentUserName}</div>
                  <div className="text-xs text-muted-foreground">
                    あなたの名前で投稿されます
                  </div>
                </div>
              </div>

              <QuestionForm onSuccess={handleSuccess} onCancel={handleCancel} />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default QuestionNew;
