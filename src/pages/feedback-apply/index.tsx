/**
 * 15分フィードバック トップページ
 * - 機能説明、手順、ルール、NGパターンを表示
 * - 応募ボタンで応募フォームへ遷移
 */

import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import SEO from "@/components/common/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";

// 15分アイコンコンポーネント
const FifteenMinutesIcon = () => (
  <div className="relative w-[70px] h-[70px] bg-white rounded-[14px] shadow-lg overflow-hidden flex items-center justify-center">
    {/* 背景パターン */}
    <div className="absolute inset-0 opacity-20">
      <div className="grid grid-cols-4 gap-px rotate-90 scale-150">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="h-4 w-7 border border-gray-400 rounded-t-full" />
        ))}
      </div>
    </div>
    {/* 数字 */}
    <div className="relative z-10 flex flex-col items-center">
      <span className="font-serif text-[48px] font-normal text-slate-900 leading-none tracking-tight">
        15
      </span>
      <span className="text-[10px] font-bold text-slate-900 -mt-1">minutes</span>
    </div>
  </div>
);

// セクションヘッダーコンポーネント
const SectionHeader = ({
  icon,
  title,
  iconType = "emoji",
}: {
  icon: string | React.ReactNode;
  title: string;
  iconType?: "emoji" | "component";
}) => (
  <div className="flex flex-col gap-2 items-start">
    {iconType === "emoji" ? (
      <span className="text-2xl">{icon}</span>
    ) : (
      <div className="w-5 h-5 text-slate-700">{icon}</div>
    )}
    <h3 className="font-rounded-mplus text-base font-bold text-slate-900">
      {title}
    </h3>
  </div>
);

