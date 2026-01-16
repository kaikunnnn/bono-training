# LessonHero → 新デザイン移行計画

**作成日**: 2025-01-15
**ステータス**: Phase 4 完了（LessonDetail統合済み）

---

## 概要

現在の `LessonHero` コンポーネントを新デザインに置き換える。

### 現在のデザイン（LessonHero）

```
┌──────────────────────────────────────────────────────┐
│  ← レッスン一覧                                       │  グラデーション背景
├──────────────────────────────────────────────────────┤
│                    ┌─────┐                            │
│                    │ icon│  ← 中央配置、小さいアイコン │
│                    └─────┘                            │
│                                                       │
│              UIデザインサイクル                        │  ← 中央揃えタイトル
│              説明文テキスト...                         │
│              ┌───────────────┐                        │
│              │ スタートする  │                        │
│              └───────────────┘                        │
└──────────────────────────────────────────────────────┘
```

### 新デザイン

```
┌──────────────────────────────────────────────────────┐
│  [← レッスン一覧へ]                         [シェア]  │  LessonHeader
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────┐   [カテゴリタグ]                        │
│  │         │   UIデザインサイクル（タイトル）         │
│  │  icon   │   [████████░░] 72%（進捗バー）          │  LessonTitleArea
│  │ 278x420 │   説明文テキスト...                      │
│  │         │   概要・目的ですべてみる                 │
│  └─────────┘   [スタートする]                        │
│  LessonSidebar                                        │
└──────────────────────────────────────────────────────┘
```

---

## 移行戦略

### 方針: 並行実装 → 切り替え → 旧削除

1. **新コンポーネントを別ファイルで作成**（既存を壊さない）
2. **動作確認してから切り替え**
3. **問題なければ旧コンポーネントを削除**

---

## 実装ステップ

### Phase 1: 共通コンポーネント作成

**目的**: 新デザインで使用する共通コンポーネントを先に作成

| # | コンポーネント | ファイル | 説明 | 依存関係 |
|---|---------------|---------|------|---------|
| 1-1 | LessonProgressBar | `src/components/ui/LessonProgressBar.tsx` | 進捗バー（共通化） | なし |
| 1-2 | CategoryTag | `src/components/ui/CategoryTag.tsx` | カテゴリタグ | なし |
| 1-3 | Button（size追加） | `src/components/ui/button.tsx` | large/medium/small | 既存修正 |

**完了条件**:
- [ ] 各コンポーネントが単体で動作する
- [ ] `/dev/components` で表示確認

---

### Phase 2: 新ヘッダーコンポーネント作成

**目的**: LessonHeroを置き換える新コンポーネント群を作成

| # | コンポーネント | ファイル | 説明 |
|---|---------------|---------|------|
| 2-1 | LessonHeader | `src/components/lesson/header/LessonHeader.tsx` | 戻る + シェアボタン |
| 2-2 | LessonSidebar | `src/components/lesson/header/LessonSidebar.tsx` | 左サイドバー（アイコン画像） |
| 2-3 | LessonTitleArea | `src/components/lesson/header/LessonTitleArea.tsx` | カテゴリ+タイトル+進捗+説明+CTA |
| 2-4 | LessonHeaderLayout | `src/components/lesson/header/LessonHeaderLayout.tsx` | 全体レイアウト（統合） |
| 2-5 | index.ts | `src/components/lesson/header/index.ts` | エクスポート |

**ファイル構成**:
```
src/components/lesson/
├── header/                    ← 新規作成
│   ├── index.ts
│   ├── LessonHeader.tsx       ← 戻る + シェア
│   ├── LessonSidebar.tsx      ← 左アイコン
│   ├── LessonTitleArea.tsx    ← 右メイン
│   └── LessonHeaderLayout.tsx ← 統合レイアウト
│
├── LessonHero.tsx             ← 旧（後で削除）
├── InfoBlock.tsx              ← 旧（後で削除）
└── ...
```

