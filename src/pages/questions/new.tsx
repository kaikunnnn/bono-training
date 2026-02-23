import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { StepQuestionForm, type SubmitResult } from "@/components/questions/StepQuestionForm";
import { QuestionSubmitSuccess } from "@/components/questions/QuestionSubmitSuccess";
import { ArrowLeft, Lock } from "lucide-react";

const QuestionNew = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { hasMemberAccess, loading: subLoading } = useSubscriptionContext();
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  // プレビューモード: ?preview=true&step=1 などで指定
  const isPreviewMode = searchParams.get("preview") === "true";
  const initialStep = parseInt(searchParams.get("step") || "1", 10);

  const currentUserName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "ゲスト";
  const currentUserAvatar =
    user?.user_metadata?.avatar_url || "/avatars/avatar-06.svg";

  const handleSuccess = (result: SubmitResult) => {
    setSubmitResult(result);
  };

  const handleCancel = () => {
    navigate("/questions");
  };

  const handleNewQuestion = () => {
    setSubmitResult(null);
  };

  // プレビューモードでない場合のみ認証チェック
  if (!isPreviewMode) {
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
    if (!hasMemberAccess) {
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
  }

  // プレビューモード用のダミーユーザー情報
  const displayName = isPreviewMode ? "たかし" : currentUserName;
  const displayAvatar = isPreviewMode ? "/avatars/avatar-06.svg" : currentUserAvatar;

  // 投稿完了
  if (submitResult) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="mx-auto max-w-2xl">
            <QuestionSubmitSuccess
              result={submitResult}
              onNewQuestion={handleNewQuestion}
            />
          </div>
        </div>
      </Layout>
    );
  }

  // 質問投稿フォーム
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
                  <AvatarImage src={displayAvatar} alt={displayName} />
                  <AvatarFallback>{displayName.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold">{displayName}</div>
                  <div className="text-xs text-muted-foreground">
                    あなたの名前で投稿されます
                  </div>
                </div>
              </div>

              <StepQuestionForm
                onSuccess={handleSuccess}
                onCancel={handleCancel}
                initialStep={isPreviewMode ? initialStep : undefined}
                previewMode={isPreviewMode}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default QuestionNew;
