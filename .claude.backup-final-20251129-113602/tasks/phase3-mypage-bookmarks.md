# フェーズ3: マイページ - ブックマーク一覧表示

## 📋 概要

- **目的**: ユーザーがブックマークした記事を一覧表示する専用ページを実装
- **URL**: `/mypage`
- **所要時間**: 3-4時間

---

## 🎯 このフェーズで実装するもの

### 1. マイページの作成
- `/mypage` ページを新規作成
- ログイン必須（未ログイン時は `/auth` にリダイレクト）
- プロフィールページ (`/profile`) への導線を追加

### 2. ブックマーク一覧表示
- ユーザーのブックマーク済み記事をリスト形式で表示
- Supabaseから記事IDを取得 → SanityでArticle情報を取得
- 表示項目:
  - サムネイル画像
  - 記事タイトル
  - 所属レッスン名
  - 推定時間（分）

### 3. ナビゲーションの更新
- Sidebarの「マイページ」リンクを `/profile` → `/mypage` に変更

---

## 🧩 ユーザー体験

1. ユーザーがSidebarの「マイページ」をクリック
2. `/mypage` に遷移
3. ページ上部にプロフィールへのリンクが表示される
4. ブックマーク一覧がリスト形式で表示される
   - サムネイル、タイトル、レッスン名、推定時間
5. 記事をクリックすると詳細ページに遷移
6. ブックマークがない場合は「ブックマークがありません」と表示

---

## 📝 ステップバイステップ実装手順

### ステップ1: Sidebarの更新

**ファイル**: `src/components/layout/Sidebar/index.tsx`

**変更箇所**: 54-65行目

```typescript
// 変更前
<SidebarMenuItem
  href={user ? "/profile" : "/auth"}
  icon={...}
  isActive={isActive(user ? "/profile" : "/auth")}
>
  {user ? "マイページ" : "ログイン"}
</SidebarMenuItem>

// 変更後
<SidebarMenuItem
  href={user ? "/mypage" : "/auth"}
  icon={...}
  isActive={isActive(user ? "/mypage" : "/auth")}
>
  {user ? "マイページ" : "ログイン"}
</SidebarMenuItem>
```

---

### ステップ2: ブックマーク記事情報取得サービスの作成

**ファイル**: `src/services/bookmarks.ts`（既存ファイルに追加）

```typescript
import { client } from "@/lib/sanity";
import type { Article } from "@/types/sanity";

/**
 * ブックマークした記事の詳細情報を取得
 * @returns ブックマーク済み記事の配列（Sanityから取得）
 */
export async function getBookmarkedArticles(): Promise<Article[]> {
  try {
    // 1. Supabaseからブックマークした記事IDを取得
    const bookmarkIds = await getBookmarks();

    if (bookmarkIds.length === 0) {
      return [];
    }

    // 2. SanityからArticle情報を取得
    const query = `*[_type == "article" && _id in $ids] {
      _id,
      title,
      slug,
      thumbnail,
      coverImage,
      videoDuration,
      "lessonTitle": *[_type == "lesson" && references(^._id)][0].title,
      "lessonSlug": *[_type == "lesson" && references(^._id)][0].slug.current
    } | order(_createdAt desc)`;

    const articles = await client.fetch(query, { ids: bookmarkIds });
    return articles;
  } catch (error) {
    console.error('Get bookmarked articles error:', error);
    return [];
  }
}
```

---

### ステップ3: ブックマークリストアイテムコンポーネント

**ファイル**: `src/components/mypage/BookmarkListItem.tsx`（新規作成）

```typescript
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { urlFor } from "@/lib/sanity";
import type { Article } from "@/types/sanity";

interface BookmarkListItemProps {
  article: Article & {
    lessonTitle?: string;
    lessonSlug?: string;
  };
}

/**
 * ブックマークリストアイテム
 * リスト形式の1行を表示
 */
export default function BookmarkListItem({ article }: BookmarkListItemProps) {
  const thumbnailUrl = article.thumbnail
    ? urlFor(article.thumbnail).width(160).height(90).url()
    : article.coverImage
    ? urlFor(article.coverImage).width(160).height(90).url()
    : "/placeholder-thumbnail.png";

  const durationMinutes = article.videoDuration
    ? Math.ceil(article.videoDuration / 60)
    : null;

  return (
    <Link
      to={`/articles/${article.slug.current}`}
      className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
    >
      {/* サムネイル */}
      <div className="flex-shrink-0 w-40 h-[90px] bg-gray-200 rounded overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* テキスト情報 */}
      <div className="flex-1 min-w-0">
        {/* レッスン名 */}
        {article.lessonTitle && (
          <p className="text-sm text-gray-600 mb-1">
            {article.lessonTitle}
          </p>
        )}

        {/* タイトル */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {article.title}
        </h3>

        {/* 推定時間 */}
        {durationMinutes && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{durationMinutes}分</span>
          </div>
        )}
      </div>
    </Link>
  );
}
```

