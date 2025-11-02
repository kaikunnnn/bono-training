# レッスン詳細＋バックナビゲーション セット仕様書（修正版）

## 概要

レッスン詳細情報表示エリアの統合コンポーネント。バックナビゲーションとレッスンカード（サムネイル・タイトル・プログレスバー）が上下に配置されたセット。サイドバーの最上部に表示され、ユーザーがレッスンの階層から戻る導線と、学習進捗を同時に確認できる。

---

## 1. コンポーネント構造

### HTML / JSX 構造

```jsx
<section class="lesson-detail-section">
  {/* ナビゲーション領域 */}
  <div class="lesson-section__navigation">
    <button class="back-navigation">
      <span class="back-navigation__icon">{/* 矢印アイコン SVG */}</span>
      <span class="back-navigation__text">トップへ</span>
    </button>
  </div>

  {/* レッスン詳細カード */}
  <div class="lesson-detail">
    <div class="lesson-detail__wrap">
      {/* レッスンサムネイル */}
      <div class="lesson-detail__icon">
        <img src="lesson-thumbnail.jpg" alt="ToDoサービスをデザインしよう" />
      </div>

      {/* レッスン情報 */}
      <div class="lesson-detail__content">
        <h2 class="lesson-detail__title">ToDoサービスをデザインしよう</h2>

        {/* プログレス情報 */}
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
</section>
```

### セット仕様

- **タイプ**: ナビゲーション + インフォメーション統合セクション
- **用途**: サイドバートップのレッスン情報表示・戻るナビゲーション
- **親**: sidenavi（サイドバー）
- **子**: back_navigation + lesson_detail

---

## 2. レイアウト・サイズ仕様

### 全体セクション（lesson_detail_section）

| プロパティ       | 値                            |
| ---------------- | ----------------------------- |
| **ディスプレイ** | flex（column）                |
| **幅**           | 100%（親に合わせる）          |
| **高さ**         | content（動的）               |
| **パディング**   | 12px 0px                      |
| **ギャップ**     | 0px（内部要素で管理）         |
| **背景色**       | #FFFFFF（白）                 |
| **ボーダー下**   | 1px #F0F0F0（薄いグレー）     |
| **自動サイズ**   | fill-horizontal、hug-vertical |

### ナビゲーション領域（lesson_section\_\_navigation）

| プロパティ       | 値                   |
| ---------------- | -------------------- |
| **ディスプレイ** | flex（column）       |
| **幅**           | 100%（親に合わせる） |
| **高さ**         | content（動的）      |
| **パディング**   | 0px 12px             |
| **ギャップ**     | 10px                 |
| **背景色**       | transparent          |

### バックナビゲーション（back_navigation）

| プロパティ       | 値                 |
| ---------------- | ------------------ |
| **ディスプレイ** | flex（row）        |
| **配置**         | center（垂直中央） |
| **ギャップ**     | 4px                |
| **幅**           | content（動的）    |
| **高さ**         | content（動的）    |

#### アイコン（circle_block）

| プロパティ             | 値                    |
| ---------------------- | --------------------- |
| **幅**                 | 16px（固定）          |
| **高さ**               | 16px（固定）          |
| **背景色**             | #E4E4E4（薄いグレー） |
| **ボーダーラディウス** | 1000px（円形）        |

#### テキスト

| プロパティ           | 値                |
| -------------------- | ----------------- |
| **フォント**         | Noto Sans JP      |
| **フォントサイズ**   | 10px              |
| **フォントウェイト** | 400               |
| **行高**             | 1.6em             |
| **色**               | #6D6D6D（グレー） |
| **テキスト**         | トップへ          |

### レッスン詳細コンテナ（lesson_detail）

| プロパティ       | 値                            |
| ---------------- | ----------------------------- |
| **ディスプレイ** | flex（column）                |
| **ギャップ**     | 4px                           |
| **パディング**   | 0px 12px                      |
| **幅**           | 100%（親に合わせる）          |
| **高さ**         | content（動的）               |
| **背景色**       | transparent                   |
| **自動サイズ**   | fill-horizontal、hug-vertical |

### ラップコンテナ（wrap）

