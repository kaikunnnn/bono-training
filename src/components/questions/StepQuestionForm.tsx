/**
 * ステップ形式の質問投稿フォーム
 * Pattern 01: ステップ形式で始めやすく、完了しやすいフォーム
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Figma,
  AlertCircle,
} from "lucide-react";
import { getQuestionCategories } from "@/lib/sanity";
import type { QuestionCategory } from "@/types/sanity";
import { useAuth } from "@/contexts/AuthContext";

// バリデーションルール
const VALIDATION_RULES = {
  title: { minLength: 5, maxLength: 100 },
  questionContent: { minLength: 20, maxLength: 5000 },
};

// テンプレート
const QUESTION_TEMPLATE = `## 背景・状況
（今取り組んでいるプロジェクトや課題について教えてください）

## 困っていること・質問
（具体的に何について聞きたいか教えてください）

## 試したこと（任意）
（自分で調べたり試したことがあれば書いてください）`;

// 投稿結果の型
export interface SubmitResult {
  questionId: string;
  slug: string;
  title: string;
  categoryTitle: string;
  categoryEmoji?: string;
}

interface StepQuestionFormProps {
  onSuccess: (result: SubmitResult) => void;
  onCancel?: () => void;
  /** プレビュー用: 初期ステップを指定 */
  initialStep?: number;
  /** プレビュー用: ダミーデータを入れる */
  previewMode?: boolean;
}

// プレビュー用ダミーデータ
const PREVIEW_DATA = {
  categoryId: "preview-cat-1",
  title: "ポートフォリオのヒーローセクションについて",
  questionContent: `## 背景・状況
現在、自分のポートフォリオサイトを作成しています。ヒーローセクションのレイアウトで悩んでいます。

## 困っていること・質問
左側にテキスト、右側に画像を配置したいのですが、スマホ表示にしたときにどのような順序で並べるのがベストか迷っています。

## 試したこと
・テキスト→画像の順（読みやすさ重視）
・画像→テキストの順（インパクト重視）`,
  figmaUrl: "https://www.figma.com/file/abc123...",
};

const PREVIEW_CATEGORIES: QuestionCategory[] = [
  { _id: "preview-cat-1", title: "UIデザイン", emoji: "🎨", slug: "ui-design", order: 1 },
  { _id: "preview-cat-2", title: "レイアウト", emoji: "📐", slug: "layout", order: 2 },
  { _id: "preview-cat-3", title: "配色・カラー", emoji: "🌈", slug: "color", order: 3 },
  { _id: "preview-cat-4", title: "タイポグラフィ", emoji: "✒️", slug: "typography", order: 4 },
  { _id: "preview-cat-5", title: "UX・体験設計", emoji: "💡", slug: "ux", order: 5 },
  { _id: "preview-cat-6", title: "その他", emoji: "📝", slug: "other", order: 6 },
];

