# クエストブロック（通常・Focus） 実装仕様書

Figma データを取得して、Focus 状態での変更点を中心に仕様書を作成します。完璧です！Artifact で、Default 状態との違いを中心にした仕様書を作成します。

# クエストブロック（Focus 状態） - Default との比較仕様書

## 概要

クエスト内のコンテンツを表示中の状態。Default 状態から以下が変更されます：

- **左側にグラデーションボーダー（2px、下側のみ）**
- **クエストタイトルのコンポーネント状態が変更**

---

## 1. Default 状態との比較

### クエストブロック全体の変更点

| 要素               | Default | Focus                                                              |
| ------------------ | ------- | ------------------------------------------------------------------ |
| **ボーダー**       | なし    | 左側 2px グラデーション（下側のみ）                                |
| **ボーダー位置**   | -       | 下部分のみ                                                         |
| **ボーダー色**     | -       | linear-gradient(180deg, rgba(255,190,142,1) → rgba(232,162,255,1)) |
| **ボーダー開始色** | -       | #FEA667（オレンジ）                                                |
| **ボーダー終了色** | -       | #C471F5（紫）                                                      |
| **背景色**         | #FFFFFF | #FFFFFF（変わらず）                                                |
| **パディング**     | 0 6px   | 0 6px（変わらず）                                                  |

---

## 2. 変更されるコンポーネント

### 2.1 クエストブロック（quest_block）

#### CSS 変更

```css
/* Default */
.quest-block[data-state="default"] {
  border: none;
}

/* Focus */
.quest-block[data-state="focus"] {
  border-bottom: 2px solid transparent;
  border-image: linear-gradient(
      180deg,
      rgba(254, 166, 103, 1) 0%,
      rgba(196, 113, 245, 1) 100%
    ) 1;
  border-top: none;
  border-left: none;
  border-right: none;
}
```

#### ボーダーグラデーション詳細

- **方向**: 180deg（上から下へ）
- **スタート**: rgba(254, 166, 103, 1) = #FEA667（オレンジ）
- **エンド**: rgba(196, 113, 245, 1) = #C471F5（紫）
- **適用位置**: 下側のみ（border-bottom）
- **太さ**: 2px

---

### 2.2 クエストタイトル（quest_title）コンポーネント

#### 番号ボックス（number_box）の変更

| プロパティ         | Default        | Focus                                                              |
| ------------------ | -------------- | ------------------------------------------------------------------ |
| **背景色**         | #FFFFFF（白）  | グラデーション                                                     |
| **ボーダー**       | 1.25px #787878 | なし                                                               |
| **グラデーション** | -              | linear-gradient(180deg, rgba(254,166,103,1) → rgba(196,113,245,1)) |
| **文字色**         | #787878        | #FFFFFF（白）                                                      |

#### 番号ボックスの CSS 変更

```css
/* Default */
.quest-title__number-box[data-state="default"] {
  background-color: #ffffff;
  border: 1.25px solid #787878;
}

.quest-title__number[data-state="default"] {
  color: #787878;
}

/* Focus */
.quest-title__number-box[data-state="focus"] {
  background: linear-gradient(
    180deg,
    rgba(254, 166, 103, 1) 0%,
    rgba(196, 113, 245, 1) 100%
  );
  border: none;
}

.quest-title__number[data-state="focus"] {
  color: #ffffff;
  font-weight: 600;
}
```

#### クエストタイトルテキストの変更

| プロパティ           | Default           | Focus           |
| -------------------- | ----------------- | --------------- |
| **色**               | #787878（グレー） | #101828（黒）   |
| **フォントウェイト** | 700               | 700（変わらず） |
| **テキスト**         | グレー            | 濃い色で強調    |

#### タイトルテキストの CSS 変更

```css
/* Default */
.quest-title__text[data-state="default"] {
  color: #787878;
}

/* Focus */
.quest-title__text[data-state="focus"] {
  color: #101828;
}
```

