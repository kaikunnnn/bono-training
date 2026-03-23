# カラートークン

**最終更新**: 2026-03-19
**Figma参照**: `PRD🏠_Roadmap_2026` node-id `12-10281`

---

## テキストカラー（Figma定義）

### 階層（Text Hierarchy）

| トークン名 | CSS変数 | Tailwindクラス | Hex値 | 用途 |
|-----------|---------|---------------|-------|------|
| text-primary | `--text-primary` | `text-text-primary` | `#021710` | 見出し・強調テキスト |
| text-secondary | `--text-secondary` | `text-text-secondary` | `#354540` | 本文・説明文 |
| text-muted | `--text-muted` | `text-text-muted` | `#677470` | 補助テキスト・プレースホルダー |
| text-disabled | `--text-disabled` | `text-text-disabled` | `#9AA29F` | 無効状態のテキスト |

### インタラクティブ（Interactive）

| トークン名 | CSS変数 | Tailwindクラス | Hex値 | 用途 |
|-----------|---------|---------------|-------|------|
| text-link | `--text-link` | `text-text-link` | `#0829BF` | リンク |
| text-link-hover | `--text-link-hover` | `hover:text-text-link-hover` | `#3306E8` | リンクホバー |

### セマンティック（Semantic）

| トークン名 | CSS変数 | Tailwindクラス | Hex値 | 用途 |
|-----------|---------|---------------|-------|------|
| text-success | `--text-success` | `text-text-success` | `#047A53` | 成功メッセージ |
| text-warning | `--text-warning` | `text-text-warning` | `#9E6608` | 警告メッセージ |
| text-error | `--text-error` | `text-text-error` | `#C42626` | エラーメッセージ |

### 反転（Inverse）

| トークン名 | CSS変数 | Tailwindクラス | Hex値 | 用途 |
|-----------|---------|---------------|-------|------|
| text-inverse | `--text-inverse` | `text-text-inverse` | `#FAFBFB` | 暗い背景上のテキスト |

---

## 背景カラー（Figma定義）

**Figma参照**: `PRD🏠_Roadmap_2026` node-id `18-10329`

### 基本レイヤー（Basic Layers）

| トークン名 | CSS変数 | Tailwindクラス | ライト | ダーク | 用途 |
|-----------|---------|---------------|--------|--------|------|
| bg-base | `--bg-base` | `bg-base` | `#F9F9F7` | `#0a0a0a` | ページ全体の背景 |
| bg-surface | `--bg-surface` | `bg-surface` | `#FFFFFF` | `#1a1a1a` | カード・パネルの背景 |
| bg-surface-raised | `--bg-surface-raised` | `bg-surface-raised` | `#FFFFFF` | `#252525` | モーダル・ドロップダウン |
| bg-overlay | `--bg-overlay` | `bg-overlay` | `rgba(5,16,12,0.72)` | `rgba(0,0,0,0.7)` | オーバーレイ背景 |

### インタラクティブ（Interactive）

| トークン名 | CSS変数 | Tailwindクラス | ライト | ダーク | 用途 |
|-----------|---------|---------------|--------|--------|------|
| bg-muted | `--bg-muted` | `bg-muted` | `#F2F3F0` | `#2a2a2a` | バッジ・タグ・控えめな背景 |
| bg-muted-strong | `--bg-muted-strong` | `bg-muted-strong` | `#E9EAE6` | `#3a3a3a` | DescriptionBadge等の濃い背景 |
| bg-hover | `--bg-hover` | `bg-hover` | `#F2F3F0` | `#2a2a2a` | ホバー状態 |
| bg-active | `--bg-active` | `bg-active` | `#E0E1DC` | `#333333` | アクティブ・選択状態 |
| bg-disabled | `--bg-disabled` | `bg-disabled` | `#F9FAFB` | `#1f1f1f` | 無効状態 |

### セマンティック（Semantic / Feedback）

| トークン名 | CSS変数 | Tailwindクラス | ライト | ダーク | 用途 |
|-----------|---------|---------------|--------|--------|------|
| bg-success | `--bg-success` | `bg-success-feedback` | `rgba(138,204,161,0.12)` | `#052e16` | 成功メッセージ背景 |
| bg-warning | `--bg-warning` | `bg-warning-feedback` | `rgba(255,183,33,0.12)` | `#422006` | 警告メッセージ背景 |
| bg-error | `--bg-error` | `bg-error-feedback` | `#FDEFF2` | `#450a0a` | エラーメッセージ背景 |
| bg-info | `--bg-info` | `bg-info-feedback` | `#FFFFFF` | `#1e3a5f` | 情報メッセージ背景（ボーダー付き） |

> **Note**:
> - セマンティック背景は `-feedback` サフィックスを使用。shadcn の `success` 等（ボタン用ソリッドカラー）との競合を避けるため。
> - `bg-success` と `bg-warning` は透明度付きRGBA色（親の背景に溶け込む）。
> - `bg-info` は白背景 + ボーダーで表現（Figma定義に準拠）。

---

## ボーダーカラー（Figma定義）

