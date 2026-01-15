# レッスン詳細ページ 実装仕様書

**最終更新**: 2025-01-15
**ステータス**: 仕様記入中

---

## 実装ステップ一覧

| Step | コンポーネント | 状態 | 備考 |
|------|---------------|------|------|
| 1 | LessonHeader | ✅ 仕様完了 | 戻る + シェアボタン |
| 2 | LessonSidebar | ✅ 仕様完了 | 左サイドバー全体 |
| 3 | LessonTitleArea | ✅ 仕様完了 | 右側タイトルエリア（カテゴリ+タイトル+進捗+説明+CTA） |
| 4 | ProgressBar（統一） | ✅ 仕様完了 | マイページ・記事・詳細画面で共通化 |
| 5 | CategoryTag | 仕様待ち | カテゴリタグ |
| 6 | Button（サイズ追加） | 仕様待ち | large/medium/small サイズバリエーション |
| 7 | QuestCard（修正） | 仕様待ち | 矢印位置変更など |
| 8 | ContentItem（修正） | 仕様待ち | 矢印削除など |
| 9 | LessonDetail（統合） | 仕様待ち | ページ全体レイアウト |

---

## Step 1: LessonHeader

**用途**: ページ上部の戻るボタン + シェアボタン

**Figmaリンク**: [node-id=418:7739](https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D?node-id=418:7739)

### Figma仕様（デスクトップ版）

```
コンテナ (heading):
- 幅: 1240px（フル幅）
- 高さ: 64px
- 背景: transparent
- パディング: 左右 16px
- レイアウト: flex, justify-between, items-start

左側 (left):
- 幅: 142px
- 高さ: 64px
- パディング: 上下 16px

右側 (right):
- 幅: 62px
- 高さ: 64px
- パディング: 上下 16px

戻るボタン（レッスン一覧へ）:
- 幅: 142px
- 高さ: 32px
- 背景: #FFFFFF（白）
- ボーダー: 1px solid #000000（黒）
- 角丸: 12px
- シャドウ: 0px 0px 3px rgba(0,0,0,0.04)
- パディング: 上下 7px, 左右 10px
- ギャップ: 4px（アイコンとテキスト間）

戻るアイコン（←）:
- サイズ: 25px × 25px
- 形状: 円形（rounded-full）
- ボーダー: 1px solid #020817
- 背景: backdrop-blur 2.5px
- 内部矢印: 12.5px × 6.944px

戻るテキスト:
- フォント: Hiragino Sans W6
- サイズ: 14px
- 行高: 20px
- 色: #000000（黒）
- テキスト: 「レッスン一覧へ」

シェアボタン:
- 幅: 62px
- 高さ: 32px
- 背景: #FFFFFF（白）
- ボーダー: 1px solid #000000（黒）
- 角丸: 12px
- シャドウ: 0px 0px 3px rgba(0,0,0,0.04)
- パディング: 上下 7px, 左右 10px

シェアテキスト:
- フォント: Hiragino Sans W6
- サイズ: 14px
- 行高: 20px
- 色: #000000（黒）
- テキスト: 「シェア」
```

### Figma MCPから取得した生成コード

```tsx
// ヘッダー全体
<div className="flex items-start justify-between px-4 py-0 w-full h-16">
  {/* 左側：戻るボタン */}
  <div className="flex items-start py-4">
    <div className="flex items-center h-8">
      <div className="bg-white border border-black flex gap-1 items-center px-2.5 py-[7px] rounded-xl shadow-[0px_0px_3px_0px_rgba(0,0,0,0.04)]">
        {/* 矢印アイコン */}
        <div className="backdrop-blur-[2.5px] border border-[#020817] flex items-center justify-center rounded-full size-[25px]">
          <ArrowLeftIcon />
        </div>
        {/* テキスト */}
        <span className="font-hiragino-w6 text-sm text-black">レッスン一覧へ</span>
      </div>
    </div>
  </div>

  {/* 右側：シェアボタン */}
  <div className="flex items-start py-4 h-16">
    <div className="flex items-center justify-end h-full">
      <div className="bg-white border border-black flex gap-1 items-center px-2.5 py-[7px] rounded-xl shadow-[0px_0px_3px_0px_rgba(0,0,0,0.04)]">
        <span className="font-hiragino-w6 text-sm text-black">シェア</span>
      </div>
    </div>
  </div>
</div>
```

