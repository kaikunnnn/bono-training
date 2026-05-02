"use client";

/**
 * 15分フィードバック 応募フォーム
 * - ステップ形式で入力
 * - Step 1: アウトプットURL + アカウント名
 * - Step 2: 学んだBONOコンテンツ + 該当項目チェック
 * - 完了画面: アニメーション + Slack説明 + 内容確認
 *
 * mainブランチの /src/pages/feedback-apply/submit.tsx を移植
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  ExternalLink,
  X,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ============================================
// 型定義
// ============================================
interface FormData {
  articleUrl: string;
  slackAccountName: string;
  lessonId: string;
  checkedItems: string[];
}

interface LessonOption {
  id: string;
  title: string;
  slug: string;
  categoryTitle?: string;
}

interface FeedbackSubmitFormProps {
  userId: string;
  userEmail: string;
  lessons: LessonOption[];
}

// 該当項目の選択肢
const CRITERIA_OPTIONS = [
  {
    id: "notice",
    title: "Notice（気づき・変化）",
    description: "自分の考え方やデザインがどう変わったかが書かれている",
  },
  {
    id: "before-after",
    title: "Before/After（修正過程）",
    description: "成果物を気づきを得て自ら修正した過程が伝わる",
  },
  {
    id: "why",
    title: "Why（なぜそうしたか）",
    description: "なぜそうしたかを自分の言葉で説明している",
  },
];

// ステップ定義
const STEPS = [
  { number: 1, label: "URL" },
  { number: 2, label: "詳細入力" },
];

// ============================================
// UIコンポーネント
// ============================================

// ステップインジケーター（プログレスバー）
function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full max-w-[670px]">
      <div className="flex gap-1.5">
        {STEPS.map((step) => (
          <div key={step.number} className="flex-1 flex flex-col gap-2">
            {/* プログレスバー */}
            <div
              className={`h-1 rounded-full transition-colors ${
                currentStep >= step.number ? "bg-slate-900" : "bg-gray-200"
              }`}
            />
            {/* ステップラベル */}
            <div className="flex items-center gap-1.5">
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                  currentStep >= step.number
                    ? "border-slate-900 text-slate-900"
                    : "border-gray-400 text-gray-400"
                }`}
              >
                {step.number}
              </div>
              <span
                className={`text-sm font-bold ${
                  currentStep >= step.number
                    ? "text-slate-900"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ステップバッジ（ピル型）
function StepBadge({ step }: { step: number }) {
  return (
    <div className="inline-flex items-center justify-center px-3 py-0.5 border border-slate-900 rounded-full">
      <span className="text-[10px] font-bold text-slate-900">
        ステップ{step}
      </span>
    </div>
  );
}

// フォームフィールド（ラベル + 説明 + 入力）
function FormField({
  label,
  required,
  description,
  children,
}: {
  label: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-900">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        {description && (
          <p className="text-xs text-slate-500">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// チェックボックス項目（タイトル + 説明）
function CheckboxItem({
  title,
  description,
  checked,
  onChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-3 p-3.5 border rounded-2xl text-left transition-all ${
        checked
          ? "border-slate-900 bg-slate-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div
        className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
          checked
            ? "bg-slate-900 border-slate-900"
            : "bg-white border-gray-400"
        }`}
      >
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-base font-medium text-slate-800">{title}</span>
        <span className="text-sm text-slate-500">{description}</span>
      </div>
    </button>
  );
}

// 完了画面のチェックアニメーション
function SuccessCheckAnimation() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
      className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
      </motion.div>
    </motion.div>
  );
}

// 完了画面
function SuccessScreen({
  formData,
  lessonTitle,
}: {
  formData: FormData;
  lessonTitle?: string;
}) {
  const router = useRouter();

  // 選択された該当項目のラベルを取得
  const checkedLabels = CRITERIA_OPTIONS.filter((opt) =>
    formData.checkedItems.includes(opt.id)
  ).map((opt) => opt.title.split("（")[0]); // "Notice（気づき・変化）" → "Notice"

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      className="py-8"
    >
      <SuccessCheckAnimation />

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          応募が完了しました
        </h2>
        <p className="text-slate-600">ありがとうございます！</p>
      </div>

      {/* Slack説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg">💬</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1">次のステップ</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              1〜3日以内にSlackコミュニティで通知が届きます。
              <br />
              そこから日程調整を行い、15分フィードバックを実施します。
            </p>
          </div>
        </div>
      </div>

      {/* 入力内容の確認 */}
      <div className="bg-slate-50 rounded-2xl p-5 mb-8">
        <h3 className="text-sm font-bold text-slate-700 mb-4">応募内容</h3>
        <div className="space-y-4">
          {/* アウトプットURL */}
          <div>
            <p className="text-xs text-slate-500 mb-1">アウトプットURL</p>
            <a
              href={formData.articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1 break-all"
            >
              {formData.articleUrl}
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>

          {/* アカウント名 */}
          <div>
            <p className="text-xs text-slate-500 mb-1">アカウント名</p>
            <p className="text-sm font-medium text-slate-800">
              {formData.slackAccountName}
            </p>
          </div>

          {/* 関連レッスン */}
          {lessonTitle && (
            <div>
              <p className="text-xs text-slate-500 mb-1">
                学んだBONOコンテンツ
              </p>
              <p className="text-sm font-medium text-slate-800">
                {lessonTitle}
              </p>
            </div>
          )}

          {/* 該当項目 */}
          <div>
            <p className="text-xs text-slate-500 mb-1">該当項目</p>
            <div className="flex flex-wrap gap-2">
              {checkedLabels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-sm text-slate-700"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="outline"
          onClick={() => router.push("/feedback-apply")}
        >
          15分フィードバックに戻る
        </Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          ホームへ
        </Button>
      </div>
    </motion.div>
  );
}

// ============================================
// メインコンポーネント
// ============================================
export function FeedbackSubmitForm({
  userId,
  userEmail,
  lessons,
}: FeedbackSubmitFormProps) {
  const router = useRouter();

  // フォーム状態
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    articleUrl: "",
    slackAccountName: "",
    lessonId: "",
    checkedItems: [],
  });
  const [lessonSearchQuery, setLessonSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 2;

  // レッスン検索結果
  const filteredLessons = useMemo(() => {
    if (!lessons) return [];
    if (!lessonSearchQuery.trim()) return lessons;
    const query = lessonSearchQuery.toLowerCase();
    return lessons.filter((lesson) =>
      lesson.title.toLowerCase().includes(query)
    );
  }, [lessons, lessonSearchQuery]);

  // 選択中のレッスン
  const selectedLesson = useMemo(() => {
    if (!formData.lessonId || !lessons) return null;
    return lessons.find((l) => l.id === formData.lessonId) || null;
  }, [formData.lessonId, lessons]);

  // 現在のステップで次に進めるか
  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return (
          formData.articleUrl !== "" &&
          /^https?:\/\/.+/.test(formData.articleUrl) &&
          formData.slackAccountName.trim() !== ""
        );
      case 2:
        return formData.lessonId !== "" && formData.checkedItems.length > 0;
      default:
        return false;
    }
  };

  // チェックボックスのトグル
  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        checkedItems: [...formData.checkedItems, id],
      });
    } else {
      setFormData({
        ...formData,
        checkedItems: formData.checkedItems.filter((item) => item !== id),
      });
    }
  };

  // 送信処理
  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback-apply/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleUrl: formData.articleUrl,
          slackAccountName: formData.slackAccountName,
          lessonId: formData.lessonId,
          lessonTitle: selectedLesson?.title || "",
          checkedItems: formData.checkedItems,
          userId,
          userEmail,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "応募に失敗しました");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "応募に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="space-y-5">
        {/* キャンセルボタン */}
        {!isSubmitted && (
          <button
            onClick={() => router.push("/feedback-apply")}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
            <span>キャンセル</span>
          </button>
        )}

        <h1 className="text-2xl font-bold text-slate-900">
          15分フィードバックに応募しよう
        </h1>
        {!isSubmitted && <StepIndicator currentStep={step} />}
      </div>

      {/* メインカード */}
      <div className="bg-white border border-gray-200 rounded-[40px] shadow-sm">
        <div className="px-8 sm:px-14 py-10 sm:py-12">
          {/* 完了画面 */}
          {isSubmitted ? (
            <SuccessScreen
              formData={formData}
              lessonTitle={selectedLesson?.title}
            />
          ) : (
            <div className="space-y-10">
              {/* エラー表示 */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <AnimatePresence mode="wait">
                {/* Step 1: アウトプットURL + アカウント名 */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                      <StepBadge step={1} />
                      <h2 className="text-xl font-bold text-slate-900">
                        アウトプットURLとアカウント名を教えてください
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <FormField
                        label="アウトプットURL"
                        required
                        description="書いたアウトプットのURLを貼りましょう"
                      >
                        <Input
                          type="url"
                          value={formData.articleUrl}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              articleUrl: e.target.value,
                            });
                            setError(null);
                          }}
                          placeholder="https://note.com/..."
                          className="h-12 rounded-2xl border-gray-300 text-base"
                        />
                      </FormField>

                      <FormField
                        label="アカウント名"
                        required
                        description="※Slackと同じアカウント名"
                      >
                        <Input
                          type="text"
                          value={formData.slackAccountName}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              slackAccountName: e.target.value,
                            });
                            setError(null);
                          }}
                          placeholder="例：あきら(青い背景の犬のアイコン)"
                          className="h-12 rounded-2xl border-gray-300 text-base"
                        />
                      </FormField>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: 学んだBONOコンテンツ + 該当項目チェック */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                      <StepBadge step={2} />
                      <h2 className="text-xl font-bold text-slate-900">
                        URLの詳細について教えてください
                      </h2>
                    </div>

                    <div className="space-y-8">
                      {/* 学んだBONOコンテンツ（レッスン選択） */}
                      <FormField
                        label="学んだBONOコンテンツ"
                        required
                        description="このアウトプットで参照したレッスンを選択してください"
                      >
                        <div className="space-y-2">
                          {/* 選択中のレッスン表示 */}
                          {selectedLesson ? (
                            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="text-sm font-medium text-slate-800 truncate">
                                {selectedLesson.title}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData({ ...formData, lessonId: "" })
                                }
                                className="ml-auto text-slate-400 hover:text-slate-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              {/* 検索入力 */}
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                  type="text"
                                  value={lessonSearchQuery}
                                  onChange={(e) =>
                                    setLessonSearchQuery(e.target.value)
                                  }
                                  placeholder="レッスン名で検索..."
                                  className="h-10 pl-9 rounded-xl border-gray-300 text-sm"
                                />
                              </div>

                              {/* レッスン一覧 */}
                              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                                {filteredLessons.length === 0 ? (
                                  <div className="py-6 text-center text-sm text-gray-500">
                                    {lessonSearchQuery
                                      ? "該当するレッスンがありません"
                                      : "レッスンがありません"}
                                  </div>
                                ) : (
                                  <div className="divide-y divide-gray-100">
                                    {filteredLessons
                                      .slice(0, 20)
                                      .map((lesson) => (
                                        <button
                                          key={lesson.id}
                                          type="button"
                                          onClick={() => {
                                            setFormData({
                                              ...formData,
                                              lessonId: lesson.id,
                                            });
                                            setLessonSearchQuery("");
                                            setError(null);
                                          }}
                                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                                            formData.lessonId === lesson.id
                                              ? "bg-slate-50"
                                              : ""
                                          }`}
                                        >
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 truncate">
                                              {lesson.title}
                                            </p>
                                            {lesson.categoryTitle && (
                                              <p className="text-xs text-slate-500 truncate">
                                                {lesson.categoryTitle}
                                              </p>
                                            )}
                                          </div>
                                          {formData.lessonId === lesson.id && (
                                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                          )}
                                        </button>
                                      ))}
                                    {filteredLessons.length > 20 && (
                                      <div className="px-3 py-2 text-xs text-gray-500 text-center">
                                        他 {filteredLessons.length - 20}{" "}
                                        件（検索で絞り込めます）
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </FormField>

                      <FormField
                        label="どの項目に該当しますか？"
                        required
                        description="該当する項目を選択してください（複数選択可）"
                      >
                        <div className="space-y-2">
                          {CRITERIA_OPTIONS.map((option) => (
                            <CheckboxItem
                              key={option.id}
                              id={option.id}
                              title={option.title}
                              description={option.description}
                              checked={formData.checkedItems.includes(
                                option.id
                              )}
                              onChange={(checked) =>
                                handleCheckboxChange(option.id, checked)
                              }
                            />
                          ))}
                        </div>
                      </FormField>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ナビゲーションボタン */}
              <div
                className={`flex items-center pt-4 ${
                  step === 1 ? "justify-end" : "justify-between"
                }`}
              >
                {step > 1 && (
                  <button
                    onClick={() => {
                      setStep(step - 1);
                      setError(null);
                    }}
                    className="flex items-center gap-1 text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    もどる
                  </button>
                )}

                {step < totalSteps ? (
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                    className="h-10 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                  >
                    次へ
                    <ArrowRight className="ml-1.5 w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceed() || isSubmitting}
                    className="h-10 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        送信中...
                      </>
                    ) : (
                      <>
                        応募する
                        <Check className="ml-1.5 w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