export function StepQuestionForm({ onSuccess, onCancel, initialStep, previewMode }: StepQuestionFormProps) {
  const { session } = useAuth();

  // カテゴリ
  const [categories, setCategories] = useState<QuestionCategory[]>(previewMode ? PREVIEW_CATEGORIES : []);
  const [isLoadingCategories, setIsLoadingCategories] = useState(!previewMode);

  // フォーム状態
  const [step, setStep] = useState(initialStep || 1);
  const [categoryId, setCategoryId] = useState(previewMode ? PREVIEW_DATA.categoryId : "");
  const [title, setTitle] = useState(previewMode ? PREVIEW_DATA.title : "");
  const [questionContent, setQuestionContent] = useState(previewMode ? PREVIEW_DATA.questionContent : QUESTION_TEMPLATE);
  const [figmaUrl, setFigmaUrl] = useState(previewMode ? PREVIEW_DATA.figmaUrl : "");

  // UI状態
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  // カテゴリ取得
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getQuestionCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("カテゴリの取得に失敗しました");
      } finally {
        setIsLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  // 選択中のカテゴリを取得
  const selectedCategory = categories.find((c) => c._id === categoryId);

  // 各ステップで次に進めるか
  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return categoryId !== "";
      case 2:
        return title.length >= VALIDATION_RULES.title.minLength;
      case 3:
        return questionContent.length >= VALIDATION_RULES.questionContent.minLength;
      case 4:
        return true;
      default:
        return false;
    }
  };

  // バリデーション（送信前）
  const validate = (): string | null => {
    if (!categoryId) {
      return "カテゴリを選択してください";
    }
    if (title.length < VALIDATION_RULES.title.minLength) {
      return `タイトルは${VALIDATION_RULES.title.minLength}文字以上で入力してください`;
    }
    if (title.length > VALIDATION_RULES.title.maxLength) {
      return `タイトルは${VALIDATION_RULES.title.maxLength}文字以内で入力してください`;
    }
    if (questionContent.length < VALIDATION_RULES.questionContent.minLength) {
      return `質問内容は${VALIDATION_RULES.questionContent.minLength}文字以上で入力してください`;
    }
    if (figmaUrl && !figmaUrl.includes("figma.com")) {
      return "FigmaのURLを入力してください";
    }
    return null;
  };

  // 送信処理
  const handleSubmit = async () => {
    setError(null);

    // プレビューモードの場合はモックの成功レスポンスを返す
    if (previewMode) {
      onSuccess({
        questionId: "preview-question-id",
        slug: "preview-question-slug",
        title,
        categoryTitle: selectedCategory?.title || "UIデザイン",
        categoryEmoji: selectedCategory?.emoji || "🎨",
      });
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!session?.access_token) {
      setError("ログインが必要です");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title,
        categoryId,
        questionContent,
        figmaUrl: figmaUrl || undefined,
      };

      const response = await fetch("/api/questions/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "投稿に失敗しました");
      }

      onSuccess({
        questionId: data.questionId,
        slug: data.slug,
        title,
        categoryTitle: selectedCategory?.title || "カテゴリ",
        categoryEmoji: selectedCategory?.emoji,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "投稿に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  // カテゴリ読み込み中
  if (isLoadingCategories) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* プログレスバー */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {step} / {totalSteps}</span>
          <span>{Math.round(progress)}% 完了</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: カテゴリ選択 */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">何について質問したい？</h3>
              <p className="text-muted-foreground">カテゴリを選んでください</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => {
                    setCategoryId(cat._id);
                    setError(null);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    categoryId === cat._id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-2xl mb-2 block">{cat.emoji || "📝"}</span>
                  <span className="font-medium">{cat.title}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: タイトル入力 */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">一言で説明すると？</h3>
              <p className="text-muted-foreground">タイトルを入力してください</p>
            </div>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              placeholder="例: ポートフォリオのヒーローセクションについて"
              className="text-lg py-6"
              maxLength={VALIDATION_RULES.title.maxLength}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {title.length < VALIDATION_RULES.title.minLength && (
                  <span className="text-amber-600">
                    あと{VALIDATION_RULES.title.minLength - title.length}文字以上
                  </span>
                )}
              </span>
              <span>{title.length} / {VALIDATION_RULES.title.maxLength} 文字</span>
            </div>
          </motion.div>
        )}

        {/* Step 3: 詳細入力 */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">詳しく教えて！</h3>
              <p className="text-muted-foreground">背景や具体的な質問を書いてください</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">質問内容</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuestionContent(QUESTION_TEMPLATE)}
                >
                  テンプレートをリセット
                </Button>
              </div>
              <Textarea
                id="content"
                value={questionContent}
                onChange={(e) => {
                  setQuestionContent(e.target.value);
                  setError(null);
                }}
                rows={12}
                className="font-mono text-sm"
                maxLength={VALIDATION_RULES.questionContent.maxLength}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {questionContent.length < VALIDATION_RULES.questionContent.minLength && (
                    <span className="text-amber-600">
                      あと{VALIDATION_RULES.questionContent.minLength - questionContent.length}文字以上
                    </span>
                  )}
                </span>
                <span>
                  {questionContent.length} / {VALIDATION_RULES.questionContent.maxLength} 文字
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="text-sm text-muted-foreground mb-2 block">
                Figmaリンク（任意）
              </Label>
              <Input
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                placeholder="https://www.figma.com/file/..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Figmaファイルがあれば、より具体的なフィードバックが可能です
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 4: 確認 */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">内容を確認</h3>
              <p className="text-muted-foreground">問題なければ投稿しましょう</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {selectedCategory?.emoji} {selectedCategory?.title}
                </Badge>
              </div>
              <h4 className="font-bold text-lg">{title}</h4>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6 bg-background/50 p-3 rounded-lg">
                {questionContent}
              </div>
              {figmaUrl && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Figma className="h-4 w-4" />
                  Figmaリンクあり
                </div>
              )}
            </div>

            {/* 注意事項 */}
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>・ 投稿された質問はカイくんが確認後、回答とともに公開されます</li>
                <li>・ 回答までお時間をいただく場合があります（通常1-3日）</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between mt-8">
        <Button
          variant="ghost"
          onClick={() => {
            if (step === 1 && onCancel) {
              onCancel();
            } else {
              setStep(step - 1);
              setError(null);
            }
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {step === 1 ? "キャンセル" : "戻る"}
        </Button>

        {step < totalSteps ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
            次へ
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                投稿中...
              </>
            ) : (
              <>
                投稿する
                <Check className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