### Props（予定）

```tsx
interface LessonHeaderProps {
  backLabel?: string;      // デフォルト: "レッスン一覧へ"
  backHref?: string;       // デフォルト: "/lessons"
  onShare?: () => void;
  showShare?: boolean;     // デフォルト: true
}
```

---

## Step 2: LessonSidebar

**用途**: 左サイドバー全体（デスクトップのみ表示）- レッスンのアイコン画像を表示

**Figmaリンク**: [node-id=418:7849](https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D?node-id=418:7849)

### Figma仕様（デスクトップ版）

```
コンテナ (left):
- 幅: 278.25px
- 高さ: 420.41px
- 位置: x=20, y=32（ページ左端から20px、ヘッダーから32px下）
- レイアウト: flex, flex-col, items-start

画像ブロック (block-lessonIcon):
- 幅: 278.25px
- 高さ: 420.41px
- レイアウト: flex, items-center

画像コンテナ (img-lesson-icon):
- 幅: 278.255px
- 高さ: 420.407px
- 角丸: 右上・右下のみ 16px（rounded-tr-[16px] rounded-br-[16px]）
        ※左側は角丸なし（画面端に接するため）
- シャドウ: 0px 2px 40px rgba(0,0,0,0.24)（強めのドロップシャドウ）
- オーバーフロー: hidden

画像 (img):
- 幅: 100%
- 高さ: 100.44%（わずかにはみ出し）
- 位置: top -0.22%（微調整）
- ソース: lessonデータのiconImage / iconImageUrl
```

### 表示条件

```
デスクトップ: 表示（md:block）
モバイル: 非表示（hidden）
```

### Figma MCPから取得した生成コード

```tsx
<div className="flex flex-col items-start">
  <div className="flex items-center">
    <div className="relative w-[278.255px] h-[420.407px] rounded-tr-[16px] rounded-br-[16px] shadow-[0px_2px_40px_0px_rgba(0,0,0,0.24)] overflow-hidden">
      <img
        src={lesson.iconImageUrl || urlFor(lesson.iconImage).url()}
        alt={lesson.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  </div>
</div>
```

### Props（予定）

```tsx
interface LessonSidebarProps {
  lesson: {
    title: string;
    iconImage?: any;       // Sanity image reference
    iconImageUrl?: string; // 直接URL指定の場合
  };
}
```

### 実装メモ

- 画像は`lessonデータ`の`iconImage`または`iconImageUrl`を使用
- 左側は角丸なし（ページ端に接するデザイン）
- シャドウが強め（0.24）なので本のような立体感を演出
- モバイルでは非表示にし、別のレイアウトを使用

---

## Step 3: LessonTitleArea

**用途**: 右側メインエリアのタイトルセクション（カテゴリ + タイトル + 進捗 + 説明 + CTA）

**Figmaリンク**: [node-id=418:7409](https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D?node-id=418:7409)

### Figma仕様（デスクトップ版）

