# レッスン部分コンポーネント 実装仕様書

## 概要

レッスンの詳細情報を表示するコンポーネント。レッスンサムネイル画像、タイトル、進捗プログレスバーを縦積みレイアウトで配置。カード形式で背景色を持ち、タブレット以上での横表示対応も検討。

---

## 1. コンポーネント構造

### HTML / JSX 構造

```jsx
<div class="lesson-detail">
  <div class="lesson-detail__wrap">
    {/* レッスンサムネイル画像 */}
    <div class="lesson-detail__icon">
      <img src="lesson-thumbnail.jpg" alt="ToDoサービスをデザインしよう" />
    </div>

    {/* レッスン詳細情報 */}
    <div class="lesson-detail__content">
      {/* レッスンタイトル */}
      <h3 class="lesson-detail__title">ToDoサービスをデザインしよう</h3>

      {/* プログレスボックス */}
      <div class="lesson-detail__progress">
        <div class="progress-bar">
          <div class="progress-bar__background">
            <div class="progress-bar__fill"></div>
          </div>
        </div>
        <div class="progress-percent">
          <span class="progress-percent__number">2</span>
          <span class="progress-percent__unit">%</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

### コンポーネント仕様

- **タイプ**: カード型コンテナ
- **用途**: レッスン情報表示
- **レイアウト**: 縦積み（column）
- **インタラクティブ**: 選択可能（フォーカス状態対応推奨）

---

## 2. レイアウト・サイズ仕様

### 全体コンテナ（lesson-detail）

| プロパティ             | 値                      |
| ---------------------- | ----------------------- |
| **幅**                 | 316px（固定）           |
| **高さ**               | content（動的）         |
| **パディング**         | 12px                    |
| **ディスプレイ**       | flex（column）          |
| **ギャップ**           | 4px                     |
| **背景色**             | #F9FAFB（ライトグレー） |
| **ボーダーラディウス** | 0px（デフォルト）       |

### ラップコンテナ（wrap）

| プロパティ       | 値                            |
| ---------------- | ----------------------------- |
| **幅**           | 100%（親に合わせる）          |
| **高さ**         | content（動的）               |
| **ディスプレイ** | flex（column）                |
| **配置**         | center（中央配置）            |
| **ギャップ**     | 6px                           |
| **自動サイズ**   | fill-horizontal、hug-vertical |

### レッスンアイコン領域（icon_lesson）

| プロパティ               | 値                                     |
| ------------------------ | -------------------------------------- |
| **幅**                   | 53.33px（固定）                        |
| **高さ**                 | 80px（固定）                           |
| **ボーダーラディウス**   | 0px 5.33px 5.33px 0px（右側のみ丸い）  |
| **背景**                 | レッスンサムネイル画像（cover）        |
| **シャドウ**             | 1.33px 1.33px 18.08px rgba(0,0,0,0.33) |
| **オブジェクトフィット** | cover / fill                           |

### レッスンタイトル（lesson_title）

| プロパティ           | 値                          |
| -------------------- | --------------------------- |
| **フォント**         | Inter                       |
| **フォントウェイト** | 500（Medium）               |
| **フォントサイズ**   | 13px                        |
| **行高**             | 1.846em（≈24px）            |
| **レターパディング** | -2.40%（タイト）            |
| **色**               | #101828（濃いグレー）       |
| **テキスト配置**     | 左寄せ                      |
| **サイジング**       | hug（コンテンツに合わせる） |

### プログレスボックス（progress_box）

| プロパティ       | 値                   |
| ---------------- | -------------------- |
| **ディスプレイ** | flex（row）          |
| **配置**         | center（垂直中央）   |
| **ギャップ**     | 5px                  |
| **幅**           | 100%（親に合わせる） |
| **高さ**         | content（動的）      |

### プログレスバー（ProgressBar）

| プロパティ             | 値                             |
| ---------------------- | ------------------------------ |
| **幅**                 | 160px（固定）                  |
| **高さ**               | 2px（固定）                    |
| **ボーダーラディウス** | 16777200px（完全円形、最大値） |
| **背景色**             | #E5E7EB（ライトグレー）        |

### プログレスフィル（Container）

| プロパティ             | 値                           |
| ---------------------- | ---------------------------- |
| **幅**                 | 動的（パーセンテージベース） |
| **高さ**               | 4px（親の 2 倍）             |
| **背景色**             | #155DFC（ブルー）            |
| **ボーダーラディウス** | 2px（親に合わせる）          |

### パーセンテージ表示（percent）

| プロパティ       | 値             |
| ---------------- | -------------- |
| **ディスプレイ** | flex（row）    |
| **ギャップ**     | 2px            |
| **配置**         | center（中央） |

### パーセンテージ数値（number）

| プロパティ           | 値                |
| -------------------- | ----------------- |
| **フォント**         | Inter             |
| **フォントウェイト** | 400（Normal）     |
| **フォントサイズ**   | 12px              |
| **行高**             | 1.333em（≈16px）  |
| **色**               | #6A7282（グレー） |

### パーセンテージ単位（%）

| プロパティ           | 値                |
| -------------------- | ----------------- |
| **フォント**         | Inter             |
| **フォントウェイト** | 400（Normal）     |
| **フォントサイズ**   | 10px              |
| **行高**             | 1.6em（≈16px）    |
| **色**               | #6A7282（グレー） |

---

## 3. ビジュアル仕様

### 色パレット

| 要素               | 色コード | RGB 値             | 用途             |
| ------------------ | -------- | ------------------ | ---------------- |
| 背景               | #F9FAFB  | rgb(249, 250, 251) | コンテナ背景     |
| タイトル           | #101828  | rgb(16, 24, 40)    | テキスト（濃い） |
| パーセンテージ     | #6A7282  | rgb(106, 114, 130) | テキスト（薄い） |
| プログレスバー背景 | #E5E7EB  | rgb(229, 231, 235) | 背景トラック     |
| プログレスフィル   | #155DFC  | rgb(21, 93, 252)   | アクティブフィル |

### ボックスシャドウ

```css
box-shadow: 1.33px 1.33px 18.08px rgba(0, 0, 0, 0.33);
```

- **Offset X**: 1.33px
- **Offset Y**: 1.33px
- **Blur**: 18.08px
- **Spread**: 0px
- **Color**: rgba(0, 0, 0, 0.33)

### レッスン画像

- **アスペクト比**: 約 53.33 × 80 = 2:3（縦向き）
- **フィットモード**: cover（画像の一部がカットされる可能性）
- **クロップ**: Figma で指定のクロップ変換あり

---

## 4. インタラクション仕様

### ホバー状態

- **背景色の変更**: #F3F4F6 にやや濃くなる（推奨）
- **アイコンシャドウの強調**: ボックスシャドウを 2px 2px 20px rgba(0,0,0,0.4) に変更
- **アニメーション**: 150ms ease-in-out
- **カーソル**: pointer

### アクティブ / クリック状態

- **背景色**: #E5E7EB にさらに濃くなる
- **スケール**: 98-99% に縮小
- **アニメーション**: 100ms ease-out

### フォーカス状態（キーボード操作）

- **アウトライン**: 2px solid #0066CC
- **内側パディング**: 4px
- **ボーダーラディウス**: 4px

### 進捗更新時のアニメーション

- **プログレスフィル更新**: width を徐々に変更（300-500ms）
- **トランジション**: `width 400ms cubic-bezier(0.4, 0, 0.2, 1)`

---

## 5. CSS 実装例

```css
/* レッスン詳細コンテナ */
.lesson-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  width: 316px;
  background-color: #f9fafb;
  border-radius: 4px;
  transition: background-color 150ms ease-in-out;
}

