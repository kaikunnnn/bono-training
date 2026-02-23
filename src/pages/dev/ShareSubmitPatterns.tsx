import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  HelpCircle,
  Lightbulb,
  Sparkles,
  BookOpen,
  Link as LinkIcon,
  MessageSquare,
  Send,
} from "lucide-react";

// BONOコンテンツのモックデータ
const BONO_CONTENTS = [
  { id: "1", title: "UIビジュアル基礎", category: "基礎" },
  { id: "2", title: "UIデザインの法則", category: "基礎" },
  { id: "3", title: "レイアウト入門", category: "基礎" },
  { id: "4", title: "配色の考え方", category: "応用" },
  { id: "5", title: "タイポグラフィ", category: "応用" },
];

// カテゴリ選択肢
const CATEGORY_OPTIONS = [
  {
    value: "notice",
    label: "気づき・変化",
    description: "自分の考え方やデザインがどう変わったか",
    icon: Lightbulb,
    color: "amber",
  },
  {
    value: "before-after",
    label: "Before/After",
    description: "成果物を自ら修正した過程",
    icon: ArrowRight,
    color: "green",
  },
  {
    value: "why",
    label: "Why（なぜ）",
    description: "なぜそうしたかを自分の言葉で",
    icon: HelpCircle,
    color: "blue",
  },
];