```
コンテナ (LessonTitleArea):
- 幅: 793.75px（可変、メインコンテンツエリア）
- 高さ: 293px
- レイアウト: flex, flex-col, items-start
- ギャップ: 14px
- 位置: x=48（LessonSidebarから48pxオフセット）

カテゴリタグ (Container > Background):
- 背景: #EBECED（薄いグレー）
- パディング: 上下5px、左右7px
- 角丸: 10px
- テキスト:
  - フォント: Noto Sans JP Medium
  - サイズ: 12px
  - 行高: 10px
  - 色: #0D221D（濃い緑がかった黒）
  - 中央揃え

タイトル (Heading 1):
- 幅: 100%（コンテナ幅）
- 高さ: 40px
- テキスト:
  - フォント: Rounded Mplus 1c Bold
  - サイズ: 32px
  - 行高: 40px
  - 色: #0D221D

進捗バー (progressbar):
- 幅: 350px
- 高さ: 24px
- レイアウト: flex, items-center
- ギャップ: 9px
- ※共通コンポーネント化予定（Step 4参照）

進捗バー背景 (progress_bar):
- 幅: 314px（flex-1）
- 高さ: 7px
- 背景: #EAEAEA
- 角丸: 1000px（完全な丸み）

進捗バー完了部分 (done):
- 幅: 可変（進捗に応じて）
- 高さ: 7px
- 角丸: 40px
- 色: 【要確認：緑系の色】

進捗数字 (block_progress):
- レイアウト: flex, items-end
- ギャップ: 2px
- 数字部分:
  - フォント: Rounded Mplus 1c Bold
  - サイズ: 24px
  - 色: 黒
  - letter-spacing: -0.48px
  - text-align: right
- %記号:
  - フォント: Rounded Mplus 1c Bold
  - サイズ: 10px
  - 色: 黒

説明文エリア (Lesson Description Area):
- 幅: 100%
- 高さ: 105px
- レイアウト: flex, flex-col
- ギャップ: 3px

説明文 (Lesson Description):
- 幅: 100%
- 高さ: 80px（固定、オーバーフローは非表示）
- フォント: Noto Sans JP Regular
- サイズ: 16px
- 行高: 1.6（25.6px）
- 色: #4B5563（グレー）
- text-overflow: ellipsis

「概要・目的ですべてみる」リンク (View All Details):
- フォント: Noto Sans JP Medium
- サイズ: 14px
- 行高: 1.6（22.4px）
- 色: #1E0FF0（青/紫）
- 動作: クリックで「概要・目的」タブに切り替え

CTAボタン (Button):
- 幅: 140px
- 高さ: 48px
- 背景: #000000（黒）
- 角丸: 16px
- パディング: 上下14px、左右28px
- テキスト:
  - フォント: Noto Sans JP Bold
  - サイズ: 14px
  - 行高: 20px
  - 色: 白
  - 中央揃え
- サイズ: large（※Buttonコンポーネント共通化予定）
```

### Figma MCPから取得した生成コード

```tsx
<div className="flex flex-col gap-[14px] items-start w-full">
  {/* カテゴリタグ */}
  <div className="flex items-center w-full">
    <div className="bg-[#ebeced] flex items-center justify-center px-[7px] py-[5px] rounded-[10px]">
      <span className="font-noto-medium text-[12px] text-[#0d221d] text-center leading-[10px]">
        {category}
      </span>
    </div>
  </div>

  {/* タイトル */}
  <div className="flex flex-col items-center w-full">
    <h1 className="font-rounded-mplus-bold text-[32px] text-[#0d221d] leading-[40px] w-full">
      {title}
    </h1>
  </div>

  {/* 進捗バー（共通コンポーネント化予定） */}
  <div className="flex gap-[9px] items-center w-[350px]">
    <div className="bg-[#eaeaea] flex-1 h-[7px] rounded-[1000px] overflow-hidden">
      <div className="h-full rounded-[40px]" style={{ width: `${progress}%` }} />
    </div>
    <div className="flex gap-[2px] items-end font-rounded-mplus-bold">
      <span className="text-[24px] text-black text-right tracking-[-0.48px] leading-none">
        {progress}
      </span>
      <span className="text-[10px] text-black leading-none">%</span>
    </div>
  </div>

  {/* 説明文エリア */}
  <div className="flex flex-col gap-[3px] items-start w-full">
    <div className="w-full h-[80px] overflow-hidden">
      <p className="font-noto-regular text-[16px] text-[#4b5563] leading-[1.6] line-clamp-3">
        {description}
      </p>
    </div>
    <button
      className="font-noto-medium text-[14px] text-[#1e0ff0] leading-[1.6]"
      onClick={onViewAllDetails}
    >
      概要・目的ですべてみる
    </button>
  </div>

  {/* CTAボタン（Buttonコンポーネント size="large"） */}
  <div className="flex items-start w-full">
    <Button size="large" onClick={onStart}>
      スタートする
    </Button>
  </div>
</div>
```

### Props（予定）

```tsx
interface LessonTitleAreaProps {
  lesson: {
    title: string;
    category?: string;
    description?: string;
  };
  progress: number;              // 0-100
  onStart?: () => void;          // 「スタートする」クリック時
  onViewAllDetails?: () => void; // 「概要・目的ですべてみる」クリック時 → タブ切替
}
```

### 実装メモ

- **CategoryTag**: 共通コンポーネント化（Step 5参照）
- **ProgressBar**: 共通コンポーネント化が必要（マイページ・記事・詳細画面で共通化）
- **Button**: size="large"を使用（large/medium/small対応が必要）
- **「概要・目的ですべてみる」**: クリックで「概要・目的」タブに表示切替
- **「スタートする」**: 最初の未完了コンテンツへ遷移

