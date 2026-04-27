import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSubscriptionStatus, getCurrentUser } from "@/lib/subscription";
import { getAllLessons } from "@/lib/sanity";
import { FeedbackSubmitForm } from "@/components/feedback/FeedbackSubmitForm";

export const metadata: Metadata = {
  title: "フィードバック申請フォーム",
  description: "15分フィードバックの申請フォーム",
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
    <div className="min-h-screen bg-[#F9F9F7]">
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