---

### 2.3 コンテンツアイテム（content_item）の変更

#### Focus 状態のアイテムのみ変更

| プロパティ                   | Default Item                    | Focus Item       |
| ---------------------------- | ------------------------------- | ---------------- |
| **背景色**                   | transparent（ホバーで #F9FAFB） | #F3F3F3（常に）  |
| **ボーラディウス**           | 6px                             | 12px（より丸い） |
| **タイトル色**               | #677B87                         | #101828（濃い）  |
| **タイトルフォントウェイト** | 400                             | 500（Medium）    |

#### Focus アイテムの CSS

```css
/* Default状態のアイテム */
.quest-item[data-state="default"] {
  background-color: transparent;
  border-radius: 6px;
}

.quest-item[data-state="default"]:hover {
  background-color: #f9fafb;
}

.quest-item[data-state="default"] .quest-item__title {
  color: #677b87;
  font-weight: 400;
}

/* Focus状態のアイテム */
.quest-item[data-state="focus"] {
  background-color: #f3f3f3;
  border-radius: 12px;
}

.quest-item[data-state="focus"] .quest-item__title {
  color: #101828;
  font-weight: 500;
}
```

---

## 3. 変更サマリー

### クエストブロック全体

✅ **追加**: 左側グラデーションボーダー（下側のみ 2px）

### クエストタイトル内

✅ **番号ボックス背景**: #FFFFFF → グラデーション  
✅ **番号ボックスボーダー**: 1.25px #787878 → なし  
✅ **番号テキスト色**: #787878 → #FFFFFF  
✅ **番号テキストウェイト**: 500 → 600  
✅ **クエストタイトル色**: #787878 → #101828

### コンテンツアイテム（Focus 状態のアイテムのみ）

✅ **背景色**: transparent → #F3F3F3  
✅ **ボーラディウス**: 6px → 12px  
✅ **タイトル色**: #677B87 → #101828  
✅ **タイトルウェイト**: 400 → 500

---

## 4. React 実装例

```jsx
export const QuestBlockFocus: React.FC<QuestBlockFocusProps> = ({
  questNumber,
  title,
  items,
  focusItemId,
}) => {
  return (
    <div className="quest-block" data-state="focus">
      {/* クエストタイトル */}
      <div className="quest-title" data-state="focus">
        <div className="quest-title__wrap">
          <div className="quest-title__number-box" data-state="focus">
            <span className="quest-title__number" data-state="focus">
              {questNumber}
            </span>
          </div>
          <h2 className="quest-title__text" data-state="focus">
            {title}
          </h2>
        </div>
      </div>

      {/* コンテンツリスト */}
      <div className="quest-content-list">
        {items.map((item) => (
          <div
            key={item.id}
            className="quest-item"
            data-state={item.id === focusItemId ? "focus" : "default"}
          >
            <input
              type="checkbox"
              className="quest-item__checkbox"
              checked={item.isCompleted}
            />
            <div className="quest-item__content">
              <h3 className="quest-item__title">{item.title}</h3>
              <div className="quest-item__duration">
                <span className="quest-item__duration-number">
                  {item.duration}
                </span>
                <span className="quest-item__duration-unit">分</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 5. 完全な CSS 実装（Focus 状態）

```css
/* ========== クエストブロック Focus ========== */

.quest-block[data-state="focus"] {
  display: flex;
  flex-direction: column;
  width: 312px;
  padding: 0 6px;
  background-color: #ffffff;
  border: none;
  border-bottom: 2px solid transparent;
  border-image: linear-gradient(
      180deg,
      rgba(254, 166, 103, 1) 0%,
      rgba(196, 113, 245, 1) 100%
    ) 1;
}

/* ========== クエストタイトル Focus ========== */

.quest-title[data-state="focus"] {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px;
  background-color: #ffffff;
}