---

## Step 4: ProgressBar（統一）

**用途**: レッスン進捗バー（マイページ・記事・詳細画面で共通使用）

**Figmaリンク**: [node-id=418:7842](https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D?node-id=418:7842)

### 現状分析：既存の進捗バー実装

現在、**3箇所**で進捗バーが別々に実装されている：

#### 1. マイページ（ProgressLesson.tsx）
**ファイル**: `src/components/progress/ProgressLesson.tsx` (200-234行目)

```tsx
// インラインスタイルで実装
<div style={{
  backgroundColor: "#EAEAEA",
  height: "6px",              // ← 高さ6px
  width: "100%",
  borderRadius: "1000px",
  ...
}}>
  <div style={{
    backgroundColor: "#000000", // ← 進捗色: 黒
    width: `${progress}%`,
    height: "6px",
    borderRadius: "40px",
    ...
  }} />
</div>
```

**パーセント表示**: 24px + 10px（Rounded Mplus 1c）

#### 2. 記事サイドバー（LessonDetailCard.tsx）
**ファイル**: `src/components/article/sidebar/LessonDetailCard.tsx` (58-74行目)

```tsx
// Tailwind CSSで実装
<div className="flex-1 h-[7px] bg-[#eaeaea] rounded-full overflow-hidden">
  <div
    className="h-full bg-black rounded-[40px] transition-all duration-400"
    style={{ width: `${progress}%` }}
  />
</div>

// パーセント表示
<div className="flex items-end text-black font-bold font-rounded-mplus">
  <span className="text-2xl tracking-[-0.48px] leading-none">{progress}</span>
  <span className="text-[10px] leading-none">%</span>
</div>
```

**パーセント表示**: text-2xl(24px) + 10px（font-rounded-mplus）

#### 3. UIコンポーネント（progress.tsx）
**ファイル**: `src/components/ui/progress.tsx`

```tsx
// Radix UIベース（shadcn/ui）
<ProgressPrimitive.Root className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
  <ProgressPrimitive.Indicator
    className="h-full w-full flex-1 bg-primary transition-all"
    style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
  />
</ProgressPrimitive.Root>
```

**問題**: h-4 (16px)、パーセント表示なし、デザインが異なる

### 統一仕様

| 項目 | 仕様 |
|------|------|
| **バー高さ** | 7px（Figma準拠、既存の6pxから統一） |
| **バー背景色** | #EAEAEA |
| **バー進捗色** | #000000（黒） |
| **バー角丸** | 1000px（背景）/ 40px（進捗部分） |
| **数字フォント** | Rounded Mplus 1c Bold |
| **数字サイズ** | 24px |
| **数字letter-spacing** | -0.48px |
| **%記号サイズ** | 10px |

### 統一後の仕様

```
コンテナ:
- レイアウト: flex, items-center
- ギャップ: 9px
- 幅: 可変（親要素に依存）または固定指定可能

バー背景:
- 高さ: 7px
- 背景: #EAEAEA
- 角丸: 1000px（rounded-full）
- flex: 1（伸縮可能）

バー進捗部分:
- 高さ: 7px
- 背景: #000000
- 角丸: 40px
- 幅: {progress}%
- transition: width 0.3s ease

パーセント表示:
- レイアウト: flex, items-end
- ギャップ: 2px
- 数字: 24px, Rounded Mplus 1c Bold, tracking-[-0.48px]
- %: 10px, Rounded Mplus 1c Bold
```

### Props（予定）

```tsx
interface LessonProgressBarProps {
  /** 進捗率 0-100 */
  progress: number;
  /** パーセント表示の有無（デフォルト: true） */
  showPercent?: boolean;
  /** 幅指定（デフォルト: 100%） */
  width?: string | number;
  /** カスタムクラス */
  className?: string;
}
```

### 統一後のコンポーネント

```tsx
// src/components/ui/LessonProgressBar.tsx
export function LessonProgressBar({
  progress,
  showPercent = true,
  width,
  className,
}: LessonProgressBarProps) {
  return (
    <div
      className={cn("flex items-center gap-[9px]", className)}
      style={{ width: width || "100%" }}
    >
      {/* バー */}
      <div className="flex-1 h-[7px] bg-[#eaeaea] rounded-full overflow-hidden">
        <div
          className="h-full bg-black rounded-[40px] transition-all duration-300"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      {/* パーセント表示 */}
      {showPercent && (
        <div className="flex items-end font-bold font-rounded-mplus text-black whitespace-nowrap">
          <span className="text-2xl tracking-[-0.48px] leading-none">
            {progress}
          </span>
          <span className="text-[10px] leading-none">%</span>
        </div>
      )}
    </div>
  );
}
```

