import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getEvent } from "@/lib/sanity";
import { createClient } from "@/lib/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import RichTextSection from "@/components/article/RichTextSection";
import EventRegistrationButton from "@/components/event/EventRegistrationButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    return { title: "イベントが見つかりません | BONO" };
  }

  return {
    title: `${event.title} | イベント | BONO`,
    description: event.summary || `${event.title}の詳細`,
    openGraph: {
      title: `${event.title} | イベント | BONO`,
      description: event.summary || `${event.title}の詳細`,
    },
  };
}

// 日付表示のヘルパー
function getDateDisplay(event: {
  publishedAt?: string;
  eventMonth?: number;
  eventPeriod?: string;
}) {
  const periodLabels: Record<string, string> = {
    early: "上旬",
    mid: "中旬",
    late: "下旬",
  };

  const eventDate = event.publishedAt ? new Date(event.publishedAt) : null;

  if (eventDate) {
    return {
      type: "exact" as const,
      month: eventDate.getMonth() + 1,
      day: eventDate.getDate(),
      dayOfWeek: ["日", "月", "火", "水", "木", "金", "土"][
        eventDate.getDay()
      ],
    };
  }

  if (event.eventMonth) {
    return {
      type: "approximate" as const,
      month: event.eventMonth,
      period: event.eventPeriod ? periodLabels[event.eventPeriod] : null,
    };
  }

  return null;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    notFound();
  }

  // ユーザー・サブスクリプション状態を取得
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasMemberAccess = false;
  if (user) {
    try {
      const subscription = await getSubscriptionStatus();
      hasMemberAccess = subscription.hasMemberAccess;
    } catch {
      // サブスク取得失敗は非メンバー扱い
    }
  }

  const dateDisplay = getDateDisplay(event);
  const thumbnailSrc = event.thumbnail?.asset?.url || event.thumbnailUrl;

  return (
    <div className="min-h-screen w-full">
      {/* メインコンテンツ */}
      <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col gap-8">
          {/* イベントヘッダー - センター揃え */}
          <div className="flex flex-col items-center text-center gap-6">
            {/* 日付表示 - 物理カレンダー風（正方形） */}
            <div className="relative w-[96px] h-[96px]">
              {/* グロー効果 */}
              <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-[#FF6B4A]/30 to-[#FF8A6B]/20 blur-xl animate-pulse" />

              {/* バインディング穴 */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex gap-5 z-10">
                <div className="w-2 h-3 bg-white rounded-full shadow-inner border border-gray-200" />
                <div className="w-2 h-3 bg-white rounded-full shadow-inner border border-gray-200" />
              </div>

              {/* カレンダーカード */}
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg flex flex-col">
                {/* 上部（カラー部分） */}
                <div className="bg-gradient-to-b from-[#FF6B4A] to-[#FF8A6B] flex-[0.3] flex items-center justify-center">
                  <span className="text-white text-[10px] font-semibold tracking-wide">
                    {dateDisplay?.type === "exact" ||
                    dateDisplay?.type === "approximate"
                      ? `${dateDisplay.month}月`
                      : "開催日"}
                  </span>
                </div>

                {/* 下部（白い部分） */}
                <div className="bg-white flex-[0.7] flex flex-col items-center justify-center">
                  {dateDisplay?.type === "exact" ? (
                    <>
                      <span className="text-2xl font-bold text-[#101828] leading-none">
                        {String(dateDisplay.day).padStart(2, "0")}
                      </span>
                      <span className="mt-0.5 text-[10px] font-medium text-gray-500">
                        {dateDisplay.dayOfWeek}曜日
                      </span>
                    </>
                  ) : dateDisplay?.type === "approximate" ? (
                    <>
                      <span className="text-xl font-bold text-[#101828] leading-none">
                        {dateDisplay.period || "予定"}
                      </span>
                      <span className="mt-0.5 text-[9px] font-medium text-gray-400">
                        日程調整中
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl font-bold text-[#101828] leading-none">
                        未定
                      </span>
                      <span className="mt-0.5 text-[9px] font-medium text-gray-400">
                        日程調整中
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <span className="text-sm text-gray-500">（ Event ）</span>

            {/* タイトル */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#101828] font-rounded-mplus leading-[148%] max-w-[720px] text-balance">
              {event.title}
            </h1>

            {/* 概要 */}
            {event.summary && (
              <p className="text-base md:text-lg text-[#4B5563] leading-relaxed max-w-[560px] text-balance">
                {event.summary}
              </p>
            )}

            {/* 参加フォームボタン */}
            {event.registrationUrl && (
              <EventRegistrationButton
                registrationUrl={event.registrationUrl}
                isLoggedIn={!!user}
                hasMemberAccess={hasMemberAccess}
              />
            )}

            {/* サムネイル画像 */}
            {thumbnailSrc && (
              <div className="w-full max-w-[640px] mt-4 relative">
                <Image
                  src={thumbnailSrc}
                  alt={event.title}
                  width={640}
                  height={360}
                  className="w-full h-auto rounded-xl shadow-sm"
                  unoptimized
                />
              </div>
            )}
          </div>

          {/* 詳細本文 */}
          {event.content && event.content.length > 0 && (
            <div className="w-full max-w-[640px] mx-auto">
              <RichTextSection content={event.content} />
            </div>
          )}

          {/* 下部の参加フォームボタン（本文がある場合のみ） */}
          {event.registrationUrl &&
            event.content &&
            event.content.length > 0 && (
              <div className="w-full max-w-[640px] mx-auto pt-6 border-t border-gray-200 flex justify-center">
                <EventRegistrationButton
                  registrationUrl={event.registrationUrl}
                  isLoggedIn={!!user}
                  hasMemberAccess={hasMemberAccess}
                />
              </div>
            )}
        </div>
      </main>
    </div>
  );
}
