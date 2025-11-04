# フェーズ 5: レッスン進捗管理と可視化 - 詳細実装計画

## 📋 概要

- **目的**: レッスンの進捗状況を計算し、各所で可視化する
- **所要時間**: 2-3 時間
- **前提条件**: フェーズ 4 完了（記事完了機能が実装済み）

---

## 🎯 このフェーズで実装するもの

### 1. レッスン進捗計算機能

- `src/services/progress.ts` に機能追加
- レッスン内の完了記事数/全記事数を取得
- 進捗パーセンテージを計算

### 2. サイドナビでの完了マーク

- ArticleSideNav コンポーネントを更新
- 完了済み記事にチェックマークを表示
- 進捗バーを表示（オプション）

### 3. マイページでの進捗表示

- 進行中のレッスン一覧を表示
- 各レッスンの進捗状況を視覚化
- 完了したレッスンと未完了のレッスンを分けて表示

---

## 🧩 ユーザー体験

### シナリオ 1: サイドナビでの進捗確認

1. ユーザーが記事詳細ページを開く
2. サイドナビに記事一覧が表示される
3. 完了済み記事には**緑のチェックマーク ✓** が付いている
4. 現在見ている記事は強調表示される
5. 上部に進捗バー「3/5 完了」が表示される

### シナリオ 2: マイページでの進捗確認

1. ユーザーがマイページを開く
2. 「進行中のレッスン」セクションが表示される
3. 各レッスンカードに進捗バー（例: 60% 完了）が表示される
4. レッスンをクリックするとレッスン詳細ページに遷移
5. 完了したレッスンは別セクション「完了したレッスン」に表示される

---

## 📝 ステップバイステップ実装手順

### ステップ 1: 進捗計算機能の追加

**ファイル**: `src/services/progress.ts` に追加

```typescript
/**
 * レッスンの進捗情報
 */
export interface LessonProgress {
  lessonId: string;
  totalArticles: number;
  completedArticles: number;
  percentage: number; // 0-100
  completedArticleIds: string[];
}

/**
 * レッスンの進捗状況を取得
 * @param lessonId レッスンID
 * @param articleIds そのレッスンに含まれる全記事ID
 * @returns レッスンの進捗情報
 */
export async function getLessonProgress(
  lessonId: string,
  articleIds: string[]
): Promise<LessonProgress> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || articleIds.length === 0) {
      return {
        lessonId,
        totalArticles: articleIds.length,
        completedArticles: 0,
        percentage: 0,
        completedArticleIds: [],
      };
    }

    // そのレッスンの記事で完了しているものを取得
    const { data } = await supabase
      .from("article_progress")
      .select("article_id")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .eq("status", "completed")
      .in("article_id", articleIds);

    const completedArticleIds = data?.map((item) => item.article_id) || [];
    const completedCount = completedArticleIds.length;
    const percentage = Math.round((completedCount / articleIds.length) * 100);

    return {
      lessonId,
      totalArticles: articleIds.length,
      completedArticles: completedCount,
      percentage,
      completedArticleIds,
    };
  } catch (error) {
    console.error("Get lesson progress error:", error);
    return {
      lessonId,
      totalArticles: articleIds.length,
      completedArticles: 0,
      percentage: 0,
      completedArticleIds: [],
    };
  }
}

/**
 * 複数のレッスンの進捗を一括取得
 * @param lessons レッスン情報の配列 { lessonId, articleIds }
 * @returns レッスン進捗のマップ
 */
export async function getMultipleLessonProgress(
  lessons: Array<{ lessonId: string; articleIds: string[] }>
): Promise<Record<string, LessonProgress>> {
  const progressMap: Record<string, LessonProgress> = {};

  await Promise.all(
    lessons.map(async (lesson) => {
      const progress = await getLessonProgress(
        lesson.lessonId,
        lesson.articleIds
      );
      progressMap[lesson.lessonId] = progress;
    })
  );

  return progressMap;
}

/**
 * 記事IDが完了済みかどうかをチェック
 * @param articleId 記事ID
 * @returns 完了済みならtrue
 */
export async function isArticleCompleted(articleId: string): Promise<boolean> {
  const status = await getArticleProgress(articleId);
  return status === "completed";
}
```

---

### ステップ 2: サイドナビに完了マークを表示

**ファイル**: `src/components/article/sidebar/ArticleSideNav.tsx`

#### 変更点

1. **進捗状態を取得**:

