# 次回実装時の推奨アプローチ

## 推奨: プレビュー専用ルート方式

既存のコードを変更せず、プレビュー専用のルートとクライアントを追加する。

---

## 実装計画

### Phase 1: プレビュー用Sanityクライアント作成

**新規ファイル: `src/lib/sanity-preview.ts`**

```typescript
import { createClient } from "@sanity/client";

// プレビュー専用クライアント（下書き含む）
export const previewClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || "2024-01-01",
  useCdn: false,
  perspective: "previewDrafts",
  token: import.meta.env.VITE_SANITY_TOKEN,
});
```

**既存ファイル `src/lib/sanity.ts` は変更しない**

---

### Phase 2: プレビュー用ルート追加

**`src/App.tsx` に追加**:

```typescript
// プレビュー用ルート（開発環境のみ）
{import.meta.env.DEV && (
  <>
    <Route path="/preview/lessons/:slug" element={<LessonDetailPreview />} />
    <Route path="/preview/articles/:slug" element={<ArticleDetailPreview />} />
  </>
)}
```

---

### Phase 3: プレビュー用コンポーネント作成

**`src/pages/preview/LessonDetailPreview.tsx`**:

```typescript
import { previewClient } from "@/lib/sanity-preview";
// 既存のLessonDetailをコピーし、clientをpreviewClientに置き換え
// + プレビューバナーを表示
```

**`src/pages/preview/ArticleDetailPreview.tsx`**:

```typescript
import { previewClient } from "@/lib/sanity-preview";
// 既存のArticleDetailをコピーし、clientをpreviewClientに置き換え
// + プレビューバナーを表示
```

---

### Phase 4: Sanity Studioにプレビューリンク追加

**`sanity-studio/sanity.config.ts`**:

```typescript
// 各ドキュメントタイプにプレビューURLを設定
resolve: {
  production: {
    article: (doc) => ({
      url: `http://localhost:5173/preview/articles/${doc.slug?.current}`,
    }),
    lesson: (doc) => ({
      url: `http://localhost:5173/preview/lessons/${doc.slug?.current}`,
    }),
  },
}
```

---

## メリット

1. **既存コードへの影響ゼロ**
   - 通常のルートは一切変更しない
   - 本番環境には影響しない

2. **明確な分離**
   - プレビューは `/preview/*` ルートのみ
   - 本番は従来通り

3. **開発環境限定**
   - `import.meta.env.DEV` でガード
   - 本番ビルドにはプレビューコードが含まれない

4. **段階的に実装可能**
   - まずarticleだけ実装して動作確認
   - 問題なければlesson、questに拡大

---

## デメリット

1. **コードの重複**
   - LessonDetail と LessonDetailPreview が似たコードになる
   - → 共通ロジックを hooks に切り出すことで軽減可能

2. **2つのクライアントを管理**
   - sanity.ts と sanity-preview.ts
   - → 設定は環境変数で一元管理

---

## 実装順序

1. `src/lib/sanity-preview.ts` 作成
2. `src/pages/preview/ArticleDetailPreview.tsx` 作成
3. `src/App.tsx` にルート追加
4. 動作確認
5. 問題なければ LessonDetailPreview も作成
6. Sanity Studioにプレビューリンク追加

---

## 環境変数

`.env.local` に追加が必要:

```bash
VITE_SANITY_TOKEN=sk...your-viewer-token
```

Sanity管理画面でViewerロールのトークンを発行する。

---

## 注意事項

- プレビュー用トークンは**絶対に本番環境に含めない**
- `.env.local` は `.gitignore` に含まれていることを確認
- Vercelには `VITE_SANITY_TOKEN` を設定しない
