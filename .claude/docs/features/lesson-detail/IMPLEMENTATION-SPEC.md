# レッスン詳細ページ 実装仕様書

**最終更新**: 2025-01-15
**ステータス**: 仕様記入中

---

## 実装ステップ一覧

| Step | コンポーネント | 状態 | 備考 |
|------|---------------|------|------|
| 1 | LessonHeader | 仕様待ち | 戻る + シェアボタン |
| 2 | LessonSidebar | 仕様待ち | 左サイドバー全体 |
| 3 | LessonCard | 仕様待ち | サイドバー内のレッスンカード |
| 4 | ProgressBar | 仕様待ち | タイトル下の進捗バー |
| 5 | CategoryTag | 仕様待ち | カテゴリタグ |
| 6 | QuestCard（修正） | 仕様待ち | 矢印位置変更など |
| 7 | ContentItem（修正） | 仕様待ち | 矢印削除など |
| 8 | LessonDetail（統合） | 仕様待ち | ページ全体レイアウト |

---

## Step 1: LessonHeader

**用途**: ページ上部の戻るボタン + シェアボタン

### Figma仕様

```
【ここに仕様を記入】

コンテナ:
- 幅:
- 高さ:
- 背景:
- パディング:

戻るボタン:
- アイコン:
- テキスト:
- フォント:
- 色:
- ギャップ:

シェアボタン:
- テキスト:
- フォント:
- 色:
- 背景:
- ボーダー:
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

**用途**: 左サイドバー全体（デスクトップのみ表示）

### Figma仕様

```
【ここに仕様を記入】

コンテナ:
- 幅:
- 背景:
- パディング:
- ボーダー:

表示条件:
- デスクトップ:
- モバイル:

内部構成:
1. LessonCard
2. ロードマップセクション（任意）
```

### Props（予定）

```tsx
interface LessonSidebarProps {
  lesson: {
    title: string;
    iconImage?: any;
    iconImageUrl?: string;
  };
  roadmap?: {
    title: string;
    href: string;
  };
}
```

---

## Step 3: LessonCard

**用途**: サイドバー内のレッスンアイコン+タイトル表示

### Figma仕様

```
【ここに仕様を記入】

カード:
- 幅:
- 高さ:
- 背景:
- ボーダー:
- 角丸:
- シャドウ:

アイコン画像:
- 幅:
- 高さ:
- 位置:

タイトル:
- フォント:
- サイズ:
- 色:
- 位置:
```

### Props（予定）

```tsx
interface LessonCardProps {
  title: string;
  iconImage?: any;
  iconImageUrl?: string;
  category?: string;
}
```

---

## Step 4: ProgressBar

**用途**: タイトル下のレッスン全体進捗表示

### Figma仕様

```
【ここに仕様を記入】

コンテナ:
- 幅:
- 高さ:
- 配置:

バー背景:
- 色:
- 高さ:
- 角丸:

バー進捗:
- 色:
- アニメーション:

パーセント表示:
- フォント:
- サイズ:
- 色:
- 位置:
```

### Props（予定）

```tsx
interface ProgressBarProps {
  progress: number;        // 0-100
  showPercent?: boolean;   // デフォルト: true
  size?: "sm" | "md" | "lg";
}
```

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

## Step 6: QuestCard（修正）

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

## Step 7: ContentItem（修正）

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

## Step 8: LessonDetail（統合）

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
