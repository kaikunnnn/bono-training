# カテゴリ機能 実装計画

**作成日**: 2025-11-15
**目的**: レッスンをカテゴリ別に表示・管理する機能を実装

---

## 🔍 現状分析

### Sanity スキーマ（lesson.ts:63-73）

```typescript
defineField({
  name: "category",
  title: "カテゴリ",
  type: "string",
  options: {
    list: [
      { title: "情報設計", value: "情報設計" },
      { title: "UI", value: "UI" },
      { title: "UX", value: "UX" },
    ],
  },
}),
```

**現状**:
- ✅ カテゴリフィールドは既に存在
- ✅ ドロップダウンで選択可能（3つのオプション）
- ❌ カテゴリ専用のスキーマはなし（文字列のみ）
- ❌ カテゴリのメタデータ（説明、アイコンなど）なし

### フロントエンド（Lessons.tsx）

**現状**:
- ✅ カテゴリ表示は実装済み（lines 50-52, 67-69）
- ❌ カテゴリフィルタリングなし
- ❌ カテゴリ別ページなし
- ❌ カテゴリ一覧表示なし

### データ取得（useLessons.ts）

**現状**:
- ✅ カテゴリデータはSanityから取得済み（line 100）
- ✅ Webflowのカテゴリも統合済み（line 133）
- ❌ カテゴリフィルタリング機能なし

---

## 📋 要件定義

### 1. カテゴリ一覧の表示

**Where**: レッスン一覧ページ（`/lessons`）の上部

**UI**:
```
┌─────────────────────────────────────────┐
│ レッスン一覧                           │
├─────────────────────────────────────────┤
│ [すべて] [情報設計] [UI] [UX]         │  ← カテゴリタブ
├─────────────────────────────────────────┤
│ [レッスンカード] [レッスンカード] ...  │
└─────────────────────────────────────────┘
```

**機能**:
- カテゴリボタンをクリックで絞り込み
- 「すべて」ボタンでリセット
- 選択中のカテゴリはハイライト
- 各カテゴリのレッスン数を表示（例: 情報設計 (3)）

### 2. カテゴリ別ページ

**URL**: `/lessons/category/:categorySlug`

**例**:
- `/lessons/category/ui`
- `/lessons/category/ux`
- `/lessons/category/infomation-architecture`（情報設計）

**UI**:
```
┌─────────────────────────────────────────┐
│ 情報設計のレッスン                     │
│ [戻る] ← レッスン一覧に戻る            │
├─────────────────────────────────────────┤
│ [レッスンカード] [レッスンカード] ...  │
└─────────────────────────────────────────┘
```

### 3. カテゴリに属するレッスン取得API

**フック**: `useLessonsByCategory(categorySlug: string)`

**機能**:
- 指定カテゴリのレッスンのみ取得
- Sanity + Webflow統合データ
- ソート（新しい順/古い順/タイトル順）

---

## 🎯 実装方針

### Option A: 文字列ベース（シンプル）✅ 推奨

**メリット**:
- 現状のスキーマをそのまま活用
- 実装が簡単
- Webflowとの統合もスムーズ

**デメリット**:
- カテゴリのメタデータ（説明、アイコン）を追加しにくい
- カテゴリスラッグが固定（日本語URLになる可能性）

**実装内容**:
1. カテゴリスラッグのマッピング定義（TypeScript定数）
2. フロントエンドでフィルタリング実装
3. カテゴリ別ページ作成

---

### Option B: カテゴリスキーマ作成（拡張性高）

**メリット**:
- カテゴリごとにメタデータを持てる（説明、アイコン、色など）
- スラッグを自由に設定可能
- 将来的な拡張性が高い

**デメリット**:
- Sanityスキーマの変更が必要
- 既存データのマイグレーション必要
- Webflowインポート時の対応が必要

**実装内容**:
1. `category.ts` スキーマ作成
2. `lesson.ts` のカテゴリフィールドを参照型に変更
3. マイグレーションスクリプト作成
4. フロントエンド実装

---

## 🛠️ 推奨実装プラン（Option A）

### Phase 1: カテゴリ定数とユーティリティ

**目的**: カテゴリのスラッグ変換とメタデータ管理

**1. カテゴリ定義ファイル作成**

`src/constants/categories.ts`:
```typescript
export interface Category {
  value: string;      // Sanityの値（日本語）
  slug: string;       // URL用スラッグ
  label: string;      // 表示名
  description?: string;
  icon?: string;
}

export const CATEGORIES: Category[] = [
  {
    value: "情報設計",
    slug: "information-architecture",
    label: "情報設計",
    description: "情報設計の基礎から実践まで",
  },
  {
    value: "UI",
    slug: "ui",
    label: "UI",
    description: "UIデザインの基本と応用",
  },
  {
    value: "UX",
    slug: "ux",
    label: "UX",
    description: "UX設計の理論と実践",
  },
];

export function getCategoryByValue(value: string): Category | undefined {
  return CATEGORIES.find(c => c.value === value);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find(c => c.slug === slug);
}
```

**成果物**: `src/constants/categories.ts`

---

### Phase 2: カテゴリフィルタリング機能

**目的**: レッスン一覧でカテゴリ絞り込み

**1. useLessonsByCategory フック作成**

`src/hooks/useLessonsByCategory.ts`:
```typescript
import { useMemo } from 'react';
import { useLessons } from './useLessons';
import { getCategoryBySlug } from '@/constants/categories';

export function useLessonsByCategory(categorySlug?: string) {
  const { data: allLessons, isLoading, error } = useLessons();

  const filteredLessons = useMemo(() => {
    if (!allLessons || !categorySlug) return allLessons || [];

    const category = getCategoryBySlug(categorySlug);
    if (!category) return allLessons;

    return allLessons.filter(lesson => lesson.category === category.value);
  }, [allLessons, categorySlug]);

  const category = categorySlug ? getCategoryBySlug(categorySlug) : null;

  return {
    lessons: filteredLessons,
    category,
    isLoading,
    error,
  };
}
```