/* ホバー状態 */
.lesson-detail:hover {
  background-color: #f3f4f6;
}

.lesson-detail:hover .lesson-detail__icon {
  box-shadow: 2px 2px 20px rgba(0, 0, 0, 0.4);
}

/* アクティブ状態 */
.lesson-detail:active {
  transform: scale(0.98);
}

/* フォーカス状態 */
.lesson-detail:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
  border-radius: 4px;
}

/* ラップコンテナ */
.lesson-detail__wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
  gap: 6px;
  width: 100%;
  height: auto;
}

/* アイコン領域 */
.lesson-detail__icon {
  width: 53.33px;
  height: 80px;
  border-radius: 0 5.33px 5.33px 0;
  overflow: hidden;
  box-shadow: 1.33px 1.33px 18.08px rgba(0, 0, 0, 0.33);
  transition: box-shadow 150ms ease-in-out;
}

.lesson-detail__icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* コンテンツ領域 */
.lesson-detail__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
  gap: 6px;
  width: 100%;
  height: auto;
}

/* レッスンタイトル */
.lesson-detail__title {
  font-family: Inter, sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.846em;
  letter-spacing: -2.4%;
  color: #101828;
  text-align: left;
  margin: 0;
  padding: 0;
  width: auto;
  height: auto;
}

