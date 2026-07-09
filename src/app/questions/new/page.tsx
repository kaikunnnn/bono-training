import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { getCurrentUser, getSubscriptionStatus } from "@/lib/subscription";
import { getQuestionCategories } from "@/lib/services/questions";
import { NewQuestionClient } from "@/components/questions/NewQuestionClient";

export const metadata = {
  title: "質問を投稿する | みんなの掲示板",
  description: "UIデザインや学習に関する質問をメンバーと共有できます",
};

interface PageProps {
  searchParams: Promise<{ preview?: string; step?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  const isPreviewMode = sp.preview === "true";
  const initialStep = sp.step ? parseInt(sp.step, 10) : undefined;

  // プレビューモードは認証スキップ（デザイン確認用）。本番では無効（/dev と同じ遮断方針）
  if (isPreviewMode && process.env.NODE_ENV !== "production") {
    return (
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <NewQuestionClient
            categories={[]}
            displayName="たかし"
            displayAvatar="/avatars/avatar-06.svg"
            previewMode
            initialStep={initialStep}
          />
        </div>
      </div>
    );
  }

  const [user, status] = await Promise.all([
    getCurrentUser(),
    getSubscriptionStatus(),
  ]);

  // 未ログイン
  if (!user) {
    return (
      <div className="container py-8">
        <Card className="mx-auto max-w-lg">
          <CardContent className="pt-6 text-center">
            <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-lg font-semibold">ログインが必要です</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              質問を投稿するにはログインしてください
            </p>
            <Button asChild>
              <Link href="/login?next=/questions/new">ログイン</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 有料会員でない
  if (!status.hasMemberAccess) {
    return (
      <div className="container py-8">
        <Card className="mx-auto max-w-lg">
          <CardContent className="pt-6 text-center">
            <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-lg font-semibold">
              メンバー限定の機能です
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              質問投稿はメンバーのみご利用いただけます
            </p>
            <Button asChild>
              <Link href="/subscription">プランを確認する</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // カテゴリは Server Component で取得して props で渡す（クライアントの fetch を避ける）
  const categories = await getQuestionCategories();

  const displayName =
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "メンバー";
  const displayAvatar =
    (user.user_metadata?.avatar_url as string | undefined) ||
    "/avatars/avatar-06.svg";

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <NewQuestionClient
          categories={categories}
          displayName={displayName}
          displayAvatar={displayAvatar}
        />
      </div>
    </div>
  );
}
