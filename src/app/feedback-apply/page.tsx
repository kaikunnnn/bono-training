import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSubscriptionStatus, getCurrentUser } from "@/lib/subscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Lightbulb,
  FileText,
  ArrowRight,
  Lock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "15分フィードバック申請",
  description: "BONOの15分フィードバックサービス。あなたのデザインアウトプットに対して、具体的なフィードバックを受けられます。",
  openGraph: {
    title: "15分フィードバック申請 | BONO",
    description: "BONOの15分フィードバックサービス。あなたのデザインアウトプットに対して、具体的なフィードバックを受けられます。",
  },
};

const rules = [
  {
    icon: CheckCircle2,
    title: "気づきを言語化",
    description: "学んだこと、気づいたことを自分の言葉でまとめていること",
  },
  {
    icon: CheckCircle2,
    title: "Before/Afterを見せる",
    description: "改善前と改善後の比較ができるようにしていること",
  },
  {
    icon: CheckCircle2,
    title: "なぜを説明",
    description: "なぜそのデザインにしたのか、理由を説明できること",
  },
];

const ngPatterns = [
  "レッスンのお題をただ模写しただけのもの",
  "自分なりの解釈や工夫がないもの",
  "質問内容が曖昧で何を聞きたいかわからないもの",
  "提出物のURLが正しくない、アクセスできない",
];

const tips = [
  {
    icon: FileText,
    title: "記事に整理する",
    description: "Notionや記事形式でまとめると、見返しやすく成長の記録になります",
  },
  {
    icon: Lightbulb,
    title: "仮説を持つ",
    description: "「こうした方が良いかも」という仮説を持って提出すると、学びが深まります",
  },
  {
    icon: MessageSquare,
    title: "具体的に質問",
    description: "「ここが不安」「この部分の判断が正しいか」など具体的に質問しましょう",
  },
];

export default async function FeedbackApplyPage() {
  const [user, subscription] = await Promise.all([
    getCurrentUser(),
    getSubscriptionStatus(),
  ]);

  // 未ログインの場合はログインページへ
  if (!user) {
    redirect("/login?redirectTo=/feedback-apply");
  }

  // Standard / Feedback プランのみアクセス可能
  const hasAccess =
    subscription.planType === "standard" ||
    subscription.planType === "feedback";

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Clock className="w-3 h-3 mr-1" />
            15分フィードバック
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            あなたのアウトプットに
            <br />
            フィードバックをもらおう
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            BONOのレッスンで学んだことを実践し、その成果物に対してフィードバックを受けられます。
            成長のための具体的なアドバイスをお届けします。
          </p>
        </div>

        {/* アクセス制限 */}
        {!hasAccess && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    StandardまたはFeedbackプランが必要です
                  </h3>
                  <p className="text-gray-600 mb-4">
                    15分フィードバックはStandard・Feedbackプランのメンバー限定サービスです。
                    プランをアップグレードして、フィードバックを受けましょう。
                  </p>
                  <Button asChild>
                    <Link href="/subscription">プランを見る</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 必須条件 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            提出時の3つの条件
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {rules.map((rule, index) => (
              <Card key={index}>
                <CardContent className="py-6">
                  <rule.icon className="w-8 h-8 text-green-500 mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">{rule.title}</h3>
                  <p className="text-sm text-gray-600">{rule.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* NGパターン */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">NGパターン</h2>
          <Card>
            <CardContent className="py-6">
              <ul className="space-y-3">
                {ngPatterns.map((pattern, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{pattern}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Tips */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            より良いフィードバックを受けるために
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {tips.map((tip, index) => (
              <Card key={index}>
                <CardContent className="py-6">
                  <tip.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 申請ボタン */}
        <div className="text-center">
          {hasAccess ? (
            <Button size="large" asChild>
              <Link href="/feedback-apply/submit">
                フィードバックを申請する
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          ) : (
            <Button size="large" disabled>
              <Lock className="w-4 h-4 mr-2" />
              StandardまたはFeedbackプランが必要です
            </Button>
          )}
        </div>

        {/* 過去のフィードバック */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            過去のフィードバック事例を参考にしてみましょう
          </p>
          <Button variant="outline" asChild>
            <Link href="/feedbacks">フィードバック一覧を見る</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