/* プログレスボックス */
.lesson-detail__progress {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  gap: 5px;
  width: 100%;
  height: auto;
}

/* プログレスバー全体 */
.progress-bar {
  width: 160px;
  height: 2px;
  border-radius: 999px;
  background-color: #e5e7eb;
  overflow: hidden;
  position: relative;
}

/* プログレスバー背景 */
.progress-bar__background {
  width: 100%;
  height: 100%;
  background-color: #e5e7eb;
}

/* プログレスフィル */
.progress-bar__fill {
  width: 2%; /* 動的に更新 */
  height: 4px;
  background-color: #155dfc;
  border-radius: 2px;
  transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* パーセンテージ表示 */
.progress-percent {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2px;
  height: auto;
}

/* 数値 */
.progress-percent__number {
  font-family: Inter, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.333em;
  color: #6a7282;
}

/* パーセント記号 */
.progress-percent__unit {
  font-family: Inter, sans-serif;
  font-size: 10px;
  font-weight: 400;
  line-height: 1.6em;
  color: #6a7282;
}
```

---

## 6. React 実装例

```jsx
import React, { useState } from "react";
import "./LessonDetail.css";

interface LessonDetailProps {
  id: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  progressPercent: number;
  onClick?: () => void;
}

export const LessonDetail: React.FC<LessonDetailProps> = ({
  id,
  title,
  imageUrl,
  imageAlt,
  progressPercent,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="lesson-detail"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`${title} - ${progressPercent}% 完了`}
    >
      <div className="lesson-detail__wrap">
        {/* レッスンアイコン */}
        <div className="lesson-detail__icon">
          <img src={imageUrl} alt={imageAlt} />
        </div>

        {/* コンテンツ */}
        <div className="lesson-detail__content">
          {/* タイトル */}
          <h3 className="lesson-detail__title">{title}</h3>

          {/* プログレスボックス */}
          <div className="lesson-detail__progress">
            <div className="progress-bar">
              <div className="progress-bar__background">
                <div
                  className="progress-bar__fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="progress-percent">
              <span className="progress-percent__number">
                {progressPercent}
              </span>
              <span className="progress-percent__unit">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;
```

---

## 7. HTML 実装例

```html
<div class="lesson-detail" tabindex="0" role="button">
  <div class="lesson-detail__wrap">
    <!-- レッスンアイコン -->
    <div class="lesson-detail__icon">
      <img src="lesson-thumbnail.jpg" alt="ToDoサービスをデザインしよう" />
    </div>

    <!-- コンテンツ -->
    <div class="lesson-detail__content">
      <!-- タイトル -->
      <h3 class="lesson-detail__title">ToDoサービスをデザインしよう</h3>

      <!-- プログレスボックス -->
      <div class="lesson-detail__progress">
        <div class="progress-bar">
          <div class="progress-bar__background">
            <div class="progress-bar__fill" style="width: 2%;"></div>
          </div>
        </div>
        <div class="progress-percent">
          <span class="progress-percent__number">2</span>
          <span class="progress-percent__unit">%</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 8. レスポンシブ対応

### モバイル（320px - 480px）

- **コンテナ幅**: 100%（最大 316px）
- **パディング**: 12px（維持）
- **フォントサイズ**: 13px（維持、読みやすさ確認）
- **アイコン高さ**: 80px（維持）
- **プログレスバー幅**: 160px（維持）

### タブレット（481px - 1024px）

- **コンテナ幅**: 316px（固定）
- **複数カード横並び**: 2-3 列グリッドレイアウト推奨
- **ギャップ**: 16px

### デスクトップ（1025px 以上）

- **コンテナ幅**: 316px（固定）
- **複数カード横並び**: 3-4 列グリッドレイアウト推奨
- **ホバー効果**: より顕著に（シャドウ強調）

---

## 9. プログレスバー動的更新

### JavaScript/React での進捗更新

```javascript
// 進捗を更新する関数
const updateProgress = (progressPercent: number) => {
  const fillElement = document.querySelector('.progress-bar__fill') as HTMLElement;
  if (fillElement) {
    fillElement.style.width = `${Math.min(100, progressPercent)}%`;
  }
};

// 例：スクロール時に進捗を更新
window.addEventListener('scroll', () => {
  const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  updateProgress(scrollPercent);
});
```

---

## 10. アクセシビリティ

### ARIA 属性

```html
<div
  class="lesson-detail"
  tabindex="0"
  role="button"
  aria-label="ToDoサービスをデザインしよう - 2% 完了"
>
  <!-- コンテンツ -->
</div>
```

### 対応項目

- ✅ キーボードナビゲーション（Tab キーで選択可能、Enter で実行）
- ✅ フォーカス表示（明確な枠線）
- ✅ スクリーンリーダー対応（aria-label で進捗含めて読み上げ）
- ✅ コントラスト比：4.5:1 以上（WCAG AA 準拠）
- ✅ テキストリサイズ対応（EM 単位使用）

---

## 11. 使用例・シーン

### 単一レッスンカード表示

```jsx
<LessonDetail
  id="lesson-1"
  title="ToDoサービスをデザインしよう"
  imageUrl="/images/lesson-todo.jpg"
  imageAlt="ToDoサービスのレッスンサムネイル"
  progressPercent={2}
  onClick={() => navigateToLesson("lesson-1")}
/>
```

### レッスンリスト表示

```jsx
<div class="lesson-grid">
  {lessons.map((lesson) => (
    <LessonDetail
      key={lesson.id}
      id={lesson.id}
      title={lesson.title}
      imageUrl={lesson.imageUrl}
      imageAlt={lesson.imageAlt}
      progressPercent={lesson.progressPercent}
      onClick={() => navigateToLesson(lesson.id)}
    />
  ))}
</div>

<style>
  .lesson-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(316px, 1fr));
    gap: 16px;
    padding: 16px;
  }
</style>
```

---

## 12. 注記・最適化ポイント

1. **画像最適化**: サムネイル画像は WebP フォーマットで提供し、PNG/JPG のフォールバック用意
2. **プログレスバー**: 2% は表示上ほぼ見えないため、最小値（5-10%）の制限検討
3. **クロップ**: Figma のクロップは 0.9934 × スケール + 0.0033 オフセット。実装時は `object-fit: cover` で調整可能
4. **パフォーマンス**: 複数カード表示時は仮想スクロール（React Window など）検討
5. **ライトモード・ダークモード**: 背景色を CSS 変数で管理し、容易に切り替え可能にする

---

## チェックリスト

- [ ] レッスンサムネイル画像が 53.33 × 80px で正しく表示される
- [ ] ボーダーラディウス（右側のみ 5.33px）が正しく反映される
- [ ] プログレスバーの幅が 160px、フィルがパーセンテージで正しく変更される
- [ ] ホバー時の背景色・シャドウ変更が滑らかに遷移する
- [ ] キーボード フォーカス表示が明確
- [ ] モバイルでタップ領域が十分（44×44px 以上）
- [ ] スクリーンリーダーで「ToDo サービスをデザインしよう - 2% 完了」と読み上げられる
- [ ] 進捗更新時のアニメーションが自然
- [ ] ライトモード・ダークモード両対応確認
