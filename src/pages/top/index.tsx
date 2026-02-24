/**
 * BONOトップページ プロトタイプ
 * パターンA: Stripe風グリッド重視
 */

import { motion } from "framer-motion";
import { ArrowRight, Play, Users, BookOpen, Award, MessageCircle, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEO from "@/components/common/SEO";

// ============================================
// アニメーション設定
// ============================================
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// ============================================
// ヒーローセクション
// ============================================
const HeroSection = () => (
  <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white">
    <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10" />
    <div className="container mx-auto px-6 py-24 lg:py-32 relative">
      <motion.div
        className="max-w-4xl mx-auto text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-white/10 rounded-full border border-white/20">
          UI/UXデザインを学ぶなら
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          すべての人に
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            創造性の夜明けを
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          未経験からUI/UXデザイナーへ。体系的なカリキュラムと実践的なフィードバックで、
          あなたのキャリアチェンジをサポートします。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="h-14 px-8 text-base bg-white text-slate-900 hover:bg-slate-100 rounded-xl">
            無料で始める
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/30 text-white hover:bg-white/10 rounded-xl">
            <Play className="mr-2 h-5 w-5" />
            紹介動画を見る
          </Button>
        </div>
      </motion.div>
    </div>
    {/* 装飾 */}
    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f9fafb] to-transparent" />
  </section>
);

// ============================================
// 統計セクション
// ============================================
const stats = [
  { number: "5,000+", label: "受講者数", icon: Users },
  { number: "200+", label: "動画レッスン", icon: BookOpen },
  { number: "92%", label: "満足度", icon: Award },
  { number: "500+", label: "コミュニティ", icon: MessageCircle },
];

