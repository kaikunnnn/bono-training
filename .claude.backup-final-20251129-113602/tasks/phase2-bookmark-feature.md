# フェーズ2: ブックマーク機能 - 詳細実装計画

## 📋 概要

- **目的**: ユーザーが記事をお気に入り登録・解除できる機能を実装
- **所要時間**: 1日（2-3時間の作業）
- **前提条件**: フェーズ1完了（`article_bookmarks` テーブルが存在）

---

## 🎯 このフェーズで実装するもの

### 1. サービス層
- `src/services/bookmarks.ts` を作成
- ブックマークの追加/削除/確認機能

### 2. UI実装
- ArticleDetailページにブックマークボタン追加
- トースト通知の実装

### 3. サブスクリプション連携
- 有料記事のブックマークは有料プラン限定
- フリープランユーザーへの適切なメッセージ表示

---

## 🧩 ユーザー体験（再確認）

1. ユーザーが記事を読んでいて「これは重要だな」と思ったら、ヘッダーの⭐アイコンをクリック
2. 「ブックマークに追加しました」というトースト通知が表示される
3. 後日、マイページの「ブックマーク」セクションからすぐにその記事に戻れる
4. もう一度⭐をクリックすればブックマークを解除できる
5. 有料記事の場合、フリープランユーザーには「プラン登録が必要」と表示

---

## 📝 ステップバイステップ実装手順

### ステップ1: サービス層の実装

**ファイル**: `src/services/bookmarks.ts`

#### 実装する関数

1. **`toggleBookmark()`**: ブックマークの追加/削除をトグル
2. **`getBookmarks()`**: ユーザーのブックマーク一覧を取得
3. **`isBookmarked()`**: 記事がブックマーク済みかチェック

#### 実装内容

```typescript
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

/**
 * 記事をブックマーク/解除する
 * @param articleId 記事ID (Sanity article._id)
 * @param isPremium 記事がプレミアムかどうか
 * @returns {success: boolean, isBookmarked: boolean}
 */
export async function toggleBookmark(
  articleId: string,
  isPremium: boolean = false
): Promise<{ success: boolean; isBookmarked: boolean }> {
  try {
    // 1. 認証チェック
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: 'ログインが必要です',
        description: 'ブックマークするにはログインしてください',
        variant: 'destructive',
      });
      return { success: false, isBookmarked: false };
    }

    // 2. プレミアム記事の場合、サブスクリプションチェック
    if (isPremium) {
      // TODO: サブスクリプション状態を確認
      // フェーズ6で実装するので、今は警告のみ
      console.warn('Premium article bookmark - subscription check required');
    }

    // 3. 既存のブックマークを確認
    const { data: existing } = await supabase
      .from('article_bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .eq('article_id', articleId)
      .single();

    if (existing) {
      // 既にブックマーク済み → 削除
      const { error } = await supabase
        .from('article_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', articleId);

      if (error) throw error;

      toast({
        title: 'ブックマークを解除しました',
        description: 'お気に入りから削除されました',
      });
      return { success: true, isBookmarked: false };
    } else {
      // ブックマークされていない → 追加
      const { error } = await supabase
        .from('article_bookmarks')
        .insert({
          user_id: user.id,
          article_id: articleId,
        });

      if (error) throw error;

      toast({
        title: 'ブックマークに追加しました',
        description: 'マイページから確認できます',
      });
      return { success: true, isBookmarked: true };
    }
  } catch (error) {
    console.error('Bookmark error:', error);
    toast({
      title: 'エラーが発生しました',
      description: 'もう一度お試しください',
      variant: 'destructive',
    });
    return { success: false, isBookmarked: false };
  }
}

/**
 * 記事がブックマーク済みかチェック
 * @param articleId 記事ID
 * @returns boolean
 */
export async function isBookmarked(articleId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('article_bookmarks')
      .select('article_id')
      .eq('user_id', user.id)
      .eq('article_id', articleId)
      .single();

    return !!data;
  } catch (error) {
    return false;
  }
}

/**
 * ユーザーのブックマーク一覧を取得
 * @returns ブックマークした記事ID一覧
 */
export async function getBookmarks(): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('article_bookmarks')
      .select('article_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(b => b.article_id) || [];
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return [];
  }
}
```

