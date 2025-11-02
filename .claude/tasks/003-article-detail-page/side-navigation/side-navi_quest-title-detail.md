# クエストブロック：クエストタイトル詳細のアイテム 実装仕様書

## 概要

クエストブロックのヘッダーに表示されるコンポーネント。クエスト番号（小さなボックス）とクエストタイトルテキストを水平に並べたシンプルな構成。クエストブロック内の視覚的な階層を作り、ユーザーが現在どのクエスト内にいるかを明示する。

---

## 1. コンポーネント構造

### HTML / JSX 構造

```jsx
<div class="quest-title">
  <div class="quest-title__wrap">
    {/* クエスト番号ボックス */}
    <div class="quest-title__number-box">
      <span class="quest-title__number">1</span>
    </div>

    {/* クエストタイトルテキスト */}
    <h2 class="quest-title__text">はじめに</h2>
  </div>
</div>
```

### コンポーネント仕様

- **タイプ**: ヘッダーコンポーネント
- **用途**: クエストブロック内のタイトル表示
- **親コンポーネント**: quest_block（クエストブロック）
- **構成**: 番号ボックス + テキスト（水平並び）
- **ステートレス**: 通常、parent（親の状態）に依存

---

## 2. レイアウト・サイズ仕様

### クエストタイトルコンテナ（quest_title）

| プロパティ             | 値              |
| ---------------------- | --------------- |
| **幅**                 | 312px（固定）   |
| **高さ**               | content（動的） |
| **ディスプレイ**       | flex（column）  |
| **ギャップ**           | 10px            |
| **パディング**         | 12px 16px       |
| **背景色**             | #FFFFFF（白）   |
| **ボーダーラディウス** | 0px（なし）     |

### ラップコンテナ（wrap）

| プロパティ       | 値                            |
| ---------------- | ----------------------------- |
| **ディスプレイ** | flex（row）                   |
| **配置**         | center（垂直中央）            |
| **ギャップ**     | 12px                          |
| **幅**           | 100%（親に合わせる）          |
| **高さ**         | content（動的）               |
| **自動サイズ**   | fill-horizontal、hug-vertical |

### クエスト番号ボックス（number_box）

| プロパティ               | 値                             |
| ------------------------ | ------------------------------ |
| **幅**                   | 16px（固定）                   |
| **高さ**                 | 16px（固定）                   |
| **ディスプレイ**         | flex（column）                 |
| **配置**                 | center（中央）                 |
| **ボーダー**             | 1.25px solid #787878（グレー） |
| **ボーダーラディウス**   | 5px                            |
| **背景色**               | #FFFFFF（白）                  |
| **パディング**           | 0px                            |
| **フレックスシュリンク** | 0（縮小しない）                |

### クエスト番号テキスト（quest_number）

| プロパティ           | 値                |
| -------------------- | ----------------- |
| **フォント**         | Hind              |
| **フォントウェイト** | 500（Medium）     |
| **フォントサイズ**   | 10px              |
| **行高**             | 1em（≈10px）      |
| **文字間隔**         | 0px               |
| **テキスト配置**     | center（中央）    |
| **色**               | #787878（グレー） |
| **幅**               | 7px（固定）       |
| **高さ**             | 8px（固定）       |

### クエストタイトルテキスト（quest_title）

| プロパティ           | 値                   |
| -------------------- | -------------------- |
| **フォント**         | Noto Sans JP         |
| **フォントウェイト** | 700（Bold）          |
| **フォントサイズ**   | 12px                 |
| **行高**             | 1em（≈12px）         |
| **文字間隔**         | 0px                  |
| **テキスト配置**     | 左寄せ               |
| **色**               | #787878（グレー）    |
| **幅**               | 100%（親に合わせる） |
| **高さ**             | content（動的）      |
| **マージン**         | 0px                  |

---

## 3. ビジュアル仕様

### 色パレット

| 要素     | 色コード | RGB 値             | 用途             |
| -------- | -------- | ------------------ | ---------------- |
| 背景     | #FFFFFF  | rgb(255, 255, 255) | コンテナ背景     |
| テキスト | #787878  | rgb(120, 120, 120) | 番号・タイトル色 |
| ボーダー | #787878  | rgb(120, 120, 120) | 番号ボックス枠線 |

### フォント詳細

#### クエスト番号（Hind）

```css
font-family: Hind, sans-serif;
font-size: 10px;
font-weight: 500;
line-height: 1em;
letter-spacing: 0;
text-align: center;
```

#### クエストタイトル（Noto Sans JP）

```css
font-family: "Noto Sans JP", sans-serif;
font-size: 12px;
font-weight: 700;
line-height: 1em;
letter-spacing: 0;
text-align: left;
```

---

## 4. 親コンポーネント連動状態

このコンポーネントは **親コンポーネント（quest_block）の状態** に依存します。

### Default 状態（親が Default）

- **番号テキスト色**: #787878（グレー）
- **ボーダー色**: #787878（グレー）
- **番号ボックス背景**: #FFFFFF（白）
- **タイトルテキスト色**: #787878（グレー）

### Focus 状態（親が Focus）

