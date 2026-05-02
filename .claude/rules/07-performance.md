# パフォーマンス規約

## フォント

- **Google Fontsは `next/font/google` で読み込む**（`layout.tsx` で定義済み）
- CSS `@import url(...)` は**使用禁止**（レンダーブロッキングになる）
- 新しいフォント追加時は `layout.tsx` に `next/font` で定義し、CSS変数経由で使用する

```typescript
// ✅ 正しい: layout.tsx で next/font を使う
import { Noto_Sans_JP } from "next/font/google";
const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp-var",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// ❌ 間違い: CSS @import を使う
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP...');
```

## 画像

- **`next/image` の `<Image>` を使う**（`<img>` は使わない）
- ESLint `@next/next/no-img-element` で警告が出る
- 外部画像は `next.config.ts` の `remotePatterns` に追加が必要
- サイズ不明の動的画像は `width={0} height={0} sizes="100vw"` パターンを使う

```typescript
// ✅ 正しい: next/image
import Image from "next/image";
<Image src="/logo.svg" alt="BONO" width={48} height={14} />

// ✅ サイズ不明の外部画像
<Image src={url} alt={alt} width={0} height={0} sizes="100vw"
       style={{ width: "100%", height: "auto" }} />

// ✅ fill モード（親要素が position: relative）
<Image src={url} alt="" fill style={{ objectFit: "cover" }} />

// ❌ 間違い: raw img
<img src="/logo.svg" alt="BONO" />
```

**例外**: mainから移植したinline styleコードで `<img>` が残っている箇所は、移行タイミングで順次置換する

## バンドルサイズ

- `"use client"` は必要最小限に（不要な依存をクライアントバンドルに含めない）
- 大きいライブラリ（framer-motion等）は dynamic import を検討
- Server Component で完結する処理はクライアントに持ち込まない

## チェック方法

```bash
# ESLint（no-img-element 等）
npm run lint

# 型チェック
npx tsc --noEmit

# ビルド
npm run build
```
