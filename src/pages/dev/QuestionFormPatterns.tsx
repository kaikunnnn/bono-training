/**
 * 質問投稿フォーム - デザインパターン比較
 * PMレビューとデザイナー協議を経て作成した3つのパターン
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  MessageCircle,
  HelpCircle,
  Figma,
  Link2,
  Clock,
  Users,
  Eye,
  ChevronRight,
  Sparkles,
} from "lucide-react";

// ===========================
// Pattern 1: ステップ形式フォーム
// ===========================

const CATEGORIES = [
  { id: "portfolio", label: "ポートフォリオ", emoji: "💼" },
  { id: "ui-design", label: "UIデザイン", emoji: "🎨" },
  { id: "figma", label: "Figma", emoji: "🔧" },
  { id: "career", label: "キャリア", emoji: "🚀" },
  { id: "other", label: "その他", emoji: "💬" },
];

function StepFormPattern() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const canProceed = () => {
    switch (step) {
      case 1:
        return category !== "";
      case 2:
        return title.length >= 5;
      case 3:
        return content.length >= 20;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
        <h3 className="text-xl font-bold mb-2">投稿完了！</h3>
        <p className="text-muted-foreground mb-4">
          カイくんが確認後、回答とともに公開されます
        </p>
        <Button variant="outline" onClick={() => {
          setIsSubmitted(false);
          setStep(1);
          setCategory("");
          setTitle("");
          setContent("");
          setFigmaUrl("");
        }}>
          もう一度試す
        </Button>
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
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    category === cat.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-2xl mb-2 block">{cat.emoji}</span>
                  <span className="font-medium">{cat.label}</span>
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
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: ポートフォリオのヒーローセクションについて"
              className="text-lg py-6"
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length} / 100 文字
            </p>
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
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`## 背景・状況\n今取り組んでいることを教えてください\n\n## 困っていること\n具体的に何を聞きたいですか？`}
              rows={10}
              className="font-mono text-sm"
            />
            <div className="border-t pt-4">
              <Label className="text-sm text-muted-foreground mb-2 block">
                Figmaリンク（任意）
              </Label>
              <Input
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                placeholder="https://www.figma.com/file/..."
              />
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
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {CATEGORIES.find((c) => c.id === category)?.label}
                </Badge>
              </div>
              <h4 className="font-bold">{title}</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-5">
                {content}
              </p>
              {figmaUrl && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Figma className="h-4 w-4" />
                  Figmaリンクあり
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between mt-8">
        <Button
          variant="ghost"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
        {step < totalSteps ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
            次へ
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit}>
            投稿する
            <Check className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ===========================
// Pattern 2: 投稿完了後の体験強化
// ===========================

const RELATED_QUESTIONS = [
  {
    id: 1,
    title: "ポートフォリオの構成について",
    views: 234,
    category: "ポートフォリオ",
  },
  {
    id: 2,
    title: "Figmaのコンポーネント設計のコツ",
    views: 189,
    category: "Figma",
  },
  {
    id: 3,
    title: "未経験からUIデザイナーになるには",
    views: 456,
    category: "キャリア",
  },
];

function PostSubmitExperiencePattern() {
  const [submitted, setSubmitted] = useState(false);

  if (!submitted) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          投稿完了後の画面を見るにはボタンをクリック
        </p>
        <Button onClick={() => setSubmitted(true)}>
          投稿完了画面を表示
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* 投稿完了カード */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
          <h3 className="text-lg font-bold mb-2">質問を投稿しました！</h3>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
            <Clock className="h-4 w-4" />
            <span>通常1-3日以内に回答</span>
          </div>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm">
              Slackで通知を受け取る
            </Button>
            <Button variant="outline" size="sm">
              メールで受け取る
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 関連質問 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            回答を待つ間に...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">
            同じカテゴリの人気質問をチェック
          </p>
          {RELATED_QUESTIONS.map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <div>
                <Badge variant="outline" className="mb-1 text-xs">
                  {q.category}
                </Badge>
                <p className="text-sm font-medium">{q.title}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                {q.views}
              </div>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="w-full">
            もっと見る
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* あなたの質問 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">あなたの質問</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                🟡 回答待ち
              </Badge>
            </div>
            <h4 className="font-medium mb-1">ポートフォリオのレイアウトについて</h4>
            <p className="text-xs text-muted-foreground">投稿: たった今</p>
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm">
              質問を編集
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive">
              取り下げる
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => setSubmitted(false)}
      >
        デモをリセット
      </Button>
    </div>
  );
}

