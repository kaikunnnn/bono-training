/**
 * BONO トップページ
 * Stripe.com レイアウト準拠 + BONO 実コンテンツ
 *
 * 参考: https://stripe.com/jp
 * リサーチ: .claude/docs/features/top-page/RESEARCH.md
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Play,
  BookOpen,
  Users,
  MessageSquare,
  Target,
  Sparkles,
  GraduationCap,
  Briefcase,
  TrendingUp,
  CheckCircle,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ============================================
// ヘッダー（Stripe準拠）
// ============================================
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "コース", href: "/lessons" },
    { label: "学習パス", href: "/roadmap" },
    { label: "コミュニティ", href: "/questions" },
    { label: "ガイド", href: "/guide" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-bold text-xl text-gray-900">BONO</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/subscription"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              料金
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              ログイン
            </Link>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6">
              <Link to="/signup">無料で始める</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  {item.label}
                </Link>
              ))}
              <Link to="/subscription" className="text-gray-600 hover:text-gray-900 font-medium">
                料金
              </Link>
              <hr className="border-gray-100" />
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                ログイン
              </Link>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full">
                <Link to="/signup">無料で始める</Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// ============================================
// ヒーローセクション（Stripe準拠）
// ============================================
const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>60社以上の転職実績</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6"
          >
            プロから学ぶ、
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              実践的UIデザイン
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
          >
            10年の実務経験を持つプロが作ったカリキュラム。
            <br className="hidden md:block" />
            未経験からUI/UXデザイナーへの転職を実現。
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-14 text-lg">
              <Link to="/signup">
                無料で始める
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg border-gray-300">
              <Link to="/guide">
                <Play className="w-5 h-5 mr-2" />
                コースを見る
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// Bento Grid セクション（Stripe準拠）
// ============================================
const BentoGridSection = () => {
  const cards = [
    {
      title: "UIデザイン基礎",
      description: "配色、タイポグラフィ、レイアウトの基本原則をマスター。デザインの「なぜ」を理解できるようになる。",
      icon: <BookOpen className="w-6 h-6" />,
      size: "large", // 2x2
      color: "bg-gradient-to-br from-blue-500 to-indigo-600",
      link: "/lessons",
    },
    {
      title: "転職ロードマップ",
      description: "未経験からUI/UXデザイナーになるまでの道筋を明確に。",
      icon: <Target className="w-6 h-6" />,
      size: "medium",
      color: "bg-gradient-to-br from-purple-500 to-pink-600",
      link: "/roadmap",
    },
    {
      title: "コミュニティ",
      description: "仲間と学び、質問し放題。挫折しない環境。",
      icon: <Users className="w-6 h-6" />,
      size: "medium",
      color: "bg-gradient-to-br from-amber-500 to-orange-600",
      link: "/questions",
    },
    {
      title: "プロからのフィードバック",
      description: "あなたのデザインを10年経験のプロがレビュー。実務で通用するレベルに。",
      icon: <MessageSquare className="w-6 h-6" />,
      size: "wide",
      color: "bg-gradient-to-br from-emerald-500 to-teal-600",
      link: "/feedbacks",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            必要なすべてが、ここに
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            基礎学習からキャリア支援まで。体系的なカリキュラムで確実にスキルアップ。
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Large Card (2x2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-2"
          >
            <Link to={cards[0].link} className="block h-full">
              <div className={`${cards[0].color} rounded-3xl p-8 h-full min-h-[400px] text-white flex flex-col justify-between hover:scale-[1.02] transition-transform`}>
                <div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                    {cards[0].icon}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">{cards[0].title}</h3>
                  <p className="text-white/80 text-lg">{cards[0].description}</p>
                </div>
                <div className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                  <span>詳しく見る</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Medium Cards (1x1) */}
          {cards.slice(1, 3).map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={card.link} className="block h-full">
                <div className={`${card.color} rounded-3xl p-6 h-full min-h-[200px] text-white flex flex-col justify-between hover:scale-[1.02] transition-transform`}>
                  <div>
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                      {card.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                    <p className="text-white/80 text-sm">{card.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Wide Card (2x1) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <Link to={cards[3].link} className="block h-full">
              <div className={`${cards[3].color} rounded-3xl p-6 h-full min-h-[200px] text-white flex flex-col justify-between hover:scale-[1.02] transition-transform`}>
                <div>
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                    {cards[3].icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{cards[3].title}</h3>
                  <p className="text-white/80">{cards[3].description}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// 統計セクション（Stripe準拠）
// ============================================
const StatsSection = () => {
  const stats = [
    { value: "60+", label: "転職実績", description: "社" },
    { value: "36+", label: "動画コンテンツ", description: "本" },
    { value: "10", label: "プロ経験", description: "年" },
    { value: "無制限", label: "質問対応", description: "" },
  ];

  return (
    <section className="py-20 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.value}
                <span className="text-2xl md:text-3xl text-gray-400">{stat.description}</span>
              </div>
              <div className="text-gray-400 text-sm md:text-base">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// ターゲット別セクション（Stripe準拠）
// ============================================
const TargetSection = () => {
  const targets = [
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "未経験からデザイナーへ",
      description: "プログラミングや他業界からの転職を目指す方。基礎から体系的に学べるカリキュラムで、確実にスキルを身につけます。",
      features: ["基礎から学べる", "転職ロードマップ付き", "ポートフォリオ作成支援"],
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "デザイナーとして転職したい",
      description: "Web/グラフィックデザイナーからUI/UXデザイナーへ。実務で通用するスキルと作品を作れるようになります。",
      features: ["実践的な課題", "プロからのフィードバック", "面接対策"],
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "スキルアップしたい",
      description: "ジュニアデザイナーとして働いている方。より高いレベルのスキルを身につけ、キャリアアップを目指します。",
      features: ["上級テクニック", "論理的なデザイン思考", "業界最新トレンド"],
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            あなたの目標に合わせて
          </h2>
          <p className="text-lg text-gray-600">
            それぞれのステージに最適な学習パスを用意
          </p>
        </div>

        {/* Target Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {targets.map((target, index) => (
            <motion.div
              key={target.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                {target.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{target.title}</h3>
              <p className="text-gray-600 mb-6">{target.description}</p>
              <ul className="space-y-3">
                {target.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// 料金セクション
// ============================================
const PricingSection = () => {
  const plans = [
    {
      name: "スタンダード",
      price: "5,800",
      period: "月額（3ヶ月継続）",
      description: "すべての動画コンテンツにアクセス",
      features: [
        "全コース見放題",
        "コミュニティ参加",
        "質問し放題",
        "学習ロードマップ",
      ],
      cta: "スタンダードで始める",
      highlighted: false,
    },
    {
      name: "フィードバック",
      price: "13,800",
      period: "月額（3ヶ月継続）",
      description: "プロからの直接フィードバック付き",
      features: [
        "スタンダードの全機能",
        "月2回のフィードバック",
        "ポートフォリオレビュー",
        "キャリア相談",
      ],
      cta: "フィードバックで始める",
      highlighted: true,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            シンプルな料金プラン
          </h2>
          <p className="text-lg text-gray-600">
            広告費ゼロだから、質と価格を両立
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-600 ring-offset-4"
                  : "bg-gray-50 text-gray-900"
              }`}
            >
              <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-6 ${plan.highlighted ? "text-indigo-200" : "text-gray-600"}`}>
                {plan.description}
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold">¥{plan.price}</span>
                <span className={`text-sm ml-2 ${plan.highlighted ? "text-indigo-200" : "text-gray-500"}`}>
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? "text-indigo-200" : "text-emerald-500"}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={`w-full h-12 rounded-full ${
                  plan.highlighted
                    ? "bg-white text-indigo-600 hover:bg-gray-100"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                <Link to="/subscription">{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// CTA セクション
// ============================================
const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-white mb-6"
        >
          今日から、デザイナーへの一歩を
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg text-indigo-100 mb-10"
        >
          まずは無料でコンテンツを体験。あなたのペースで学習を始められます。
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 rounded-full px-10 h-14 text-lg">
            <Link to="/signup">
              無料で始める
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================
// フッター
// ============================================
const Footer = () => {
  const links = {
    コンテンツ: [
      { label: "コース一覧", href: "/lessons" },
      { label: "ロードマップ", href: "/roadmap" },
      { label: "ガイド", href: "/guide" },
    ],
    コミュニティ: [
      { label: "Q&A", href: "/questions" },
      { label: "フィードバック", href: "/feedbacks" },
      { label: "ナレッジ", href: "/knowledge" },
    ],
    サポート: [
      { label: "料金プラン", href: "/subscription" },
      { label: "よくある質問", href: "/guide" },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Logo */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-bold text-xl text-white">BONO</span>
            </div>
            <p className="text-sm">
              すべての人に創造性の夜明けを
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link to={item.href} className="hover:text-white transition-colors text-sm">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© 2024 BONO. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">利用規約</a>
            <a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a>
            <a href="#" className="hover:text-white transition-colors">特定商取引法</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ============================================
// メインコンポーネント
// ============================================
const TopPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <BentoGridSection />
        <StatsSection />
        <TargetSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default TopPage;
