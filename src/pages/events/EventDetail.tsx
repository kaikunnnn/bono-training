import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getEvent, getAllEvents } from "@/lib/sanity";
import type { Event } from "@/types/sanity";
import RichTextSection from "@/components/article/RichTextSection";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import Logo from "@/components/common/Logo";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

// アニメーション設定
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const fadeInScale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!slug) {
        setError("イベントのスラッグが指定されていません");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // デバッグ: 全イベント一覧を取得
        console.log("[EventDetail] Requested slug:", slug);
        await getAllEvents();

        const data = await getEvent(slug);

        if (!data) {
          setError("イベントが見つかりませんでした");
          setLoading(false);
          return;
        }

        setEvent(data);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("イベントの取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || "イベントが見つかりませんでした"}
          </p>
          <Button variant="default" onClick={() => navigate("/")}>
            トップに戻る
          </Button>
        </div>
      </div>
    );
  }

  // 日付情報を分解
  const eventDate = event.publishedAt ? new Date(event.publishedAt) : null;

  // 時期の日本語変換
  const periodLabels: Record<string, string> = {
    early: "上旬",
    mid: "中旬",
    late: "下旬",
  };

  // 日付表示のパターンを決定
  const dateDisplay = eventDate
    ? {
        type: "exact" as const,
        month: eventDate.getMonth() + 1,
        day: eventDate.getDate(),
        dayOfWeek: ["日", "月", "火", "水", "木", "金", "土"][
          eventDate.getDay()
        ],
      }
    : event.eventMonth
      ? {
          type: "approximate" as const,
          month: event.eventMonth,
          period: event.eventPeriod ? periodLabels[event.eventPeriod] : null,
        }
      : null;

  return (
    <div className="min-h-screen w-full bg-[#F8F8F8]">
      {/* ヘッダーエリア */}
      <div className="w-full">
        <div className="w-full px-4 sm:px-6 py-6">
          <Link to="/">
            <Logo className="h-6 w-auto" />
          </Link>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-12 -mt-12">
        <div className="flex flex-col gap-8">
          {/* イベントヘッダー - センター揃え */}
          <motion.div
            className="flex flex-col items-center text-center gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* 日付表示 - 物理カレンダー風（正方形） */}
            <motion.div
              className="relative w-[96px] h-[96px]"
              variants={fadeInScale}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* グロー効果 */}
              <motion.div
                className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-[#FF6B4A]/30 to-[#FF8A6B]/20 blur-xl"
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* バインディング穴 */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex gap-5 z-10">
                <div className="w-2 h-3 bg-white rounded-full shadow-inner border border-gray-200" />
                <div className="w-2 h-3 bg-white rounded-full shadow-inner border border-gray-200" />
              </div>

              {/* カレンダーカード */}
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg flex flex-col">
                {/* 上部（カラー部分） - 30% */}
                <div className="bg-gradient-to-b from-[#FF6B4A] to-[#FF8A6B] flex-[0.3] flex items-center justify-center">
                  <span className="text-white text-[10px] font-semibold tracking-wide">
                    {dateDisplay?.type === "exact"
                      ? `${dateDisplay.month}月`
                      : dateDisplay?.type === "approximate"
                        ? `${dateDisplay.month}月`
                        : "開催日"}
                  </span>
                </div>

                {/* 下部（白い部分） - 70% */}
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
            </motion.div>

            <motion.span
              className="text-sm text-gray-500"
              variants={fadeInUp}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              （ Event ）
            </motion.span>

            {/* タイトル */}
            <motion.h1
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#101828] font-rounded-mplus leading-tight max-w-[720px]"
              variants={fadeInUp}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {event.title}
            </motion.h1>

            {/* タグ + 概要 */}
            <motion.div
              className="flex flex-col items-center gap-2"
              variants={fadeInUp}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {event.summary && (
                <p className="text-base md:text-lg text-[#4B5563] leading-relaxed max-w-[560px]">
                  {event.summary}
                </p>
              )}
            </motion.div>

            {/* 参加フォームボタン */}
            {event.registrationUrl && (
              <motion.div
                className="relative"
                variants={fadeInUp}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <motion.div
                  className="relative overflow-hidden rounded-lg"
                  whileHover="hover"
                  initial="rest"
                >
                  <Button
                    variant="default"
                    size="large"
                    asChild
                    className="relative"
                  >
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>参加申し込みフォームへ</span>
                      <ExternalLink className="w-4 h-4" />
                      {/* シマー効果（キラン） */}
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
                        variants={{
                          rest: { x: "-150%", transition: { duration: 0 } },
                          hover: { x: "150%", transition: { duration: 0.6, ease: "easeInOut" } },
                        }}
                      />
                    </a>
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {/* サムネイル画像 */}
            {(event.thumbnail?.asset?.url || event.thumbnailUrl) && (
              <motion.div
                className="w-full max-w-[640px] mt-4"
                variants={fadeInScale}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <img
                  src={event.thumbnail?.asset?.url || event.thumbnailUrl}
                  alt={event.title}
                  className="w-full h-auto rounded-xl shadow-sm"
                />
              </motion.div>
            )}
          </motion.div>

          {/* 詳細本文 */}
          {event.content && event.content.length > 0 && (
            <motion.div
              className="w-full max-w-[640px] mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              <RichTextSection content={event.content} />
            </motion.div>
          )}

          {/* 下部の参加フォームボタン（本文がある場合のみ） */}
          {event.registrationUrl &&
            event.content &&
            event.content.length > 0 && (
              <motion.div
                className="w-full max-w-[640px] mx-auto pt-6 border-t border-gray-200 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
              >
                <motion.div
                  className="relative overflow-hidden rounded-lg"
                  whileHover="hover"
                  initial="rest"
                >
                  <Button
                    variant="default"
                    size="large"
                    asChild
                    className="relative"
                  >
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>参加申し込みフォームへ</span>
                      <ExternalLink className="w-4 h-4" />
                      {/* シマー効果（キラン） */}
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
                        variants={{
                          rest: { x: "-150%", transition: { duration: 0 } },
                          hover: { x: "150%", transition: { duration: 0.6, ease: "easeInOut" } },
                        }}
                      />
                    </a>
                  </Button>
                </motion.div>
              </motion.div>
            )}
        </div>
      </main>
    </div>
  );
};

export default EventDetail;