---

### ステップ2: ArticleDetailページへの統合

**ファイル**: `src/pages/ArticleDetail.tsx`

#### 実装内容

1. **ブックマーク状態の管理**
   - `useState` でブックマーク状態を保持
   - `useEffect` でページ読み込み時にブックマーク状態を取得

2. **ブックマークボタンの追加**
   - ヘッダー部分に⭐アイコンを配置
   - クリック時に `toggleBookmark()` を呼び出し
   - 状態に応じてアイコンを切り替え（塗りつぶし/白抜き）

3. **実装箇所**
   - ヘッダーの右上（記事タイトルの横）にボタンを配置
   - レスポンシブ対応（モバイルでも表示）

#### 実装コード（追加部分）

```typescript
import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { toggleBookmark, isBookmarked } from '@/services/bookmarks';

// ArticleDetail コンポーネント内
const [bookmarked, setBookmarked] = useState(false);
const [bookmarkLoading, setBookmarkLoading] = useState(false);

// ブックマーク状態の初期化
useEffect(() => {
  const checkBookmark = async () => {
    if (article?._id) {
      const result = await isBookmarked(article._id);
      setBookmarked(result);
    }
  };
  checkBookmark();
}, [article?._id]);

// ブックマークトグル処理
const handleBookmarkToggle = async () => {
  if (!article) return;

  setBookmarkLoading(true);
  const result = await toggleBookmark(article._id, article.isPremium);

  if (result.success) {
    setBookmarked(result.isBookmarked);
  }
  setBookmarkLoading(false);
};

// JSX内（ヘッダー部分）
<button
  onClick={handleBookmarkToggle}
  disabled={bookmarkLoading}
  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
  aria-label={bookmarked ? 'ブックマークを解除' : 'ブックマークに追加'}
>
  <Star
    className={`w-6 h-6 transition-colors ${
      bookmarked
        ? 'fill-yellow-400 stroke-yellow-400'
        : 'stroke-gray-400'
    }`}
  />
</button>
```

---

### ステップ3: UIコンポーネントの作成（オプション）

**ファイル**: `src/components/article/BookmarkButton.tsx`

再利用可能なブックマークボタンコンポーネントを作成（オプション）

```typescript
import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { toggleBookmark, isBookmarked } from '@/services/bookmarks';
import { Button } from '@/components/ui/button';

interface BookmarkButtonProps {
  articleId: string;
  isPremium?: boolean;
  variant?: 'icon' | 'text';
  className?: string;
}

export default function BookmarkButton({
  articleId,
  isPremium = false,
  variant = 'icon',
  className = '',
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkBookmark = async () => {
      const result = await isBookmarked(articleId);
      setBookmarked(result);
    };
    checkBookmark();
  }, [articleId]);

  const handleToggle = async () => {
    setLoading(true);
    const result = await toggleBookmark(articleId, isPremium);
    if (result.success) {
      setBookmarked(result.isBookmarked);
    }
    setLoading(false);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
        aria-label={bookmarked ? 'ブックマークを解除' : 'ブックマークに追加'}
      >
        <Star
          className={`w-6 h-6 transition-colors ${
            bookmarked
              ? 'fill-yellow-400 stroke-yellow-400'
              : 'stroke-gray-400'
          }`}
        />
      </button>
    );
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={loading}
      variant={bookmarked ? 'default' : 'outline'}
      className={className}
    >
      <Star
        className={`w-4 h-4 mr-2 ${
          bookmarked ? 'fill-yellow-400' : ''
        }`}
      />
      {bookmarked ? 'ブックマーク済み' : 'ブックマークする'}
    </Button>
  );
}
```

---

### ステップ4: テスト

#### 手動テスト項目

1. **ブックマーク追加**
   - [ ] 記事ページでブックマークボタンをクリック
   - [ ] トースト通知「ブックマークに追加しました」が表示される
   - [ ] アイコンが塗りつぶし（黄色）になる
   - [ ] Supabase Dashboardで `article_bookmarks` テーブルに行が追加される

2. **ブックマーク解除**
   - [ ] 同じボタンをもう一度クリック
   - [ ] トースト通知「ブックマークを解除しました」が表示される
   - [ ] アイコンが白抜きになる
   - [ ] Supabase Dashboardで行が削除される

