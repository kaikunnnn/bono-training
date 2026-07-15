# UI/コンポーネント規約

## アイコン

- **lucide-react** を使用（プロジェクト標準、86ファイルで使用中）
- `iconsax-react` は Sidebar と Roadmap detail の一部で使用（レガシー）
- 新規コードでは必ず lucide-react を使う

```typescript
// ✅ 正しい
import { Check, Lock, Star } from "lucide-react";

// ❌ 間違い
import { TickCircle } from "iconsax-react";
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
