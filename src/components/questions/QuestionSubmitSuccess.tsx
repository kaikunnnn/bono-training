"use client";

/**
 * 質問投稿完了画面
 * - 投稿完了メッセージ
 * - 投稿した質問の表示
 * - 一覧へ戻る / 新規投稿 / 詳細を見る
 */

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  PlusCircle,
  List,
  ArrowRight,
} from "lucide-react";
import type { SubmitResult } from "./StepQuestionForm";

interface QuestionSubmitSuccessProps {
  result: SubmitResult;
  onNewQuestion: () => void;
}

export function QuestionSubmitSuccess({
  result,
  onNewQuestion,
}: QuestionSubmitSuccessProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto space-y-6"
    >
      {/* 投稿完了メッセージ */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          >
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
          </motion.div>
          <h3 className="text-xl font-bold mb-2 text-green-900">
            質問を投稿しました！
          </h3>
          <p className="text-sm text-green-700">
            すぐに掲示板に表示されます。メンバーからのコメントを待ちましょう
          </p>
        </CardContent>
      </Card>

      {/* 投稿した質問 */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <span className="text-lg">📝</span>
            あなたの質問
          </h4>
          <div className="p-4 border rounded-xl bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                📝 {result.categoryTitle}
              </Badge>
            </div>
            <h5 className="font-medium text-base mb-2">{result.title}</h5>
            <p className="text-xs text-muted-foreground">投稿: たった今</p>
          </div>
          <Button
            variant="link"
            size="sm"
            className="mt-3 gap-1 px-0"
            asChild
          >
            <Link href={`/questions/${result.slug}`}>
              投稿した質問を見る
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => router.push("/questions")}
        >
          <List className="h-4 w-4" />
          掲示板を見る
        </Button>
        <Button
          className="flex-1 gap-2"
          onClick={onNewQuestion}
        >
          <PlusCircle className="h-4 w-4" />
          新しい質問を投稿
        </Button>
      </div>
    </motion.div>
  );
}
