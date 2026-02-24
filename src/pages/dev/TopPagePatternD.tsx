import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play, Check, Sparkles, Zap, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

// Linear-inspired Design Pattern
// - Dark mode with gradient accents
// - Grid dot background
// - Monospace typography accents
// - Minimal, focused layout
// - Smooth animations

const TopPagePatternD = () => {
  const gridRef = useRef<HTMLDivElement>(null);

  // Grid animation effect
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = grid.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      grid.style.setProperty("--mouse-x", `${x}px`);
      grid.style.setProperty("--mouse-y", `${y}px`);
    };

    grid.addEventListener("mousemove", handleMouseMove);
    return () => grid.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Grid Background */}
      <div
        ref={gridRef}
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99, 102, 241, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.03) 0%, transparent 50%)
          `,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-lg font-semibold tracking-tight">
              BONO
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#courses" className="hover:text-white transition-colors">Courses</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="#community" className="hover:text-white transition-colors">Community</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
              ログイン
            </Link>
            <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white">
              無料で始める
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span className="font-mono">v2.0</span>
              <span>新しい学習体験</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent">
                UIデザインを、
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                体系的に学ぶ
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              プロのデザイナーから学ぶ実践的なUIデザイン。
              <br className="hidden md:block" />
              論理的なアプローチで、確実にスキルアップ。
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 gap-2">
                無料で始める
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/5 gap-2">
                <Play className="w-4 h-4" />
                デモを見る
              </Button>
            </div>

            {/* Metrics */}
            <div className="mt-16 flex items-center justify-center gap-12">
              {[
                { value: "3,000+", label: "受講者数" },
                { value: "50+", label: "レッスン数" },
                { value: "4.9", label: "満足度" },
              ].map((metric) => (
                <div key={metric.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold font-mono text-white">{metric.value}</div>
                  <div className="text-sm text-gray-500">{metric.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-transparent to-purple-500/20" />
              <div className="relative rounded-xl bg-[#111118] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=600&fit=crop"
                  alt="BONO Dashboard"
                  className="w-full aspect-[2/1] object-cover opacity-80"
                />
                {/* Overlay UI elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-indigo-500/80 flex items-center justify-center backdrop-blur-sm cursor-pointer hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="container">
          <div className="text-center mb-16">
            <div className="font-mono text-sm text-indigo-400 mb-4">FEATURES</div>
            <h2 className="text-3xl md:text-4xl font-bold">
              なぜBONOが選ばれるのか
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "目的から逆算",
                description: "ゴールを明確にし、最短距離で必要なスキルを習得。無駄のない学習設計。",
                gradient: "from-indigo-500 to-blue-500",
              },
              {
                icon: Zap,
                title: "実践重視",
                description: "理論だけでなく、実際のデザインを作りながら学ぶ。手を動かして身につける。",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Users,
                title: "コミュニティ",
                description: "同じ志を持つ仲間と切磋琢磨。質問・相談できる環境で挫折しない。",
                gradient: "from-amber-500 to-orange-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Cards */}
      <section id="courses" className="py-24 relative">
        <div className="container">
          <div className="text-center mb-16">
            <div className="font-mono text-sm text-indigo-400 mb-4">COURSES</div>
            <h2 className="text-3xl md:text-4xl font-bold">
              学習コース
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "UIデザイン基礎",
                description: "デザインの基本原則から学ぶ。初心者でも安心のカリキュラム。",
                lessons: 24,
                duration: "12時間",
                image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop",
                tag: "入門",
                tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
              },
              {
                title: "UIビジュアル",
                description: "配色、タイポグラフィ、レイアウトの実践的テクニック。",
                lessons: 32,
                duration: "16時間",
                image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop",
                tag: "中級",
                tagColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
              },
              {
                title: "UXデザイン",
                description: "ユーザー体験設計の考え方とプロセスを習得。",
                lessons: 28,
                duration: "14時間",
                image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&h=400&fit=crop",
                tag: "中級",
                tagColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
              },
              {
                title: "実践プロジェクト",
                description: "実際のアプリUIを設計。ポートフォリオ作成にも。",
                lessons: 16,
                duration: "20時間",
                image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop",
                tag: "上級",
                tagColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
              },
            ].map((course, index) => (
              <motion.div
                key={course.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden hover:border-white/10 transition-all"
              >
                <div className="aspect-[3/2] overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className={`inline-flex px-2 py-0.5 rounded text-xs font-mono border ${course.tagColor} mb-3`}>
                    {course.tag}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{course.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-mono">{course.lessons} lessons</span>
                    <span>•</span>
                    <span className="font-mono">{course.duration}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative">
        <div className="container">
          <div className="text-center mb-16">
            <div className="font-mono text-sm text-indigo-400 mb-4">PRICING</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              シンプルな料金体系
            </h2>
            <p className="text-gray-400">
              すべての機能をシンプルな月額で
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/5 to-transparent p-8"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full bg-indigo-500 text-white text-xs font-medium">
                  POPULAR
                </span>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold mb-4">プレミアムプラン</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold font-mono">¥2,980</span>
                  <span className="text-gray-400">/月</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  "全コース無制限アクセス",
                  "コミュニティ参加権",
                  "月1回のグループメンタリング",
                  "オリジナル教材ダウンロード",
                  "質問サポート（48時間以内）",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-indigo-400 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white h-12">
                今すぐ始める
              </Button>

              <p className="text-center text-sm text-gray-500 mt-4">
                7日間の無料トライアル付き
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-white/5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-12 md:p-16 text-center overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                今日から始めよう
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                UIデザインのスキルを身につけて、キャリアの可能性を広げよう。
                まずは無料で体験してみてください。
              </p>
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 gap-2">
                無料で始める
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-500 text-sm">
              © 2024 BONO. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">利用規約</a>
              <a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a>
              <a href="#" className="hover:text-white transition-colors">お問い合わせ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TopPagePatternD;
