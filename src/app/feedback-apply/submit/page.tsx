/**
 * 15分フィードバック 応募フォームページ
 *
 * mainブランチの /src/pages/feedback-apply/submit.tsx を移植
 * - Server Component でデータ取得 + アクセスチェック
 * - Client Component (FeedbackSubmitForm) にデータを渡す
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSubscriptionStatus, getCurrentUser } from "@/lib/subscription";
import { getAllLessons } from "@/lib/sanity";
import { FeedbackSubmitForm } from "@/components/feedback/FeedbackSubmitForm";

export const metadata: Metadata = {
  title: "15分フィードバック 応募",
  description: "コンテンツの学びをシェアしてフィードバックを受けよう",
  openGraph: {
    images: ["/assets/feedback/og-image.png"],
  },
};

export default async function FeedbackSubmitPage() {
  const [user, subscription, lessons] = await Promise.all([
    getCurrentUser(),
    getSubscriptionStatus(),
    getAllLessons(),
  ]);

  // 未ログインの場合はログインページへ
  if (!user) {
    redirect("/login?redirectTo=/feedback-apply/submit");
  }

  // Standard / Feedback プランのみアクセス可能
  const hasAccess =
    subscription.planType === "standard" ||
    subscription.planType === "feedback";

  if (!hasAccess) {
    redirect("/feedback-apply");
  }

  // レッスン選択肢
  const lessonOptions = lessons.map((lesson) => ({
    id: lesson._id,
    title: lesson.title,
    slug: lesson.slug.current,
  }));

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <FeedbackSubmitForm
          userId={user.id}
          userEmail={user.email || ""}
          lessons={lessonOptions}
        />
      </div>
    </div>
  );
}