**完了条件**:
- [ ] 各コンポーネントが作成されている
- [ ] LessonHeaderLayoutがすべてを統合している

---

### Phase 3: 開発プレビュー作成

**目的**: 新コンポーネントを隔離環境でテスト

| # | タスク | ファイル |
|---|--------|---------|
| 3-1 | プレビューページ作成 | `src/pages/dev/LessonHeaderComponents.tsx` |
| 3-2 | ルート追加 | `src/App.tsx` に `/dev/lesson-header` 追加 |

**完了条件**:
- [ ] `/dev/lesson-header` でコンポーネント表示確認
- [ ] デスクトップ・モバイル両方で確認

---

### Phase 4: LessonDetailページ統合

**目的**: 新コンポーネントを実際のページに適用

| # | タスク | 説明 |
|---|--------|------|
| 4-1 | インポート変更 | `LessonHero` → `LessonHeaderLayout` |
| 4-2 | Props調整 | 進捗データの受け渡し |
| 4-3 | レイアウト調整 | タブ位置などの調整 |

**変更対象ファイル**:
- `src/pages/LessonDetail.tsx`

**完了条件**:
- [ ] `/lessons/{slug}` で新デザインが表示される
- [ ] 進捗バーが正しく表示される
- [ ] 「スタートする」ボタンが動作する
- [ ] 「概要・目的ですべてみる」がタブ切替する

---

### Phase 5: 旧コンポーネント削除

**目的**: 不要になった旧コンポーネントを削除

| # | タスク | ファイル |
|---|--------|---------|
| 5-1 | 旧LessonHero削除 | `src/components/lesson/LessonHero.tsx` |
| 5-2 | 旧InfoBlock削除 | `src/components/lesson/InfoBlock.tsx` |
| 5-3 | 使用箇所確認 | 他で参照されていないことを確認 |
| 5-4 | CSSクリーンアップ | `arc-wrapper`, `ellipse` など |

**完了条件**:
- [ ] 旧ファイルが削除されている
- [ ] ビルドエラーがない
- [ ] 不要なCSSが削除されている

---

## 詳細実装ガイド

### Phase 1-1: LessonProgressBar

**仕様（IMPLEMENTATION-SPEC.md Step 4より）**:
- バー高さ: 7px
- バー背景色: #EAEAEA
- バー進捗色: #000000（黒）
- 数字フォント: Rounded Mplus 1c Bold, 24px
- %記号: 10px

```tsx
interface LessonProgressBarProps {
  progress: number;        // 0-100
  showPercent?: boolean;   // デフォルト: true
  width?: string | number; // デフォルト: 100%
  className?: string;
}
```

---

### Phase 1-2: CategoryTag

**仕様（IMPLEMENTATION-SPEC.md Step 5より）**:
- 背景: #EBECED
- パディング: 5px 7px
- 角丸: 10px
- フォント: Noto Sans JP Medium, 12px
- 色: #0D221D

```tsx
interface CategoryTagProps {
  category: string;
  className?: string;
}
```

---

### Phase 1-3: Button（size追加）

**仕様（IMPLEMENTATION-SPEC.md Step 6より）**:

| サイズ | 高さ | padding-y | padding-x | 角丸 | font-size |
|-------|------|-----------|-----------|------|-----------|
| large | 48px | 14px | 28px | 16px | 14px |
| medium | 40px | 10px | 20px | 12px | 14px |
| small | 32px | 6px | 14px | 10px | 12px |

```tsx
interface ButtonProps {
  size?: "large" | "medium" | "small";  // デフォルト: "medium"
  // ...既存props
}
```

---

### Phase 2-1: LessonHeader

**仕様（IMPLEMENTATION-SPEC.md Step 1より）**:
- 高さ: 64px
- 左: 戻るボタン（142px）
- 右: シェアボタン（62px）
- ボタンスタイル: 白背景、黒ボーダー、角丸12px

