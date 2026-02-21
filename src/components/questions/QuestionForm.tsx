import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, X, ExternalLink } from "lucide-react";
import { getQuestionCategories } from "@/lib/sanity";
import type { QuestionCategory } from "@/types/sanity";
import { useAuth } from "@/contexts/AuthContext";

interface ReferenceUrl {
  title?: string;
  url: string;
}

interface QuestionFormProps {
  onSuccess?: (questionId: string, slug: string) => void;
  onCancel?: () => void;
}

const QUESTION_TEMPLATE = `## 背景・状況
（今取り組んでいるプロジェクトや課題について教えてください）

## 困っていること・質問
（具体的に何について聞きたいか教えてください）

## 試したこと（任意）
（自分で調べたり試したことがあれば書いてください）`;

const VALIDATION_RULES = {
  title: { minLength: 5, maxLength: 100 },
  questionContent: { minLength: 20, maxLength: 5000 },
};

export function QuestionForm({ onSuccess, onCancel }: QuestionFormProps) {
  const { user, session } = useAuth();
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // フォーム状態
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [questionContent, setQuestionContent] = useState(QUESTION_TEMPLATE);
  const [referenceUrls, setReferenceUrls] = useState<ReferenceUrl[]>([]);

  // UI状態
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // カテゴリ取得
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getQuestionCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  // 参考URL追加
  const addReferenceUrl = () => {
    setReferenceUrls([...referenceUrls, { url: "" }]);
  };

  // 参考URL削除
  const removeReferenceUrl = (index: number) => {
    setReferenceUrls(referenceUrls.filter((_, i) => i !== index));
  };

  // 参考URL更新
  const updateReferenceUrl = (
    index: number,
    field: "title" | "url",
    value: string
  ) => {
    const updated = [...referenceUrls];
    updated[index] = { ...updated[index], [field]: value };
    setReferenceUrls(updated);
  };

  // バリデーション
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
    if (questionContent.length > VALIDATION_RULES.questionContent.maxLength) {
      return `質問内容は${VALIDATION_RULES.questionContent.maxLength}文字以内で入力してください`;
    }
    if (figmaUrl && !figmaUrl.includes("figma.com")) {
      return "FigmaのURLを入力してください";
    }
    return null;
  };

  // 送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
        referenceUrls: referenceUrls.filter((ref) => ref.url.trim()),
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

      onSuccess?.(data.questionId, data.slug);
    } catch (err) {
      setError(err instanceof Error ? err.message : "投稿に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* カテゴリ選択 */}
      <div className="space-y-2">
        <Label htmlFor="category">カテゴリ *</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger id="category">
            <SelectValue placeholder="カテゴリを選択" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingCategories ? (
              <SelectItem value="loading" disabled>
                読み込み中...
              </SelectItem>
            ) : (
              categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.title}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* タイトル */}
      <div className="space-y-2">
        <Label htmlFor="title">タイトル *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: ポートフォリオのヒーローセクションのレイアウトについて"
          maxLength={VALIDATION_RULES.title.maxLength}
        />
        <p className="text-xs text-muted-foreground">
          {title.length} / {VALIDATION_RULES.title.maxLength}文字
        </p>
      </div>

      {/* Figmaリンク */}
      <div className="space-y-2">
        <Label htmlFor="figmaUrl">
          Figmaリンク
          <span className="ml-2 text-xs text-muted-foreground">（任意）</span>
        </Label>
        <Input
          id="figmaUrl"
          type="url"
          value={figmaUrl}
          onChange={(e) => setFigmaUrl(e.target.value)}
          placeholder="https://www.figma.com/file/... または https://www.figma.com/design/..."
        />
      </div>

      {/* 質問内容 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="questionContent">質問内容 *</Label>
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
          id="questionContent"
          value={questionContent}
          onChange={(e) => setQuestionContent(e.target.value)}
          rows={15}
          maxLength={VALIDATION_RULES.questionContent.maxLength}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          {questionContent.length} / {VALIDATION_RULES.questionContent.maxLength}
          文字
        </p>
      </div>

      {/* 参考URL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>
            参考URL
            <span className="ml-2 text-xs text-muted-foreground">（任意）</span>
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addReferenceUrl}
          >
            <Plus className="mr-1 h-4 w-4" />
            追加
          </Button>
        </div>

        {referenceUrls.map((ref, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={ref.title || ""}
              onChange={(e) => updateReferenceUrl(index, "title", e.target.value)}
              placeholder="タイトル（任意）"
              className="w-1/3"
            />
            <Input
              type="url"
              value={ref.url}
              onChange={(e) => updateReferenceUrl(index, "url", e.target.value)}
              placeholder="https://..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeReferenceUrl(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {referenceUrls.length === 0 && (
          <p className="text-sm text-muted-foreground">
            参考にしているサイトやデザインのURLがあれば追加してください
          </p>
        )}
      </div>

      {/* 送信ボタン */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              投稿中...
            </>
          ) : (
            "質問を投稿する"
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
        )}
      </div>

      {/* 注意事項 */}
      <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
        <h4 className="mb-2 text-sm font-medium">投稿について</h4>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>
            投稿された質問はカイくんが確認後、回答とともに公開されます
          </li>
          <li>回答までお時間をいただく場合があります</li>
          <li>
            Figmaリンクを添付いただくと、より具体的なフィードバックが可能です
          </li>
        </ul>
      </div>
    </form>
  );
}
