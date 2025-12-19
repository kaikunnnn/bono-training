# Progress Lesson Component

Figma デザインから実装した学習進捗カードコンポーネント。

## 📋 概要

このコンポーネントは、オンライン学習プラットフォーム（BONO）の進捗状況を表示するためのカード UI です。ユーザーのレッスン進捗、現在のステップ、完了状態を視覚的に表現します。

### デザイン仕様

- **サイズ**: 360px × 147px 👉️ レスポンシブです。横幅はレスポンシブ、縦幅も中の余白でつくる結果のサイズになります。
- **スタイル**: モダンでミニマルなカードデザイン
- **カラー**: カスタマイズ可能なアイコン背景色、黒のプログレスバー

## 🎨 バリエーション

2 つのバージョンを用意しています:

1. **ProgressLesson.tsx** - インラインスタイル版（依存なし）
2. **ProgressLessonTailwind.tsx** - Tailwind CSS 版

## 📦 インストール & セットアップ

### インラインスタイル版

```bash
# 依存なし、そのままコピーして使用可能
```

### Tailwind CSS 版

```bash
# Tailwind CSSが必要
npm install -D tailwindcss
```

## 🚀 使用方法

### 基本的な使い方

```tsx
import { ProgressLesson } from "./ProgressLesson";

function App() {
  return (
    <ProgressLesson
      title="センスを盗む技術"
      progress={25}
      currentStep="送る視線①:ビジュアル"
      isStepCompleted={false}
    />
  );
}
```

### カスタムアイコンと色

```tsx
<ProgressLesson
  icon="UI"
  iconBgColor="#E3F2FD"
  title="UIデザインの基礎"
  progress={75}
  currentStep="レイアウト設計の基本"
  isStepCompleted={true}
  onClick={() => console.log("クリック!")}
/>
```

### 画像アイコン

```tsx
<ProgressLesson
  icon="https://example.com/icon.png"
  iconBgColor="#F5F5F5"
  title="フロントエンド開発"
  progress={100}
  currentStep="React基礎完了"
  isStepCompleted={true}
/>
```

### 絵文字アイコン

```tsx
<ProgressLesson
  icon="🎨"
  iconBgColor="#E8F5E9"
  title="カラー理論"
  progress={15}
  currentStep="色彩の基礎知識"
  isStepCompleted={false}
/>
```

## 📚 Props API

| Prop              | 型           | デフォルト  | 説明                                         |
| ----------------- | ------------ | ----------- | -------------------------------------------- |
| `icon`            | `string`     | `'COPY'`    | アイコンテキスト、絵文字、または画像 URL     |
| `iconBgColor`     | `string`     | `'#FFE5E5'` | アイコン背景色（HEX または Tailwind クラス） |
| `title`           | `string`     | **必須**    | レッスンのタイトル                           |
| `progress`        | `number`     | **必須**    | 進捗率 (0-100)                               |
| `currentStep`     | `string`     | **必須**    | 現在のステップ名                             |
| `isStepCompleted` | `boolean`    | **必須**    | ステップが完了しているか                     |
| `onClick`         | `() => void` | `undefined` | クリック時のコールバック                     |

## 🎯 デザイントークン

### カラーパレット

```tsx
// アイコン背景色のバリエーション
const iconColors = {
  pink: "#FFE5E5", // デフォルト
  blue: "#E3F2FD", // UI系
  purple: "#F3E5F5", // UX系
  yellow: "#FFF9C4", // コーディング系
  green: "#E8F5E9", // デザイン系
  orange: "#FBE9E7", // タイポグラフィ系
  teal: "#E0F2F1", // プロトタイピング系
};
```

### タイポグラフィ

```tsx
const typography = {
  title: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1A1A1A",
  },
  percentage: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1A1A1A",
  },
  step: {
    fontSize: "14px",
    fontWeight: "400",
    color: "#666666",
  },
};
```

### スペーシング

```tsx
const spacing = {
  cardPadding: "20px",
  iconGap: "12px",
  progressGap: "12px",
  stepTopMargin: "16px",
};
```

## 🎭 ステート管理

### 進捗更新の例

```tsx
function LessonTracker() {
  const [progress, setProgress] = useState(25);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleStepComplete = () => {
    const newProgress = Math.min(progress + 25, 100);
    setProgress(newProgress);
    setIsCompleted(true);
  };

  return (
    <ProgressLesson
      title="センスを盗む技術"
      progress={progress}
      currentStep="送る視線①:ビジュアル"
      isStepCompleted={isCompleted}
      onClick={handleStepComplete}
    />
  );
}
```

## ♿ アクセシビリティ

このコンポーネントは以下のアクセシビリティ機能を実装しています:

- **ARIA 属性**

  - `role="article"` - カード全体
  - `aria-label` - レッスン名と進捗状況
  - `role="progressbar"` - プログレスバー
  - `aria-valuenow`, `aria-valuemin`, `aria-valuemax` - 進捗値

- **キーボード対応**

  - `onClick`が指定されている場合、フォーカス可能
  - Enter キーでの操作対応（ブラウザデフォルト）

- **視覚的フィードバック**
  - ホバー時の影変化
  - 完了/未完了の色分け（緑/グレー）
  - 十分なコントラスト比

## 📱 レスポンシブデザイン

```css
/* モバイル対応の例 */
@media (max-width: 768px) {
  .progress-lesson-card {
    width: 100%;
    max-width: 360px;
  }
}
```

## 🎨 カスタマイズ例

### ダークモード対応

```tsx
const ProgressLessonDark = (props) => {
  return (
    <div
      style={{
        backgroundColor: "#1F1F1F",
        color: "#FFFFFF",
        // ... その他のスタイル
      }}
    >
      {/* コンポーネント内容 */}
    </div>
  );
};
```

### グリッドレイアウト

```tsx
function LessonGrid() {
  const lessons = [...]; // レッスンデータ

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
      gap: '24px',
    }}>
      {lessons.map((lesson) => (
        <ProgressLesson key={lesson.id} {...lesson} />
      ))}
    </div>
  );
}
```

## 🔧 トラブルシューティング

### アイコンが表示されない

画像 URL を使用する場合は、CORS ポリシーを確認してください。

```tsx
// 代替案: Base64エンコードされた画像
icon = "data:image/png;base64,iVBORw0KG...";
```

### プログレスバーがアニメーションしない

CSS トランジションが正しく適用されているか確認してください。

```css
transition: width 0.3s ease;
```

## 📄 ライセンス

このコンポーネントは Figma デザインから実装された BONO 専用コンポーネントです。

## 🤝 コントリビューション

改善提案やバグ報告は、チームの Slack チャンネルまでお願いします。

## 📞 サポート

質問や問題がある場合:

1. このドキュメントを確認
2. `progress-lesson-demo.html`でデモを確認
3. チームメンバーに相談

---

**作成日**: 2025 年 1 月
**バージョン**: 1.0.0
**デザイナー**: BONO Design Team
**実装**: Claude (AI)
