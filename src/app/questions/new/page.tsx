import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { getCurrentUser, getSubscriptionStatus } from "@/lib/subscription";
import { getQuestionCategories } from "@/lib/services/questions";
import { BOARD_CATEGORIES } from "@/lib/questions/categories";
import type { QuestionCategory } from "@/types/sanity";
import { PostFlowClient } from "@/components/questions/post-flow/PostFlowClient";
import { isProfileIncomplete } from "@/lib/profile-utils";

/** プレビュー用モックカテゴリ（BOARD_CATEGORIES の post から生成。contact は Sanity に存在しない） */
const PREVIEW_CATEGORIES: QuestionCategory[] = BOARD_CATEGORIES.filter(
  (c) => c.kind === "post",
).map((c) => ({
  _id: `preview-${c.slug}`,
  title: c.label,
  slug: { _type: "slug", current: c.slug },
}));

export const metadata = {
  title: "投稿する | みんなの掲示板",
  description: "UIデザインや学習に関する話題をメンバーと共有できます",
};

interface PageProps {
  searchParams: Promise<{ preview?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  const isPreviewMode = sp.preview === "true";

  // プレビューモードは認証スキップ（デザイン確認用）。本番では無効（/dev と同じ遮断方針）
  if (isPreviewMode && process.env.NODE_ENV !== "production") {
    return (
      <PostFlowClient
        categories={PREVIEW_CATEGORIES}
        isPreview
        profileIncomplete={false}
      />
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
              投稿するにはログインしてください
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
              投稿はメンバーのみご利用いただけます
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

  // 表示名・アイコンが未設定なら投稿完了時に設定を促す（#142）
  const profileIncomplete = isProfileIncomplete(user.user_metadata);

  return (
    <PostFlowClient
      categories={categories}
      profileIncomplete={profileIncomplete}
    />
  );
}
