import { Metadata } from "next";
import { getCurrentUser, getSubscriptionStatus } from "@/lib/subscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MessageSquare } from "lucide-react";
import { PlanCard } from "@/components/subscription/PlanCard";
import { CustomerPortalButton } from "@/components/subscription/CustomerPortalButton";
import type { PlanType } from "@/types/subscription";

export const metadata: Metadata = {
  title: "プレミアム会員",
  description:
    "BONOプレミアム会員になって、すべてのレッスンと記事にアクセスしよう。UIUXデザインのスキルを効率的に身につけられます。",
  openGraph: {
    title: "プレミアム会員 | BONO",
    description:
      "BONOプレミアム会員になって、すべてのレッスンと記事にアクセスしよう。",
  },
  alternates: { canonical: "/subscription" },
};

const plans: Array<{
  id: PlanType;
  name: string;
  description: string;
  price: number;
  features: string[];
  popular: boolean;
}> = [
  {
    id: "standard",
    name: "スタンダード",
    description: "すべてのコンテンツにアクセス",
    price: 4000,
    features: [
      "すべてのレッスン・記事へのアクセス",
      "新規コンテンツの優先アクセス",
      "学習進捗の記録",
      "メールサポート",
    ],
    popular: true,
  },
  {
    id: "feedback",
    name: "フィードバック",
    description: "作品のレビューを受ける",
    price: 1480,
    features: [
      "すべてのコンテンツへのアクセス",
      "フィードバック機能の利用",
      "実務プロジェクトのレビュー",
      "キャリア相談",
    ],
    popular: false,
  },
];

export default async function SubscriptionPage() {
  const user = await getCurrentUser();
  const subscription = await getSubscriptionStatus();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-b from-background to-muted/30 border-b">
        <div className="container px-4 py-16 sm:px-8 text-center">
          <Badge variant="secondary" className="mb-4">
            プレミアム会員
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            UIUXデザインを
            <br className="sm:hidden" />
            本格的に学ぶ
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            プレミアム会員になると、すべてのレッスンと記事にアクセスできます。
            体系的なカリキュラムで、効率的にスキルアップしましょう。
          </p>
        </div>
      </section>

      {/* 現在のプラン表示（ログイン済みの場合） */}
      {user && subscription.isSubscribed && (
        <section className="container px-4 py-8 sm:px-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    現在のプラン
                  </p>
                  <p className="text-2xl font-bold">
                    {getPlanLabel(subscription.planType)}
                  </p>
                  {subscription.renewalDate && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {subscription.cancelAtPeriodEnd
                        ? `${formatDate(subscription.renewalDate)} に終了予定`
                        : `次回更新: ${formatDate(subscription.renewalDate)}`}
                    </p>
                  )}
                </div>
                <CustomerPortalButton variant="outline">
                  プランを管理
                </CustomerPortalButton>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* プラン一覧 */}
      <section className="container px-4 py-12 sm:px-8">
        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              duration={1}
              isCurrentPlan={
                subscription.isSubscribed && subscription.planType === plan.id
              }
              isCanceled={subscription.cancelAtPeriodEnd}
              isLoggedIn={!!user}
              isSubscribed={subscription.isSubscribed}
            />
          ))}
        </div>

        {/* 3ヶ月プランの案内 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            3ヶ月プランをご希望の方は、プラン選択後にカスタマーポータルからお申し込みいただけます。
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="container px-4 py-12 sm:px-8">
        <h2 className="text-2xl font-bold text-center mb-8">よくある質問</h2>
        <div className="max-w-2xl mx-auto space-y-4">
          {[
            {
              q: "いつでも解約できますか？",
              a: "はい、いつでも解約できます。解約後も、次回更新日までコンテンツにアクセスできます。",
            },
            {
              q: "プランの変更はできますか？",
              a: "はい、いつでもプランを変更できます。アップグレードは即時適用され、ダウングレードは次回更新時に適用されます。",
            },
            {
              q: "支払い方法は何が使えますか？",
              a: "クレジットカード（Visa、Mastercard、JCB、American Express）でお支払いいただけます。",
            },
            {
              q: "無料トライアルはありますか？",
              a: "一部のコンテンツは無料でお試しいただけます。プレミアムコンテンツをすべて体験したい場合は、月額プランにご登録ください。",
            },
          ].map((faq, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{faq.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
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
