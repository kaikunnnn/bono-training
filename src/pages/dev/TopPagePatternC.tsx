/**
 * トップページ パターンC: Stripe風「機能比較・プロダクト重視」
 * - 明確な情報設計とインタラクティブなUI
 * - ベントグリッド、タブ切り替え、詳細な比較表
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Play,
  Check,
  ChevronDown,
  BookOpen,
  Users,
  Award,
  Zap,
  Layers,
  PenTool,
  Layout,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// ============================================
// メガメニュー付きヘッダー
// ============================================
const Header = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const menuItems = [
    {
      label: "コース",
      items: [
        { icon: PenTool, title: "UIデザイン", desc: "ビジュアルデザインの基礎" },
        { icon: Layout, title: "UXデザイン", desc: "ユーザー体験設計" },
        { icon: Layers, title: "Figma", desc: "ツールマスター" },
        { icon: Target, title: "転職コース", desc: "6ヶ月集中プログラム" },
      ],
    },
    {
      label: "機能",
      items: [
        { icon: BookOpen, title: "動画レッスン", desc: "200本以上のコンテンツ" },
        { icon: Users, title: "コミュニティ", desc: "仲間と学ぶ" },
        { icon: Award, title: "フィードバック", desc: "プロからの添削" },
        { icon: Zap, title: "メンタリング", desc: "1on1サポート" },
      ],
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/top" className="text-xl font-bold text-slate-900">
              BONO
            </Link>
            <nav className="hidden lg:flex items-center gap-1">
              {menuItems.map((menu) => (
                <div
                  key={menu.label}
                  className="relative"
                  onMouseEnter={() => setActiveMenu(menu.label)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                    {menu.label}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {activeMenu === menu.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 w-80 bg-white rounded-2xl shadow-xl border p-4 mt-2"
                      >
                        <div className="grid gap-2">
                          {menu.items.map((item, i) => (
                            <a
                              key={i}
                              href="#"
                              className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                <item.icon className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">{item.title}</div>
                                <div className="text-sm text-slate-500">{item.desc}</div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              <a href="#" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                料金
              </a>
              <a href="#" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                事例
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              ログイン
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              無料で始める
              <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

// ============================================
// ヒーロー（プロダクト重視）
// ============================================
const HeroSection = () => (
  <section className="pt-32 pb-20 bg-gradient-to-b from-slate-50 to-white">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            デザインスキルを
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              体系的に習得する
            </span>
            プラットフォーム
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            200本以上の動画レッスン、プロからのフィードバック、
            500人以上が参加するコミュニティ。UI/UXデザイナーへの最短ルート。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
              無料で始める
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 rounded-xl">
              <Play className="mr-2 h-5 w-5" />
              デモを見る
            </Button>
          </div>
        </motion.div>
      </div>

      {/* プロダクトプレビュー */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative max-w-5xl mx-auto"
      >
        <div className="bg-slate-900 rounded-2xl p-2 shadow-2xl">
          <div className="bg-slate-800 rounded-xl aspect-video flex items-center justify-center">
            <div className="text-center">
              <Play className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <span className="text-white/50">学習画面プレビュー</span>
            </div>
          </div>
        </div>
        {/* フローティング統計 */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl px-8 py-4 flex items-center gap-8">
          {[
            { value: "5,000+", label: "受講者" },
            { value: "200+", label: "動画" },
            { value: "92%", label: "満足度" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

// ============================================
// ベントグリッド（大小カードの組み合わせ）
// ============================================
const features = [
  {
    title: "体系的なカリキュラム",
    description: "基礎から応用まで、段階的にスキルアップできる構成。迷わず学習を進められます。",
    icon: Layers,
    size: "large",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "プロからのフィードバック",
    description: "現役デザイナーが課題を添削。的確なアドバイスで確実に成長。",
    icon: Award,
    size: "small",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "活発なコミュニティ",
    description: "500人以上の仲間と切磋琢磨。質問も相談もOK。",
    icon: Users,
    size: "small",
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "転職サポート",
    description: "ポートフォリオ添削、面接対策、企業紹介まで。92%の転職成功率。",
    icon: Target,
    size: "large",
    gradient: "from-blue-500 to-cyan-500",
  },
];

const BentoGridSection = () => (
  <section className="py-24 bg-white">
    <div className="container mx-auto px-6">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
          なぜBONOが選ばれるのか
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          独学では得られない、成長を加速させる仕組み
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className={`rounded-3xl p-8 ${
              feature.size === "large" ? "lg:col-span-2" : ""
            } bg-gradient-to-br ${feature.gradient} text-white`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <feature.icon className="w-10 h-10 mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-white/80">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ============================================
// タブ切り替えコース一覧
// ============================================
const categories = ["すべて", "UI", "UX", "Figma", "キャリア"];
const allCourses = [
  { title: "UIデザインの教科書", category: "UI", lessons: 36, level: "初級" },
  { title: "色彩理論マスター", category: "UI", lessons: 24, level: "中級" },
  { title: "UXリサーチ入門", category: "UX", lessons: 28, level: "初級" },
  { title: "情報設計の基礎", category: "UX", lessons: 32, level: "初級" },
  { title: "はじめてのFigma", category: "Figma", lessons: 24, level: "初級" },
  { title: "Figmaプロトタイピング", category: "Figma", lessons: 18, level: "中級" },
  { title: "ポートフォリオ制作", category: "キャリア", lessons: 16, level: "中級" },
  { title: "面接対策講座", category: "キャリア", lessons: 12, level: "中級" },
];

const CoursesTabSection = () => {
  const [activeCategory, setActiveCategory] = useState("すべて");

  const filteredCourses =
    activeCategory === "すべて"
      ? allCourses
      : allCourses.filter((c) => c.category === activeCategory);

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              コースカタログ
            </h2>
            <p className="text-lg text-slate-600">
              目的に合わせて選べる豊富なコンテンツ
            </p>
          </div>
        </motion.div>

        {/* タブ */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* コースグリッド */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.title}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="aspect-video bg-slate-100 rounded-xl mb-4 flex items-center justify-center">
                  <Play className="w-8 h-8 text-slate-300" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                    {course.category}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded">
                    {course.level}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{course.title}</h3>
                <p className="text-sm text-slate-500">{course.lessons}レッスン</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================
// 詳細な料金比較表
// ============================================
const pricingFeatures = [
  { name: "動画コンテンツ", free: "10本", growth: "全て", pro: "全て" },
  { name: "コミュニティ参加", free: true, growth: true, pro: true },
  { name: "課題添削", free: false, growth: "月2回", pro: "無制限" },
  { name: "1on1メンタリング", free: false, growth: "月1回", pro: "月4回" },
  { name: "転職サポート", free: false, growth: true, pro: true },
  { name: "ポートフォリオレビュー", free: false, growth: false, pro: true },
  { name: "企業紹介", free: false, growth: false, pro: true },
];

const PricingTableSection = () => {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            料金プラン
          </h2>
          <p className="text-lg text-slate-600 mb-6">
            目標に合わせて選べる3つのプラン
          </p>

          {/* 月額/年額トグル */}
          <div className="inline-flex items-center gap-3 bg-slate-100 p-1 rounded-full">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !annual ? "bg-white shadow text-slate-900" : "text-slate-600"
              }`}
            >
              月額
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                annual ? "bg-white shadow text-slate-900" : "text-slate-600"
              }`}
            >
              年額 <span className="text-emerald-600">20%OFF</span>
            </button>
          </div>
        </motion.div>

        {/* 比較表 */}
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-4"></th>
                <th className="p-4 text-center">
                  <div className="text-lg font-bold text-slate-900">Free</div>
                  <div className="text-2xl font-bold text-slate-900">¥0</div>
                </th>
                <th className="p-4 text-center bg-indigo-50 rounded-t-2xl">
                  <div className="text-xs font-medium text-indigo-600 mb-1">人気</div>
                  <div className="text-lg font-bold text-slate-900">Growth</div>
                  <div className="text-2xl font-bold text-slate-900">
                    ¥{annual ? "7,840" : "9,800"}
                    <span className="text-sm font-normal text-slate-500">/月</span>
                  </div>
                </th>
                <th className="p-4 text-center">
                  <div className="text-lg font-bold text-slate-900">Pro</div>
                  <div className="text-2xl font-bold text-slate-900">
                    ¥{annual ? "12,640" : "15,800"}
                    <span className="text-sm font-normal text-slate-500">/月</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {pricingFeatures.map((feature, index) => (
                <tr key={index} className="border-t border-slate-100">
                  <td className="p-4 text-sm text-slate-600">{feature.name}</td>
                  <td className="p-4 text-center">
                    {typeof feature.free === "boolean" ? (
                      feature.free ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )
                    ) : (
                      <span className="text-sm text-slate-900">{feature.free}</span>
                    )}
                  </td>
                  <td className="p-4 text-center bg-indigo-50">
                    {typeof feature.growth === "boolean" ? (
                      feature.growth ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )
                    ) : (
                      <span className="text-sm text-slate-900">{feature.growth}</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {typeof feature.pro === "boolean" ? (
                      feature.pro ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )
                    ) : (
                      <span className="text-sm text-slate-900">{feature.pro}</span>
                    )}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-slate-100">
                <td className="p-4"></td>
                <td className="p-4 text-center">
                  <Button variant="outline" className="w-full rounded-xl">
                    始める
                  </Button>
                </td>
                <td className="p-4 text-center bg-indigo-50 rounded-b-2xl">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                    始める
                  </Button>
                </td>
                <td className="p-4 text-center">
                  <Button variant="outline" className="w-full rounded-xl">
                    始める
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

// ============================================
// CTA
// ============================================
const CTASection = () => (
  <section className="py-24 bg-slate-900 text-white">
    <div className="container mx-auto px-6">
      <motion.div
        className="max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl lg:text-4xl font-bold mb-6">
          今すぐ、デザイナーへの一歩を
        </h2>
        <p className="text-lg text-slate-400 mb-10">
          まずは無料で始めて、自分に合うかお試しください。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="h-14 px-8 bg-white text-slate-900 hover:bg-slate-100 rounded-xl">
            無料で始める
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-8 border-slate-600 text-white hover:bg-slate-800 rounded-xl"
          >
            セールスに相談
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

// ============================================
// メインコンポーネント
// ============================================
const TopPagePatternC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <BentoGridSection />
      <CoursesTabSection />
      <PricingTableSection />
      <CTASection />
    </div>
  );
};

export default TopPagePatternC;