3. **ページリロード**
   - [ ] ブックマーク済みの記事をリロード
   - [ ] アイコンが塗りつぶし状態で表示される

4. **未ログイン状態**
   - [ ] ログアウトしてからブックマークボタンをクリック
   - [ ] 「ログインが必要です」というトースト通知が表示される

5. **複数記事**
   - [ ] 異なる記事を複数ブックマーク
   - [ ] それぞれ独立して動作する

#### テストデータ確認

Supabase DashboardのSQL Editorで実行：

```sql
-- 自分のブックマークを確認
SELECT * FROM article_bookmarks
WHERE user_id = '61b109da-117d-44aa-a2db-21d8838405c1'
ORDER BY created_at DESC;
```

---

## 🎨 デザイン仕様

### ブックマークボタンの配置

**ArticleDetailページ**:
```
┌─────────────────────────────────────────┐
│ [← 戻る]              [⭐ ブックマーク] │ ← ヘッダー
│                                         │
│ 記事タイトル                            │
│ Quest 1 - レッスンタイトル              │
├─────────────────────────────────────────┤
│                                         │
│ [動画プレーヤー]                        │
│                                         │
└─────────────────────────────────────────┘
```

### アイコンの状態

- **未ブックマーク**: ☆（白抜き、グレー）
- **ブックマーク済み**: ★（塗りつぶし、黄色）
- **ローディング**: 薄いグレー、クリック不可

### トースト通知

- **追加成功**: 緑色の背景、✓アイコン
- **削除成功**: 青色の背景、情報アイコン
- **エラー**: 赤色の背景、⚠アイコン

---

## 🔧 実装の優先順位

### 必須機能
1. ✅ `toggleBookmark()` 関数
2. ✅ `isBookmarked()` 関数
3. ✅ ArticleDetailページへのボタン追加
4. ✅ トースト通知

### 推奨機能
5. ✅ `getBookmarks()` 関数（マイページで使用）
6. ✅ BookmarkButtonコンポーネント（再利用可能）

### オプション機能
7. ⏳ サブスクリプション連携（フェーズ6で実装）
8. ⏳ ローディングアニメーション

---

## 📦 ファイル構成

実装後のファイル構成：

```
src/
├── services/
│   └── bookmarks.ts              # 新規作成 ⭐
├── components/
│   └── article/
│       └── BookmarkButton.tsx    # 新規作成（オプション）
└── pages/
    └── ArticleDetail.tsx         # 更新
```

---

## ✅ 完了チェックリスト

- [ ] `src/services/bookmarks.ts` を作成
- [ ] `toggleBookmark()` 関数を実装
- [ ] `isBookmarked()` 関数を実装
- [ ] `getBookmarks()` 関数を実装
- [ ] ArticleDetailページにブックマークボタンを追加
- [ ] ブックマーク状態の管理を実装
- [ ] トースト通知を実装
- [ ] 手動テストを実施
- [ ] コミット

---

## 🎉 フェーズ2完了後の状態

- ✅ ユーザーが記事をブックマークできる
- ✅ ブックマーク済みの記事が視覚的にわかる
- ✅ ブックマークの追加/削除がスムーズに動作
- ✅ 適切なフィードバック（トースト通知）
- ⏳ マイページでのブックマーク表示（フェーズ5で実装）
- ⏳ サブスクリプション連携（フェーズ6で実装）

**次のステップ**: フェーズ3の記事進捗管理に進みます！

---

## 📚 参考情報

### Supabase クエリ例

```typescript
// ブックマーク追加
await supabase.from('article_bookmarks').insert({ user_id, article_id });

// ブックマーク削除
await supabase.from('article_bookmarks').delete()
  .eq('user_id', userId)
  .eq('article_id', articleId);

// ブックマーク確認
await supabase.from('article_bookmarks')
  .select('*')
  .eq('user_id', userId)
  .eq('article_id', articleId)
  .single();
```

### Lucide-react アイコン

```tsx
import { Star } from 'lucide-react';

// 白抜き
<Star className="w-6 h-6 stroke-gray-400" />

// 塗りつぶし
<Star className="w-6 h-6 fill-yellow-400 stroke-yellow-400" />
```
