import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  Sparkles,
  FileText,
  ExternalLink,
  UserPlus,
} from "lucide-react";

// カテゴリの選択肢
const CATEGORY_OPTIONS = [
  {
    value: "notice",
    label: "Notice（気づき・変化）",
    description: "自分の考え方やデザインがどう変わったかが書かれている",
  },
  {
    value: "before-after",
    label: "Before/After（修正過程）",
    description: "成果物を気づきを得て自ら修正した過程が伝わる",
  },
  {
    value: "why",
    label: "Why（なぜそうしたか）",
    description: "なぜそうしたかを自分の言葉で説明している",
  },
];

// フォームの状態
interface FormData {
  authorName: string;
  articleUrl: string;
  mainPoint: string;
  categories: string[];
  bonoContent: string;
}

// 完了画面
const SuccessScreen = ({ onNewSubmission }: { onNewSubmission: () => void }) => (
  <Card className="mx-auto max-w-lg">
    <CardContent className="pt-8 text-center">
      <div className="mb-6 flex justify-center">
        <div className="rounded-full bg-green-100 p-4">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
      </div>
      <h2 className="mb-2 text-xl font-bold text-slate-900">
        記事を提出しました！
      </h2>
      <p className="mb-6 text-slate-600">
        あなたの思考の軌跡を共有してくれてありがとうございます。
      </p>

      <div className="mb-8 rounded-xl bg-slate-50 p-4 text-left text-sm">
        <div className="mb-3 flex items-center gap-2 font-semibold text-slate-700">
          <FileText className="h-4 w-4" />
          判定について
        </div>
        <ul className="space-y-2 text-slate-600">
          <li>・判定結果はコミュニティSlackでお伝えします</li>
          <li>・通常3営業日以内にご連絡します</li>
        </ul>

        <div className="my-4 border-t border-slate-200" />

        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-slate-700">パスした場合</span>
        </div>
        <p className="mb-3 text-slate-600">
          フィードバック権利が付与されます
        </p>

        <div className="mb-2 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-amber-600" />
          <span className="font-semibold text-slate-700">改善点がある場合</span>
        </div>
        <p className="text-slate-600">
          Slackで具体的にお伝えします。修正の参考にしてください
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="outline" asChild>
          <Link to="/share">みんなの記事を見る</Link>
        </Button>
        <Button onClick={onNewSubmission}>もう1つ提出する</Button>
      </div>
    </CardContent>
  </Card>
);

