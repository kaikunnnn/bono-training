# 記事詳細ページ - Rich テキストエリア デザイン仕様書

## 📋 概要

記事の本文コンテンツを表示するセクションです。見出し（Heading 2、Heading 3）、段落テキスト、箇条書きリスト、複合要素など、複数のテキストフォーマットをサポートします。

設計では、Rich テキストエディタから出力されたコンテンツを構造化しており、最低限必要な書式（見出し・段落・リスト）に限定することで、実装の複雑さを削減しています。

---

## 🎯 構造概要

```
ritchtext（メインコンテナ）
├── Section 1（セクション）
│   ├── Heading 2（H2見出し）
│   └── Paragraph（段落テキスト）
├── Section 2（セクション）
│   ├── Heading 2（H2見出し）
│   ├── Container（セクション内コンテナ）
│   │   ├── Heading 3（H3見出し）
│   │   ├── List Item（リスト項目・テキスト）
│   │   ├── Heading 3（H3見出し）
│   │   └── List（リストコンテナ）
│   │       ├── List Item
│   │       ├── List Item
│   │       └── List Item
└── Section 3（セクション）
    ├── Heading 2（H2見出し）
    └── Paragraph（段落テキスト）
```

---

## 📐 全体レイアウト

### メインコンテナ（ritchtext）

| プロパティ           | 値                              |
| -------------------- | ------------------------------- |
| **レイアウトモード** | Column（縦並び）                |
| **パディング**       | 24px 0px（上下 24px、左右 0px） |
| **ギャップ**         | 48px（各セクション間）          |
| **サイズモード**     | Fill（横方向）/ Hug（縦方向）   |
| **推奨幅**           | 720px（親コンテナから継承）     |

---

## 📚 セクション構造（Section）

### 基本セクションレイアウト

**通常の段落セクション（Section 1）**

| プロパティ           | 値                            |
| -------------------- | ----------------------------- |
| **レイアウトモード** | Column（縦並び）              |
| **ギャップ**         | 24px                          |
| **パディング**       | 0px                           |
| **高さ**             | 108px（固定、コンテンツ依存） |

**複合コンテナセクション（Section 2）**

| プロパティ           | 値                            |
| -------------------- | ----------------------------- |
| **レイアウトモード** | Column（縦並び）              |
| **ギャップ**         | 32px                          |
| **パディング**       | 0px                           |
| **高さ**             | 372px（固定、複数要素を含む） |

### セクション内ギャップの意味

- 各セクション内の要素（見出し、段落、リスト）は 24px ～ 32px の距離で区切られ、コンテンツの階層感を作ります

---

## 🔤 テキスト要素仕様

### Heading 2（H2 見出し）

**レイアウト情報**

| プロパティ           | 値                   |
| -------------------- | -------------------- |
| **レイアウトモード** | None（相対位置指定） |
| **高さ**             | 32px（固定）         |
| **幅**               | Fill（自動調整）     |

**テキストスタイル**

| プロパティ           | 値                            |
| -------------------- | ----------------------------- |
| **フォント**         | Inter                         |
| **フォントサイズ**   | 20px                          |
| **フォントウェイト** | 700（Bold）                   |
| **行高**             | 32px（1.6em）                 |
| **文字間**           | 0.3515625%                    |
| **色**               | #101828（濃いスレートグレー） |
| **配置**             | LEFT / TOP                    |

**使用例**

- "アウトプット目標の重要性"
- "良い目標設定の例"
- "効果的な目標の立て方"

### Heading 3（H3 見出し）

**レイアウト情報**

| プロパティ           | 値                      |
| -------------------- | ----------------------- |
| **レイアウトモード** | None（相対位置指定）    |
| **高さ**             | 28px（固定）            |
| **幅**               | 832px（コンテナ内フル） |

**テキストスタイル**

| プロパティ           | 値                            |
| -------------------- | ----------------------------- |
| **フォント**         | Inter                         |
| **フォントサイズ**   | 16px                          |
| **フォントウェイト** | 600（SemiBold）               |
| **行高**             | 28px（1.75em）                |
| **文字間**           | -2.8076171875%                |
| **色**               | #101828（濃いスレートグレー） |
| **配置**             | LEFT / TOP                    |

**使用例**

- "❌ 悪い例"
- "✅ 良い例"

**注記**