**2. Lessons.tsx にカテゴリタブ追加**

```tsx
import { useState } from 'react';
import { CATEGORIES } from '@/constants/categories';

export default function Lessons() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: lessons, isLoading, error } = useLessons();

  // フィルタリング
  const filteredLessons = useMemo(() => {
    if (!lessons || !selectedCategory) return lessons || [];
    return lessons.filter(lesson => lesson.category === selectedCategory);
  }, [lessons, selectedCategory]);

  // カテゴリごとのレッスン数
  const categoryCounts = useMemo(() => {
    if (!lessons) return {};
    return lessons.reduce((acc, lesson) => {
      if (lesson.category) {
        acc[lesson.category] = (acc[lesson.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [lessons]);

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">レッスン一覧</h1>

        {/* カテゴリタブ */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            すべて ({lessons?.length || 0})
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded ${selectedCategory === cat.value ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {cat.label} ({categoryCounts[cat.value] || 0})
            </button>
          ))}
        </div>

        {/* レッスン一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map(lesson => (
            // ... existing lesson card
          ))}
        </div>
      </div>
    </Layout>
  );
}
```

**成果物**:
- `src/hooks/useLessonsByCategory.ts`
- `src/pages/Lessons.tsx` 更新

---

### Phase 3: カテゴリ別ページ

**目的**: `/lessons/category/:categorySlug` でカテゴリ専用ページ作成

**1. CategoryLessons ページ作成**

`src/pages/CategoryLessons.tsx`:
```tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useLessonsByCategory } from '@/hooks/useLessonsByCategory';
import Layout from '@/components/layout/Layout';

export default function CategoryLessons() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const { lessons, category, isLoading, error } = useLessonsByCategory(categorySlug);

  if (!category) {
    return (
      <Layout>
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">カテゴリが見つかりません</h1>
          <button onClick={() => navigate('/lessons')}>レッスン一覧に戻る</button>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">{category.label}のレッスン</h1>
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <button onClick={() => navigate('/lessons')} className="mb-4">
          ← レッスン一覧に戻る
        </button>
        <h1 className="text-2xl font-bold mb-2">{category.label}のレッスン</h1>
        {category.description && (
          <p className="text-gray-600 mb-6">{category.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map(lesson => (
            // ... lesson card
          ))}
        </div>
      </div>
    </Layout>
  );
}
```

**2. ルーティング追加**

`src/App.tsx`:
```tsx
import CategoryLessons from "./pages/CategoryLessons";

// ...
<Route path="/lessons/category/:categorySlug" element={<CategoryLessons />} />
```

**成果物**:
- `src/pages/CategoryLessons.tsx`
- `src/App.tsx` 更新

---

## 🚀 実装手順まとめ

### Phase 1: 基盤整備（30分）
1. `src/constants/categories.ts` 作成
2. カテゴリ定数とユーティリティ関数定義

### Phase 2: フィルタリング機能（1時間）
1. `src/hooks/useLessonsByCategory.ts` 作成
2. `src/pages/Lessons.tsx` にカテゴリタブ追加
3. フィルタリングロジック実装

### Phase 3: カテゴリ別ページ（1時間）
1. `src/pages/CategoryLessons.tsx` 作成
2. `src/App.tsx` にルート追加
3. 動作確認

**合計所要時間**: 約2.5時間

---

## 🎨 UI/UX 考慮事項

### カテゴリタブのデザイン

**選択済み**:
- 背景: `bg-blue-600`
- 文字色: `text-white`
- フォントウェイト: `font-semibold`

**未選択**:
- 背景: `bg-gray-200`
- 文字色: `text-gray-700`
- ホバー: `hover:bg-gray-300`

### レスポンシブ対応

- モバイル: カテゴリタブは横スクロール可能
- タブレット: 2カラムレイアウト
- デスクトップ: 3カラムレイアウト

---

## ⚠️ 注意事項

### Webflowインポート時のカテゴリ

**現状**: Webflowから`category`フィールドを取得済み（useLessons.ts:133）

**対応**:
- Webflowのカテゴリが定義済みの3つ（情報設計、UI、UX）に一致しない場合
- → `CATEGORIES`配列に追加するか、デフォルト値を設定

### 既存レッスンのカテゴリ

**確認が必要**:
1. Sanityで作成済みのレッスンにカテゴリが設定されているか
2. Webflowレッスンのカテゴリが正しくマッピングされているか

---

## 📝 質問・確認事項

1. **カテゴリの追加予定はありますか？**
   - 現在: 情報設計、UI、UX の3つ
   - 追加予定があれば、今のうちに`CATEGORIES`配列に追加可能

2. **カテゴリ別ページのURL形式はこれで良いですか？**
   - `/lessons/category/ui`
   - または `/categories/ui` のほうが良いか？

3. **カテゴリの表示順序は？**
   - 現在: 定義順（情報設計 → UI → UX）
   - アルファベット順？レッスン数順？

4. **「すべて」タブの表示は必要ですか？**
   - または `/lessons` 自体がすべて表示で、カテゴリページは別URL？

5. **カテゴリにアイコンや色を追加しますか？**
   - 例: 情報設計 = 🗂️ / UI = 🎨 / UX = 👥

---

## 🎯 次のアクション

質問への回答を確認後、Phase 1 から順番に実装を開始します。