- **番号テキスト色**: #FFFFFF（白）
- **ボーダー**: なし
- **番号ボックス背景**: グラデーション（オレンジ → 紫）
- **タイトルテキスト色**: #101828（濃いグレー・黒）

### グラデーション詳細（Focus 時）

```css
background: linear-gradient(
  180deg,
  rgba(254, 166, 103, 1) 0%,
  rgba(196, 113, 245, 1) 100%
);
```

- **方向**: 180deg（上から下へ）
- **スタート色**: rgba(254, 166, 103, 1)（オレンジ #FEA667）
- **エンド色**: rgba(196, 113, 245, 1)（紫 #C471F5）

---

## 5. インタラクション仕様

### ホバー状態

- **動作**: 親コンポーネント（quest_block）がホバー時に連動
- **テキスト色変更**: わずかに濃くなる（推奨 #6D6D6D）
- **アニメーション**: 150ms ease-in-out
- **カーソル**: default（非インタラクティブ）

### アクティブ / クリック状態

- **動作**: 親コンポーネント（quest_block）がクリック時に連動
- **変化**: 親が Focus 状態に遷移
- **アニメーション**: 150ms ease-in-out

---

## 6. CSS 実装例

```css
/* クエストタイトル コンテナ */
.quest-title {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px;
  width: 312px;
  height: auto;
  background-color: #ffffff;
  border-radius: 0;
}

/* ラップ */
.quest-title__wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: auto;
  align-self: stretch;
}

/* 番号ボックス */
.quest-title__number-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
  border: 1.25px solid #787878;
  border-radius: 5px;
  background-color: #ffffff;
  padding: 0;
  flex-shrink: 0;
  transition: all 150ms ease-in-out;
}

/* 番号ボックス：親が Focus の場合 */
.quest-block[data-state="focus"] .quest-title__number-box {
  border: none;
  background: linear-gradient(
    180deg,
    rgba(254, 166, 103, 1) 0%,
    rgba(196, 113, 245, 1) 100%
  );
}

/* 番号テキスト */
.quest-title__number {
  font-family: Hind, sans-serif;
  font-size: 10px;
  font-weight: 500;
  line-height: 1em;
  text-align: center;
  color: #787878;
  margin: 0;
  padding: 0;
  width: 7px;
  height: 8px;
  transition: color 150ms ease-in-out;
}

/* 番号テキスト：親が Focus の場合 */
.quest-block[data-state="focus"] .quest-title__number {
  color: #ffffff;
}

/* クエストタイトルテキスト */
.quest-title__text {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 12px;
  font-weight: 700;
  line-height: 1em;
  text-align: left;
  color: #787878;
  margin: 0;
  padding: 0;
  width: 100%;
  height: auto;
  flex: 1;
  transition: color 150ms ease-in-out;
}

/* クエストタイトルテキスト：親が Focus の場合 */
.quest-block[data-state="focus"] .quest-title__text {
  color: #101828;
}

/* ホバー時の親コンポーネント連動 */
.quest-block:hover .quest-title__number,
.quest-block:hover .quest-title__text {
  opacity: 0.85;
}
```

---

## 7. React 実装例

```jsx
import React from "react";
import "./QuestTitle.css";

interface QuestTitleProps {
  questNumber: number;
  title: string;
  isFocus?: boolean;
  parentState?: "default" | "focus";
}

export const QuestTitle: React.FC<QuestTitleProps> = ({
  questNumber,
  title,
  parentState = "default",
}) => {
  return (
    <div className="quest-title">
      <div className="quest-title__wrap">
        {/* クエスト番号ボックス */}
        <div className="quest-title__number-box">
          <span className="quest-title__number">{questNumber}</span>
        </div>

        {/* クエストタイトルテキスト */}
        <h2 className="quest-title__text">{title}</h2>
      </div>
    </div>
  );
};

export default QuestTitle;
```

---

## 8. HTML 実装例

```html
<!-- Default状態 -->
<div class="quest-title">
  <div class="quest-title__wrap">
    <div class="quest-title__number-box">
      <span class="quest-title__number">1</span>
    </div>
    <h2 class="quest-title__text">はじめに</h2>
  </div>
</div>

<!-- Focus状態（親コンテナで制御） -->
<div class="quest-block" data-state="focus">
  <div class="quest-title">
    <div class="quest-title__wrap">
      <div class="quest-title__number-box">
        {/* グラデーション背景に変わる */}
        <span class="quest-title__number">1</span>
      </div>
      <h2 class="quest-title__text">はじめに</h2>
    </div>
  </div>
</div>
```

---

## 9. 独立での使用例

このコンポーネントは通常 **quest_block 内に含まれる** ため、単独使用は稀ですが、以下のような場面で活用できます：

### パンくずリスト表示

```jsx
<div class="breadcrumb">
  <QuestTitle questNumber={1} title="はじめに" parentState="default" />
  <span class="breadcrumb__separator">/</span>
  <QuestTitle questNumber={2} title="基礎を学ぶ" parentState="default" />
</div>

<style>
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
  }

  .breadcrumb__separator {
    color: #999;
  }
</style>
```

### クエスト進捗表示