- H3 は絵文字や記号を含む場合がある
- 絵文字は実装時にサニタイズまたは図のように配置

---

### 段落テキスト（Paragraph）

**レイアウト情報**

| プロパティ             | 値                            |
| ---------------------- | ----------------------------- |
| **コンテナレイアウト** | Row（テキスト + 左マージン）  |
| **ギャップ**           | 10px                          |
| **パディング**         | 0px                           |
| **サイズモード**       | Fill（横方向）/ Hug（縦方向） |

**テキスト要素のレイアウト**

| プロパティ       | 値                            |
| ---------------- | ----------------------------- |
| **レイアウト**   | None（絶対配置）              |
| **サイズモード** | Fill（横方向）/ Hug（縦方向） |

**テキストスタイル**

| プロパティ           | 値                        |
| -------------------- | ------------------------- |
| **フォント**         | Inter                     |
| **フォントサイズ**   | 16px                      |
| **フォントウェイト** | 400（Regular）            |
| **行高**             | 26px（1.625em）           |
| **文字間**           | -1.953125%                |
| **色**               | #364153（スレートグレー） |
| **配置**             | LEFT / TOP                |

**使用例**

```
「Figmaを学ぶ」よりも「Figmaでポートフォリオサイトのデザインを作る」という目標の方が、
具体的で達成感も得られます。アウトプットを設定することで、学習に方向性が生まれます。
```

**テキストの扱い**

- 複数行に折返す場合、行高 26px で綺麗に並ぶ
- 自動折返し対応
- テキストの前後に余白なし

---

## 📋 リスト構造

### リストコンテナ（List）

**レイアウト情報**

| プロパティ           | 値                         |
| -------------------- | -------------------------- |
| **レイアウトモード** | Column（縦並び）           |
| **ギャップ**         | 8px（各リスト項目間）      |
| **パディング**       | 0px                        |
| **幅**               | 832px（固定）              |
| **高さ**             | 94px（3 項目の場合、固定） |

### リスト項目（List Item）

**レイアウト情報**

| プロパティ           | 値                   |
| -------------------- | -------------------- |
| **レイアウトモード** | None（相対配置）     |
| **高さ**             | 26px（固定）         |
| **幅**               | Fill（自動調整）     |
| **左マージン**       | 21.5px（インデント） |

**テキスト要素**

| プロパティ           | 値                        |
| -------------------- | ------------------------- |
| **フォント**         | Inter                     |
| **フォントサイズ**   | 16px                      |
| **フォントウェイト** | 400（Regular）            |
| **行高**             | 26px（1.625em）           |
| **文字間**           | -1.953125%                |
| **色**               | #364153（スレートグレー） |
| **配置**             | LEFT / TOP                |
| **左マージン**       | 21.5px                    |
| **上マージン**       | -0.5px（微調整）          |

**使用例**

```
リスト項目1: 架空のECサイトのUIデザインを3画面作成する
リスト項目2: Daily UIチャレンジを30日間続けて、30個のUI要素を作る
リスト項目3: 既存アプリのリデザイン案を1つ完成させる
```

**マークアップ時の注記**

- リスト項目の前に「・」や「–」などの記号を自動付与（CSS の `::before` または直接マークアップ）
- インデント 21.5px は記号スペース + テキスト開始位置

---

## 🎨 色彩体系

| 用途                   | 色値       | 説明                     |
| ---------------------- | ---------- | ------------------------ |
| **Heading 2**          | #101828    | 濃いスレートグレー       |
| **Heading 3**          | #101828    | 濃いスレートグレー       |
| **段落テキスト**       | #364153    | ミディアムスレートグレー |
| **リスト項目テキスト** | #364153    | ミディアムスレートグレー |
| **背景**               | 継承（白） | コンテナ背景色に依存     |

---

## 🔤 フォント体系

| 用途             | フォント | サイズ | ウェイト | 行高 |
| ---------------- | -------- | ------ | -------- | ---- |
| **見出し H2**    | Inter    | 20px   | 700      | 32px |
| **見出し H3**    | Inter    | 16px   | 600      | 28px |
| **段落テキスト** | Inter    | 16px   | 400      | 26px |
| **リスト項目**   | Inter    | 16px   | 400      | 26px |

---

## 📏 スペーシング定義