// ==============================
// パターンA: シングルページ（現状改善版）
// ==============================
const PatternA = () => {
  const [selectedContent, setSelectedContent] = useState<string>("");
  const [articleUrl, setArticleUrl] = useState("");
  const [mainPoint, setMainPoint] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const toggleCategory = (value: string) => {
    setCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <Badge variant="outline" className="mb-2 w-fit">Pattern A</Badge>
        <CardTitle className="text-lg">シングルページ（現状改善版）</CardTitle>
        <p className="text-sm text-slate-500">
          フォーム順序を改善し、BONOコンテンツ→URL→思考の流れに
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: BONOコンテンツ選択 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
              1
            </div>
            <Label className="font-semibold">どのBONOコンテンツを実践しましたか？</Label>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {BONO_CONTENTS.slice(0, 4).map((content) => (
              <button
                key={content.id}
                type="button"
                className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-all ${
                  selectedContent === content.id
                    ? "border-indigo-400 bg-indigo-50 ring-1 ring-indigo-400"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setSelectedContent(content.id)}
              >
                <BookOpen className={`h-4 w-4 ${
                  selectedContent === content.id ? "text-indigo-600" : "text-slate-400"
                }`} />
                <span>{content.title}</span>
              </button>
            ))}
          </div>
          <Input placeholder="その他のコンテンツを入力..." className="text-sm" />
        </div>

        {/* Step 2: URL入力 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
              2
            </div>
            <Label className="font-semibold">記事URLを入力</Label>
          </div>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={articleUrl}
              onChange={(e) => setArticleUrl(e.target.value)}
              placeholder="https://note.com/..."
              className="pl-10"
            />
          </div>
          {/* OGPプレビュー（モック） */}
          {articleUrl && (
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="h-12 w-16 rounded bg-slate-200" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">記事タイトルがここに表示</p>
                <p className="text-xs text-slate-500">note.com</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          )}
        </div>

        {/* Step 3: カテゴリ選択 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
              3
            </div>
            <Label className="font-semibold">記事に含まれる内容</Label>
            <span className="text-xs text-slate-500">（複数選択OK）</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {CATEGORY_OPTIONS.map((option) => {
              const isSelected = categories.includes(option.value);
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                    isSelected
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => toggleCategory(option.value)}
                >
                  <div className={`rounded-full p-2 ${
                    isSelected ? "bg-indigo-100" : "bg-slate-100"
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      isSelected ? "text-indigo-600" : "text-slate-500"
                    }`} />
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: 伝えたいこと */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
              4
            </div>
            <Label className="font-semibold">一番伝えたいこと</Label>
          </div>
          <Textarea
            value={mainPoint}
            onChange={(e) => setMainPoint(e.target.value)}
            placeholder="この記事で読者に伝えたいことを140字以内で..."
            rows={3}
            maxLength={140}
          />
          <div className="text-right text-xs text-slate-500">{mainPoint.length}/140</div>
        </div>

        <Button className="w-full">
          <Send className="mr-2 h-4 w-4" />
          記事を提出する
        </Button>
      </CardContent>
    </Card>
  );
};

// ==============================
// パターンB: ステップ型フォーム
// ==============================
const PatternB = () => {
  const [step, setStep] = useState(1);
  const [selectedContent, setSelectedContent] = useState<string>("");
  const [articleUrl, setArticleUrl] = useState("");
  const [mainPoint, setMainPoint] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const totalSteps = 4;

  const toggleCategory = (value: string) => {
    setCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <Badge variant="outline" className="mb-2 w-fit">Pattern B</Badge>
        <CardTitle className="text-lg">ステップ型フォーム</CardTitle>
        <p className="text-sm text-slate-500">
          Airbnb風の一度に一つのことを聞くフォーム
        </p>
      </CardHeader>
      <CardContent>
        {/* プログレスバー */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <span>Step {step}/{totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: BONOコンテンツ選択 */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                どのBONOコンテンツを
                <br />
                実践しましたか？
              </h3>
              <p className="text-sm text-slate-500">
                学んだコンテンツを選んでください
              </p>
            </div>
            <div className="space-y-2">
              {BONO_CONTENTS.map((content) => (
                <button
                  key={content.id}
                  type="button"
                  className={`flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-all ${
                    selectedContent === content.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => setSelectedContent(content.id)}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className={`h-5 w-5 ${
                      selectedContent === content.id ? "text-indigo-600" : "text-slate-400"
                    }`} />
                    <div>
                      <p className="font-medium">{content.title}</p>
                      <p className="text-xs text-slate-500">{content.category}</p>
                    </div>
                  </div>
                  {selectedContent === content.id && (
                    <Check className="h-5 w-5 text-indigo-600" />
                  )}
                </button>
              ))}
            </div>
            <Input placeholder="その他のコンテンツを入力..." />
          </div>
        )}

        {/* Step 2: URL入力 */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                あなたの記事を
                <br />
                教えてください
              </h3>
              <p className="text-sm text-slate-500">
                note、Qiita、ブログなどのURLを入力
              </p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={articleUrl}
                  onChange={(e) => setArticleUrl(e.target.value)}
                  placeholder="https://note.com/..."
                  className="h-14 pl-12 text-base"
                />
              </div>
              {/* OGPプレビュー（モック） */}
              {articleUrl && (
                <div className="flex items-center gap-4 rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="h-16 w-24 rounded-lg bg-slate-200" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">記事タイトルがここに表示</p>
                    <p className="text-sm text-slate-500">note.com</p>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: カテゴリ選択 + 伝えたいこと */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                この記事であなたが
                <br />
                考えたことは？
              </h3>
              <p className="text-sm text-slate-500">
                1つ以上選択してください
              </p>
            </div>
            <div className="space-y-3">
              {CATEGORY_OPTIONS.map((option) => {
                const isSelected = categories.includes(option.value);
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => toggleCategory(option.value)}
                  >
                    <div className={`rounded-xl p-3 ${
                      isSelected ? "bg-indigo-100" : "bg-slate-100"
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        isSelected ? "text-indigo-600" : "text-slate-500"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{option.label}</p>
                      <p className="text-sm text-slate-500">{option.description}</p>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 text-indigo-600" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">一番伝えたいこと（140字以内）</Label>
              <Textarea
                value={mainPoint}
                onChange={(e) => setMainPoint(e.target.value)}
                placeholder="この記事で読者に伝えたいことを..."
                rows={4}
                maxLength={140}
                className="resize-none"
              />
              <div className="text-right text-sm text-slate-500">{mainPoint.length}/140</div>
            </div>
          </div>
        )}

        {/* Step 4: 確認画面 */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                提出内容の確認
              </h3>
            </div>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex justify-between p-4">
                <span className="text-sm text-slate-500">投稿者</span>
                <span className="font-medium">たかし</span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-sm text-slate-500">実践コンテンツ</span>
                <span className="font-medium">
                  {BONO_CONTENTS.find((c) => c.id === selectedContent)?.title || "-"}
                </span>
              </div>
              <div className="p-4">
                <span className="text-sm text-slate-500">記事</span>
                <div className="mt-2 flex items-center gap-3 rounded-lg bg-white p-3">
                  <div className="h-10 w-14 rounded bg-slate-200" />
                  <div className="flex-1 truncate text-sm">記事タイトル</div>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </div>
              </div>
              <div className="p-4">
                <span className="text-sm text-slate-500">該当項目</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge key={cat} variant="secondary">
                      {CATEGORY_OPTIONS.find((o) => o.value === cat)?.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <span className="text-sm text-slate-500">伝えたいこと</span>
                <p className="mt-2 text-sm">{mainPoint || "-"}</p>
              </div>
            </div>
            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-semibold">提出後の流れ</p>
              <p className="mt-1">運営が確認し、3営業日以内にSlackでお知らせします</p>
            </div>
          </div>
        )}

        {/* ナビゲーションボタン */}
        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
          )}
          {step < totalSteps ? (
            <Button onClick={() => setStep((s) => s + 1)} className="flex-1">
              次へ
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button className="flex-1 bg-green-600 hover:bg-green-700">
              <Sparkles className="mr-2 h-4 w-4" />
              この内容で提出する
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ==============================
// パターンC: カード型（ゲーミフィケーション）
// ==============================
const PatternC = () => {
  const [selectedContent, setSelectedContent] = useState<string>("");
  const [articleUrl, setArticleUrl] = useState("");
  const [mainPoint, setMainPoint] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedSection, setExpandedSection] = useState<number>(1);

  const toggleCategory = (value: string) => {
    setCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  const sections = [
    { id: 1, title: "学んだこと", completed: !!selectedContent },
    { id: 2, title: "書いた記事", completed: !!articleUrl },
    { id: 3, title: "考えたこと", completed: categories.length > 0 && mainPoint.length > 0 },
  ];

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <Badge variant="outline" className="mb-2 w-fit">Pattern C</Badge>
        <CardTitle className="text-lg">アコーディオン型（達成感重視）</CardTitle>
        <p className="text-sm text-slate-500">
          セクションごとにチェックマークで達成感を演出
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* プログレス表示 */}
        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-white">
          <div>
            <p className="text-sm opacity-80">思考の整理</p>
            <p className="text-lg font-bold">
              {sections.filter((s) => s.completed).length}/{sections.length} 完了
            </p>
          </div>
          <div className="flex gap-1">
            {sections.map((s) => (
              <div
                key={s.id}
                className={`h-3 w-3 rounded-full ${
                  s.completed ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* セクション1: 学んだこと */}
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <button
            type="button"
            className="flex w-full items-center justify-between bg-slate-50 p-4"
            onClick={() => setExpandedSection(1)}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                sections[0].completed ? "bg-green-100" : "bg-slate-200"
              }`}>
                {sections[0].completed ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <span className="text-sm font-semibold text-slate-500">1</span>
                )}
              </div>
              <span className="font-semibold">学んだこと</span>
            </div>
            <ChevronRight className={`h-5 w-5 transition-transform ${
              expandedSection === 1 ? "rotate-90" : ""
            }`} />
          </button>
          {expandedSection === 1 && (
            <div className="border-t border-slate-200 p-4">
              <p className="mb-3 text-sm text-slate-600">どのBONOコンテンツを実践しましたか？</p>
              <div className="flex flex-wrap gap-2">
                {BONO_CONTENTS.map((content) => (
                  <button
                    key={content.id}
                    type="button"
                    className={`rounded-full border px-4 py-2 text-sm transition-all ${
                      selectedContent === content.id
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => setSelectedContent(content.id)}
                  >
                    {content.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* セクション2: 書いた記事 */}
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <button
            type="button"
            className="flex w-full items-center justify-between bg-slate-50 p-4"
            onClick={() => setExpandedSection(2)}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                sections[1].completed ? "bg-green-100" : "bg-slate-200"
              }`}>
                {sections[1].completed ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <span className="text-sm font-semibold text-slate-500">2</span>
                )}
              </div>
              <span className="font-semibold">書いた記事</span>
            </div>
            <ChevronRight className={`h-5 w-5 transition-transform ${
              expandedSection === 2 ? "rotate-90" : ""
            }`} />
          </button>
          {expandedSection === 2 && (
            <div className="border-t border-slate-200 p-4">
              <p className="mb-3 text-sm text-slate-600">記事のURLを入力してください</p>
              <Input
                value={articleUrl}
                onChange={(e) => setArticleUrl(e.target.value)}
                placeholder="https://note.com/..."
              />
            </div>
          )}
        </div>

        {/* セクション3: 考えたこと */}
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <button
            type="button"
            className="flex w-full items-center justify-between bg-slate-50 p-4"
            onClick={() => setExpandedSection(3)}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                sections[2].completed ? "bg-green-100" : "bg-slate-200"
              }`}>
                {sections[2].completed ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <span className="text-sm font-semibold text-slate-500">3</span>
                )}
              </div>
              <span className="font-semibold">考えたこと</span>
            </div>
            <ChevronRight className={`h-5 w-5 transition-transform ${
              expandedSection === 3 ? "rotate-90" : ""
            }`} />
          </button>
          {expandedSection === 3 && (
            <div className="space-y-4 border-t border-slate-200 p-4">
              <div>
                <p className="mb-3 text-sm text-slate-600">記事に含まれる内容は？</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((option) => {
                    const isSelected = categories.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                        onClick={() => toggleCategory(option.value)}
                      >
                        {isSelected && <Check className="h-4 w-4" />}
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm text-slate-600">一番伝えたいこと</p>
                <Textarea
                  value={mainPoint}
                  onChange={(e) => setMainPoint(e.target.value)}
                  placeholder="140字以内で..."
                  rows={3}
                  maxLength={140}
                />
                <div className="mt-1 text-right text-xs text-slate-500">{mainPoint.length}/140</div>
              </div>
            </div>
          )}
        </div>

        <Button
          className="w-full"
          disabled={!sections.every((s) => s.completed)}
        >
          <Send className="mr-2 h-4 w-4" />
          記事を提出する
        </Button>
      </CardContent>
    </Card>
  );
};

// ==============================
// メインページ
// ==============================
const ShareSubmitPatterns = () => {
  const [activePattern, setActivePattern] = useState<"A" | "B" | "C">("B");

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-slate-900">
            思考シェア提出フォーム - UIパターン
          </h1>
          <p className="text-slate-600">
            Airbnb的なUXプリンシプルを適用した3つのパターン
          </p>
        </div>

        {/* パターン切り替え */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={activePattern === "A" ? "default" : "outline"}
            onClick={() => setActivePattern("A")}
          >
            A: シングルページ
          </Button>
          <Button
            variant={activePattern === "B" ? "default" : "outline"}
            onClick={() => setActivePattern("B")}
          >
            B: ステップ型
          </Button>
          <Button
            variant={activePattern === "C" ? "default" : "outline"}
            onClick={() => setActivePattern("C")}
          >
            C: アコーディオン型
          </Button>
        </div>

        {/* パターン表示 */}
        {activePattern === "A" && <PatternA />}
        {activePattern === "B" && <PatternB />}
        {activePattern === "C" && <PatternC />}

        {/* パターン比較表 */}
        <div className="mx-auto mt-12 max-w-2xl">
          <h2 className="mb-4 text-lg font-bold">パターン比較</h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3 text-left font-semibold">観点</th>
                  <th className="p-3 text-center font-semibold">A: シングル</th>
                  <th className="p-3 text-center font-semibold">B: ステップ</th>
                  <th className="p-3 text-center font-semibold">C: アコーディオン</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3">認知負荷</td>
                  <td className="p-3 text-center text-amber-600">中</td>
                  <td className="p-3 text-center text-green-600">低</td>
                  <td className="p-3 text-center text-green-600">低</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3">完了率（予測）</td>
                  <td className="p-3 text-center">70%</td>
                  <td className="p-3 text-center font-semibold text-green-600">85%</td>
                  <td className="p-3 text-center">75%</td>
                </tr>
                <tr>
                  <td className="p-3">操作数</td>
                  <td className="p-3 text-center text-green-600">少</td>
                  <td className="p-3 text-center text-amber-600">中</td>
                  <td className="p-3 text-center text-amber-600">中</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3">達成感</td>
                  <td className="p-3 text-center text-slate-500">低</td>
                  <td className="p-3 text-center text-green-600">高</td>
                  <td className="p-3 text-center font-semibold text-green-600">最高</td>
                </tr>
                <tr>
                  <td className="p-3">実装コスト</td>
                  <td className="p-3 text-center text-green-600">低</td>
                  <td className="p-3 text-center text-amber-600">中</td>
                  <td className="p-3 text-center text-amber-600">中</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-xl bg-indigo-50 p-4">
            <p className="font-semibold text-indigo-800">推奨: Pattern B（ステップ型）</p>
            <p className="mt-1 text-sm text-indigo-700">
              認知負荷が低く、完了率が高い。Airbnbの予約フローと同じアプローチ。
              ユーザーは「次へ」を押すだけで思考が整理されていく体験。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareSubmitPatterns;