// 会員登録を促すCTA
const MembershipCTA = ({ isLoggedIn }: { isLoggedIn: boolean }) => (
  <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-6 text-center">
    <div className="mb-3 flex justify-center">
      <div className="rounded-full bg-indigo-100 p-3">
        {isLoggedIn ? (
          <Sparkles className="h-6 w-6 text-indigo-600" />
        ) : (
          <UserPlus className="h-6 w-6 text-indigo-600" />
        )}
      </div>
    </div>
    <h3 className="mb-2 font-semibold text-slate-900">
      {isLoggedIn ? "有料会員になると記事を提出できます" : "会員登録して記事を提出"}
    </h3>
    <p className="mb-4 text-sm text-slate-600">
      {isLoggedIn
        ? "記事提出 → プロからのフィードバックで成長を加速しましょう"
        : "BONOに参加して、プロからフィードバックを受けましょう"}
    </p>
    <Button asChild>
      <Link to={isLoggedIn ? "/subscription" : "/login"} state={{ from: "/share/submit" }}>
        {isLoggedIn ? "プランを確認する" : "ログイン / 新規登録"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  </div>
);

const ShareSubmit = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { hasMemberAccess, loading: subLoading } = useSubscriptionContext();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    authorName: "",
    articleUrl: "",
    mainPoint: "",
    categories: [],
    bonoContent: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const currentUserName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "";

  // 会員かどうか（全有料プラン: standard, growth, communityが対象）
  const canSubmit = user && hasMemberAccess;

  // フォーム初期化
  useEffect(() => {
    if (currentUserName && !formData.authorName) {
      setFormData((prev) => ({ ...prev, authorName: currentUserName }));
    }
  }, [currentUserName]);

  const handleCategoryToggle = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(value)
        ? prev.categories.filter((c) => c !== value)
        : [...prev.categories, value],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.authorName.trim()) {
      newErrors.authorName = "名前を入力してください";
    }
    if (!formData.articleUrl.trim()) {
      newErrors.articleUrl = "記事URLを入力してください";
    } else if (!formData.articleUrl.match(/^https?:\/\/.+/)) {
      newErrors.articleUrl = "有効なURLを入力してください";
    }
    if (!formData.mainPoint.trim()) {
      newErrors.mainPoint = "伝えたいことを入力してください";
    } else if (formData.mainPoint.length > 140) {
      newErrors.mainPoint = "140文字以内で入力してください";
    }
    if (formData.categories.length === 0) {
      newErrors.categories = "少なくとも1つ選択してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 会員チェック
    if (!user) {
      navigate("/login", { state: { from: "/share/submit" } });
      return;
    }
    if (!hasMemberAccess) {
      navigate("/subscription");
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Supabaseセッショントークンを取得
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch("/api/share/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...formData,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "送信に失敗しました");
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Submit error:", error);
      alert(error instanceof Error ? error.message : "送信に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewSubmission = () => {
    setSubmitted(false);
    setFormData({
      authorName: currentUserName,
      articleUrl: "",
      mainPoint: "",
      categories: [],
      bonoContent: "",
    });
  };

  // ローディング中（認証情報のみ待つ、会員情報はオプショナル）
  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </div>
      </Layout>
    );
  }

  // 提出完了
  if (submitted) {
    return (
      <Layout>
        <div className="container py-8">
          <SuccessScreen onNewSubmission={handleNewSubmission} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/share">
              <ArrowLeft className="mr-2 h-4 w-4" />
              みんなの記事へ
            </Link>
          </Button>

          {/* HERO セクション */}
          <section className="mb-8 text-center">
            <h1 className="mb-3 text-2xl font-bold text-slate-900 sm:text-3xl">
              あなたの"考えた軌跡"を
              <br className="sm:hidden" />
              見せてください
            </h1>
            <p className="text-slate-600">
              BONOで学んだことを実践し、思考の記事を書いて提出すると、
              <br className="hidden sm:block" />
              プロからのフィードバックを受けられます
            </p>
          </section>

          {/* GUIDE セクション */}
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              記事に含めてほしい内容
            </h2>
            <p className="mb-4 text-sm text-slate-600">
              以下のどれか1つでも含まれていればOK！完璧な記事でなくて大丈夫です。
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {CATEGORY_OPTIONS.map((option) => (
                <Card
                  key={option.value}
                  className="border-slate-200 bg-slate-50/50"
                >
                  <CardContent className="p-4">
                    <div className="mb-2 font-semibold text-slate-800">
                      {option.label.split("（")[0]}
                    </div>
                    <p className="text-xs text-slate-600">
                      {option.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* コツ */}
            <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
              <div className="mb-2 flex items-center gap-2 font-semibold text-indigo-700">
                <HelpCircle className="h-4 w-4" />
                コツ
              </div>
              <ul className="space-y-1 text-sm text-indigo-600">
                <li>・「やったことの羅列」ではなく「何を考えたか」を書く</li>
                <li>・読者が「あなたの思考を追体験できる」ことが大切</li>
                <li>・140字で「一番伝えたいこと」を言語化してから提出</li>
              </ul>
            </div>
          </section>

          {/* 非会員向けCTA（フォームの前に表示） */}
          {!canSubmit && !subLoading && (
            <section className="mb-8">
              <MembershipCTA isLoggedIn={!!user} />
            </section>
          )}

          {/* FORM セクション */}
          <Card className={!canSubmit ? "opacity-60" : ""}>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 名前 */}
                <div className="space-y-2">
                  <Label htmlFor="authorName">
                    名前 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="authorName"
                    value={formData.authorName}
                    onChange={(e) =>
                      setFormData({ ...formData, authorName: e.target.value })
                    }
                    placeholder="Slack表示名と同じもの"
                    disabled={!canSubmit}
                  />
                  {errors.authorName && (
                    <p className="text-sm text-red-500">{errors.authorName}</p>
                  )}
                </div>

                {/* 記事URL */}
                <div className="space-y-2">
                  <Label htmlFor="articleUrl">
                    記事URL <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="articleUrl"
                    type="url"
                    value={formData.articleUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, articleUrl: e.target.value })
                    }
                    placeholder="https://note.com/..."
                    disabled={!canSubmit}
                  />
                  {errors.articleUrl && (
                    <p className="text-sm text-red-500">{errors.articleUrl}</p>
                  )}
                </div>

                {/* 伝えたいこと */}
                <div className="space-y-2">
                  <Label htmlFor="mainPoint">
                    この記事で一番伝えたいこと{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="mainPoint"
                    value={formData.mainPoint}
                    onChange={(e) =>
                      setFormData({ ...formData, mainPoint: e.target.value })
                    }
                    placeholder="この記事で読者に伝えたいことを140文字以内で..."
                    rows={3}
                    maxLength={140}
                    disabled={!canSubmit}
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>
                      {errors.mainPoint && (
                        <span className="text-red-500">{errors.mainPoint}</span>
                      )}
                    </span>
                    <span>{formData.mainPoint.length}/140</span>
                  </div>
                </div>

                {/* カテゴリ選択 */}
                <div className="space-y-3">
                  <Label>
                    どの項目に該当しますか？{" "}
                    <span className="text-red-500">*</span>
                    <span className="ml-2 text-xs font-normal text-slate-500">（複数選択OK）</span>
                  </Label>
                  <div className="space-y-2">
                    {CATEGORY_OPTIONS.map((option) => {
                      const isSelected = formData.categories.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                            !canSubmit
                              ? "cursor-not-allowed opacity-60"
                              : "cursor-pointer hover:border-slate-300"
                          } ${
                            isSelected
                              ? "border-indigo-400 bg-indigo-50 ring-1 ring-indigo-400"
                              : "border-slate-200"
                          }`}
                          onClick={() => canSubmit && handleCategoryToggle(option.value)}
                          disabled={!canSubmit}
                        >
                          <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-600"
                              : "border-slate-300 bg-white"
                          }`}>
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">
                              {option.label}
                            </div>
                            <p className="text-sm text-slate-500">
                              {option.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {errors.categories && (
                    <p className="text-sm text-red-500">{errors.categories}</p>
                  )}
                </div>

                {/* 使ったBONOコンテンツ */}
                <div className="space-y-2">
                  <Label htmlFor="bonoContent">
                    主に使ったBONOコンテンツ（任意）
                  </Label>
                  <Input
                    id="bonoContent"
                    value={formData.bonoContent}
                    onChange={(e) =>
                      setFormData({ ...formData, bonoContent: e.target.value })
                    }
                    placeholder="例：UIビジュアル基礎、UIデザインの法則..."
                    disabled={!canSubmit}
                  />
                </div>

                {/* 送信ボタン */}
                <div className="flex gap-3 pt-4">
                  {canSubmit ? (
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          送信中...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          記事を提出する
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="flex-1"
                      variant="secondary"
                      onClick={() => {
                        if (!user) {
                          navigate("/login", { state: { from: "/share/submit" } });
                        } else {
                          navigate("/subscription");
                        }
                      }}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      {user ? "会員になって提出する" : "ログインして提出する"}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* OK事例へのリンク */}
          <div className="mt-6 text-center">
            <Button variant="link" asChild className="text-slate-500">
              <Link to="/share" className="flex items-center gap-1">
                <ExternalLink className="h-4 w-4" />
                OK事例を見る
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShareSubmit;