.quest-title__wrap[data-state="focus"] {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

/* 番号ボックス Focus */

.quest-title__number-box[data-state="focus"] {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 5px;
  background: linear-gradient(
    180deg,
    rgba(254, 166, 103, 1) 0%,
    rgba(196, 113, 245, 1) 100%
  );
  flex-shrink: 0;
}

/* 番号テキスト Focus */

.quest-title__number[data-state="focus"] {
  font-family: Hind, sans-serif;
  font-size: 10px;
  font-weight: 600;
  line-height: 1em;
  text-align: center;
  color: #ffffff;
  width: 7px;
  height: 8px;
}

/* クエストタイトルテキスト Focus */

.quest-title__text[data-state="focus"] {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 12px;
  font-weight: 700;
  line-height: 1em;
  color: #101828;
  text-align: left;
  margin: 0;
  padding: 0;
  width: 100%;
  flex: 1;
}

/* ========== コンテンツアイテム Focus ========== */

.quest-item[data-state="focus"] {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 16px;
  width: 100%;
  background-color: #f3f3f3;
  border-radius: 12px;
  cursor: pointer;
}

.quest-item[data-state="focus"] .quest-item__title {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.667em;
  letter-spacing: -1.25%;
  color: #101828;
}

.quest-item[data-state="focus"] .quest-item__duration {
  display: flex;
  gap: 0;
  white-space: nowrap;
  flex-shrink: 0;
}
```

---

## 6. チェックリスト - Focus 状態の確認

- [ ] クエストブロック下側ボーダー: 2px グラデーション（オレンジ → 紫）
- [ ] 番号ボックス背景: グラデーション（オレンジ → 紫）
- [ ] 番号ボックスボーダー: なし
- [ ] 番号テキスト色: #FFFFFF（白）
- [ ] 番号テキストウェイト: 600
- [ ] クエストタイトル色: #101828（黒）
- [ ] Focus アイテム背景: #F3F3F3
- [ ] Focus アイテムボーラディウス: 12px
- [ ] Focus アイテムタイトル色: #101828
- [ ] Focus アイテムウェイト: 500
- [ ] Default アイテムは変更なし（#677B87、400、ボーラディ 6px）

# クエストブロック（Default 状態） 実装仕様書（修正版）

## 概要

クエストを管理・表示する基本コンポーネントのデフォルト状態。クエスト番号・タイトル、複数のコンテンツアイテムを縦積みで配置。通常は紫のダッシュボーダーで囲まれ、非表示時のクエストを表現。ユーザーが現在取り組んでいないクエストはこの状態で表示される。

---

## 1. コンポーネント構造

### HTML / JSX 構造

```jsx
<div class="quest-block" data-state="default">
  {/* クエストヘッダー */}
  <div class="quest-header">
    <div class="quest-title">
      <div class="quest-title__wrap">
        <div class="quest-title__number-box">
          <span class="quest-title__number">1</span>
        </div>
        <h2 class="quest-title__text">はじめに</h2>
      </div>
    </div>
  </div>

  {/* コンテンツリスト */}
  <div class="quest-content-list">
    <div class="quest-item">
      <input
        type="checkbox"
        class="quest-item__checkbox"
        aria-label="ゴールを把握しよう"
      />
      <div class="quest-item__content">
        <h3 class="quest-item__title">ゴールを把握しよう</h3>
        <div class="quest-item__duration">
          <span class="quest-item__duration-number">10</span>
          <span class="quest-item__duration-unit">分</span>
        </div>
      </div>
    </div>
    {/* 複数の item が続く */}
  </div>
</div>
```

### コンポーネント仕様

- **タイプ**: コンテナブロック
- **用途**: クエスト管理・表示（非フォーカス状態）
- **状態**: Default（通常）のみ
- **サブコンポーネント**: quest_title、content_item（複数）
- **インタラクティブ**: チェックボックス、ホバー対応

---

## 2. レイアウト・サイズ仕様

### クエストブロック全体（quest_block）

| プロパティ             | 値                                   |
| ---------------------- | ------------------------------------ |
| **幅**                 | 312px（固定）                        |
| **高さ**               | content（動的）                      |
| **ディスプレイ**       | flex（column）                       |
| **パディング**         | 0px 6px                              |
| **ギャップ**           | 0px（内部で管理）                    |
| **背景色**             | transparent                          |
| **ボーダー**           | なし（Default 状態ではボーダーなし） |
| **ボーダーラディウス** | 0px（なし）                          |

### クエストヘッダー（quest_header）

| プロパティ       | 値                   |
| ---------------- | -------------------- |
| **ディスプレイ** | flex（column）       |
| **パディング**   | なし                 |
| **幅**           | 100%（親に合わせる） |
| **背景色**       | transparent          |

### クエストタイトル（quest_title）

| プロパティ       | 値                   |
| ---------------- | -------------------- |
| **ディスプレイ** | flex（column）       |
| **ギャップ**     | 10px                 |
| **パディング**   | 12px 16px            |
| **幅**           | 100%（親に合わせる） |
| **背景色**       | #FFFFFF（白）        |

### クエストタイトルラップ（wrap）

| プロパティ       | 値                   |
| ---------------- | -------------------- |
| **ディスプレイ** | flex（row）          |
| **配置**         | center（垂直中央）   |
| **ギャップ**     | 12px                 |
| **幅**           | 100%（親に合わせる） |

### クエスト番号ボックス（number_box）

| プロパティ             | 値                   |
| ---------------------- | -------------------- |
| **幅**                 | 16px（固定）         |
| **高さ**               | 16px（固定）         |
| **ボーダー**           | 1.25px solid #787878 |
| **ボーダーラディウス** | 5px                  |
| **背景色**             | #FFFFFF（白）        |
| **ディスプレイ**       | flex（column）       |
| **配置**               | center               |

### クエスト番号テキスト（quest_number）

| プロパティ           | 値          |
| -------------------- | ----------- |
| **フォント**         | Hind        |
| **フォントウェイト** | 500         |
| **フォントサイズ**   | 10px        |
| **行高**             | 1em         |
| **テキスト配置**     | center      |
| **色**               | #787878     |
| **幅**               | 7px（固定） |
| **高さ**             | 8px（固定） |

### クエストタイトルテキスト（quest_title\_\_text）

| プロパティ           | 値                   |
| -------------------- | -------------------- |
| **フォント**         | Noto Sans JP         |
| **フォントウェイト** | 700（Bold）          |
| **フォントサイズ**   | 12px                 |
| **行高**             | 1em                  |
| **テキスト配置**     | 左寄せ               |
| **色**               | #787878              |
| **幅**               | 100%（親に合わせる） |

### コンテンツリスト（content_list）

| プロパティ       | 値                      |
| ---------------- | ----------------------- |
| **ディスプレイ** | flex（column）          |
| **幅**           | 100%（親に合わせる）    |
| **高さ**         | content（動的）         |
| **ギャップ**     | 0px（アイテム間隔なし） |

### コンテンツアイテム（quest_item）

| プロパティ             | 値                   |
| ---------------------- | -------------------- |
| **ディスプレイ**       | flex（row）          |
| **配置**               | center（垂直中央）   |
| **ギャップ**           | 8px                  |
| **パディング**         | 16px                 |
| **幅**                 | 100%（親に合わせる） |
| **ボーダーラディウス** | 6px                  |

### チェックボックス（checkbox）

| プロパティ               | 値                   |
| ------------------------ | -------------------- |
| **幅**                   | 16px（固定）         |
| **高さ**                 | 16px（固定）         |
| **ボーダー**             | 1.25px solid #99A1AF |
| **ボーダーラディウス**   | 3px                  |
| **背景色**               | #FFFFFF（白）        |
| **フレックスシュリンク** | 0（縮小しない）      |

### コンテンツ情報（quest_item\_\_content）

| プロパティ           | 値                        |
| -------------------- | ------------------------- |
| **ディスプレイ**     | flex（row）               |
| **ジャスティファイ** | space-between（両端配置） |
| **配置**             | center（垂直中央）        |
| **幅**               | 100%（親に合わせる）      |

### コンテンツタイトル（content_title）

| プロパティ           | 値                   |
| -------------------- | -------------------- |
| **フォント**         | Noto Sans JP         |
| **フォントウェイト** | 400                  |
| **フォントサイズ**   | 12px                 |
| **行高**             | 1.667em              |
| **レターパディング** | -1.25%               |
| **色**               | #677B87              |
| **テキスト配置**     | 左寄せ               |
| **幅**               | 100%（親に合わせる） |

### 学習時間情報（numberofduration）

| プロパティ               | 値                  |
| ------------------------ | ------------------- |
| **ディスプレイ**         | flex（row）         |
| **配置**                 | center              |
| **ギャップ**             | 0px（詰まったまま） |
| **ホワイトスペース**     | nowrap              |
| **フレックスシュリンク** | 0（縮小しない）     |

#### 数値（duration_number）

| プロパティ           | 値           |
| -------------------- | ------------ |
| **フォント**         | Noto Sans JP |
| **フォントウェイト** | 400          |
| **フォントサイズ**   | 10px         |
| **行高**             | 1.6em        |
| **色**               | #6A7282      |

#### 単位（minutes）

| プロパティ           | 値           |
| -------------------- | ------------ |
| **フォント**         | Noto Sans JP |
| **フォントウェイト** | 400          |
| **フォントサイズ**   | 10px         |
| **行高**             | 1.6em        |
| **色**               | #6A7282      |

---

## 3. ビジュアル仕様

### 色パレット

| 要素                     | 色コード | RGB 値             | 用途                 |
| ------------------------ | -------- | ------------------ | -------------------- |
| 背景                     | #FFFFFF  | rgb(255, 255, 255) | クエストタイトル背景 |
| 番号ボックス背景         | #FFFFFF  | rgb(255, 255, 255) | 番号背景             |
| 番号ボックスボーダー     | #787878  | rgb(120, 120, 120) | 番号ボックス枠線     |
| 番号テキスト             | #787878  | rgb(120, 120, 120) | 番号テキスト         |
| クエストタイトル         | #787878  | rgb(120, 120, 120) | タイトルテキスト     |
| コンテンツタイトル       | #677B87  | rgb(103, 123, 135) | アイテムタイトル     |
| 時間テキスト             | #6A7282  | rgb(106, 114, 130) | 時間情報             |
| チェックボックスボーダー | #99A1AF  | rgb(153, 161, 175) | チェックボックス枠線 |

---

## 4. インタラクション仕様

### ブロック全体

#### ホバー状態

- **動作**: アイテムのみがホバーに応答（ブロック全体には変化なし）
- **アイテム背景**: #F9FAFB に変更
- **アニメーション**: 150ms ease-in-out

### コンテンツアイテム

#### デフォルト状態

- **背景**: transparent
- **ボーラディ**: 6px

#### ホバー状態

- **背景**: #F9FAFB
- **ボーラディ**: 6px（変わらない）
- **アニメーション**: 150ms ease-in-out

#### チェックボックスホバー

- **背景**: #E8E8E8（わずかな暗化）
- **ボーダー**: #88919F（やや濃くなる）

#### チェック状態

- **背景**: #155DFC（ブルー）
- **ボーダー**: #155DFC
- **チェックマーク**: ホワイト表示

---

## 5. CSS 実装例

```css
/* ========== クエストブロック ========== */

.quest-block {
  display: flex;
  flex-direction: column;
  width: 312px;
  padding: 0 6px;
  background-color: transparent;
  border: none;
  border-radius: 0;
  transition: all 150ms ease-in-out;
}

.quest-block[data-state="default"] {
  border: none;
}

/* ========== クエストヘッダー ========== */

.quest-header {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: transparent;
}

/* ========== クエストタイトル ========== */

.quest-title {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px;
  width: 100%;
  background-color: #ffffff;
}

.quest-title__wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  width: 100%;
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
  flex-shrink: 0;
}