---

### ステップ4: マイページの作成

**ファイル**: `src/pages/MyPage.tsx`（新規作成）

```typescript
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import BookmarkListItem from "@/components/mypage/BookmarkListItem";
import { getBookmarkedArticles } from "@/services/bookmarks";
import type { Article } from "@/types/sanity";
import { User } from "lucide-react";

export default function MyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ログインチェック
    if (!user) {
      navigate("/auth");
      return;
    }

    // ブックマーク一覧を取得
    const fetchBookmarks = async () => {
      setLoading(true);
      const articles = await getBookmarkedArticles();
      setBookmarks(articles);
      setLoading(false);
    };

    fetchBookmarks();
  }, [user, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

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
            ブックマークした記事を確認できます
          </p>
        </div>

        {/* ブックマーク一覧 */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            ブックマーク（{bookmarks.length}件）
          </h2>

          {bookmarks.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">
                ブックマークした記事がありません
              </p>
              <Link
                to="/lessons"
                className="text-blue-600 hover:underline"
              >
                レッスンを見る
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((article) => (
                <BookmarkListItem key={article._id} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
```

---

### ステップ5: ルーティングの追加

**ファイル**: `src/App.tsx` または ルーティング設定ファイル

```typescript
import MyPage from "@/pages/MyPage";

// ルート定義に追加
<Route path="/mypage" element={<MyPage />} />
```

---

## ✅ 完了チェックリスト

- [ ] Sidebarの「マイページ」リンクを `/mypage` に変更
- [ ] `getBookmarkedArticles()` 関数を実装
- [ ] `BookmarkListItem` コンポーネントを作成
- [ ] `MyPage` ページを作成
- [ ] ルーティングを追加
- [ ] 手動テストを実施:
  - [ ] ブックマークがない状態で表示確認
  - [ ] ブックマークを追加して一覧に表示されることを確認
  - [ ] 記事をクリックして詳細ページに遷移できることを確認
  - [ ] プロフィールリンクが動作することを確認
- [ ] コミット

---

## 🎨 デザイン仕様

### ブックマークリストアイテム

```
┌────────────────────────────────────────────────────┐
│ ┌──────┐  レッスンタイトル                        │
│ │ サム │  記事タイトル（1-2行）                    │
│ │ネイル│  ⏱ 10分                                  │
│ └──────┘                                           │
└────────────────────────────────────────────────────┘
```

- **サムネイル**: 160px × 90px（16:9）
- **レッスン名**: 14px、グレー
- **記事タイトル**: 18px、Bold、最大2行
- **推定時間**: 14px、グレー、時計アイコン付き
- **ホバー効果**: 背景色をライトグレーに変更

---

## 🔧 実装のポイント

### 1. Sanityクエリでのレッスン情報取得

```groq
*[_type == "lesson" && references(^._id)][0].title
```

このクエリで記事が所属するレッスンの情報を取得できます。

### 2. サムネイル画像のフォールバック

```typescript
const thumbnailUrl = article.thumbnail
  ? urlFor(article.thumbnail).width(160).height(90).url()
  : article.coverImage
  ? urlFor(article.coverImage).width(160).height(90).url()
  : "/placeholder-thumbnail.png";
```

thumbnail → coverImage → placeholder の順で表示します。

### 3. 推定時間の計算

`videoDuration` は秒単位なので、分に変換して表示します。

```typescript
const durationMinutes = article.videoDuration
  ? Math.ceil(article.videoDuration / 60)
  : null;
```

---

## 📚 参考情報

### Sanity References Query
- [GROQ References](https://www.sanity.io/docs/groq-functions#references-6c3e46b7faa5)

### React Router Protected Routes
- [Protected Routes Pattern](https://reactrouter.com/en/main/start/tutorial#protected-routes)

---

## 🎉 フェーズ3完了後の状態

- ✅ マイページ (`/mypage`) が実装された
- ✅ ブックマーク一覧が表示される
- ✅ プロフィールへのリンクが追加された
- ✅ Sidebarから `/mypage` にアクセスできる
- ⏳ 記事の完了機能（フェーズ4で実装）
- ⏳ レッスン進捗表示（フェーズ5で実装）

**次のステップ**: フェーズ4の記事進捗管理（完了ボタン）に進みます！
