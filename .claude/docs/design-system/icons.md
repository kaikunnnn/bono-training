# アイコン デザインシステム

## 使用ライブラリ

**iconsax-react** を標準アイコンライブラリとして使用します。

```bash
# インストール済み
npm install iconsax-react
```

公式サイト: https://iconsax.io/

---

## 基本的な使い方

### 推奨: `@/lib/icons` から import

```tsx
import { Check, ICON_SIZES } from "@/lib/icons";

// サイズ定数を使用
<Check size={ICON_SIZES.md} />

// または直接数値
<Check size={16} />

// バリアント指定（Iconsax特有）
<Check size={16} variant="Bold" />
```

### 動的にアイコンを使う場合

```tsx
import { icons, type IconName } from "@/lib/icons";

function MyComponent({ iconName }: { iconName: IconName }) {
  const Icon = icons[iconName];
  return <Icon size={16} />;
}
```

---

## サイズ規定

| 名前 | サイズ | Tailwind | 用途 |
|------|--------|----------|------|
| `sm` | 14px | `size-3.5` | 小さいテキスト横のアイコン |
| `md` | 16px | `size-4` | **標準サイズ（デフォルト）** |
| `lg` | 20px | `size-5` | ボタン内のアイコン |
| `xl` | 24px | `size-6` | 大きめのアイコン |

```tsx
import { ICON_SIZES } from "@/lib/icons";

<Check size={ICON_SIZES.md} />  // 16px
<Check size={ICON_SIZES.lg} />  // 20px
```

---

## バリアント（Iconsax特有）

Iconsaxは6種類のスタイルバリアントを提供します。

| バリアント | 説明 | 使用場面 |
|-----------|------|----------|
| `Linear` | 線のみ（デフォルト） | 通常のUI |
| `Outline` | アウトライン | 強調したい場合 |
| `Bold` | 塗りつぶし | アクティブ状態 |
| `Bulk` | 半透明の塗り | 背景に馴染ませたい場合 |
| `TwoTone` | 2色 | アクセント |

```tsx
import { Star } from "@/lib/icons";

// デフォルト（Linear）
<Star size={16} />

// 塗りつぶし
<Star size={16} variant="Bold" />

// 半透明
<Star size={16} variant="Bulk" />
```

---

## 色の使い方

アイコンは `currentColor` を継承するので、親要素の `text-*` クラスで色を指定します。

```tsx
// 推奨: text-* クラスで色を指定
<div className="text-gray-500">
  <Check size={16} />
</div>

// または直接 className
<Check size={16} className="text-green-500" />

// color prop でも指定可能（Iconsax）
<Check size={16} color="#10B981" />
```

### よく使う色

| 用途 | クラス |
|------|--------|
| 標準テキスト | `text-gray-600` |
| サブテキスト | `text-gray-400` |
| 成功 | `text-green-500` |
| 警告 | `text-amber-500` |
| エラー | `text-red-500` |
| 情報 | `text-blue-500` |
| 無効 | `text-gray-300` |

---

## よく使うアイコン一覧

### ナビゲーション

| 用途 | Iconsax名 | エイリアス | import |
|------|-----------|-----------|--------|
| 次へ、展開 | `ArrowRight2` | `ChevronRight` | `import { ChevronRight } from "@/lib/icons"` |
| 戻る | `ArrowLeft2` | `ChevronLeft` | `import { ChevronLeft } from "@/lib/icons"` |
| ドロップダウン | `ArrowDown2` | `ChevronDown` | `import { ChevronDown } from "@/lib/icons"` |
| 遷移 | `ArrowRight` | - | `import { ArrowRight } from "@/lib/icons"` |
| メニュー | `HambergerMenu` | `Menu` | `import { Menu } from "@/lib/icons"` |
| 閉じる | `CloseSquare` | `X` | `import { X } from "@/lib/icons"` |

### アクション

