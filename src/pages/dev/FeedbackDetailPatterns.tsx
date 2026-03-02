/**
 * フィードバック詳細ページ デザインパターン比較（System Components版）
 *
 * 既存のデザインシステム（Card, Badge, Accordion等）を使用して再構築。
 * ライトモードでの「高級感」「洗練」を維持しつつ、実装コストを考慮。
 */

import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Lock,
  User,
  Calendar,
  Layers,
  Sparkles,
  FileText,
  MapPin,
  Clock,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// モックデータ
const MOCK_FEEDBACK = {
  title: "出張申請システム（申請一覧・新規作成）のUIデザイン添削",
  category: "UIスタイル",
  targetOutput: "情報設計コースのお題：出張申請システム",
  publishedDate: "2026.02.18",
  author: "T.K.",
  reviewer: "BONO Reviewer",
  requestSummary:
    "申請一覧と新規作成画面のUIを添削していただきたいです。情報設計の観点から、ユーザビリティや視認性についてフィードバックをお願いします。特にテーブルのレイアウトと、SP時の表示崩れが気になっています。",
};

/**
 * Pattern C: Luma Case Study Style (Refined)
 * 特徴: やわらかいグラデーション背景、シングルカラム、記事のような読みやすさ
 */
const PatternLuma: React.FC = () => {
  return (
    <div className="relative min-h-[900px] bg-white rounded-3xl overflow-hidden border border-border shadow-sm font-sans">
      {/* Ambient Gradient Background */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-100/60 via-pink-50/40 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[400px] bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 md:px-10 py-12 relative z-10">
        
        {/* Header Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Feedback Review
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-gray-900 leading-[1.2] tracking-tight font-rounded-mplus mb-6">
            {MOCK_FEEDBACK.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6 border border-white shadow-sm">
                <AvatarFallback className="bg-gray-900 text-white text-[10px]">B</AvatarFallback>
              </Avatar>
              <span className="font-medium text-gray-900">{MOCK_FEEDBACK.reviewer}</span>
            </div>
            <span className="text-gray-300">•</span>
            <span>{MOCK_FEEDBACK.publishedDate}</span>
            <span className="text-gray-300">•</span>
            <Badge variant="secondary" className="font-normal bg-gray-100 hover:bg-gray-200 border-transparent text-gray-600">
              {MOCK_FEEDBACK.category}
            </Badge>
          </div>
        </div>

        {/* Request Context (Card) */}
        <div className="mb-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1.5 bg-gray-100 rounded-lg">
                <User className="size-4 text-gray-500" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Member's Request
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {MOCK_FEEDBACK.requestSummary}
            </p>
          </div>
        </div>

        <Separator className="mb-12 opacity-50" />

        {/* Main Content Body */}
        <div className="space-y-10">
          
          {/* Section: Text Feedback */}
          <div className="prose prose-gray max-w-none">
            <h3 className="text-2xl font-bold text-gray-900 font-rounded-mplus">
              情報設計の観点からの改善案
            </h3>
            <p className="text-gray-600 leading-8">
              今回のデザインで特に良かった点は、申請一覧の「ステータス」の視認性です。
              一方で、モバイル表示時のテーブルレイアウトには課題があります。
              横スクロールは一つの解ですが、ユーザーの操作負荷を考えると、カード形式への変形（Reflow）が望ましいでしょう。
            </p>
          </div>

          {/* Section: Video (Optional) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Play className="size-4 text-indigo-500 fill-indigo-500" />
                Video Review
              </h4>
              <Badge variant="outline" className="text-xs font-normal text-gray-500">
                12:45
              </Badge>
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative group cursor-pointer bg-gray-50">
               <div className="aspect-video flex items-center justify-center relative">
                 {/* Premium Overlay */}
                 <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] flex flex-col items-center justify-center z-10">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl mb-4 group-hover:scale-105 transition-transform">
                      <Lock className="size-6 text-gray-900" />
                    </div>
                    <p className="font-bold text-gray-900">Unlock Full Review</p>
                    <p className="text-sm text-gray-500 mt-1">Available on Growth Plan</p>
                 </div>
                 {/* Placeholder Content */}
                 <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 opacity-50" />
               </div>
            </div>
          </div>

          {/* Section: Figma Link */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:border-gray-300 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm text-[#F24E1E]">
                <FileText className="size-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">Open in Figma</p>
                <p className="text-xs text-gray-500">Review file with comments</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400 group-hover:text-gray-600">
              <ArrowLeft className="size-4 rotate-180" />
            </Button>
          </div>

        </div>

        {/* Bottom CTA (Sticky-ish feel without being intrusive) */}
        <div className="mt-20 p-8 bg-gray-50 rounded-2xl border border-gray-200 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            もっと詳しく学びたいですか？
          </h3>
          <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
            Growthプランに参加すると、すべての動画レビューとFigmaデータにアクセスできます。
          </p>
          <Button size="lg" className="rounded-full px-8 font-bold shadow-lg shadow-indigo-200 bg-gray-900 hover:bg-gray-800">
            プランを確認する
          </Button>
        </div>

      </div>
    </div>
  );
};



/**
 * Pattern A: Editorial (System Components)
 * 特徴: 繊細なグラデーション背景、中央寄せレイアウト、システムコンポーネントの活用
 */
const PatternEditorial: React.FC = () => {
  return (
    <div className="relative min-h-[800px] rounded-3xl overflow-hidden bg-background border border-border shadow-sm">
      {/* 背景: 非常に淡いオーロラグラデーション (Tailwind標準色を使用) */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/80 via-indigo-50/50 to-background pointer-events-none" />
      
      <div className="relative max-w-[800px] mx-auto px-8 py-16">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-16">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-blue-200 text-blue-700 uppercase tracking-wider font-bold text-[10px] px-3 py-1">
            Premium Feedback
          </Badge>
        </div>

        {/* Title Block: Centered */}
        <div className="text-center mb-12 space-y-6">
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <Badge variant="secondary" className="rounded-full px-3 font-medium">
              {MOCK_FEEDBACK.category}
            </Badge>
            <span className="text-border">|</span>
            <span>{MOCK_FEEDBACK.publishedDate}</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-foreground leading-[1.3] tracking-tight font-rounded-mplus">
            {MOCK_FEEDBACK.title}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
            {MOCK_FEEDBACK.targetOutput}
          </p>
        </div>

        {/* Request Block: Accordion */}
        <div className="max-w-2xl mx-auto mb-16">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="request" className="border border-border rounded-lg bg-white/60 backdrop-blur-sm px-4">
              <AccordionTrigger className="hover:no-underline py-3 text-sm text-muted-foreground hover:text-foreground">
                <div className="flex items-center gap-2">
                  <User className="size-4" />
                  <span>メンバーからの依頼内容</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                <div className="pt-2 border-t border-dashed border-border">
                  {MOCK_FEEDBACK.requestSummary}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Feedback Block: Card Component */}
        <div className="relative">
          {/* Decorative blur behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 rounded-2xl blur opacity-40" />
          
          <Card className="relative overflow-hidden border-border/60 shadow-lg">
            <CardHeader className="border-b border-border/50 bg-muted/30 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-rounded-mplus">Feedback Review</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Professional review by BONO</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="gap-2 h-9 rounded-full bg-background shadow-sm hover:bg-accent">
                  <Play className="size-3.5 fill-current" />
                  Play Video
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
              {/* Video Placeholder */}
              <div className="aspect-video w-full bg-muted rounded-xl border border-border flex items-center justify-center relative overflow-hidden group cursor-pointer shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-tr from-muted to-transparent" />
                <div className="w-16 h-16 rounded-full bg-background/90 backdrop-blur shadow-lg flex items-center justify-center text-foreground group-hover:scale-110 transition-transform duration-300">
                  <Play className="size-6 fill-foreground ml-1" />
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground font-rounded-mplus flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  情報設計の観点からのフィードバック
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  全体的に非常にきれいにまとまっています。特に申請一覧の視認性は高いです。
                  ただ、モバイル表示時のテーブルの挙動について、現状の横スクロールだけでなく、
                  カード形式への変形も検討するとよりユーザー体験が向上します。
                </p>
                
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 text-foreground text-sm flex gap-3 items-start">
                  <div className="mt-0.5 text-primary">💡</div>
                  <div>
                    <strong className="block mb-1 font-bold">Key Takeaway</strong>
                    レスポンシブ対応では、単に縮小するだけでなく、デバイスの利用シーンに合わせた情報の再構成（Reflow）を意識しましょう。
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="bg-muted/30 border-t border-border/50 py-3 px-8 text-xs text-muted-foreground flex justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-primary" />
                <span>Growth Plan Content</span>
              </div>
              <span>Video duration: 12:45</span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

/**
 * Pattern B: Modern SaaS (System Components)
 * 特徴: サイドバー構造、カードレイアウト、機能的なデザイン
 */
const PatternModernSaaS: React.FC = () => {
  return (
    <div className="min-h-[800px] rounded-3xl overflow-hidden bg-muted/30 border border-border flex flex-col md:flex-row">
      {/* Sidebar (Context) */}
      <div className="w-full md:w-[280px] bg-background border-r border-border p-6 flex flex-col gap-6 flex-shrink-0">
        <div>
          <Button variant="link" className="px-0 h-auto gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="size-4" />
            Back to Feedbacks
          </Button>
          
          <div className="space-y-5">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</p>
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-muted-foreground" />
                <Badge variant="secondary" className="font-normal">{MOCK_FEEDBACK.category}</Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">{MOCK_FEEDBACK.publishedDate}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target</p>
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium line-clamp-2 leading-snug">{MOCK_FEEDBACK.targetOutput}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <Card className="bg-muted/50 border-border shadow-none">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                  ?
                </div>
                <span className="text-xs font-medium text-muted-foreground">Request</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                {MOCK_FEEDBACK.requestSummary}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-background/50">
        <div className="max-w-[800px] px-8 py-10">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100">
                <Lock className="size-3" />
                Premium Content
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight font-rounded-mplus">
              {MOCK_FEEDBACK.title}
            </h1>
          </div>

          {/* Video Section (Card) */}
          <Card className="mb-8 overflow-hidden border-border shadow-sm">
            <div className="aspect-video bg-black relative flex items-center justify-center group cursor-pointer">
               {/* Video Placeholder */}
               <div className="text-center z-10">
                 <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 border border-white/20 group-hover:scale-110 transition-transform">
                   <Play className="size-6 text-white ml-1 fill-white" />
                 </div>
                 <p className="text-white/80 text-sm font-medium">Watch Feedback Video</p>
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
            </div>
            <CardFooter className="bg-muted/30 border-t p-3 flex items-center gap-3 overflow-x-auto">
               <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Chapters:</span>
               <div className="flex gap-2">
                  {["Intro", "Table UI", "SP View", "Summary"].map((chapter, i) => (
                    <Badge key={i} variant="outline" className="bg-background cursor-pointer hover:bg-accent font-normal text-muted-foreground">
                      {chapter}
                    </Badge>
                  ))}
               </div>
            </CardFooter>
          </Card>

          {/* Text Content */}
          <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground">
            <h3 className="text-foreground font-rounded-mplus">デザインレビューのポイント</h3>
            <p>
              今回のレビューでは、主に情報設計の観点からUIを拝見しました。
              特に業務システムにおいて重要なのは「一覧性」と「操作性」のバランスです。
            </p>
            <ul className="marker:text-primary">
               <li>テーブルの列数が多くなった場合のスクロール処理</li>
               <li>アクションボタンの配置と優先度</li>
               <li>エラー時のフィードバック表示</li>
            </ul>
            <p>
              これらを改善することで、より使いやすいシステムになると考えられます。
              動画内で具体的なFigmaの操作を見せながら解説していますので、ぜひ参考にしてください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * メインページ
 */
const FeedbackDetailPatterns: React.FC = () => {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-6xl mx-auto py-12 px-4 md:px-6">
        <div className="mb-12">
          <Link
            to="/dev"
            className="text-muted-foreground hover:text-foreground text-sm font-medium mb-4 inline-block"
          >
            ← Dev Home
          </Link>
          <div className="flex items-end justify-between border-b border-border pb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground font-rounded-mplus">
                Feedback Detail Patterns
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                デザインシステム（components/ui）を使用した実装パターン。
                ライトモードでの「高級感」と「洗練」を表現。
              </p>
            </div>
            <div className="hidden md:flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/feedbacks">Current Prod</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Pattern A */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg shadow-primary/20">A</div>
            <div>
               <h2 className="text-xl font-bold text-foreground font-rounded-mplus">Editorial Style</h2>
               <p className="text-sm text-muted-foreground">OpenAI風。淡いグラデーションとCardコンポーネントの組み合わせ。</p>
            </div>
          </div>
          <PatternEditorial />
        </section>

        {/* Pattern B */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold shadow-lg shadow-foreground/20">B</div>
             <div>
               <h2 className="text-xl font-bold text-foreground font-rounded-mplus">Modern SaaS Style</h2>
               <p className="text-sm text-muted-foreground">Linear風。サイドバー構造とBadge、Cardコンポーネントの機能的配置。</p>
            </div>
          </div>
          <PatternModernSaaS />
        </section>

        {/* Pattern C */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-200">C</div>
             <div>
               <h2 className="text-xl font-bold text-foreground font-rounded-mplus">Luma Event Style</h2>
               <p className="text-sm text-muted-foreground">Lu.ma風。大きなアイキャッチ、カレンダー表示、イベントページのような情報整理。</p>
            </div>
          </div>
          <PatternLuma />
        </section>

      </div>
    </div>
  );
};

export default FeedbackDetailPatterns;