// 手順ステップコンポーネント
const StepItem = ({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) => (
  <div className="space-y-2">
    <p className="font-bold text-slate-600">
      {number}.{title}
    </p>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

// ルールアイテムコンポーネント
const RuleItem = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="space-y-2">
    <p className="font-bold text-slate-600">{title}</p>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

// NGアイテムコンポーネント
const NgItem = ({
  title,
  example,
  reason,
}: {
  title: string;
  example: string;
  reason: string;
}) => (
  <div className="space-y-2">
    <p className="font-bold text-slate-600">{title}</p>
    <div className="bg-red-50 border-l-4 border-red-300 px-4 py-3 rounded-r-lg">
      <p className="text-slate-700 text-sm italic">「{example}」</p>
    </div>
    <p className="text-slate-600 text-sm leading-relaxed">{reason}</p>
  </div>
);

// コツアイテムコンポーネント
const TipItem = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="space-y-2">
    <p className="font-bold text-slate-600">{title}</p>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

const FeedbackApplyIndex = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { planType, loading } = useSubscriptionContext();

  // Growthプラン or feedbackプランかどうか
  const canApply = planType === "growth" || planType === "feedback";

  const handleApplyClick = () => {
    if (!user) {
      navigate("/login", { state: { from: "/feedback-apply/submit" } });
      return;
    }
    if (!canApply) {
      navigate("/subscription");
      return;
    }
    navigate("/feedback-apply/submit");
  };

  return (
    <Layout>
      <SEO
        title="15分フィードバック"
        description="BONOで学んだことを実践し、思考の記事を書いて提出すると、プロからのフィードバックを受けられます"
        ogUrl="/feedback-apply"
        ogType="website"
      />

      <div className="min-h-screen bg-base">
        <main className="max-w-[900px] mx-auto px-4 sm:px-6 py-8">
          {/* ヘッダーセクション */}
          <motion.section
            className="border-b border-gray-200 pb-8 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              {/* 左側: アイコン + タイトル + ボタン */}
              <div className="flex flex-col gap-3">
                <FifteenMinutesIcon />
                <div className="space-y-4">
                  <h1 className="font-rounded-mplus text-[30px] font-bold text-slate-900 leading-tight">
                    15分フィードバック
                  </h1>
                  <Button
                    onClick={handleApplyClick}
                    disabled={loading}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-2.5 shadow-sm"
                  >
                    応募する
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 右側: 説明文 */}
              <div className="text-slate-600 leading-relaxed max-w-md">
                <p>BONOで学んだことを実践し、思考の記事を書いて提出すると、</p>
                <p>プロからのフィードバックを受けられます</p>
              </div>
            </div>
          </motion.section>

          {/* メインビジュアル */}
          <motion.section
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div className="h-[300px] md:h-[400px] w-full bg-gradient-to-b from-white to-gray-200 rounded-[20px] flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm">15分間のオンラインフィードバック</p>
              </div>
            </div>
          </motion.section>

          {/* コンテンツセクション */}
          <motion.div
            className="space-y-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {/* フィードバックまでの手順 */}
            <section className="border-b border-gray-200 py-14">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                <SectionHeader icon="🚀" title="フィードバックまでの手順" />
                <div className="md:w-[550px] space-y-5 py-4">
                  <StepItem
                    number={1}
                    title="コンテンツで学習する"
                    description="BONOのコースレッスンやロードマップを使ってデザインスキルを鍛えよう"
                  />
                  <StepItem
                    number={2}
                    title="学びの記事を書く"
                    description="実践の中で考えたこと・気づいたことを記事にまとめる（note等）※ 下記ルールの3項目のうち、最低1つが含まれていればOK！"
                  />
                  <StepItem
                    number={3}
                    title="ボタンから提出する"
                    description="このページの提出ボタンから記事URLを提出しよう"
                  />
                  <StepItem
                    number={4}
                    title="日程調整してフィードバックを受ける"
                    description="提出後にSlackコミュニティで日程調整をしてフィードバックを受けよう"
                  />
                </div>
              </div>
            </section>

            {/* ルール：3つの必須項目 */}
            <section className="border-b border-gray-200 py-14">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                <SectionHeader icon="✅" title="ルール：3つの必須項目（どれか1つあればOK）" />
                <div className="md:w-[550px] space-y-5 py-4">
                  <RuleItem
                    title="Notice（気づき）"
                    description="コンテンツを実践したり、サイクルを回す中で、自分の考え方やデザインがどう変わったか"
                  />
                  <RuleItem
                    title="Before/After"
                    description="一度作った成果物（デザイン・リサーチ・設計など）を、気づきを得て自らの手で修正したことを伝えている"
                  />
                  <RuleItem
                    title="Why（意思・理由）"
                    description="なぜこれが良いのかを、コンテンツで実践したことやサイクルを回した経験から自分の言葉で説明できている"
                  />
                </div>
              </div>
            </section>

            {/* NGパターン */}
            <section className="border-b border-gray-200 py-14">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                <SectionHeader icon="❌" title="NGパターン" />
                <div className="md:w-[550px] space-y-6 py-4">
                  <NgItem
                    title="①「やったことの羅列」"
                    example="今週はホーム画面の修正、プロトタイプづけ、言葉の表現修正をしました"
                    reason="やったことを並べただけでは、あなたが何を考えたのかが分かりません。"
                  />
                  <NgItem
                    title="②「コンテンツ内容のまとめ直し」"
                    example="講座ではベースカラーから決めると良いと学びました。パターン出しをしてから方向性を決めます"
                    reason="動画で言っていたことをそのまま書いても、あなた自身が何を考えたかは伝わりません。"
                  />
                  <NgItem
                    title="③「勉強になりました」"
                    example="とても勉強になりました。次も頑張ります"
                    reason="感想だけの記事は対象外です。"
                  />
                </div>
              </div>
            </section>

            {/* コツ：「考えた」が伝わる記事の書き方 */}
            <section className="border-b border-gray-200 py-14">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                <SectionHeader icon="💡" title="コツ：「考えた」が伝わる記事の書き方" />
                <div className="md:w-[550px] space-y-5 py-4">
                  <TipItem
                    title="①「やったこと」ではなく「考えたこと」を書く"
                    description="あなたの記事の価値は、作業ログではなく思考ログにあります。つまり「なぜこれにしたのか？」にたどり着くまでの軌跡をまとめることが自分の成長につながりますし、見る側にとっても魅力的に映ります。"
                  />
                  <TipItem
                    title="②「サイクルでデザインの思考を回した軌跡」を見せる"
                    description="デザインは一発で正解にたどり着くものではありません。探索の期間を経て、目的に沿った内容や形を決めていく流れが必要です。BONOの「デザインサイクル」を実践した結果、気づきや学びが反映されたかどうかを見せましょう。"
                  />
                  <TipItem
                    title="③ 読者が「あなたの思考プロセス」を追体験できるか？"
                    description="記事を書き終えたら、自分で読み返してみてください。「この記事を読んだ人は、自分がどう考えて何に気づきどう判断したかを見て、学びがあるような内容か？」これがYesなら、良い記事です。"
                  />
                </div>
              </div>
            </section>
          </motion.div>

          {/* CTAセクション */}
          <motion.section
            className="py-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <h2 className="font-rounded-mplus text-xl font-bold text-slate-900 mb-4">
              準備ができたら応募しましょう
            </h2>
            <p className="text-slate-600 mb-6">
              記事のURLと関連するBONOコンテンツを入力して応募できます
            </p>
            <Button
              onClick={handleApplyClick}
              disabled={loading}
              size="lg"
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 py-3 shadow-sm"
            >
              応募する
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {/* アクセス制限メッセージ */}
            {!loading && user && !canApply && (
              <p className="mt-4 text-sm text-muted-foreground">
                15分フィードバックはGrowthプラン限定の機能です。
                <Link to="/subscription" className="text-primary underline ml-1">
                  プランを確認する
                </Link>
              </p>
            )}
          </motion.section>
        </main>
      </div>
    </Layout>
  );
};

export default FeedbackApplyIndex;