/* 番号テキスト */

.quest-title__number {
  font-family: Hind, sans-serif;
  font-size: 10px;
  font-weight: 500;
  line-height: 1em;
  text-align: center;
  color: #787878;
  width: 7px;
  height: 8px;
}

/* クエストタイトルテキスト */

.quest-title__text {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 12px;
  font-weight: 700;
  line-height: 1em;
  color: #787878;
  text-align: left;
  margin: 0;
  padding: 0;
  width: 100%;
  flex: 1;
}

/* ========== コンテンツリスト ========== */

.quest-content-list {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0;
}

/* ========== コンテンツアイテム ========== */

.quest-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 16px;
  width: 100%;
  background-color: transparent;
  border-radius: 6px;
  transition: all 150ms ease-in-out;
  cursor: pointer;
}

.quest-item:hover {
  background-color: #f9fafb;
}

/* チェックボックス */

.quest-item__checkbox {
  width: 16px;
  height: 16px;
  border: 1.25px solid #99a1af;
  border-radius: 3px;
  background-color: #ffffff;
  flex-shrink: 0;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: all 150ms ease-in-out;
}

.quest-item__checkbox:hover {
  background-color: #e8e8e8;
  border-color: #88919f;
}

.quest-item__checkbox:checked {
  background-color: #155dfc;
  border-color: #155dfc;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="%23FFFFFF"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 11.94l6.72-6.72a.75.75 0 011.06 0z"/></svg>');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%;
}