const StatsSection = () => (
  <section className="py-16 bg-white border-b">
    <div className="container mx-auto px-6">
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
        variants={stagger}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="text-center"
            variants={fadeInUp}
          >
            <stat.icon className="w-8 h-8 mx-auto mb-3 text-indigo-600" />
            <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-1">
              {stat.number}
            </div>
            <div className="text-sm text-slate-500 uppercase tracking-wide">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

// ============================================
// 学習パスセクション
// ============================================
const learningPaths = [
  {
    title: "UI/UXデザイナー転職",
    description: "未経験から6ヶ月でデザイナーへ。実践的なカリキュラムで転職を実現。",
    duration: "6ヶ月",
    color: "from-indigo-500 to-purple-500",
    features: ["ポートフォリオ制作", "転職サポート", "1on1メンタリング"]
  },
  {
    title: "ビジュアルデザイン基礎",
    description: "色彩、タイポグラフィ、レイアウトの基礎を1ヶ月で習得。",
    duration: "1ヶ月",
    color: "from-emerald-500 to-teal-500",
    features: ["36本の動画", "実践課題", "添削フィードバック"]
  },
  {
    title: "情報設計マスター",
    description: "ユーザー体験を設計する力を身につける。UXの本質を学ぶ。",
    duration: "1ヶ月",
    color: "from-orange-500 to-red-500",
    features: ["ワイヤーフレーム", "ユーザーリサーチ", "プロトタイピング"]
  },
];

const LearningPathsSection = () => (
  <section className="py-24 bg-[#f9fafb]">
    <div className="container mx-auto px-6">
      <motion.div
        className="text-center mb-16"
        {...fadeInUp}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
          あなたに合った学習パス
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          目標に合わせて選べる体系的なカリキュラム。段階的にスキルアップできます。
        </p>
      </motion.div>

      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={stagger}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        {learningPaths.map((path, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100"
            variants={fadeInUp}
          >
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${path.color} mb-4`}>
              {path.duration}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{path.title}</h3>
            <p className="text-slate-600 mb-6">{path.description}</p>
            <ul className="space-y-2 mb-6">
              {path.features.map((feature, i) => (
                <li key={i} className="flex items-center text-sm text-slate-600">
                  <Check className="w-4 h-4 mr-2 text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full rounded-xl">
              詳しく見る
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

// ============================================
// コースグリッドセクション
// ============================================
const courses = [
  { title: "はじめてのFigma", videos: 24, category: "Figma", image: "/images/course-figma.jpg" },
  { title: "UIデザインの教科書", videos: 36, category: "UI", image: "/images/course-ui.jpg" },
  { title: "UXリサーチ入門", videos: 28, category: "UX", image: "/images/course-ux.jpg" },
  { title: "ポートフォリオ制作", videos: 18, category: "キャリア", image: "/images/course-portfolio.jpg" },
];

const CoursesSection = () => (
  <section className="py-24 bg-white">
    <div className="container mx-auto px-6">
      <motion.div
        className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
        {...fadeInUp}
        viewport={{ once: true }}
      >
        <div>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            人気のコース
          </h2>
          <p className="text-lg text-slate-600">
            実践的なスキルが身につく厳選コンテンツ
          </p>
        </div>
        <Link to="/courses" className="mt-4 md:mt-0 text-indigo-600 font-medium flex items-center hover:underline">
          すべてのコースを見る
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </motion.div>

      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={stagger}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        {courses.map((course, index) => (
          <motion.div
            key={index}
            className="group cursor-pointer"
            variants={fadeInUp}
          >
            <div className="relative aspect-video rounded-2xl bg-slate-200 mb-4 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 text-slate-900 ml-0.5" />
                </div>
              </div>
            </div>
            <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
              {course.category}
            </span>
            <h3 className="text-lg font-semibold text-slate-900 mt-1 group-hover:text-indigo-600 transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{course.videos}本の動画</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

// ============================================
// 成功事例セクション
// ============================================
const testimonials = [
  {
    name: "田中 美咲",
    role: "元教師 → UIデザイナー",
    company: "IT企業",
    quote: "教師を辞めてデザイナーになるなんて無理だと思っていました。でもBONOで体系的に学び、半年で転職できました。",
    image: "/images/testimonial-1.jpg"
  },
  {
    name: "鈴木 健太",
    role: "元営業 → UXデザイナー",
    company: "スタートアップ",
    quote: "営業経験がUXリサーチに活きています。BONOのフィードバックのおかげで、自信を持ってキャリアチェンジできました。",
    image: "/images/testimonial-2.jpg"
  },
];

const TestimonialsSection = () => (
  <section className="py-24 bg-slate-900 text-white">
    <div className="container mx-auto px-6">
      <motion.div
        className="text-center mb-16"
        {...fadeInUp}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          キャリアチェンジを実現した先輩たち
        </h2>
        <p className="text-lg text-slate-400">
          異業種からデザイナーへ。あなたも次のステップへ。
        </p>
      </motion.div>

      <motion.div
        className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
        variants={stagger}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        {testimonials.map((t, index) => (
          <motion.div
            key={index}
            className="bg-white/5 backdrop-blur rounded-3xl p-8 border border-white/10"
            variants={fadeInUp}
          >
            <p className="text-lg text-slate-300 mb-6 leading-relaxed">
              "{t.quote}"
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mr-4" />
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="text-sm text-slate-400">{t.role} @ {t.company}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

// ============================================
// 料金プランセクション
// ============================================
const plans = [
  {
    name: "Starter",
    price: "5,800",
    description: "まずは始めてみたい方に",
    features: ["動画コンテンツ視聴", "コミュニティ参加", "月1回のQ&A"],
    highlighted: false
  },
  {
    name: "Growth",
    price: "9,800",
    description: "本気でスキルアップしたい方に",
    features: ["全コンテンツ視聴", "課題添削", "月2回のメンタリング", "転職サポート"],
    highlighted: true
  },
  {
    name: "Pro",
    price: "15,800",
    description: "プロを目指す方に",
    features: ["全機能利用可能", "無制限メンタリング", "ポートフォリオレビュー", "企業紹介"],
    highlighted: false
  },
];

const PricingSection = () => (
  <section className="py-24 bg-[#f9fafb]">
    <div className="container mx-auto px-6">
      <motion.div
        className="text-center mb-16"
        {...fadeInUp}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
          シンプルな料金プラン
        </h2>
        <p className="text-lg text-slate-600">
          目標に合わせて選べる3つのプラン
        </p>
      </motion.div>

      <motion.div
        className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        variants={stagger}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            className={`rounded-3xl p-8 ${
              plan.highlighted
                ? "bg-slate-900 text-white ring-4 ring-indigo-500/50 scale-105"
                : "bg-white border border-slate-200"
            }`}
            variants={fadeInUp}
          >
            {plan.highlighted && (
              <span className="inline-block px-3 py-1 text-xs font-medium bg-indigo-500 rounded-full mb-4">
                おすすめ
              </span>
            )}
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <p className={`text-sm mb-4 ${plan.highlighted ? "text-slate-400" : "text-slate-500"}`}>
              {plan.description}
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold">¥{plan.price}</span>
              <span className={`text-sm ${plan.highlighted ? "text-slate-400" : "text-slate-500"}`}>/月</span>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center text-sm">
                  <Check className={`w-4 h-4 mr-2 ${plan.highlighted ? "text-indigo-400" : "text-emerald-500"}`} />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className={`w-full rounded-xl ${
                plan.highlighted
                  ? "bg-white text-slate-900 hover:bg-slate-100"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              始める
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

// ============================================
// CTAセクション
// ============================================
const CTASection = () => (
  <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
    <div className="container mx-auto px-6">
      <motion.div
        className="max-w-3xl mx-auto text-center"
        {...fadeInUp}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl lg:text-4xl font-bold mb-6">
          今日から、デザイナーへの第一歩を
        </h2>
        <p className="text-lg text-white/80 mb-10">
          5,000人以上が選んだBONOで、あなたも新しいキャリアをスタートしませんか？
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="h-14 px-8 bg-white text-indigo-600 hover:bg-slate-100 rounded-xl">
            無料で始める
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 border-white/30 text-white hover:bg-white/10 rounded-xl">
            資料をダウンロード
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

// ============================================
// フッター
// ============================================
const Footer = () => (
  <footer className="py-12 bg-slate-900 text-white">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="text-xl font-bold mb-4">BONO</div>
          <p className="text-sm text-slate-400">
            すべての人に創造性の夜明けを
          </p>
        </div>
        <div>
          <div className="font-medium mb-4">学ぶ</div>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="#" className="hover:text-white">コース一覧</Link></li>
            <li><Link to="#" className="hover:text-white">学習パス</Link></li>
            <li><Link to="#" className="hover:text-white">料金プラン</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-4">コミュニティ</div>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="#" className="hover:text-white">Slack</Link></li>
            <li><Link to="#" className="hover:text-white">イベント</Link></li>
            <li><Link to="#" className="hover:text-white">ブログ</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-4">サポート</div>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="#" className="hover:text-white">ヘルプ</Link></li>
            <li><Link to="#" className="hover:text-white">お問い合わせ</Link></li>
            <li><Link to="#" className="hover:text-white">利用規約</Link></li>
          </ul>
        </div>
      </div>
      <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
        © 2025 BONO. All rights reserved.
      </div>
    </div>
  </footer>
);

// ============================================
// メインコンポーネント
// ============================================
const TopPage = () => {
  return (
    <>
      <SEO
        title="BONO - すべての人に創造性の夜明けを"
        description="未経験からUI/UXデザイナーへ。体系的なカリキュラムと実践的なフィードバックで、あなたのキャリアチェンジをサポートします。"
        ogUrl="/"
      />
      <div className="min-h-screen">
        <HeroSection />
        <StatsSection />
        <LearningPathsSection />
        <CoursesSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
};

export default TopPage;