| 箇所                             | サイズ | 説明                       |
| -------------------------------- | ------ | -------------------------- |
| **メインコンテナ上下パディング** | 24px   | 本文全体の上下余白         |
| **セクション間ギャップ**         | 48px   | 大きなセクション区切り     |
| **セクション内ギャップ（通常）** | 24px   | 見出しと段落の間           |
| **セクション内ギャップ（複合）** | 32px   | 複数要素間の距離           |
| **リスト項目間ギャップ**         | 8px    | 各リスト項目の間隔         |
| **段落内ギャップ**               | 10px   | 段落コンテナの内部ギャップ |
| **リスト項目左インデント**       | 21.5px | 記号 + テキスト開始位置    |

---

## 📐 主要な固定寸法

| 要素               | 幅    | 高さ           |
| ------------------ | ----- | -------------- |
| **Heading 2**      | Fill  | 32px           |
| **Heading 3**      | 832px | 28px           |
| **段落テキスト**   | Fill  | Hug            |
| **リストコンテナ** | 832px | 94px（3 項目） |
| **リスト項目**     | Fill  | 26px           |

---

## 📦 完全なデータ構造（JSON）

### 基本構造

```json
{
  "richtext": {
    "sections": [
      {
        "type": "section",
        "content": [
          {
            "type": "heading2",
            "text": "アウトプット目標の重要性"
          },
          {
            "type": "paragraph",
            "text": "「Figmaを学ぶ」よりも「Figmaでポートフォリオサイトのデザインを作る」という目標の方が、具体的で達成感も得られます。アウトプットを設定することで、学習に方向性が生まれます。"
          }
        ]
      },
      {
        "type": "section",
        "content": [
          {
            "type": "heading2",
            "text": "良い目標設定の例"
          },
          {
            "type": "container",
            "content": [
              {
                "type": "heading3",
                "text": "❌ 悪い例"
              },
              {
                "type": "list-item",
                "text": "todolist\ntodolist\ntodolist"
              },
              {
                "type": "heading3",
                "text": "✅ 良い例"
              },
              {
                "type": "list",
                "items": [
                  {
                    "id": "list_001",
                    "text": "架空のECサイトのUIデザインを3画面作成する"
                  },
                  {
                    "id": "list_002",
                    "text": "Daily UIチャレンジを30日間続けて、30個のUI要素を作る"
                  },
                  {
                    "id": "list_003",
                    "text": "既存アプリのリデザイン案を1つ完成させる"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "type": "section",
        "content": [
          {
            "type": "heading2",
            "text": "効果的な目標の立て方"
          },
          {
            "type": "paragraph",
            "text": "SMART原則（具体的・測定可能・達成可能・関連性・期限）を意識して目標を設定しましょう。「3ヶ月後までに、架空の旅行予約アプリのUI画面を10画面デザインする」といった具体的な目標が理想的です。"
          }
        ]
      }
    ]
  }
}
```

### 配列データ形式（CMS から取得した場合）

```json
{
  "contentBlocks": [
    {
      "id": "block_001",
      "type": "section",
      "blocks": [
        {
          "id": "h2_001",
          "type": "heading2",
          "content": "アウトプット目標の重要性"
        },
        {
          "id": "p_001",
          "type": "paragraph",
          "content": "「Figmaを学ぶ」よりも「Figmaでポートフォリオサイトのデザインを作る」という目標の方が、具体的で達成感も得られます。アウトプットを設定することで、学習に方向性が生まれます。"
        }
      ]
    },
    {
      "id": "block_002",
      "type": "section",
      "blocks": [
        {
          "id": "h2_002",
          "type": "heading2",
          "content": "良い目標設定の例"
        },
        {
          "id": "container_001",
          "type": "container",
          "blocks": [
            {
              "id": "h3_001",
              "type": "heading3",
              "content": "❌ 悪い例"
            },
            {
              "id": "list_item_001",
              "type": "list-item",
              "content": "todolist\ntodolist\ntodolist"
            },
            {
              "id": "h3_002",
              "type": "heading3",
              "content": "✅ 良い例"
            },
            {
              "id": "list_001",
              "type": "list",
              "items": [
                {
                  "id": "li_001",
                  "content": "架空のECサイトのUIデザインを3画面作成する"
                },
                {
                  "id": "li_002",
                  "content": "Daily UIチャレンジを30日間続けて、30個のUI要素を作る"
                },
                {
                  "id": "li_003",
                  "content": "既存アプリのリデザイン案を1つ完成させる"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "block_003",
      "type": "section",
      "blocks": [
        {
          "id": "h2_003",
          "type": "heading2",
          "content": "効果的な目標の立て方"
        },
        {
          "id": "p_002",
          "type": "paragraph",
          "content": "SMART原則（具体的・測定可能・達成可能・関連性・期限）を意識して目標を設定しましょう。「3ヶ月後までに、架空の旅行予約アプリのUI画面を10画面デザインする」といった具体的な目標が理想的です。"
        }
      ]
    }
  ]
}
```