.quest-item__checkbox:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* コンテンツ情報 */

.quest-item__content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
}

/* コンテンツタイトル */

.quest-item__title {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.667em;
  letter-spacing: -1.25%;
  color: #677b87;
  text-align: left;
  margin: 0;
  padding: 0;
  flex: 1;
  transition: all 150ms ease-in-out;
}

.quest-item:hover .quest-item__title {
  /* Default状態ではホバーしてもタイトル色は変わらない */
}

/* 学習時間情報 */

.quest-item__duration {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0;
  white-space: nowrap;
  flex-shrink: 0;
}

.quest-item__duration-number {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 10px;
  font-weight: 400;
  line-height: 1.6em;
  color: #6a7282;
}

.quest-item__duration-unit {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 10px;
  font-weight: 400;
  line-height: 1.6em;
  color: #6a7282;
}
```

---

## 6. React 実装例

```jsx
import React, { useState } from 'react';
import './QuestBlockDefault.css';

interface QuestItemData {
  id: string;
  title: string;
  duration: number;
  isCompleted: boolean;
}

interface QuestBlockDefaultProps {
  id: string;
  questNumber: number;
  title: string;
  items: QuestItemData[];
  onItemToggle?: (questId: string, itemId: string) => void;
  onItemClick?: (questId: string, itemId: string) => void;
}