### 統一化タスク

| # | タスク | 対象ファイル |
|---|--------|-------------|
| 1 | 共通コンポーネント作成 | `src/components/ui/LessonProgressBar.tsx` |
| 2 | マイページ置き換え | `src/components/progress/ProgressLesson.tsx` (200-234行) |
| 3 | 記事サイドバー置き換え | `src/components/article/sidebar/LessonDetailCard.tsx` (58-74行) |
| 4 | レッスン詳細で使用 | `src/components/lesson/LessonTitleArea.tsx`（新規） |
| 5 | 既存progress.tsx整理 | 必要に応じて削除または別用途に |

### 注意事項

- 既存の `src/components/ui/progress.tsx`（Radix UIベース）は別用途（フォーム等）で使用される可能性があるため、削除ではなく**別名で新規作成**
- 新コンポーネント名: `LessonProgressBar`（レッスン進捗専用）
- フォント `font-rounded-mplus` がtailwind.configに定義されていることを確認

---

## Step 5: CategoryTag

**用途**: タイトル上のカテゴリ表示（例: UIデザイン）

### Figma仕様

```
【ここに仕様を記入】

タグ:
- 背景:
- パディング:
- 角丸:
- ボーダー:

テキスト:
- フォント:
- サイズ:
- 色:
```

### Props（予定）

```tsx
interface CategoryTagProps {
  category: string;
  variant?: "default" | "outline";
}
```

---

## Step 6: Button（サイズ追加）

**用途**: Buttonコンポーネントにサイズバリエーション追加

### 現状

現在のButtonコンポーネントは単一サイズのみ。

### 追加するサイズ

```
large:
- 高さ: 48px
- パディング: 上下14px、左右28px
- 角丸: 16px
- フォントサイズ: 14px
- 行高: 20px
- 用途: CTAボタン（「スタートする」など）

medium:
- 高さ: 【要確認】
- パディング: 【要確認】
- 角丸: 【要確認】
- フォントサイズ: 【要確認】
- 用途: 一般的なアクションボタン

small:
- 高さ: 【要確認】
- パディング: 【要確認】
- 角丸: 【要確認】
- フォントサイズ: 【要確認】
- 用途: コンパクトなボタン
```

### Props（予定）

```tsx
interface ButtonProps {
  children: React.ReactNode;
  size?: "large" | "medium" | "small";  // デフォルト: "medium"
  variant?: "primary" | "secondary" | "outline";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}
```

### 実装タスク

1. **既存Buttonコンポーネントの調査**: `src/components/ui/Button.tsx`
2. **sizeプロパティ追加**: large/medium/small
3. **各サイズのスタイル定義**
4. **既存使用箇所への影響確認**

---

## Step 7: QuestCard（修正）

**用途**: 既存QuestCardのスタイル調整

### 変更点

```
【ここに変更仕様を記入】

現在:
- 個別記事に矢印アイコン

変更後:
-

カードヘッダー:
-

矢印アイコン:
- 位置:
- サイズ:

展開/折りたたみ:
- 有無:
- 挙動:
```

---

## Step 8: ContentItem（修正）

**用途**: 既存ContentItemのスタイル調整

### 変更点

```
【ここに変更仕様を記入】

現在:
- 右端に矢印アイコン

変更後:
-

その他変更:
-
```

---

## Step 9: LessonDetail（統合）

**用途**: ページ全体のレイアウト変更

### Figma仕様

```
【ここに仕様を記入】

全体レイアウト:
- デスクトップ:
- モバイル:

サイドバー:
- 幅:
- 固定/スクロール:

メインコンテンツ:
- 最大幅:
- パディング:

タブ位置:
-

レスポンシブブレークポイント:
-
```

---

## 備考・質問

```
【実装前に確認したいこと】

1.
2.
3.
```

---

## 進め方

1. 上記の各Stepの「Figma仕様」セクションに仕様を記入
2. 記入完了したStepから順次実装
3. 各Step完了後にステータスを更新
