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

## CSS

- Tailwind CSS を優先
- inline style は main からの移植コードでのみ許容（Tailwind への変換は禁止）
- グローバル CSS は `globals.css` と `blog.css` のみ。新規追加しない
- フォント: `font-noto-sans-jp`（本文）, `font-rounded-mplus`（見出し）

## ステート原則（Empty / エラー時）

- **空状態は「情報がありません」で終わらせない。次のアクションを促す**（例: 「まだ質問がありません」→「最初の質問を投稿してみよう」+ セカンダリーボタンで導線）
- アクションボタンはプライマリーではなくセカンダリー系を基本とする
- 参考実装: `src/app/questions/page.tsx` の Empty カード（#137-B）

## 文言方針

- **掲示板関連では「質問」という語をUI文言に使わない**。「スレッド」「投稿」「トピック」を使う
  - 例外: カテゴリ固有名「BONOのバグ・質問」はそのまま
- 新規UI文言を書いたら、変更ファイルに対して禁止語grepをかけて確認する

```bash
# 掲示板UIの変更後チェック
grep -n "質問" src/components/questions/ src/app/questions/ -r
```

## レスポンシブ

- モバイルファースト（Tailwind のデフォルト）
- ブレークポイント: `sm:640px`, `md:768px`, `lg:1024px`