| プロパティ       | 値                     |
| ---------------- | ---------------------- |
| **ディスプレイ** | flex（column）         |
| **配置**         | center（アイテム中央） |
| **ギャップ**     | 6px                    |
| **幅**           | 100%（親に合わせる）   |

### レッスンアイコン（icon_lesson）

| プロパティ             | 値                                        |
| ---------------------- | ----------------------------------------- |
| **幅**                 | 53.33px（固定）                           |
| **高さ**               | 80px（固定）                              |
| **ボーダーラディウス** | 0px 5.33px 5.33px 0px（右側のみ丸い）     |
| **背景**               | レッスンサムネイル画像                    |
| **シャドウ**           | 1.33px 1.33px 18.08px rgba(0, 0, 0, 0.33) |

### 詳細情報コンテナ（detail）

| プロパティ       | 値                     |
| ---------------- | ---------------------- |
| **ディスプレイ** | flex（column）         |
| **配置**         | center（アイテム中央） |
| **ギャップ**     | なし（0px）            |
| **幅**           | 100%（親に合わせる）   |

### レッスンタイトル（lesson_title）

| プロパティ           | 値                   |
| -------------------- | -------------------- |
| **フォント**         | Inter                |
| **フォントウェイト** | 500（Medium）        |
| **フォントサイズ**   | 13px                 |
| **行高**             | 1.846em（≈24px）     |
| **レターパディング** | -2.40%（タイト）     |
| **色**               | #101828（黒）        |
| **テキスト配置**     | 左寄せ               |
| **幅**               | 100%（親に合わせる） |

### プログレスボックス（progress_box）

| プロパティ           | 値                     |
| -------------------- | ---------------------- |
| **ディスプレイ**     | flex（row）            |
| **配置**             | center（垂直中央）     |
| **ジャスティファイ** | center（水平中央揃え） |
| **ギャップ**         | 5px                    |
| **幅**               | 100%（親に合わせる）   |

### プログレスバー（ProgressBar）

| プロパティ             | 値                     |
| ---------------------- | ---------------------- |
| **幅**                 | 160px（固定）          |
| **高さ**               | 2px（固定）            |
| **ボーダーラディウス** | 16777200px（完全円形） |
| **背景色**             | #E5E7EB（薄いグレー）  |
| **オーバーフロー**     | hidden                 |

### プログレスフィル（Container）

| プロパティ         | 値                                       |
| ------------------ | ---------------------------------------- |
| **幅**             | 動的（パーセンテージベース）             |
| **高さ**           | 4px（親の 2 倍）                         |
| **背景色**         | #155DFC（ブルー）                        |
| **トランジション** | width 400ms cubic-bezier(0.4, 0, 0.2, 1) |

### パーセンテージ表示（percent）

| プロパティ       | 値             |
| ---------------- | -------------- |
| **ディスプレイ** | flex（row）    |
| **ギャップ**     | 2px            |
| **配置**         | center（中央） |

#### 数値（number）

| プロパティ           | 値                |
| -------------------- | ----------------- |
| **フォント**         | Inter             |
| **フォントウェイト** | 400               |
| **フォントサイズ**   | 12px              |
| **行高**             | 1.333em           |
| **色**               | #6A7282（グレー） |

#### 単位（%）

| プロパティ           | 値                |
| -------------------- | ----------------- |
| **フォント**         | Inter             |
| **フォントウェイト** | 400               |
| **フォントサイズ**   | 10px              |
| **行高**             | 1.6em             |
| **色**               | #6A7282（グレー） |

---

## 3. ビジュアル仕様

### 色パレット

| 要素                 | 色コード | RGB 値             | 用途               |
| -------------------- | -------- | ------------------ | ------------------ |
| 背景                 | #FFFFFF  | rgb(255, 255, 255) | セクション・カード |
| ボーダー             | #F0F0F0  | rgb(240, 240, 240) | 下部分割線         |
| バックボタン背景     | #E4E4E4  | rgb(228, 228, 228) | アイコン背景       |
| バックボタンテキスト | #6D6D6D  | rgb(109, 109, 109) | テキスト           |
| レッスンタイトル     | #101828  | rgb(16, 24, 40)    | タイトル           |
| プログレス背景       | #E5E7EB  | rgb(229, 231, 235) | バー背景           |
| プログレスフィル     | #155DFC  | rgb(21, 93, 252)   | ブルーフィル       |
| パーセンテージ       | #6A7282  | rgb(106, 114, 130) | 数値・単位         |