---

## 🛠️ 実装方針

### 対応する Rich テキスト書式（最小限）

本仕様では、以下の書式のみをサポートします。それ以外の書式（表、コード、引用など）は今後のアップデートで対応予定です。

| 書式                   | サポート | 説明                         |
| ---------------------- | -------- | ---------------------------- |
| **Heading 2**          | ✅       | 記事内の主要セクション見出し |
| **Heading 3**          | ✅       | セクション内のサブ見出し     |
| **段落テキスト**       | ✅       | 通常の本文                   |
| **リスト（順序なし）** | ✅       | 箇条書きリスト               |
| **太字**               | ❌       | 今後対応予定                 |
| **イタリック**         | ❌       | 今後対応予定                 |
| **リンク**             | ❌       | 今後対応予定                 |
| **表**                 | ❌       | 今後対応予定                 |
| **コードブロック**     | ❌       | 今後対応予定                 |
| **引用**               | ❌       | 今後対応予定                 |

### 設計の背景

Rich テキストエディタ（WordPress、Medium 等）ではすべての書式をサポートするのが一般的ですが、本仕様では学習コンテンツの特性上、必要最小限の書式に限定しています。

理由：

1. **実装シンプルさ**: 最小限の書式で実装コストを削減
2. **読みやすさ**: 過度なフォーマットを避け、コンテンツに集中させる
3. **保守性**: サポート書式が少ないほど、バグが少なく保守が容易
4. **一貫性**: 記事全体で統一された見た目を保つ

---

## 📝 Rich テキスト要素ごとの実装ガイド

### Heading 2 の実装

**HTML**

```html
<h2 class="richtext-heading2">アウトプット目標の重要性</h2>
```

**CSS**

```css
.richtext-heading2 {
  font-family: Inter;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.6em; /* 32px */
  letter-spacing: 0.3515625%;
  color: #101828;
  margin: 0;
  margin-bottom: 24px;
}
```

**React**

```jsx
<h2 className="richtext-heading2">{block.text}</h2>
```

---

### Heading 3 の実装

**HTML**

```html
<h3 class="richtext-heading3">✅ 良い例</h3>
```

**CSS**

```css
.richtext-heading3 {
  font-family: Inter;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.75em; /* 28px */
  letter-spacing: -2.8076171875%;
  color: #101828;
  margin: 0;
  margin-bottom: 16px;
}
```

**React**

```jsx
<h3 className="richtext-heading3">{block.text}</h3>
```

---

### 段落テキスト の実装

**HTML**

```html
<p class="richtext-paragraph">
  「Figmaを学ぶ」よりも「Figmaでポートフォリオサイトのデザインを作る」という目標の方が、
  具体的で達成感も得られます。アウトプットを設定することで、学習に方向性が生まれます。
</p>
```

**CSS**

```css
.richtext-paragraph {
  font-family: Inter;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.625em; /* 26px */
  letter-spacing: -1.953125%;
  color: #364153;
  margin: 0;
  margin-bottom: 24px;
}
```

**React**

```jsx
<p className="richtext-paragraph">{block.text}</p>
```

---

### リスト の実装

**HTML**

```html
<ul class="richtext-list">
  <li class="richtext-list-item">架空のECサイトのUIデザインを3画面作成する</li>
  <li class="richtext-list-item">
    Daily UIチャレンジを30日間続けて、30個のUI要素を作る
  </li>
  <li class="richtext-list-item">既存アプリのリデザイン案を1つ完成させる</li>
</ul>
```

**CSS**

```css
.richtext-list {
  list-style: none;
  padding: 0;
  margin: 0;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.richtext-list-item {
  font-family: Inter;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.625em; /* 26px */
  letter-spacing: -1.953125%;
  color: #364153;
  margin-left: 21.5px;
  position: relative;
}

.richtext-list-item::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #364153;
  font-weight: 700;
}
```