| トークン名 | CSS変数 | Tailwindクラス | ライト | ダーク | 用途 |
|-----------|---------|---------------|--------|--------|------|
| border-light | `--border-light` | `border-light` | `#D4D6CC` | `#3a3a3a` | 薄いボーダー（カード区切り等） |
| border-default | `--border-default` | `border-default` | `#C3C5BB` | `#4a4a4a` | 標準ボーダー（DottedDivider等） |
| border-strong | `--border-strong` | `border-strong` | `#A8AAA0` | `#5a5a5a` | 濃いボーダー（強調区切り） |

---

## コンポーネント別の推奨トークン

### テキスト

| コンポーネント | 要素 | 推奨トークン |
|---------------|------|-------------|
| PageHeader | タイトル | `text-primary` |
| PageHeader | ラベル | `text-muted` |
| PageHeader | 説明文 | `text-secondary` |
| SectionHeading | タイトル | `text-primary` |
| SectionHeading | バッジ内テキスト | `text-secondary` |
| CategoryNav | アクティブ | `text-primary` |
| CategoryNav | 非アクティブ | `text-muted` |

### 背景

| コンポーネント | 要素 | 推奨トークン |
|---------------|------|-------------|
| ページ全体 | 背景 | `bg-base` |
| Card | 背景 | `bg-surface` |
| Modal/Dialog | 背景 | `bg-surface-raised` |
| Modal backdrop | オーバーレイ | `bg-overlay` |
| DescriptionBadge | 背景 | `bg-muted-strong` |
| リスト項目 | ホバー時 | `bg-hover` |
| タブ/ナビ | 選択中 | `bg-active` |
| Alert (success) | 背景 | `bg-success-feedback` |
| Alert (warning) | 背景 | `bg-warning-feedback` |
| Alert (error) | 背景 | `bg-error-feedback` |
| Alert (info) | 背景 | `bg-info-feedback` |

### ボーダー

| コンポーネント | 要素 | 推奨トークン |
|---------------|------|-------------|
| Card | 区切り線 | `border-light` |
| DottedDivider | ドット色 | `border-default` |
| セクション区切り | 強調ボーダー | `border-strong` |

---

## shadcn/ui標準色（既存）

### テキスト色

| トークン名 | CSS変数 | 用途 |
|-----------|---------|------|
| `foreground` | `--foreground` | shadcnコンポーネント標準テキスト |
| `muted-foreground` | `--muted-foreground` | shadcn補助テキスト |

### 基本色（セマンティック）

| トークン名 | CSS変数 | 用途 |
|-----------|---------|------|
| `primary` | `--primary` | メインアクション、ブランドカラー |
| `secondary` | `--secondary` | 補助的なアクション |
| `muted` | `--muted` | 控えめな背景・テキスト |
| `accent` | `--accent` | 強調、ハイライト |
| `destructive` | `--destructive` | 削除、エラー |

### 背景色

| トークン名 | CSS変数 | 用途 |
|-----------|---------|------|
| `background` | `--background` | ページ背景 |
| `card` | `--card` | カード背景 |
| `popover` | `--popover` | ポップオーバー、ドロップダウン |

---

## Training専用色

| トークン名 | 値 | 用途 |
|-----------|-----|------|
| `training` | `#FF9900` | BONOブランドオレンジ |
| `training-background` | `#FFF9F4` | トレーニングページ背景 |
| `training-dark` | `#0D221D` | ダーク背景 |

---

## 使用例

```tsx
// テキスト - Tailwindクラスで使用
<h1 className="text-text-primary">見出し</h1>
<p className="text-text-secondary">説明文</p>
<span className="text-text-muted">補助テキスト</span>

// リンク
<a className="text-text-link hover:text-text-link-hover">リンク</a>

// セマンティックテキスト
<p className="text-text-success">保存しました</p>
<p className="text-text-error">エラーが発生しました</p>

// 背景 - 基本レイヤー
<div className="bg-base">ページ全体</div>
<div className="bg-surface">カード</div>
<div className="bg-surface-raised">モーダル</div>
<div className="bg-overlay">オーバーレイ</div>

// 背景 - インタラクティブ
<div className="bg-muted">バッジ・タグ（薄い）</div>
<div className="bg-muted-strong">DescriptionBadge（濃い）</div>
<button className="hover:bg-hover">ホバー可能</button>
<button className="bg-active">選択中</button>

// 背景 - セマンティック（フィードバック）
<div className="bg-success-feedback text-text-success">成功メッセージ（rgba透明背景）</div>
<div className="bg-warning-feedback text-text-warning">警告メッセージ（rgba透明背景）</div>
<div className="bg-error-feedback text-text-error">エラーメッセージ</div>
<div className="bg-info-feedback border-2 border-blue-200">お知らせ（白背景+ボーダー）</div>

// ボーダー
<div className="border border-light">薄いボーダー</div>
<div className="border border-default">標準ボーダー</div>
<div className="border border-strong">濃いボーダー</div>
<DottedDivider />  // デフォルトで border-default (#C3C5BB) を使用
```

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-03-19 | ボーダーカラートークン追加（light / default / strong） |
| 2026-03-19 | Figma背景カラートークン追加（基本レイヤー・インタラクティブ・セマンティック） |
| 2026-03-19 | Figmaテキストカラートークン追加（階層・インタラクティブ・セマンティック・反転） |
| 2026-03-19 | 初版作成 |