### ボックスシャドウ（icon_lesson）

```css
box-shadow: 1.33px 1.33px 18.08px rgba(0, 0, 0, 0.33);
```

---

## 4. インタラクション仕様

### バックナビゲーション

#### ホバー状態

- **背景**: アイコン背景 #D0D0D0 に濃くなる
- **テキスト色**: #4A4A4A（濃くなる）
- **アニメーション**: 150ms ease-in-out

#### クリック状態

- **スケール**: 96% に縮小
- **アニメーション**: 100ms ease-out

### レッスン詳細

#### ホバー状態

- **アイコンシャドウ**: 2px 2px 20px rgba(0, 0, 0, 0.4)
- **背景色**: #F3F4F6（ごく薄いグレー）
- **アニメーション**: 150ms ease-in-out

#### プログレスバー更新

- **トランジション**: width 400ms cubic-bezier(0.4, 0, 0.2, 1)
- **ティミングファンクション**: カスタムイージング（スプリング効果）

---

## 5. CSS 実装例

```css
/* ========== セクション全体 ========== */

.lesson-detail-section {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 12px 0;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  transition: all 150ms ease-in-out;
}

.lesson-detail-section:hover {
  background-color: #fafbfc;
}

/* ========== ナビゲーション領域 ========== */

.lesson-section__navigation {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 12px;
  gap: 10px;
  background-color: transparent;
}

/* ========== バックナビゲーション ========== */

.back-navigation {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  width: auto;
  height: auto;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 150ms ease-in-out;
}

.back-navigation:hover {
  opacity: 0.85;
}

.back-navigation:active {
  transform: scale(0.96);
}

/* バックナビゲーション - アイコン */

.back-navigation__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background-color: #e4e4e4;
  border-radius: 50%;
  transition: background-color 150ms ease-in-out;
}

.back-navigation:hover .back-navigation__icon {
  background-color: #d0d0d0;
}

/* バックナビゲーション - テキスト */

.back-navigation__text {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 10px;
  font-weight: 400;
  line-height: 1.6em;
  color: #6d6d6d;
  margin: 0;
  padding: 0;
  transition: color 150ms ease-in-out;
}

.back-navigation:hover .back-navigation__text {
  color: #4a4a4a;
}

/* ========== レッスン詳細 ========== */

.lesson-detail {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 4px;
  padding: 0 12px;
  background-color: transparent;
}

.lesson-detail__wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 6px;
}

/* レッスンアイコン */

.lesson-detail__icon {
  width: 53.33px;
  height: 80px;
  border-radius: 0 5.33px 5.33px 0;
  overflow: hidden;
  box-shadow: 1.33px 1.33px 18.08px rgba(0, 0, 0, 0.33);
  transition: box-shadow 150ms ease-in-out;
}

.lesson-detail:hover .lesson-detail__icon {
  box-shadow: 2px 2px 20px rgba(0, 0, 0, 0.4);
}

.lesson-detail__icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 詳細情報 */

.lesson-detail__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 0;
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
  width: 100%;
  margin: 0;
  padding: 0;
}

/* プログレスボックス */

.lesson-detail__progress {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 5px;
}

/* プログレスバー */

.progress-bar {
  width: 160px;
  height: 2px;
  border-radius: 999px;
  background-color: #e5e7eb;
  overflow: hidden;
}

.progress-bar__background {
  width: 100%;
  height: 100%;
  background-color: #e5e7eb;
}

.progress-bar__fill {
  width: 2%;
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
  white-space: nowrap;
}

.progress-percent__number {
  font-family: Inter, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.333em;
  color: #6a7282;
}

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
import "./LessonDetailSection.css";

interface LessonDetailSectionProps {
  lessonTitle: string;
  imageUrl: string;
  imageAlt: string;
  progressPercent: number;
  onBackClick?: () => void;
}

export const LessonDetailSection: React.FC<LessonDetailSectionProps> = ({
  lessonTitle,
  imageUrl,
  imageAlt,
  progressPercent,
  onBackClick,
}) => {
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      window.history.back();
    }
  };

  return (
    <section className="lesson-detail-section">
      {/* ナビゲーション */}
      <div className="lesson-section__navigation">
        <button
          className="back-navigation"
          onClick={handleBackClick}
          aria-label="トップへ戻る"
        >
          <span className="back-navigation__icon">
            <svg viewBox="0 0 16 16" width="16" height="16">
              <line
                x1="5"
                y1="5"
                x2="11"
                y2="0"
                stroke="#000000"
                strokeWidth="0.857"
              />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="6"
                stroke="#000000"
                strokeWidth="0.857"
              />
              <line
                x1="0"
                y1="3"
                x2="6"
                y2="3"
                stroke="#000000"
                strokeWidth="0.857"
              />
            </svg>
          </span>
          <span className="back-navigation__text">トップへ</span>
        </button>
      </div>

      {/* レッスン詳細 */}
      <div className="lesson-detail">
        <div className="lesson-detail__wrap">
          {/* サムネイル */}
          <div className="lesson-detail__icon">
            <img src={imageUrl} alt={imageAlt} />
          </div>

          {/* コンテンツ */}
          <div className="lesson-detail__content">
            {/* タイトル */}
            <h2 className="lesson-detail__title">{lessonTitle}</h2>

            {/* プログレス */}
            <div className="lesson-detail__progress">
              <div className="progress-bar">
                <div className="progress-bar__background">
                  <div
                    className="progress-bar__fill"
                    style={{ width: `${Math.min(100, progressPercent)}%` }}
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
    </section>
  );
};

export default LessonDetailSection;
```