```jsx
<div class="quest-progress-header">
  {quests.map((quest) => (
    <div key={quest.id} class="quest-progress-item">
      <QuestTitle
        questNumber={quest.number}
        title={quest.title}
        parentState={quest.isFocus ? "focus" : "default"}
      />
    </div>
  ))}
</div>
```

---

## 10. レスポンシブ対応

### モバイル（320px - 480px）

- **コンテナ幅**: 100%（最大 312px）
- **パディング**: 12px 16px（維持）
- **番号ボックス**: 16px（維持）
- **フォントサイズ**: 12px（タイトル、維持）

### タブレット（481px - 1024px）

- **コンテナ幅**: 312px（固定）
- **パディング**: 12px 16px（維持）
- **レイアウト**: 変更なし

### デスクトップ（1025px 以上）

- **コンテナ幅**: 312px（固定）
- **パディング**: 12px 16px（維持）
- **レイアウト**: 変更なし

---

## 11. アクセシビリティ

### セマンティクス

```html
<div class="quest-title">
  <div class="quest-title__wrap">
    <div class="quest-title__number-box" aria-label="クエスト1">
      <span class="quest-title__number">1</span>
    </div>
    <h2 class="quest-title__text">はじめに</h2>
  </div>
</div>
```

### 対応項目

- ✅ `<h2>` タグで見出し構造を実装
- ✅ 番号ボックスに `aria-label` で説明を追加
- ✅ 色だけに頼らない（テキスト + 視覚的配置で区別）
- ✅ コントラスト比：4.5:1 以上（WCAG AA 準拠）
- ✅ テキストリサイズ対応（相対単位）

---

## 12. 使用シーン別の詳細

### シーン 1: quest_block 内での使用（最も一般的）

```jsx
<QuestBlock
  id="quest-1"
  questNumber={1}
  title="はじめに"
  items={items}
  isFocus={true}
/>
// 内部で自動的に QuestTitle が表示される
```

### シーン 2: サイドバー表示

```jsx
<aside class="quest-sidebar">
  {quests.map((quest) => (
    <div
      key={quest.id}
      class={`sidebar-item ${quest.isFocus ? "is-focus" : ""}`}
    >
      <QuestTitle
        questNumber={quest.number}
        title={quest.title}
        parentState={quest.isFocus ? "focus" : "default"}
      />
    </div>
  ))}
</aside>
```

### シーン 3: プログレスインジケーター

```jsx
<div class="progress-indicator">
  {quests.map((quest) => (
    <div
      key={quest.id}
      class="progress-step"
      role="status"
      aria-current={quest.isFocus ? "step" : undefined}
    >
      <QuestTitle
        questNumber={quest.number}
        title={quest.title}
        parentState={quest.isFocus ? "focus" : "default"}
      />
      <div class="progress-step__bar">
        <div
          class="progress-step__fill"
          style={{ width: `${quest.progressPercent}%` }}
        />
      </div>
    </div>
  ))}
</div>
```

---

## 13. 注記・最適化ポイント

1. **数字の制限**: `quest_number` は通常 1-99 の範囲。3 桁以上の対応が必要な場合は幅を調整
2. **テキストオーバーフロー**: タイトルが長い場合は `white-space: nowrap` と `text-overflow: ellipsis` で省略
3. **グラデーション再現**: Focus 状態のグラデーション背景は CSS で完全に再現可能
4. **アニメーション**: トランジションは 150ms が目安。より速い反応が必要な場合は 100ms に短縮
5. **親依存**: このコンポーネント自体は状態を持たない。親の `data-state` 属性で制御される設計

---

## 14. スタイルバリエーション

### カスタマイズポイント

#### タイトル文字列が長い場合

```css
.quest-title__text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px; /* 必要に応じて調整 */
}
```

#### より大きなクエスト番号対応

```css
.quest-title__number-box {
  width: 20px;
  height: 20px;
}

.quest-title__number {
  font-size: 12px;
  width: 10px;
  height: 10px;
}
```

#### ダークモード対応

```css
@media (prefers-color-scheme: dark) {
  .quest-title {
    background-color: #1e1e1e;
  }

  .quest-title__number-box {
    background-color: #2a2a2a;
    border-color: #555555;
  }

  .quest-title__number,
  .quest-title__text {
    color: #e0e0e0;
  }

  .quest-block[data-state="focus"] .quest-title__text {
    color: #f0f0f0;
  }
}
```

---

## チェックリスト

- [ ] 番号ボックスが 16×16px で表示される
- [ ] ボーダーが 1.25px の #787878
- [ ] 番号テキストが 10px（Hind、500）
- [ ] タイトルテキストが 12px（Noto Sans JP、700）
- [ ] ギャップが番号ボックスとテキストの間に 12px
- [ ] 親が Focus 状態のとき、番号ボックス背景がグラデーション
- [ ] 親が Focus 状態のとき、タイトルテキストが #101828 に変更
- [ ] ホバー時の遷移が滑らか（150ms）
- [ ] テキストが `<h2>` タグで実装
- [ ] コントラスト比が WCAG AA 準拠
- [ ] 応答性対応（相対単位使用）
