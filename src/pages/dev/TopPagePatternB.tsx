/**
 * トップページ パターンB: Airbnb風「ストーリーテリング重視」
 * - 転職成功者の旅路を中心に据えたエモーショナルなデザイン
 * - 人物写真、ビフォーアフター、コミュニティ感を重視
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play, Users, Star, Quote, ChevronRight, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// ============================================
// スティッキーヘッダー
// ============================================
const StickyHeader = () => {
  const [scrolled, setScrolled] = useState(false);

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setScrolled(window.scrollY > 50);
    });
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/top" className={`text-xl font-bold ${scrolled ? "text-slate-900" : "text-white"}`}>
          BONO
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {["コース", "成功事例", "料金", "コミュニティ"].map((item) => (
            <a
              key={item}
              href="#"
              className={`text-sm font-medium transition-colors ${
                scrolled ? "text-slate-600 hover:text-slate-900" : "text-white/80 hover:text-white"
              }`}
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button
            variant={scrolled ? "outline" : "ghost"}
            size="sm"
            className={scrolled ? "" : "text-white border-white/30 hover:bg-white/10"}
          >
            ログイン
          </Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
            無料で始める
          </Button>
        </div>
      </div>
    </header>
  );
};

// ============================================
// ヒーロー（人物・実績重視）
// ============================================
const HeroSection = () => (
  <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white overflow-hidden">
    {/* 背景パターン */}
    <div className="absolute inset-0 opacity-20">
      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
    </div>

    <div className="container mx-auto px-6 py-32 relative">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* 左: テキスト */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 border-2 border-white"
                />
              ))}
            </div>
            <span className="text-sm text-white/80">5,000人以上が学習中</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            あなたも、
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
              デザイナーになれる
            </span>
          </h1>

          <p className="text-lg text-white/70 mb-8 max-w-lg">
            教師、営業、エンジニア...異業種から転職した先輩が200人以上。
            あなたの「変わりたい」を、BONOが全力でサポートします。
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="h-14 px-8 bg-white text-indigo-900 hover:bg-white/90 rounded-full">
              無料で始める
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 border-white/30 text-white hover:bg-white/10 rounded-full"
            >
              <Play className="mr-2 h-5 w-5" />
              3分でわかるBONO
            </Button>
          </div>

          {/* 実績バッジ */}
          <div className="flex items-center gap-6 mt-10 pt-10 border-t border-white/10">
            <div>
              <div className="text-3xl font-bold">92%</div>
              <div className="text-sm text-white/60">転職成功率</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div>
              <div className="text-3xl font-bold">6ヶ月</div>
              <div className="text-sm text-white/60">平均学習期間</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-3xl font-bold">4.9</span>
              </div>
              <div className="text-sm text-white/60">受講者評価</div>
            </div>
          </div>
        </motion.div>

        {/* 右: 人物/作品 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          {/* メインカード */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-4 flex items-center justify-center">
              <span className="text-slate-400">学習者の作品イメージ</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
              <div>
                <div className="font-medium text-slate-900">田中 美咲さんの作品</div>
                <div className="text-sm text-slate-500">元教師 → UIデザイナー</div>
              </div>
            </div>
          </div>

          {/* フローティングカード */}
          <div className="absolute -left-8 top-1/2 bg-white rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-600">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">転職成功！</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// ============================================
// 3ステップセクション
// ============================================
const steps = [
  {
    number: "01",
    title: "無料で登録",
    description: "メールアドレスだけで簡単登録。すぐに学習を始められます。",
    icon: "✨",
  },
  {
    number: "02",
    title: "動画で学習",
    description: "200本以上の動画レッスン。スマホでもPCでも、いつでもどこでも。",
    icon: "📚",
  },
  {
    number: "03",
    title: "フィードバックを受ける",
    description: "プロのデザイナーから直接フィードバック。確実に成長できます。",
    icon: "💬",
  },
];

const StepsSection = () => (
  <section className="py-24 bg-white">
    <div className="container mx-auto px-6">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
          3ステップで始める
        </h2>
        <p className="text-lg text-slate-600">
          難しい手続きは一切なし。今日から学習をスタート。
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="text-4xl mb-4">{step.icon}</div>
            <div className="text-sm font-bold text-indigo-600 mb-2">{step.number}</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
            <p className="text-slate-600">{step.description}</p>
            {index < steps.length - 1 && (
              <ChevronRight className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ============================================
// ビフォーアフター（大きな成功事例）
// ============================================
const transformations = [
  {
    name: "田中 美咲",
    before: { role: "小学校教師", years: "8年" },
    after: { role: "UIデザイナー", company: "メガベンチャー" },
    quote: "「デザインなんて自分には無理」と思っていました。でも、BONOで基礎から学び、6ヶ月で転職できました。今は毎日が楽しいです。",
    learningPeriod: "6ヶ月",
  },
  {
    name: "鈴木 健太",
    before: { role: "法人営業", years: "5年" },
    after: { role: "UXデザイナー", company: "スタートアップ" },
    quote: "営業で培ったヒアリング力がUXリサーチに活きています。BONOのコミュニティで仲間ができたのも大きかった。",
    learningPeriod: "8ヶ月",
  },
];

const TransformationSection = () => (
  <section className="py-24 bg-slate-50">
    <div className="container mx-auto px-6">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
          成功事例
        </span>
        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
          あなたの前を歩いた先輩たち
        </h2>
        <p className="text-lg text-slate-600">
          異業種からデザイナーへ。200人以上が転職を実現。
        </p>
      </motion.div>

      <div className="space-y-8 max-w-4xl mx-auto">
        {transformations.map((t, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-3xl p-8 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="grid md:grid-cols-[1fr,auto,1fr] gap-6 items-center mb-6">
              {/* Before */}
              <div className="text-center md:text-right">
                <div className="text-sm text-slate-500 mb-1">Before</div>
                <div className="text-xl font-bold text-slate-900">{t.before.role}</div>
                <div className="text-sm text-slate-500">{t.before.years}</div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-2">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-slate-500">{t.learningPeriod}</span>
              </div>

              {/* After */}
              <div className="text-center md:text-left">
                <div className="text-sm text-emerald-600 mb-1">After</div>
                <div className="text-xl font-bold text-slate-900">{t.after.role}</div>
                <div className="text-sm text-slate-500">{t.after.company}</div>
              </div>
            </div>

            {/* Quote */}
            <div className="bg-slate-50 rounded-2xl p-6">
              <Quote className="w-8 h-8 text-indigo-200 mb-3" />
              <p className="text-slate-700 mb-4">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
                <div className="font-medium text-slate-900">{t.name}さん</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Button variant="outline" size="lg" className="rounded-full">
          もっと見る
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  </section>
);

// ============================================
// コミュニティセクション（ライブ感）
// ============================================
const CommunitySection = () => (
  <section className="py-24 bg-white">
    <div className="container mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
            コミュニティ
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            一人じゃない。
            <br />
            仲間と一緒に成長しよう。
          </h2>
          <p className="text-lg text-slate-600 mb-6">
            500人以上のメンバーが参加するSlackコミュニティ。
            質問したり、作品を見せ合ったり、イベントで交流したり。
          </p>
          <ul className="space-y-3 mb-8">
            {["24時間いつでも質問OK", "週1回のオンラインもくもく会", "月1回のポートフォリオ発表会"].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-700">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                </div>
                {item}
              </li>
            ))}
          </ul>
          <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-full">
            コミュニティを見る
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* チャット風UI */}
          <div className="bg-slate-100 rounded-3xl p-6 space-y-4">
            {[
              { name: "山田さん", message: "Figmaのオートレイアウト、やっと理解できました！🎉", time: "2分前" },
              { name: "佐藤さん", message: "おめでとうございます！私も最初苦労しました", time: "1分前" },
              { name: "田中さん", message: "今日のもくもく会、参加します！", time: "たった今" },
            ].map((chat, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex-shrink-0" />
                <div className="bg-white rounded-2xl rounded-tl-none p-3 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-slate-900">{chat.name}</span>
                    <span className="text-xs text-slate-400">{chat.time}</span>
                  </div>
                  <p className="text-sm text-slate-600">{chat.message}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 border-2 border-white" />
                ))}
              </div>
              <span className="text-sm text-slate-500">今日 <strong className="text-emerald-600">147人</strong> が学習中</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// ============================================
// シンプルな料金セクション
// ============================================
const SimplePricingSection = () => (
  <section className="py-24 bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
    <div className="container mx-auto px-6">
      <motion.div
        className="max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          まずは無料で始めてみませんか？
        </h2>
        <p className="text-lg text-white/70 mb-8">
          無料プランでも10本以上の動画が視聴可能。
          合わなければいつでもやめられます。
        </p>

        <div className="bg-white/10 backdrop-blur rounded-3xl p-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">¥0</div>
              <div className="text-sm text-white/60">無料プラン</div>
            </div>
            <div className="border-l border-r border-white/20 px-6">
              <div className="text-3xl font-bold">¥9,800<span className="text-lg">/月</span></div>
              <div className="text-sm text-white/60">Growthプラン</div>
            </div>
            <div>
              <div className="text-3xl font-bold">¥15,800<span className="text-lg">/月</span></div>
              <div className="text-sm text-white/60">Proプラン</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="h-14 px-8 bg-white text-indigo-900 hover:bg-white/90 rounded-full">
            無料で始める
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-8 border-white/30 text-white hover:bg-white/10 rounded-full"
          >
            料金プランを比較
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

// ============================================
// メインコンポーネント
// ============================================
const TopPagePatternB = () => {
  return (
    <div className="min-h-screen">
      <StickyHeader />
      <HeroSection />
      <StepsSection />
      <TransformationSection />
      <CommunitySection />
      <SimplePricingSection />
    </div>
  );
};

export default TopPagePatternB;
