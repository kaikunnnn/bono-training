# UI/コンポーネント規約

## アイコン

- `iconsax-react` と `lucide-react` の両方を正式なアイコンライブラリとして使用できる
- **プロダクトの機能・カテゴリ・ナビゲーションを表すアイコンは `iconsax-react` を第一選択**とする
  - 左サイドナビの `MenuIcons`（レッスン、トレーニング、検索、マイページ、設定等）が基準
  - 同じ導線・概念には、サイドナビと同じIconsaxアイコンを使う
- 矢印、開閉、チェック、閉じる、ローディングなどの操作系アイコン、および既存のshadcn/ui部品では `lucide-react` を使用できる
- 既存コンポーネントを修正するときは、その画面・コンポーネントですでに使われているアイコン体系へ揃える
- 同じ役割のアイコンを画面ごとに別ライブラリへ置き換えない。ライブラリを混在させる場合は、概念アイコンと操作アイコンのように役割を分ける

```typescript
// ✅ プロダクト・ナビゲーションの概念アイコン
import { Book, MessageQuestion, User } from "iconsax-react";

// ✅ 操作系・shadcn/uiのアイコン
import { Check, ChevronRight, X } from "lucide-react";
```

## UI コンポーネント

- `@/components/ui/` の shadcn/ui コンポーネントを優先使用
- Button, Card, Input, Badge, Skeleton, Dialog, Modal 等
- 独自の Tailwind ボタンやカードを作らない
- 新しい variant が必要なら `ui/` のファイルに追加する

### ボタンは必ず共通 Button を使う（Figmaより優先）

- **押せる見た目の要素は必ず `@/components/ui/button` の Button（または buttonVariants）を使う**。`<button>` / `<Link>` / `<a>` にボタン風クラスを直書きしない（`asChild` でラップする）
- **Figma のボタンがデザインシステムと違っていても、Buttonコンポーネント側を正とする**。Figmaの生スタイルを写経しない
  - 既存 variant/size で表現できないときは `ui/button.tsx` に variant を追加してから使う
  - Figmaとの差異は「意図的にDS優先にした箇所」として報告に明記する（勝手に黙って丸めない）
- 実例: 投稿完了画面の「投稿を確認する」が生スタイルLinkで実装され、DSと不一致になった（#137-0715で是正）

## CSS

- Tailwind CSS を優先
- inline style は main からの移植コードでのみ許容（Tailwind への変換は禁止）
- グローバル CSS は `globals.css` と `blog.css` のみ。新規追加しない
- フォント: `font-noto-sans-jp`（本文）, `font-rounded-mplus`（見出し）

## ステート原則（Empty / エラー時）

- **空状態は「情報がありません」で終わらせない。次のアクションを促す**（例: 「まだ質問がありません」→「最初の質問を投稿してみよう」+ セカンダリーボタンで導線）
- アクションボタンはプライマリーではなくセカンダリー系を基本とする
- 参考実装: `src/app/questions/page.tsx` の Empty カード（#137-B）

## レスポンシブ

- モバイルファースト（Tailwind のデフォルト）
- ブレークポイント: `sm:640px`, `md:768px`, `lg:1024px`