export const QuestBlockDefault: React.FC<QuestBlockDefaultProps> = ({
  id,
  questNumber,
  title,
  items,
  onItemToggle,
  onItemClick,
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const handleCheckboxChange = (itemId: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
    onItemToggle?.(id, itemId);
  };

  const handleItemClick = (itemId: string) => {
    onItemClick?.(id, itemId);
  };

  return (
    <div
      className="quest-block"
      data-state="default"
      role="region"
      aria-label={`${title} - ${items.length}個のコンテンツ`}
    >
      {/* クエストヘッダー */}
      <div className="quest-header">
        <div className="quest-title">
          <div className="quest-title__wrap">
            <div className="quest-title__number-box">
              <span className="quest-title__number">
                {questNumber}
              </span>
            </div>
            <h2 className="quest-title__text">
              {title}
            </h2>
          </div>
        </div>
      </div>

      {/* コンテンツリスト */}
      <div className="quest-content-list" role="list">
        {items.map((item) => (
          <div
            key={item.id}
            className="quest-item"
            role="listitem"
            onClick={() => handleItemClick(item.id)}
          >
            <input
              type="checkbox"
              className="quest-item__checkbox"
              checked={checkedItems[item.id] || false}
              onChange={() => handleCheckboxChange(item.id)}
              aria-label={item.title}
            />
            <div className="quest-item__content">
              <h3 className="quest-item__title">
                {item.title}
              </h3>
              <div className="quest-item__duration">
                <span className="quest-item__duration-number">
                  {item.duration}
                </span>
                <span className="quest-item__duration-unit">分</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestBlockDefault;
```

---

## 7. HTML 実装例

```html
<div
  class="quest-block"
  data-state="default"
  role="region"
  aria-label="はじめに - 2個のコンテンツ"
>
  <!-- クエストヘッダー -->
  <div class="quest-header">
    <div class="quest-title">
      <div class="quest-title__wrap">
        <div class="quest-title__number-box">
          <span class="quest-title__number">1</span>
        </div>
        <h2 class="quest-title__text">はじめに</h2>
      </div>
    </div>
  </div>

  <!-- コンテンツリスト -->
  <div class="quest-content-list" role="list">
    <!-- アイテム1 -->
    <div class="quest-item" role="listitem">
      <input
        type="checkbox"
        class="quest-item__checkbox"
        aria-label="ゴールを把握しよう"
      />
      <div class="quest-item__content">
        <h3 class="quest-item__title">ゴールを把握しよう</h3>
        <div class="quest-item__duration">
          <span class="quest-item__duration-number">10</span>
          <span class="quest-item__duration-unit">分</span>
        </div>
      </div>
    </div>

    <!-- アイテム2 -->
    <div class="quest-item" role="listitem">
      <input
        type="checkbox"
        class="quest-item__checkbox"
        aria-label="ゴールを把握しよう"
      />
      <div class="quest-item__content">
        <h3 class="quest-item__title">ゴールを把握しよう</h3>
        <div class="quest-item__duration">
          <span class="quest-item__duration-number">10</span>
          <span class="quest-item__duration-unit">分</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 8. 詳細な設計ポイント

### Default 状態の特徴

1. **ボーダー**: なし（背景はシンプル）
2. **タイトル背景**: 白色（#FFFFFF）
3. **テキスト色**: グレー（#787878）
4. **アイテム背景**: 透明（デフォルト）
5. **ホバー効果**: アイテムのみ背景が #F9FAFB に
6. **ボーラディ**: アイテムは 6px で固定

### Focus 状態との違い

| 要素                   | Default            | Focus                  |
| ---------------------- | ------------------ | ---------------------- |
| **ボーダー**           | なし               | グラデーション下側 2px |
| **タイトルカラー**     | #787878            | #101828                |
| **番号背景**           | #FFFFFF + ボーダー | グラデーション         |
| **アイテムホバー背景** | #F9FAFB            | #F3F3F3                |
| **ボーラディ**         | 6px                | Hover 時 12px に変更   |

---

## 9. アイテム配置の構造

```
quest-block (312px幅、ダッシュボーダー)
├── quest-header
│   └── quest-title (パディング: 12px 16px)
│       ├── number-box (16×16px)
│       └── title-text (12px Bold)
│
└── content-list (ギャップ: 0)
    ├── item (16px パディング)
    │   ├── checkbox (16×16px)
    │   └── content
    │       ├── title (12px、#677B87)
    │       └── duration (10px、#6A7282)
    │
    └── item (16px パディング)
        └── ...（同じ構造）
```

---

## 10. レスポンシブ対応

### モバイル（320px - 480px）

- **ブロック幅**: 100%（最大 312px）
- **パディング**: 0 6px（維持）
- **すべてのサイズ**: 維持
- **ホバー効果**: タッチデバイスではホバーの代わりにタップで反応

### タブレット以上

- 変更なし（設計上固定）

---

## 11. アクセシビリティ

### セマンティクス

```html
<div role="region" aria-label="...">
  <div role="list">
    <div role="listitem">
      <input type="checkbox" />
    </div>
  </div>
</div>
```

### 対応項目

- ✅ `role="region"` でセクション明示
- ✅ `role="list"` でリスト構造
- ✅ `role="listitem"` で各アイテム
- ✅ `aria-label` で説明追加
- ✅ キーボード操作（Tab、Space、Enter）対応
- ✅ フォーカス表示（2px ブルーアウトライン）
- ✅ スクリーンリーダー対応
- ✅ コントラスト比 4.5:1 以上（WCAG AA 準拠）

---

## 12. 使用例

### 複数クエスト表示

```jsx
<div class="quest-list">
  {quests.map((quest) => (
    <React.Fragment key={quest.id}>
      <QuestBlockDefault
        id={quest.id}
        questNumber={quest.number}
        title={quest.title}
        items={quest.items}
        onItemToggle={handleItemToggle}
        onItemClick={handleItemClick}
      />
      {index < quests.length - 1 && <hr class="separator" />}
    </React.Fragment>
  ))}
</div>
```

---

## 13. 注記・最適化ポイント

1. **ダッシュボーダー**: CSS `border-style: dashed` で 10px on、5px off を実現
2. **アニメーション**: すべてのトランジションを 150ms に統一
3. **チェックボックス**: `appearance: none` で完全カスタマイズ
4. **パフォーマンス**: 多数のアイテム表示時は仮想スクロール検討
5. **色のコントラスト**: #677B87 は背景によって見える・見えないが変わるため、背景色に応じて調整推奨

---

## 14. ダークモード対応

```css
@media (prefers-color-scheme: dark) {
  .quest-block {
    background-color: transparent;
  }

  .quest-title {
    background-color: #1e1e1e;
  }

  .quest-title__text,
  .quest-title__number {
    color: #b0b8c0;
  }

  .quest-title__number-box {
    background-color: #1e1e1e;
    border-color: #555555;
  }

  .quest-item:hover {
    background-color: #2a2a2a;
  }

  .quest-item__title {
    color: #a0a8b0;
  }

  .quest-item__checkbox {
    background-color: #0d0d0d;
    border-color: #555555;
  }

  .quest-item__checkbox:hover {
    background-color: #1a1a1a;
  }
}
```

---

## チェックリスト

- [ ] ボーダー: なし（Default 状態）
- [ ] ブロック幅: 312px、パディング 0 6px
- [ ] クエストタイトル: パディング 12px 16px、背景 #FFFFFF
- [ ] 番号ボックス: 16×16px、ボーダー 1.25px #787878、ボーラディ 5px
- [ ] タイトルテキスト: 12px Noto Sans JP Bold、#787878
- [ ] コンテンツアイテム: パディング 16px、ボーラディ 6px
- [ ] アイテムホバー: 背景 #F9FAFB
- [ ] チェックボックス: 16×16px、ボーダー 1.25px #99A1AF、ボーラディ 3px
- [ ] コンテンツタイトル: 12px、#677B87
- [ ] 時間情報: 10px、#6A7282、ギャップなし（詰まったまま）
- [ ] すべてのトランジション: 150ms ease-in-out
- [ ] キーボード操作: Tab、Space、Enter 対応
- [ ] スクリーンリーダー: role 属性、aria-label 対応
- [ ] ダークモード対応確認