**React**

```jsx
<ul className="richtext-list">
  {block.items.map((item) => (
    <li key={item.id} className="richtext-list-item">
      {item.text}
    </li>
  ))}
</ul>
```

---

### セクション コンテナ の実装

**HTML**

```html
<section class="richtext-section">
  <h2 class="richtext-heading2">...</h2>
  <!-- 子要素 -->
</section>
```

**CSS**

```css
.richtext-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 48px;
}

.richtext-section:last-child {
  margin-bottom: 0;
}
```

**React**

```jsx
<section className="richtext-section">
  {section.blocks.map((block) => (
    <RichTextBlock key={block.id} block={block} />
  ))}
</section>
```

---

## 🎭 レスポンシブ対応

### デスクトップ（720px+）

- フォントサイズ: 指定値のままを使用
- 行高: 指定値を使用
- リスト左インデント: 21.5px
- セクション間ギャップ: 48px

### タブレット（600px - 720px）

- フォントサイズ: 95% 程度に縮小（推奨）
- 行高: 1.5 ~ 1.6em（可読性確保）
- セクション間ギャップ: 32px に縮小

### モバイル（360px - 600px）

- フォント サイズ: 90% 程度に縮小
  - H2: 18px → 16px
  - 本文: 16px → 14px
- 行高: 1.5em 統一
- リスト左インデント: 16px に縮小
- セクション間ギャップ: 24px に縮小
- メインコンテナ パディング: 16px 0px → 12px 0px

---

## 📱 モバイル CSS 例

```css
@media (max-width: 600px) {
  .richtext-heading2 {
    font-size: 16px;
    line-height: 1.5em;
    margin-bottom: 16px;
  }

  .richtext-heading3 {
    font-size: 14px;
    line-height: 1.5em;
    margin-bottom: 12px;
  }

  .richtext-paragraph {
    font-size: 14px;
    line-height: 1.5em;
    margin-bottom: 16px;
  }

  .richtext-list-item {
    font-size: 14px;
    line-height: 1.5em;
    margin-left: 16px;
  }

  .richtext-section {
    gap: 16px;
    margin-bottom: 24px;
  }
}
```

---

## 🔄 複合要素の実装例

### Section 内の Container（複数要素を含む場合）

**HTML**

```html
<section class="richtext-section">
  <h2 class="richtext-heading2">良い目標設定の例</h2>

  <div class="richtext-container">
    <h3 class="richtext-heading3">❌ 悪い例</h3>
    <p class="richtext-list-item-text">
      todolist<br />
      todolist<br />
      todolist
    </p>

    <h3 class="richtext-heading3">✅ 良い例</h3>
    <ul class="richtext-list">
      <li class="richtext-list-item">...</li>
      <!-- ... -->
    </ul>
  </div>
</section>
```

**React**

```jsx
<section className="richtext-section">
  <h2 className="richtext-heading2">{section.heading}</h2>

  <div className="richtext-container">
    {section.container.blocks.map((block) => {
      switch (block.type) {
        case "heading3":
          return (
            <h3 key={block.id} className="richtext-heading3">
              {block.text}
            </h3>
          );
        case "paragraph":
          return (
            <p key={block.id} className="richtext-paragraph">
              {block.text}
            </p>
          );
        case "list":
          return (
            <ul key={block.id} className="richtext-list">
              {block.items.map((item) => (
                <li key={item.id} className="richtext-list-item">
                  {item.text}
                </li>
              ))}
            </ul>
          );
        default:
          return null;
      }
    })}
  </div>
</section>
```

---

## ✅ 実装チェックリスト

- [ ] Heading 2: Inter 20px 700, 色#101828, 行高 32px
- [ ] Heading 3: Inter 16px 600, 色#101828, 行高 28px
- [ ] 段落テキスト: Inter 16px 400, 色#364153, 行高 26px
- [ ] リスト項目: Inter 16px 400, 色#364153, 行高 26px
- [ ] セクション間ギャップ: 48px
- [ ] セクション内ギャップ（見出し・段落間）: 24px
- [ ] セクション内ギャップ（複合要素間）: 32px
- [ ] リスト項目間ギャップ: 8px
- [ ] リスト左インデント: 21.5px
- [ ] リストマーク（・）自動付与
- [ ] リスト・マークの色: #364153
- [ ] メインコンテナ上下パディング: 24px
- [ ] 複数行テキストの自動折返し
- [ ] モバイルレスポンシブ対応確認
- [ ] テキストのサニタイズ（XSS 対策）
- [ ] 改行(\n)の正しい処理（段落内、複数行対応）
- [ ] データ構造が JSON スキーマと一致

