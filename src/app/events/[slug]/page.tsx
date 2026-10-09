import { Metadata } from "next";
import { OG_DEFAULTS } from "@/lib/seo-metadata";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getEvent } from "@/lib/sanity";
import { getCachedUser } from "@/lib/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import RichTextSection from "@/components/article/RichTextSection";
import EventRegistrationButton from "@/components/event/EventRegistrationButton";
import { ActivityRecorder } from "@/components/analytics/ActivityRecorder";
import EventOnsiteRegistration from "@/components/event/EventOnsiteRegistration";
import EventParticipantAvatars from "@/components/event/EventParticipantAvatars";
import EventParticipantList from "@/components/event/EventParticipantList";
import {
  EventParticipantsLink,
  EventParticipantsMembersOnly,
} from "@/components/event/EventParticipantsNav";
import {
  formatRegistrationDeadline,
  getRegistrantProfile,
  isOnsiteRegistrationEvent,
  isRegistrationClosed,
} from "@/lib/events/onsite-registration";
import { getEventDateParts, toEventScheduleInput } from "@/lib/events/event-schedule";
import {
  getEventParticipantSummary,
  getEventParticipantsForMember,
  getMyEventRegistration,
} from "@/lib/events/registration";

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
    title: `${event.title} | イベント`,
    description: event.summary || `${event.title}の詳細`,
    openGraph: {
      ...OG_DEFAULTS,
      title: `${event.title} | イベント`,
      description: event.summary || `${event.title}の詳細`,
    },
  };
}

