import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, getSubscriptionStatus } from "@/lib/subscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Lock,
  CreditCard,
  Calendar,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { CustomerPortalButton } from "@/components/subscription/CustomerPortalButton";

export const metadata: Metadata = {
  title: "アカウント設定",
  description: "アカウント設定とサブスクリプション管理",
};

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/account");
  }

  const subscription = await getSubscriptionStatus();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ヘッダー */}
      <section className="bg-background border-b">
        <div className="container px-4 py-8 sm:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/mypage">
                <ArrowLeft className="w-4 h-4 mr-2" />
                マイページ
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold">アカウント設定</h1>
          <p className="text-muted-foreground mt-1">
            アカウント情報とサブスクリプションを管理
          </p>
        </div>
      </section>

      {/* 設定セクション */}
      <section className="container px-4 py-8 sm:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* メールアドレス */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="w-5 h-5 text-muted-foreground" />
                メールアドレス
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user.email}</p>
                  {user.email_confirmed_at ? (
                    <p className="text-sm text-green-600">確認済み</p>
                  ) : (
                    <p className="text-sm text-amber-600">未確認</p>
                  )}
                </div>
                <Button variant="outline" size="sm" disabled>
                  変更
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* パスワード */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="w-5 h-5 text-muted-foreground" />
                パスワード
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">••••••••••••</p>
                <Button variant="outline" size="sm" disabled>
                  変更
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* サブスクリプション */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                サブスクリプション
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {subscription.isSubscribed
                      ? `${getPlanLabel(subscription.planType)}（${subscription.duration === 3 ? "3ヶ月" : "1ヶ月"}）`
                      : "無料プラン"}
                  </p>
                  {subscription.isSubscribed ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 mt-1"
                    >
                      アクティブ
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="mt-1">
                      未購読
                    </Badge>
                  )}
                </div>
                {subscription.isSubscribed ? (
                  <CustomerPortalButton variant="outline" size="sm">
                    プラン管理
                  </CustomerPortalButton>
                ) : (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/subscription">アップグレード</Link>
                  </Button>
                )}
              </div>

              {subscription.isSubscribed && subscription.renewalDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                  <Calendar className="w-4 h-4" />
                  {subscription.cancelAtPeriodEnd ? (
                    <span className="text-amber-600">
                      {formatDate(subscription.renewalDate)} に終了予定
                    </span>
                  ) : (
                    <span>次回更新: {formatDate(subscription.renewalDate)}</span>
                  )}
                </div>
              )}

              {subscription.isSubscribed && !subscription.cancelAtPeriodEnd && (
                <div className="pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled
                  >
                    サブスクリプションを解約
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* 危険な操作 */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-destructive">
                <AlertTriangle className="w-5 h-5" />
                危険な操作
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">アカウントを削除</p>
                  <p className="text-sm text-muted-foreground">
                    この操作は取り消せません
                  </p>
                </div>
                <Button variant="destructive" size="sm" disabled>
                  削除
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function getPlanLabel(planType: string | null): string {
  switch (planType) {
    case "standard":
      return "スタンダード";
    case "feedback":
      return "フィードバック";
    default:
      return "無料プラン";
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