---

## 7. HTML 実装例

```html
<section class="lesson-detail-section">
  <!-- ナビゲーション -->
  <div class="lesson-section__navigation">
    <button
      class="back-navigation"
      onclick="window.history.back()"
      aria-label="トップへ戻る"
    >
      <span class="back-navigation__icon">
        <svg viewBox="0 0 16 16" width="16" height="16">
          <line
            x1="5"
            y1="5"
            x2="11"
            y2="0"
            stroke="#000000"
            stroke-width="0.857"
          />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="6"
            stroke="#000000"
            stroke-width="0.857"
          />
          <line
            x1="0"
            y1="3"
            x2="6"
            y2="3"
            stroke="#000000"
            stroke-width="0.857"
          />
        </svg>
      </span>
      <span class="back-navigation__text">トップへ</span>
    </button>
  </div>

  <!-- レッスン詳細 -->
  <div class="lesson-detail">
    <div class="lesson-detail__wrap">
      <!-- サムネイル -->
      <div class="lesson-detail__icon">
        <img src="lesson-thumbnail.jpg" alt="ToDoサービスをデザインしよう" />
      </div>

      <!-- コンテンツ -->
      <div class="lesson-detail__content">
        <!-- タイトル -->
        <h2 class="lesson-detail__title">ToDoサービスをデザインしよう</h2>

        <!-- プログレス -->
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
</section>
```

---

## 8. 配置と間隔

### セクション内部の構造

```
lesson-detail-section (パディング: 12px 0)
├── border-bottom: 1px #F0F0F0
│
├── lesson-section__navigation (パディング: 0 12px、ギャップ: 10px)
│   └── back-navigation (幅: auto、ギャップ: 4px)
│       ├── icon (16×16px)
│       └── text (10px)
│
└── lesson-detail (パディング: 0 12px、ギャップ: 4px)
    └── wrap (ギャップ: 6px)
        ├── icon (53.33×80px、ボーラディ: 右側 5.33px)
        └── content (ギャップ: 0)
            ├── title (13px Inter)
            └── progress (ギャップ: 5px)
                ├── progress-bar (160×2px)
                └── percent (ギャップ: 2px)
```

---

## 9. レスポンシブ対応

### モバイル（320px - 480px）

- **セクション幅**: 100%
- **パディング**: 12px 0（維持）
- **内部パディング**: 0 12px（維持）
- **ギャップ**: 全て維持
- **アイコンサイズ**: 53.33×80px（維持）
- **フォントサイズ**: 13px、10px（維持）

### タブレット以上

- 変更なし（設計上固定幅）

---

## 10. アクセシビリティ

### セマンティクス