```typescript
const [completedArticleIds, setCompletedArticleIds] = useState<string[]>([]);
const [progress, setProgress] = useState<LessonProgress | null>(null);

useEffect(() => {
  const fetchProgress = async () => {
    if (!article.lessonInfo?._id || !article.questInfo?.articles) return;

    const articleIds = article.questInfo.articles.map((a) => a._id);
    const lessonProgress = await getLessonProgress(
      article.lessonInfo._id,
      articleIds
    );

    setProgress(lessonProgress);
    setCompletedArticleIds(lessonProgress.completedArticleIds);
  };

  fetchProgress();
}, [article.lessonInfo?._id, article.questInfo?.articles]);
```

2. **進捗バーを追加** (クエスト情報の下):

```tsx
{
  /* Progress Bar */
}
{
  progress && (
    <div className="px-6 py-3 border-b border-gray-200">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-600">進捗</span>
        <span className="font-bold text-gray-900">
          {progress.completedArticles}/{progress.totalArticles}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
    </div>
  );
}
```

3. **記事リストにチェックマークを表示**:

```tsx
{
  questInfo.articles.map((a) => {
    const isActive = a._id === currentArticleId;
    const isCompleted = completedArticleIds.includes(a._id);

    return (
      <Link
        key={a._id}
        to={`/articles/${a.slug.current}`}
        className={`flex items-center gap-3 px-6 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
          isActive ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
        }`}
      >
        {/* Check Mark */}
        {isCompleted && (
          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
        )}
        {!isCompleted && (
          <div className="w-5 h-5 flex-shrink-0" /> // Spacer
        )}

        {/* Article Number & Title */}
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 mb-1">
            ステップ{a.articleNumber}
          </div>
          <div
            className={`text-sm font-medium ${
              isActive ? "text-blue-700" : "text-gray-900"
            } line-clamp-2`}
          >
            {a.title}
          </div>
        </div>
      </Link>
    );
  });
}
```

---

### ステップ 3: マイページに進捗を表示

**ファイル**: `src/pages/MyPage.tsx`

#### 変更点

1. **進行中のレッスンを取得する関数を作成**:

まず、Sanity から進行中のレッスン情報を取得する必要があります。

**新規ファイル**: `src/services/lessons.ts`

```typescript
import { client } from "@/lib/sanity";
import type { Lesson } from "@/types/sanity";

export interface LessonWithArticles extends Lesson {
  articleIds: string[];
  questCount: number;
}

/**
 * すべてのレッスンと記事IDを取得
 */
export async function getAllLessonsWithArticles(): Promise<
  LessonWithArticles[]
> {
  const query = `*[_type == "lesson"] | order(lessonNumber asc) {
    _id,
    _type,
    title,
    slug,
    description,
    lessonNumber,
    coverImage,
    tags,
    isPremium,
    "articleIds": *[_type == "article" && references(^._id)]._id,
    "questCount": count(*[_type == "quest" && references(^._id)])
  }`;

  const lessons = await client.fetch<LessonWithArticles[]>(query);
  return lessons;
}
```

2. **MyPage で進行中のレッスンを表示**:

```tsx
import {
  getAllLessonsWithArticles,
  type LessonWithArticles,
} from "@/services/lessons";
import {
  getMultipleLessonProgress,
  type LessonProgress,
} from "@/services/progress";

export default function MyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>([]);
  const [lessons, setLessons] = useState<LessonWithArticles[]>([]);
  const [progressMap, setProgressMap] = useState<
    Record<string, LessonProgress>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      // ブックマークを取得
      const articles = await getBookmarkedArticles();
      setBookmarks(articles);

      // レッスン一覧を取得
      const allLessons = await getAllLessonsWithArticles();
      setLessons(allLessons);

      // 各レッスンの進捗を取得
      const lessonData = allLessons.map((lesson) => ({
        lessonId: lesson._id,
        articleIds: lesson.articleIds,
      }));
      const progress = await getMultipleLessonProgress(lessonData);
      setProgressMap(progress);

      setLoading(false);
    };

    fetchData();
  }, [user, navigate]);

  // 進行中のレッスン（0% < 進捗 < 100%）
  const inProgressLessons = lessons.filter((lesson) => {
    const progress = progressMap[lesson._id];
    return progress && progress.percentage > 0 && progress.percentage < 100;
  });

  // 完了したレッスン（進捗 = 100%）
  const completedLessons = lessons.filter((lesson) => {
    const progress = progressMap[lesson._id];
    return progress && progress.percentage === 100;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">マイページ</h1>
            <Link
              to="/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <User className="w-5 h-5" />
              <span>プロフィール</span>
            </Link>
          </div>
          <p className="text-gray-600">
            学習の進捗とブックマークを確認できます
          </p>
        </div>

        {/* 進行中のレッスン */}
        {inProgressLessons.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">進行中のレッスン</h2>
            <div className="space-y-4">
              {inProgressLessons.map((lesson) => {
                const progress = progressMap[lesson._id];
                return (
                  <LessonProgressCard
                    key={lesson._id}
                    lesson={lesson}
                    progress={progress}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ブックマーク一覧 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            ブックマーク（{bookmarks.length}件）
          </h2>
          <BookmarkList
            articles={bookmarks}
            emptyMessage="ブックマークした記事がありません"
            emptyLink={{ href: "/lessons", label: "レッスンを見る" }}
            onRemoveBookmark={handleRemoveBookmark}
          />
        </div>

        {/* 完了したレッスン */}
        {completedLessons.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">完了したレッスン</h2>
            <div className="space-y-4">
              {completedLessons.map((lesson) => {
                const progress = progressMap[lesson._id];
                return (
                  <LessonProgressCard
                    key={lesson._id}
                    lesson={lesson}
                    progress={progress}
                    isCompleted
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
```

