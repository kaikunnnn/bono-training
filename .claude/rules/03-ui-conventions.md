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

## レスポンシブ

- モバイルファースト（Tailwind のデフォルト）
- ブレークポイント: `sm:640px`, `md:768px`, `lg:1024px`