```html
<section>
  <!-- 意味のあるセクション -->
  <div class="lesson-section__navigation">
    <button>
      <!-- インタラクティブ要素 -->
      <!-- -->
    </button>
  </div>
  <div class="lesson-detail">
    <h2>
      <!-- 見出し階層 -->
      <!-- -->
    </h2>
  </div>
</section>
```

### ARIA 属性

```html
<button aria-label="トップへ戻る" onclick="window.history.back()"></button>
```

### 対応項目

- ✅ `<section>` で意味をもたせた構造
- ✅ `<button>` でインタラクティブ要素
- ✅ `<h2>` で見出し階層
- ✅ `aria-label` で機能説明
- ✅ キーボードナビゲーション対応（Tab、Enter）
- ✅ フォーカス表示対応
- ✅ スクリーンリーダー対応
- ✅ コントラスト比 4.5:1 以上（WCAG AA 準拠）

---

## 11. 使用例

### サイドバーでの配置

```jsx
<aside class="sidenavi">
  {/* ロゴ */}
  <div class="sidenavi__logo">...</div>

  {/* このセクション */}
  <LessonDetailSection
    lessonTitle="ToDoサービスをデザインしよう"
    imageUrl="/images/lesson-todo.jpg"
    imageAlt="ToDoサービスのレッスンサムネイル"
    progressPercent={2}
    onBackClick={() => navigate("/")}
  />

  {/* クエストリスト */}
  <section class="quest-section">...</section>
</aside>
```

---

## 12. アニメーション詳細

### バックナビゲーション：ホバー遷移

```css
transition: all 150ms ease-in-out;
```

### バックナビゲーション：クリック反応

```css
transform: scale(0.96);
transition: transform 100ms ease-out;
```

### プログレスバー：フィル更新

```css
transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1);
```

### シャドウ変更

```css
transition: box-shadow 150ms ease-in-out;
```

---

## 13. 注記・最適化ポイント

1. **パディング管理**: セクション全体の外側パディングと内部要素のパディングを分離
2. **ギャップ統一**: 各ギャップ値（4px、5px、6px、10px）を明確に保つ
3. **アイコン最適化**: SVG は軽量化して埋め込み推奨
4. **画像最適化**: サムネイル画像は WebP で提供、PNG/JPG フォールバック
5. **トランジション**: すべてのアニメーション時間を 150ms 基準で統一
6. **z-index**: シャドウが他要素に被らないよう確認

---

## 14. ダークモード対応

```css
@media (prefers-color-scheme: dark) {
  .lesson-detail-section {
    background-color: #1a1a1a;
    border-bottom-color: #333333;
  }

  .back-navigation__text {
    color: #b0b8c0;
  }

  .back-navigation:hover .back-navigation__text {
    color: #e8e8e8;
  }

  .back-navigation__icon {
    background-color: #2a2a2a;
  }

  .back-navigation:hover .back-navigation__icon {
    background-color: #3a3a3a;
  }

  .lesson-detail__title {
    color: #e8e8e8;
  }

  .progress-percent__number,
  .progress-percent__unit {
    color: #a0a8b0;
  }
}
```

---

## 15. チェックリスト

- [ ] セクション全体パディング: 12px 0
- [ ] ボーダー下: 1px #F0F0F0
- [ ] ナビゲーション領域パディング: 0 12px、ギャップ: 10px
- [ ] バックナビゲーション: flex row、ギャップ 4px
- [ ] アイコン: 16×16px、背景 #E4E4E4、ボーラディ 50%
- [ ] テキスト: 10px Noto Sans JP、#6D6D6D
- [ ] レッスン詳細パディング: 0 12px、ギャップ 4px
- [ ] ラップギャップ: 6px
- [ ] アイコンサイズ: 53.33×80px、ボーラディ右側 5.33px
- [ ] タイトル: 13px Inter 500、#101828
- [ ] プログレスバー: 160×2px、背景 #E5E7EB
- [ ] プログレスフィル: 高さ 4px、色 #155DFC、トランジション 400ms
- [ ] パーセンテージ: 12px + 10px、ギャップ 2px
- [ ] ホバー時アニメーション: 150ms ease-in-out
- [ ] クリック時スケール: 96%、100ms ease-out
- [ ] キーボードフォーカス対応確認
- [ ] スクリーンリーダー対応確認
- [ ] ダークモード対応確認