// ===========================
// Pattern 3: 会話型フォーム
// ===========================

interface ChatMessage {
  type: "kai" | "user";
  content: string;
  inputType?: "category" | "title" | "content" | "figma" | "confirm";
}

function ConversationalFormPattern() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: "kai",
      content: "こんにちは！何について質問したい？",
      inputType: "category",
    },
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [inputPhase, setInputPhase] = useState<"category" | "title" | "content" | "figma" | "confirm" | "done">("category");
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    content: "",
    figmaUrl: "",
  });

  const addMessage = (type: "kai" | "user", content: string, inputType?: ChatMessage["inputType"]) => {
    setMessages((prev) => [...prev, { type, content, inputType }]);
  };

  const handleCategorySelect = (catId: string) => {
    const cat = CATEGORIES.find((c) => c.id === catId);
    if (!cat) return;

    setSelectedCategory(catId);
    setFormData((prev) => ({ ...prev, category: catId }));
    addMessage("user", `${cat.emoji} ${cat.label}`);

    setTimeout(() => {
      addMessage("kai", "なるほど！一言で説明すると？", "title");
      setInputPhase("title");
    }, 500);
  };

  const handleTitleSubmit = () => {
    if (!currentInput.trim()) return;

    setFormData((prev) => ({ ...prev, title: currentInput }));
    addMessage("user", currentInput);
    setCurrentInput("");

    setTimeout(() => {
      addMessage("kai", "詳しく教えて！下のテンプレートを参考にしてね", "content");
      setInputPhase("content");
    }, 500);
  };

  const handleContentSubmit = () => {
    if (!currentInput.trim()) return;

    setFormData((prev) => ({ ...prev, content: currentInput }));
    addMessage("user", currentInput.slice(0, 50) + "...");
    setCurrentInput("");

    setTimeout(() => {
      addMessage("kai", "Figmaファイルがあれば共有してもらえると嬉しいな（スキップもOK）", "figma");
      setInputPhase("figma");
    }, 500);
  };

  const handleFigmaSubmit = (skip = false) => {
    if (!skip && currentInput.trim()) {
      setFormData((prev) => ({ ...prev, figmaUrl: currentInput }));
      addMessage("user", "Figmaリンクを追加しました");
    } else {
      addMessage("user", "スキップします");
    }
    setCurrentInput("");

    setTimeout(() => {
      addMessage("kai", "これで大丈夫？投稿ボタンを押してね！", "confirm");
      setInputPhase("confirm");
    }, 500);
  };

  const handleConfirm = () => {
    addMessage("user", "投稿します！");
    setTimeout(() => {
      addMessage("kai", "受け付けました！✨ 通常1-3日以内に回答するね。楽しみに待っててね！");
      setInputPhase("done");
    }, 500);
  };

  const resetDemo = () => {
    setMessages([
      {
        type: "kai",
        content: "こんにちは！何について質問したい？",
        inputType: "category",
      },
    ]);
    setCurrentInput("");
    setSelectedCategory("");
    setInputPhase("category");
    setFormData({
      category: "",
      title: "",
      content: "",
      figmaUrl: "",
    });
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* チャット履歴 */}
      <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.type === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.type === "kai" && (
              <Avatar className="h-8 w-8 bg-orange-500">
                <AvatarImage src="/images/authors/kaikun.jpg" />
                <AvatarFallback className="bg-orange-500 text-white text-xs">K</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.type === "kai"
                  ? "bg-muted"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 入力エリア */}
      <AnimatePresence mode="wait">
        {inputPhase === "category" && (
          <motion.div
            key="cat-input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap gap-2"
          >
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => handleCategorySelect(cat.id)}
              >
                {cat.emoji} {cat.label}
              </Button>
            ))}
          </motion.div>
        )}

        {inputPhase === "title" && (
          <motion.div
            key="title-input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-2"
          >
            <Input
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="タイトルを入力..."
              onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
            />
            <Button onClick={handleTitleSubmit}>送信</Button>
          </motion.div>
        )}

        {inputPhase === "content" && (
          <motion.div
            key="content-input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <Textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="詳しい内容を入力..."
              rows={5}
            />
            <Button onClick={handleContentSubmit} className="w-full">送信</Button>
          </motion.div>
        )}

        {inputPhase === "figma" && (
          <motion.div
            key="figma-input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <div className="flex gap-2">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="https://www.figma.com/file/..."
              />
              <Button onClick={() => handleFigmaSubmit()}>追加</Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => handleFigmaSubmit(true)}
            >
              スキップ
            </Button>
          </motion.div>
        )}

        {inputPhase === "confirm" && (
          <motion.div
            key="confirm-input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Button onClick={handleConfirm} className="w-full">
              <Check className="mr-2 h-4 w-4" />
              投稿する
            </Button>
          </motion.div>
        )}

        {inputPhase === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Button variant="outline" onClick={resetDemo} className="w-full">
              デモをリセット
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===========================
// メインコンポーネント
// ===========================

export default function QuestionFormPatterns() {
  const [activePattern, setActivePattern] = useState<1 | 2 | 3>(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold">質問フォーム デザインパターン</h1>
          </div>
          <p className="text-lg text-gray-600 mb-4">
            PMレビューとデザイナー協議を経て作成した3つのパターンを比較できます
          </p>
          <div className="flex gap-4 text-sm">
            <a
              href="https://github.com/.../Q-08-PM-REVIEW.md"
              className="text-blue-600 hover:underline"
            >
              📋 PMレビュー
            </a>
            <a
              href="https://github.com/.../Q-08-DESIGN-IDEAS.md"
              className="text-blue-600 hover:underline"
            >
              🎨 デザインアイデア
            </a>
          </div>
        </header>

        {/* パターン選択タブ */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={activePattern === 1 ? "default" : "outline"}
            onClick={() => setActivePattern(1)}
          >
            Pattern 1: ステップ形式
          </Button>
          <Button
            variant={activePattern === 2 ? "default" : "outline"}
            onClick={() => setActivePattern(2)}
          >
            Pattern 2: 投稿後体験
          </Button>
          <Button
            variant={activePattern === 3 ? "default" : "outline"}
            onClick={() => setActivePattern(3)}
          >
            Pattern 3: 会話型
          </Button>
        </div>

        {/* パターン説明 */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            {activePattern === 1 && (
              <div>
                <h3 className="font-bold mb-2">Pattern 1: ステップ形式フォーム</h3>
                <p className="text-muted-foreground text-sm">
                  フォームを4ステップに分割し、プログレスバーで進捗を可視化。
                  最初のステップが簡単なので「始めやすく」、小さな達成感の積み重ねで「完了しやすい」。
                </p>
              </div>
            )}
            {activePattern === 2 && (
              <div>
                <h3 className="font-bold mb-2">Pattern 2: 投稿完了後の体験強化</h3>
                <p className="text-muted-foreground text-sm">
                  投稿完了後の「待ち時間」を価値ある体験に変換。
                  回答予定時期の表示、関連質問のレコメンド、自分の質問の追跡機能を提供。
                </p>
              </div>
            )}
            {activePattern === 3 && (
              <div>
                <h3 className="font-bold mb-2">Pattern 3: 会話型フォーム</h3>
                <p className="text-muted-foreground text-sm">
                  フォーム入力を「カイくんとの会話」に変換。
                  チャット形式のUIで親しみやすく、1つずつ聞かれるので圧倒されない体験。
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* パターン表示 */}
        <Card>
          <CardContent className="pt-6">
            {activePattern === 1 && <StepFormPattern />}
            {activePattern === 2 && <PostSubmitExperiencePattern />}
            {activePattern === 3 && <ConversationalFormPattern />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
