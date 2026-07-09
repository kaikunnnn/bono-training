"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";
import {
  StepQuestionForm,
  type SubmitResult,
} from "@/components/questions/StepQuestionForm";
import { QuestionSubmitSuccess } from "@/components/questions/QuestionSubmitSuccess";
import type { QuestionCategory } from "@/types/sanity";

interface NewQuestionClientProps {
  categories: QuestionCategory[];
  displayName: string;
  displayAvatar: string;
  previewMode?: boolean;
  initialStep?: number;
}

export function NewQuestionClient({
  categories,
  displayName,
  displayAvatar,
  previewMode,
  initialStep,
}: NewQuestionClientProps) {
  const router = useRouter();
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

  const handleCancel = () => {
    router.push("/questions");
  };

  if (submitResult) {
    return (
      <QuestionSubmitSuccess
        result={submitResult}
        onNewQuestion={() => setSubmitResult(null)}
      />
    );
  }

  return (
    <>
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/questions">
          <ArrowLeft className="mr-2 h-4 w-4" />
          一覧へ戻る
        </Link>
      </Button>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">質問を投稿する</CardTitle>
          <p className="text-sm text-muted-foreground">
            UIデザインや学習に関する質問をメンバーと共有できます
          </p>
        </CardHeader>
        <CardContent>
          {/* 投稿者情報 */}
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={displayAvatar} alt={displayName} />
              <AvatarFallback>{displayName.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-semibold">{displayName}</div>
              <div className="text-xs text-muted-foreground">
                あなたの名前で投稿されます
              </div>
            </div>
          </div>

          <StepQuestionForm
            categories={categories}
            onSuccess={setSubmitResult}
            onCancel={handleCancel}
            initialStep={previewMode ? initialStep : undefined}
            previewMode={previewMode}
          />
        </CardContent>
      </Card>
    </>
  );
}