---

## 🚀 完全なコンポーネント実装例（React）

```jsx
import React from "react";
import "./RichTextEditor.css";

const RichTextBlock = ({ block }) => {
  switch (block.type) {
    case "heading2":
      return <h2 className="richtext-heading2">{block.text}</h2>;

    case "heading3":
      return <h3 className="richtext-heading3">{block.text}</h3>;

    case "paragraph":
      return <p className="richtext-paragraph">{block.text}</p>;

    case "list-item":
      // 改行を<br>に変換
      const lines = block.text.split("\n");
      return (
        <p className="richtext-list-item-text">
          {lines.map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      );

    case "list":
      return (
        <ul className="richtext-list">
          {block.items.map((item) => (
            <li key={item.id} className="richtext-list-item">
              {item.text}
            </li>
          ))}
        </ul>
      );

    case "container":
      return (
        <div className="richtext-container">
          {block.blocks.map((innerBlock) => (
            <RichTextBlock key={innerBlock.id} block={innerBlock} />
          ))}
        </div>
      );

    default:
      return null;
  }
};

export function RichTextEditor({ data }) {
  return (
    <div className="richtext">
      {data.sections.map((section) => (
        <section key={section.id} className="richtext-section">
          {section.content.map((block) => (
            <RichTextBlock key={block.id} block={block} />
          ))}
        </section>
      ))}
    </div>
  );
}
```

---

## 📊 データフロー（CMS → Frontend）

```
CMS（記事編集画面）
    ↓
記事データ（JSON）を出力
    ↓
API経由で Frontend に送信
    ↓
RichTextEditor コンポーネントが解析
    ↓
各ブロック型に応じて HTML をレンダリング
    ↓
ブラウザに表示
```

### API レスポンス例

```json
{
  "article": {
    "id": "article_001",
    "title": "...",
    "richtext": {
      "sections": [
        {
          "id": "section_001",
          "type": "section",
          "content": [...]
        }
      ]
    }
  }
}
```

---

## 🔐 セキュリティ対応

### XSS 対策

- ユーザー入力テキストは必ず `DOMPurify` などのライブラリでサニタイズ
- HTML エスケープを自動実行
- スクリプトタグの挿入防止

### React での実装例

```jsx
import DOMPurify from "dompurify";

const sanitizedText = DOMPurify.sanitize(block.text);
return <p>{sanitizedText}</p>;
```

---

## 📋 トラブルシューティング

### Q: テキストの改行が表示されない

**A:** `white-space: pre-line` または `white-space: pre-wrap` CSS プロパティを使用。または改行文字(\n)を<br>に変換。

### Q: リストマークが表示されない

**A:** CSS の `::before` が正しく設定されているか確認。または `<li>` タグにマークをマークアップに直接含める。

### Q: フォントが異なる

**A:** `font-family: Inter` が正しく指定されているか、フォントファイルが読み込まれているか確認。

### Q: 行高が異なる

**A:** `line-height` 値がピクセル値（32px）ではなく、倍数（1.6em）で指定されているか確認。

### Q: モバイルで崩れる

**A:** メディアクエリが正しく設定されているか、パディング・マージン値を確認。

---

## 🔍 検証チェック項目

実装後に以下を確認してください：

- [ ] 視覚的に仕様と一致（Figma デザイン対比）
- [ ] すべてのフォントサイズ・ウェイト・色が正確
- [ ] 行高が正しく計算されている（ピクセル値 = フォントサイズ × em 値）
- [ ] セクション間・要素間ギャップが正確
- [ ] リストマークが正しく表示
- [ ] 複数行テキストの折返しが自然
- [ ] モバイル（360px ～ 600px）で正常に表示
- [ ] テキストのサニタイズが動作（XSS 対策）
- [ ] アクセシビリティ対応（見出しレベルが正しい）
- [ ] パフォーマンステスト（大量コンテンツ時）
