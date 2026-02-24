import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Check, ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

// Notion-inspired Design Pattern
// - Video-first content
// - Colorful sections with distinct backgrounds
// - Tab/Carousel navigation
// - Character illustrations style
// - Playful yet professional

const TopPagePatternE = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const tabs = [
    { id: 0, label: "初心者向け", color: "bg-rose-50" },
    { id: 1, label: "スキルアップ", color: "bg-blue-50" },
    { id: 2, label: "転職・副業", color: "bg-amber-50" },
  ];

  const coursesByTab = {
    0: [
      { title: "UIデザイン基礎", description: "デザインの基本原則を学ぶ", badge: "人気", badgeColor: "bg-rose-100 text-rose-600" },
      { title: "Figma入門", description: "ツールの使い方をマスター", badge: "新着", badgeColor: "bg-blue-100 text-blue-600" },
    ],
    1: [
      { title: "UIビジュアル実践", description: "プロのテクニックを習得", badge: "おすすめ", badgeColor: "bg-emerald-100 text-emerald-600" },
      { title: "UX設計入門", description: "ユーザー体験を設計する", badge: "", badgeColor: "" },
    ],
    2: [
      { title: "ポートフォリオ作成", description: "採用担当者に刺さる見せ方", badge: "実践", badgeColor: "bg-purple-100 text-purple-600" },
      { title: "デザイン副業入門", description: "案件獲得のノウハウ", badge: "", badgeColor: "" },
    ],
  };

  const testimonials = [
    {
      name: "田中さん",
      role: "Webデザイナー",
      company: "IT企業",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
      quote: "BONOで学んで3ヶ月で転職成功！論理的に説明できるスキルが身についたのが大きかったです。",
      color: "bg-rose-50",
    },
    {
      name: "山田さん",
      role: "UIデザイナー",
      company: "スタートアップ",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      quote: "独学で行き詰まっていましたが、体系的なカリキュラムのおかげで一気に上達できました。",
      color: "bg-blue-50",
    },
    {
      name: "鈴木さん",
      role: "フリーランス",
      company: "",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      quote: "副業でデザインを始めて、今では月20万の収入に。コミュニティの仲間にも助けられています。",
      color: "bg-amber-50",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold">
              B
            </div>
            <span className="font-bold text-xl">BONO</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">BONOとは</a>
            <a href="#courses" className="text-gray-600 hover:text-gray-900 transition-colors">コース</a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">受講者の声</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">料金</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
              ログイン
            </Link>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6">
              無料で始める
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Video First */}
      <section className="py-20 bg-gradient-to-b from-rose-50 to-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm mb-6"
              >
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">3,000人以上が学習中</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              >
                UIデザインを、
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">
                  楽しく学ぼう
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-gray-600 mb-8 max-w-md"
              >
                動画で学んで、手を動かして、仲間と高め合う。
                あなたのペースで、確実にスキルアップ。
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4"
              >
                <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8 h-14 text-lg">
                  無料で始める
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg border-2">
                  <Play className="w-5 h-5 mr-2" />
                  紹介動画を見る
                </Button>
              </motion.div>
            </div>

            {/* Video Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-gray-900">
                <img
                  src="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop"
                  alt="Video thumbnail"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                  </button>
                </div>
                {/* Playful decorations */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center text-white font-bold rotate-12 shadow-lg">
                  無料
                </div>
              </div>
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4"
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-300 to-orange-300 border-2 border-white" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">+2,847人が視聴中</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Colorful Cards */}
      <section id="about" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              BONOが選ばれる理由
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              独学で挫折した人も、これから始める人も。
              BONOなら確実にスキルアップできます。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                color: "bg-rose-50 hover:bg-rose-100",
                iconBg: "bg-rose-400",
                title: "動画で分かりやすく",
                description: "プロのデザイナーが丁寧に解説。見て真似するだけでスキルが身につく。",
                illustration: "🎬",
              },
              {
                color: "bg-blue-50 hover:bg-blue-100",
                iconBg: "bg-blue-400",
                title: "実践で身につく",
                description: "課題を通じて手を動かしながら学習。理解が深まり、定着する。",
                illustration: "✏️",
              },
              {
                color: "bg-amber-50 hover:bg-amber-100",
                iconBg: "bg-amber-400",
                title: "仲間と一緒に",
                description: "コミュニティで質問・相談できる。モチベーションを維持して継続できる。",
                illustration: "👥",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`${feature.color} rounded-3xl p-8 transition-colors cursor-pointer`}
              >
                <div className="text-6xl mb-6">{feature.illustration}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section - Tabs */}
      <section id="courses" className="py-24 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              あなたの目的に合わせたコース
            </h2>
            <p className="text-gray-600">
              目的別に最適なコースをご用意しています
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center gap-2 mb-12">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Course Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`${tabs[activeTab].color} rounded-3xl p-8`}
            >
              <div className="grid md:grid-cols-2 gap-6">
                {coursesByTab[activeTab as keyof typeof coursesByTab].map((course, index) => (
                  <div
                    key={course.title}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                        📚
                      </div>
                      {course.badge && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${course.badgeColor}`}>
                          {course.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                    <p className="text-gray-600 mb-4">{course.description}</p>
                    <Button variant="link" className="p-0 h-auto font-medium text-gray-900">
                      詳しく見る <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Testimonials Section - Carousel */}
      <section id="testimonials" className="py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              受講者の声
            </h2>
            <p className="text-gray-600">
              BONOで学んだ仲間たちのストーリー
            </p>
          </div>

          {/* Carousel */}
          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className={`${testimonials[currentTestimonial].color} rounded-3xl p-8 md:p-12`}
              >
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-shrink-0">
                    <img
                      src={testimonials[currentTestimonial].avatar}
                      alt={testimonials[currentTestimonial].name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  </div>
                  <div>
                    <Quote className="w-10 h-10 text-gray-300 mb-4" />
                    <p className="text-xl md:text-2xl font-medium mb-6">
                      {testimonials[currentTestimonial].quote}
                    </p>
                    <div>
                      <div className="font-bold">{testimonials[currentTestimonial].name}</div>
                      <div className="text-gray-600">
                        {testimonials[currentTestimonial].role}
                        {testimonials[currentTestimonial].company && ` / ${testimonials[currentTestimonial].company}`}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      currentTestimonial === index ? "bg-gray-900" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              シンプルな料金プラン
            </h2>
            <p className="text-gray-600">
              まずは無料で始めて、合ったら続けてください
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-4">
                  はじめての方に
                </div>
                <h3 className="text-2xl font-bold mb-2">フリープラン</h3>
                <div className="text-4xl font-bold">¥0</div>
              </div>
              <ul className="space-y-4 mb-8">
                {["一部の動画を視聴", "サンプル教材", "メールサポート"].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-gray-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full h-12 rounded-full text-lg">
                無料で始める
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-rose-500 to-orange-500 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
                    ⭐️ 人気No.1
                  </div>
                  <h3 className="text-2xl font-bold mb-2">プレミアムプラン</h3>
                  <div className="text-4xl font-bold">
                    ¥2,980<span className="text-lg font-normal">/月</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    "全ての動画を視聴",
                    "全ての教材にアクセス",
                    "コミュニティ参加",
                    "月1回グループメンタリング",
                    "質問し放題",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-white" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full h-12 rounded-full text-lg bg-white text-gray-900 hover:bg-gray-100">
                  7日間無料で試す
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-r from-rose-50 via-amber-50 to-blue-50 rounded-3xl p-12 md:p-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              今日から始めよう！
            </h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              デザインを学ぶのに、遅すぎることはありません。
              <br />
              まずは無料で始めてみませんか？
            </p>
            <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-10 h-14 text-lg">
              無料で始める
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold">
                  B
                </div>
                <span className="font-bold text-xl">BONO</span>
              </div>
              <p className="text-gray-400 text-sm">
                UIデザインを、楽しく学ぼう。
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">コンテンツ</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">コース一覧</a></li>
                <li><a href="#" className="hover:text-white transition-colors">ロードマップ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">コミュニティ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">サポート</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">よくある質問</a></li>
                <li><a href="#" className="hover:text-white transition-colors">お問い合わせ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">法的情報</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">利用規約</a></li>
                <li><a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a></li>
                <li><a href="#" className="hover:text-white transition-colors">特定商取引法</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            © 2024 BONO. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TopPagePatternE;