// 日付表示のヘルパー
// 一覧（/events）と同じ event-schedule.ts で日本時間の年月日・曜日を出す（サーバーの TZ に左右されない）。
// eventStartAt が未導入の既存イベントは、eventMonth/eventPeriod があれば概算表示を優先し、
// どちらも無い旧形式だけ publishedAt を開催日として使う（toEventScheduleInput）。
function getDateDisplay(event: {
  publishedAt?: string;
  eventStartAt?: string;
  eventYear?: number;
  eventMonth?: number;
  eventPeriod?: string;
}) {
  const parts = getEventDateParts(toEventScheduleInput(event));
  if (!parts) return null;

  if (parts.kind === "exact") {
    return {
      type: "exact" as const,
      month: parts.month,
      day: parts.day,
      dayOfWeek: parts.weekday,
    };
  }

  return {
    type: "approximate" as const,
    month: parts.month,
    period: parts.period,
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    notFound();
  }

  // ユーザー・サブスクリプション状態を取得
  // getCachedUser（React cache）で、下の getSubscriptionStatus と認証往復を共有する
  const user = await getCachedUser();

  let hasMemberAccess = false;
  if (user) {
    try {
      const subscription = await getSubscriptionStatus();
      hasMemberAccess = subscription.hasMemberAccess;
    } catch {
      // サブスク取得失敗は非メンバー扱い
    }
  }

  // サイト上申込（#218）の対象イベントか。対象なら registrationUrl が空でも申込UIを出す
  const isOnsite = isOnsiteRegistrationEvent(slug);
  const isOnsiteMember = isOnsite && !!user && hasMemberAccess;
  // getEvent のキャッシュとは別に、申込状況・参加者は毎回最新を読む（どれも失敗時は「なし」扱い）
  // - 参加者のアイコンと人数: 誰にでも見せる
  // - 参加者の名前とコメント: サーバーで会員と確認できたときだけ取得する（非会員には渡さない）
  const [myRegistration, participantSummary, participants] = await Promise.all([
    isOnsiteMember ? getMyEventRegistration(event._id, user.id) : null,
    isOnsite ? getEventParticipantSummary(event._id) : null,
    isOnsiteMember ? getEventParticipantsForMember(event._id) : null,
  ]);
  const showRegistration = isOnsite || !!event.registrationUrl;
  // 申込の締め切り（開催日の日本時間 23:59:59.999 まで）。リクエストごとにサーバーの現在時刻で判定する
  // （このページは cookies を読むので毎回描画される。受付終了の状態はキャッシュしない）
  const registrationClosed =
    isOnsite && isRegistrationClosed(event.eventStartAt, new Date());
  const registrationDeadlineLabel = isOnsite
    ? formatRegistrationDeadline(event.eventStartAt)
    : null;

  // 参加者のコメント一覧への動線（#218 N2）。行き先が無いときは出さない
  // - 会員: 一覧に1人以上いるとき「みんなのコメントを見る ↓」→ 一覧
  // - 未ログイン・非会員: 参加者が1人以上いるとき「メンバーはみんなのコメントが見られます ↓」
  //   → 一覧の位置に置く「メンバーだけが見られます」の案内（名前・コメントは渡さない）
  const hasParticipantList = !!participants && participants.length > 0;
  const showMembersOnlyNotice =
    isOnsite && !isOnsiteMember && (participantSummary?.totalCount ?? 0) > 0;
  const participantsLinkVariant = hasParticipantList
    ? ("member" as const)
    : showMembersOnlyNotice
      ? ("guest" as const)
      : null;

  // 申込UI（上部と本文下の2か所で同じものを出す）
  // サイト上申込のイベントは、参加者アイコンの下に申込カード（未ログイン・非会員にも同じカードで案内）
  // コメント一覧への動線は上部だけ（下部は一覧のすぐ後なので出さない）
  // 申込済み（参加中の1行）のときは、アイコン列との間を詰める
  const renderRegistrationUi = (position: "top" | "bottom") => (
    <div
      className={`flex w-full flex-col items-center ${myRegistration ? "gap-4" : "gap-8"}`}
    >
      {participantSummary && participantSummary.totalCount > 0 && (
        <div className="flex flex-col items-center gap-2">
          <EventParticipantAvatars {...participantSummary} />
          {position === "top" && participantsLinkVariant && (
            <EventParticipantsLink variant={participantsLinkVariant} />
          )}
        </div>
      )}
      {isOnsite ? (
        <EventOnsiteRegistration
          slug={slug}
          isLoggedIn={!!user}
          hasMemberAccess={hasMemberAccess}
          viewer={user && hasMemberAccess ? getRegistrantProfile(user) : null}
          registration={myRegistration}
          closed={registrationClosed}
          deadlineLabel={registrationDeadlineLabel}
        />
      ) : (
        <EventRegistrationButton
          registrationUrl={event.registrationUrl}
          isLoggedIn={!!user}
          hasMemberAccess={hasMemberAccess}
        />
      )}
    </div>
  );

  const dateDisplay = getDateDisplay(event);
  const thumbnailSrc = event.thumbnail?.asset?.url || event.thumbnailUrl;

  return (
    <div className="min-h-screen w-full">
      {/* 活動ログ event_view（#232）: ログイン中のみ。何も描画しない */}
      {user && (
        <ActivityRecorder
          eventType="event_view"
          path={`/events/${slug}`}
          meta={{ slug, event_id: event._id }}
        />
      )}
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
            <h1 className="text-3xl md:text-5xl font-bold text-[#101828] font-rounded-mplus leading-[148%] text-balance">
              {event.title}
            </h1>

            {/* 概要 */}
            {event.summary && (
              <p className="text-base md:text-lg text-[#4B5563] leading-relaxed max-w-[560px] text-balance">
                {event.summary}
              </p>
            )}

            {/* 参加フォームボタン（サイト上申込のイベントは申込UI） */}
            {showRegistration && renderRegistrationUi("top")}

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

          {/* 参加者のコメント（会員だけ。本文の後・下部の申込UIの前） */}
          {hasParticipantList && (
            <div className="w-full max-w-[640px] mx-auto">
              <EventParticipantList
                participants={participants}
                slug={slug}
                ownRegistrationId={myRegistration?.id ?? null}
              />
            </div>
          )}

          {/* 非会員: 一覧の位置に「メンバーだけが見られます」の案内（上部の動線の飛び先） */}
          {showMembersOnlyNotice && (
            <div className="w-full max-w-[640px] mx-auto">
              <EventParticipantsMembersOnly />
            </div>
          )}

          {/* 下部の参加フォームボタン（本文がある場合のみ） */}
          {showRegistration &&
            event.content &&
            event.content.length > 0 && (
              <div className="w-full max-w-[640px] mx-auto pt-6 border-t border-gray-200 flex justify-center">
                {renderRegistrationUi("bottom")}
              </div>
            )}
        </div>
      </main>
    </div>
  );
}
