import Link from "next/link";
import Image from "next/image";
import { getAllLessons, urlFor } from "@/lib/sanity";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  Users,
  Sparkles,
  CheckCircle,
  Play,
} from "lucide-react";
import type { Lesson } from "@/types/sanity";

export default async function HomePage() {
  const lessons = await getAllLessons();

  return (
    <div className="min-h-screen">
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="container px-4 py-20 sm:px-8 sm:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              UIUXデザイン学習プラットフォーム
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              デザインで
              <br />
              <span className="text-primary">キャリアを変える</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              実践的なレッスンと体系的なカリキュラムで、
              UIUXデザインのスキルを効率的に身につけましょう。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/lessons">
                  レッスンを見る
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/subscription">プランを見る</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 装飾 */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </section>

      {/* 特徴セクション */}
      <section className="py-20 bg-white">
        <div className="container px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">BONOの特徴</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              実務経験のあるデザイナーが作成した、実践的なカリキュラムで学べます
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">体系的なカリキュラム</h3>
                <p className="text-sm text-muted-foreground">
                  初心者から実践レベルまで、段階的にスキルアップできる構成
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Play className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold mb-2">動画で学ぶ</h3>
                <p className="text-sm text-muted-foreground">
                  わかりやすい動画レッスンで、実際の操作を見ながら学習
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">コミュニティ</h3>
                <p className="text-sm text-muted-foreground">
                  同じ目標を持つ仲間と一緒に学び、モチベーションを維持
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* レッスン一覧セクション */}
      <section className="py-20 bg-slate-50">
        <div className="container px-4 sm:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">レッスン</h2>
              <p className="text-muted-foreground">
                UIUXデザインを体系的に学べるレッスン
              </p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex">
              <Link href="/lessons">
                すべて見る
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.slice(0, 6).map((lesson) => (
              <LessonCard key={lesson._id} lesson={lesson} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/lessons">
                すべてのレッスンを見る
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 sm:px-8 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">今すぐ始めよう</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            プレミアム会員になると、すべてのレッスンと記事に
            無制限でアクセスできます
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/signup">無料で始める</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              asChild
            >
              <Link href="/subscription">プランを見る</Link>
            </Button>
          </div>

          {/* 特典リスト */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm opacity-90">
            {[
              "すべてのレッスン",
              "すべての記事",
              "コミュニティ参加",
              "メールサポート",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function LessonCard({ lesson }: { lesson: Lesson }) {
  const iconUrl = lesson.iconImageUrl
    ? lesson.iconImageUrl
    : lesson.iconImage
      ? urlFor(lesson.iconImage).width(80).height(80).url()
      : null;

  return (
    <Link href={`/lessons/${lesson.slug.current}`}>
      <Card className="group h-full hover:shadow-lg transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {iconUrl && (
              <Image
                src={iconUrl}
                alt=""
                width={48}
                height={48}
                className="rounded-xl flex-shrink-0"
                unoptimized
              />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-2">
                {lesson.title}
              </h3>
              {lesson.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {lesson.description}
                </p>
              )}
            </div>
          </div>

          {lesson.tags && lesson.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {lesson.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
