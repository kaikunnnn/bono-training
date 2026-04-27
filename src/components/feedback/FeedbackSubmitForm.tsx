"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface LessonOption {
  id: string;
  title: string;
  slug: string;
}

interface FeedbackSubmitFormProps {
  userId: string;
  userEmail: string;
  lessons: LessonOption[];
}

const checkboxItems = [
  {
    id: "notice",
    label: "気づきを言語化した",
    description: "学んだこと、気づいたことを自分の言葉でまとめた",
  },
  {
    id: "before-after",
    label: "Before/Afterを見せた",
    description: "改善前と改善後の比較ができるようにした",
  },
  {
    id: "why",
    label: "なぜを説明した",
    description: "なぜそのデザインにしたのか、理由を説明した",
  },
];

export function FeedbackSubmitForm({
  userId,
  userEmail,
  lessons,
}: FeedbackSubmitFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // フォームデータ
  const [articleUrl, setArticleUrl] = useState("");
  const [slackAccountName, setSlackAccountName] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  // バリデーション
  const isStep1Valid = articleUrl.trim() !== "" && slackAccountName.trim() !== "";
  const isStep2Valid = lessonId !== "" && checkedItems.length > 0;

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setCheckedItems((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const handleSubmit = async () => {
    if (!isStep1Valid || !isStep2Valid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/feedback-apply/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleUrl,
          slackAccountName,
          lessonId,
          checkedItems,
          userId,
          userEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "送信に失敗しました");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "送信に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 成功画面
  if (isSuccess) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            申請が完了しました
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            フィードバック申請を受け付けました。
            Slackにて進捗をお知らせしますので、お待ちください。
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left max-w-sm mx-auto">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">提出URL:</span>{" "}
              <a
                href={articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {articleUrl}
              </a>
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Slackアカウント:</span>{" "}
              {slackAccountName}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link href="/feedback-apply">申請ページに戻る</Link>
            </Button>
            <Button asChild>
              <Link href="/feedbacks">フィードバック一覧を見る</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* 戻るリンク */}
      <Link
        href="/feedback-apply"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        申請ページに戻る
      </Link>

      {/* プログレスバー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            ステップ {step} / 2
          </span>
          <span className="text-sm text-gray-500">
            {step === 1 ? "基本情報" : "レッスン選択"}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 ? "提出物とアカウント情報" : "レッスンと確認項目"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* エラー表示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {step === 1 ? (
            /* ステップ1: 基本情報 */
            <div className="space-y-6">
              <div>
                <Label htmlFor="articleUrl">提出物のURL *</Label>
                <Input
                  id="articleUrl"
                  type="url"
                  placeholder="https://..."
                  value={articleUrl}
                  onChange={(e) => setArticleUrl(e.target.value)}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Notion、note、ブログ記事などのURLを入力してください
                </p>
              </div>
              <div>
                <Label htmlFor="slackAccountName">Slackアカウント名 *</Label>
                <Input
                  id="slackAccountName"
                  type="text"
                  placeholder="@yourname"
                  value={slackAccountName}
                  onChange={(e) => setSlackAccountName(e.target.value)}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  BONOのSlackで使用しているアカウント名を入力してください
                </p>
              </div>
            </div>
          ) : (
            /* ステップ2: レッスン選択と確認項目 */
            <div className="space-y-6">
              <div>
                <Label htmlFor="lesson">関連レッスン *</Label>
                <Select value={lessonId} onValueChange={setLessonId}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="レッスンを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {lessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id}>
                        {lesson.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  このアウトプットに関連するレッスンを選択してください
                </p>
              </div>

              <div>
                <Label className="mb-3 block">確認項目 *</Label>
                <p className="text-sm text-gray-500 mb-4">
                  以下の項目を満たしていることを確認してください（1つ以上必須）
                </p>
                <div className="space-y-3">
                  {checkboxItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <Checkbox
                        id={item.id}
                        checked={checkedItems.includes(item.id)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(item.id, checked === true)
                        }
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={item.id}
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          {item.label}
                        </label>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ナビゲーションボタン */}
          <div className="flex justify-between mt-8">
            {step === 1 ? (
              <>
                <div />
                <Button
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid}
                >
                  次へ
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  戻る
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isStep2Valid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      送信中...
                    </>
                  ) : (
                    "申請する"
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