```tsx
interface LessonHeaderProps {
  backLabel?: string;      // デフォルト: "レッスン一覧へ"
  backHref?: string;       // デフォルト: "/lessons"
  onShare?: () => void;
  showShare?: boolean;     // デフォルト: true
}
```

---

### Phase 2-2: LessonSidebar

**仕様（IMPLEMENTATION-SPEC.md Step 2より）**:
- 幅: 278.25px
- 高さ: 420.41px
- 角丸: 右上・右下のみ 16px
- シャドウ: 0px 2px 40px rgba(0,0,0,0.24)
- デスクトップのみ表示

```tsx
interface LessonSidebarProps {
  lesson: {
    title: string;
    iconImage?: any;
    iconImageUrl?: string;
  };
}
```

---

### Phase 2-3: LessonTitleArea

**仕様（IMPLEMENTATION-SPEC.md Step 3より）**:
- カテゴリタグ + タイトル + 進捗バー + 説明 + CTAボタン
- 進捗バー幅: 350px
- 説明文: 3行clamp

```tsx
interface LessonTitleAreaProps {
  lesson: {
    title: string;
    category?: string;
    description?: string;
  };
  progress: number;              // 0-100
  onStart?: () => void;
  onViewAllDetails?: () => void; // タブ切替
}
```

---

### Phase 2-4: LessonHeaderLayout

**役割**: 全体を統合

```tsx
interface LessonHeaderLayoutProps {
  lesson: Lesson;
  progress: number;
  onStart?: () => void;
  onViewAllDetails?: () => void;
}
```

**レイアウト構造**:
```
<div>
  <LessonHeader />
  <div className="flex">
    <LessonSidebar />      {/* md:block hidden */}
    <LessonTitleArea />
  </div>
</div>
```

---

## チェックリスト

### Phase 1 ✅ 完了
- [x] 1-1: LessonProgressBar作成
- [x] 1-1: LessonProgressBar動作確認
- [x] 1-2: CategoryTag作成
- [x] 1-2: CategoryTag動作確認
- [x] 1-3: Button size追加
- [x] 1-3: Button動作確認

### Phase 2 ✅ 完了
- [x] 2-1: LessonHeader作成
- [x] 2-2: LessonSidebar作成
- [x] 2-3: LessonTitleArea作成
- [x] 2-4: LessonHeaderLayout作成
- [x] 2-5: index.ts作成

### Phase 3 ✅ 完了
- [x] 3-1: プレビューページ作成 (`/dev/lesson-header`)
- [x] 3-2: ルート追加
- [ ] 3-3: 表示確認（デスクトップ） ← 手動確認必要
- [ ] 3-4: 表示確認（モバイル） ← 手動確認必要

### Phase 4 ✅ 完了
- [x] 4-1: LessonDetailでインポート変更
- [x] 4-2: Props調整（進捗率計算追加）
- [x] 4-3: LessonTabs更新（制御されたタブ対応）
- [ ] 4-4: 動作確認 ← 手動確認必要

### Phase 5 ⏳ 未実施
- [ ] 5-1: LessonHero削除
- [ ] 5-2: InfoBlock削除
- [ ] 5-3: 参照確認
- [ ] 5-4: ビルド確認
- [ ] 5-5: CSSクリーンアップ

---

## 注意事項

### フォント確認

tailwind.configで定義されているフォント:
- `font-rounded-mplus` - タイトル、見出し
- `font-noto-sans-jp` - 本文、説明
- `font-luckiest` - 番号（クエスト番号など）
- `font-inter` - 英数字

**使用禁止**（未定義）:
- ❌ `font-unbounded`
- ❌ `font-helvetica`
- ❌ `font-hiragino-w6`

### 既存コンポーネント確認

実装前に以下を確認:
1. 既存の類似コンポーネントがないか
2. 使用するpropsの型が正しいか
3. Sanity画像の処理が正しいか

---

## 備考

- 各Phase完了後に IMPLEMENTATION-SPEC.md のステータスを更新
- 問題発生時は即座にこのドキュメントに記録