3. **LessonProgressCard コンポーネントを作成**:

**新規ファイル**: `src/components/ui/lesson-progress-card.tsx`

```tsx
import * as React from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { urlFor } from "@/lib/sanity";
import type { LessonWithArticles } from "@/services/lessons";
import type { LessonProgress } from "@/services/progress";

interface LessonProgressCardProps extends React.HTMLAttributes<HTMLDivElement> {
  lesson: LessonWithArticles;
  progress: LessonProgress;
  isCompleted?: boolean;
}

const LessonProgressCard = React.forwardRef<
  HTMLDivElement,
  LessonProgressCardProps
>(({ className, lesson, progress, isCompleted = false, ...props }, ref) => {
  const thumbnailUrl = lesson.coverImage
    ? urlFor(lesson.coverImage).width(120).height(120).url()
    : "/placeholder-lesson.png";

  return (
    <Link to={`/lessons/${lesson.slug.current}`}>
      <div
        ref={ref}
        className={cn(
          "flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all",
          isCompleted && "bg-green-50 border-green-200",
          className
        )}
        {...props}
      >
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-[120px] h-[120px] bg-gray-200 rounded overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={lesson.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
            {lesson.title}
          </h3>

          {/* Description */}
          {lesson.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {lesson.description}
            </p>
          )}

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">進捗</span>
              <span className="font-bold text-gray-900">
                {progress.completedArticles}/{progress.totalArticles} 記事完了
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCompleted ? "bg-green-500" : "bg-blue-500"
                }`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{lesson.questCount} クエスト</span>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>完了</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});
LessonProgressCard.displayName = "LessonProgressCard";

export { LessonProgressCard };
```

---

## ✅ 完了チェックリスト

- [ ] `src/services/progress.ts` に機能追加
  - [ ] `getLessonProgress()` を実装
  - [ ] `getMultipleLessonProgress()` を実装
  - [ ] `isArticleCompleted()` を実装
- [ ] `src/services/lessons.ts` を作成
  - [ ] `getAllLessonsWithArticles()` を実装
- [ ] ArticleSideNav を更新
  - [ ] 進捗状態を取得
  - [ ] 進捗バーを表示
  - [ ] 完了済み記事にチェックマークを表示
- [ ] `src/components/ui/lesson-progress-card.tsx` を作成
- [ ] MyPage を更新
  - [ ] レッスン進捗を取得
  - [ ] 進行中のレッスンを表示
  - [ ] 完了したレッスンを表示
- [ ] 手動テストを実施
  - [ ] サイドナビで完了マークが表示される
  - [ ] サイドナビで進捗バーが表示される
  - [ ] マイページで進行中のレッスンが表示される
  - [ ] 記事を完了すると進捗が更新される
- [ ] コミット

---

## 🎨 デザイン仕様

### サイドナビの進捗バー

```
┌────────────────────────────┐
│ 進捗        3/5            │
│ ████████░░░░ 60%           │
└────────────────────────────┘
```

### 記事リストのチェックマーク

```
✓ ステップ1
  記事タイトル...

  ステップ2
  記事タイトル...  ← 未完了（チェックなし）

✓ ステップ3
  記事タイトル...
```

### レッスン進捗カード

```
┌────────────────────────────────────────┐
│ [画像]  レッスンタイトル               │
│         説明文...                      │
│         進捗  3/5 記事完了             │
│         ████████░░░░ 60%               │
│         📚 5 クエスト                  │
└────────────────────────────────────────┘
```

---

## 🎉 フェーズ 5 完了後の状態

- ✅ 記事を完了状態にできる（フェーズ 4）
- ✅ サイドナビで完了マークが表示される
- ✅ サイドナビで進捗バーが表示される
- ✅ マイページでレッスンの進捗が確認できる
- ✅ 進行中/完了したレッスンが分けて表示される
- ⏳ サブスクリプション連携（フェーズ 6 で実装）

**次のステップ**: フェーズ 6 のサブスクリプション統合に進みます！