| 用途 | Iconsax名 | エイリアス | import |
|------|-----------|-----------|--------|
| 完了、選択 | `TickCircle` | `Check` | `import { Check } from "@/lib/icons"` |
| 追加 | `Add` | `Plus` | `import { Plus } from "@/lib/icons"` |
| 検索 | `SearchNormal1` | `Search` | `import { Search } from "@/lib/icons"` |
| 設定 | `Setting2` | `Settings` | `import { Settings } from "@/lib/icons"` |
| シェア | `Share` | `Share2` | `import { Share2 } from "@/lib/icons"` |
| 外部リンク | `ExportSquare` | `ExternalLink` | `import { ExternalLink } from "@/lib/icons"` |

### 状態・フィードバック

| 用途 | Iconsax名 | エイリアス | import |
|------|-----------|-----------|--------|
| エラー | `Danger` | `AlertCircle` | `import { AlertCircle } from "@/lib/icons"` |
| 警告 | `Warning2` | `AlertTriangle` | `import { AlertTriangle } from "@/lib/icons"` |
| 情報 | `InfoCircle` | `Info` | `import { Info } from "@/lib/icons"` |
| 成功 | `TickCircle` | `CheckCircle2` | `import { CheckCircle2 } from "@/lib/icons"` |
| ローディング | `RefreshCircle` | `Loader2` | `import { Loader2 } from "@/lib/icons"` |
| 時間 | `Clock` | - | `import { Clock } from "@/lib/icons"` |

### ユーザー

| 用途 | Iconsax名 | エイリアス | import |
|------|-----------|-----------|--------|
| ユーザー | `User` | - | `import { User } from "@/lib/icons"` |
| ログイン | `Login` | `LogIn` | `import { LogIn } from "@/lib/icons"` |
| ログアウト | `Logout` | `LogOut` | `import { LogOut } from "@/lib/icons"` |
| ロック | `Lock1` | `Lock` | `import { Lock } from "@/lib/icons"` |

### コンテンツ

| 用途 | Iconsax名 | エイリアス | import |
|------|-----------|-----------|--------|
| レッスン | `Book1` | `BookOpen` | `import { BookOpen } from "@/lib/icons"` |
| 再生 | `Play` | - | `import { Play } from "@/lib/icons"` |
| お気に入り | `Star1` | `Star` | `import { Star } from "@/lib/icons"` |
| ブックマーク | `ArchiveBook` | `Bookmark` | `import { Bookmark } from "@/lib/icons"` |
| 表示 | `Eye` | - | `import { Eye } from "@/lib/icons"` |

### その他

| 用途 | Iconsax名 | エイリアス | import |
|------|-----------|-----------|--------|
| ロードマップ | `Map1` | `Map` | `import { Map } from "@/lib/icons"` |
| ガイド | `Discover` | `Compass` | `import { Compass } from "@/lib/icons"` |
| ホーム | `Home2` | `Home` | `import { Home } from "@/lib/icons"` |
| 通知 | `Notification` | `Bell` | `import { Bell } from "@/lib/icons"` |

---

## ローディングアニメーション

```tsx
import { Loader2 } from "@/lib/icons";

<Loader2 className="animate-spin" size={16} />
```

---

## 禁止事項

1. **カスタムSVGを作成しない** - Iconsaxに同等のアイコンがあれば使用する
2. **`<svg>` タグを直接書かない** - Iconsaxコンポーネントを使用する
3. **画像ファイル（.svg, .png）でアイコンを追加しない** - Iconsaxを使用する

### 例外
- ブランドロゴ（BONOロゴなど）
- 外部サービスのロゴ（X/Twitterなど）
- 特殊なデコレーション要素

---

## 移行ガイド（Lucide → Iconsax）

既存のLucideアイコンを使用しているコードは、以下のように移行できます:

```tsx
// Before (Lucide)
import { Check } from "lucide-react";
<Check size={16} strokeWidth={2} />

// After (Iconsax via @/lib/icons)
import { Check } from "@/lib/icons";
<Check size={16} />  // variant="Linear" がデフォルト
```

strokeWidthは不要になり、代わりにvariantでスタイルを変更します。

---

## 参考

- [Iconsax 公式](https://iconsax.io/)
- [iconsax-react npm](https://www.npmjs.com/package/iconsax-react)
- [アイコン比較ページ](/dev2) - Lucide vs Iconsax の比較
