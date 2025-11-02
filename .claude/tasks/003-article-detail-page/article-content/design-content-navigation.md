# 記事詳細ページ - Content Navigation（前後記事遷移）デザイン仕様書

## 📋 概要

記事コンテンツの最後に配置される、前の記事・次の記事へ遷移するナビゲーションブロックです。左右に分かれた 2 つのカードで構成され、ユーザーが続きの学習コンテンツへスムーズに進める流れを作ります。

---

## 🎯 構造概要

```
content_navigation（幅720px）
├── back_content（前の記事カード）
│   ├── left_arrown（左矢印アイコン）
│   └── Frame
│       ├── label: "前"
│       └── title: "ToDoサービスの基本UIをつくろう 💪"
└── back_content（次の記事カード）
    ├── Frame
    │   ├── label: "次"
    │   └── title: "動画のやり方を真似して進めよう"
    └── left_arrown（右矢印アイコン）
```

---

## 📐 全体レイアウト

### メインコンテナ（content_navigation）

| プロパティ           | 値                        |
| -------------------- | ------------------------- |
| **レイアウトモード** | Row（横並び）             |
| **配置**             | space-between（両端配置） |
| **ギャップ**         | 216px                     |
| **幅**               | 720px（固定）             |
| **高さ**             | Hug（自動）               |
| **パディング**       | 0px                       |

---

## 🔗 前の記事カード（back_content / Default）

### カード全体のレイアウト

| プロパティ           | 値                              |
| -------------------- | ------------------------------- |
| **コンポーネント名** | back_content（Default variant） |
| **レイアウトモード** | Row（横並び）                   |
| **配置**             | Center（縦方向）                |
| **ギャップ**         | 11px                            |
| **パディング**       | 16px（全方向）                  |
| **ボーダーラジアス** | 16px（全角）                    |
| **ボーダー**         | 1px #DEDEDE（ライトグレー）     |
| **背景色**           | #FFFFFF（白、推定）             |
| **高さ**             | Hug（自動）                     |

### 構成要素

```
back_content（Default - 前の記事）
├── left_arrown（左矢印 24x24px）
└── Frame
    ├── label: "前"（10px, 500, Noto Sans JP）
    └── title: "ToDoサービスの基本UIをつくろう 💪"（12px, 600, Hind）
```

---

### 3-1. 左矢印アイコン（left_arrown - left variant）

| プロパティ           | 値                               |
| -------------------- | -------------------------------- |
| **要素名**           | left_arrown                      |
| **コンポーネント**   | left_arrown / left（左向き矢印） |
| **幅**               | 24px（固定）                     |
| **高さ**             | 24px（固定）                     |
| **レイアウト**       | Center（内部）                   |
| **ボーダーラジアス** | 15000px（完全な円 - 未使用）     |
| **ボーダー**         | 1.5px #000000（黒）              |
| **タイプ**           | SVG Icon                         |

**矢印の仕様**

- 左向き矢印（←）
- ストローク：1.5px、黒色
- 24×24px のボックス内にセンタリング

---

### 3-2. テキストコンテナ（Frame 3467333）

| プロパティ           | 値               |
| -------------------- | ---------------- |
| **レイアウトモード** | Column（縦並び） |
| **ギャップ**         | 4px              |
| **パディング**       | 0px              |
| **幅**               | 199px（固定）    |
| **高さ**             | Hug（自動）      |

#### 3-2-1. ラベルテキスト（"前"）

| プロパティ           | 値                    |
| -------------------- | --------------------- |
| **テキスト**         | "前"                  |
| **フォント**         | Noto Sans JP          |
| **フォントサイズ**   | 10px                  |
| **フォントウェイト** | 500（Medium）         |
| **行高**             | 10px（1em）           |
| **文字間**           | -3.125%               |
| **色**               | #787878（グレー）     |
| **配置**             | LEFT / TOP            |
| **サイズモード**     | Fill（横）/ Hug（縦） |

#### 3-2-2. タイトルテキスト（記事タイトル）

| プロパティ           | 値                                     |
| -------------------- | -------------------------------------- |
| **テキスト**         | "ToDo サービスの基本 UI をつくろう 💪" |
| **フォント**         | Hind                                   |
| **フォントサイズ**   | 12px                                   |
| **フォントウェイト** | 600（SemiBold）                        |
| **行高**             | 16px（1.3333333333333333em）           |
| **文字間**           | 標準                                   |
| **色**               | #101828（濃いスレートグレー）          |
| **配置**             | LEFT / CENTER                          |
| **サイズモード**     | Fill（横）/ Hug（縦）                  |

**テキストの扱い**

- 絵文字（💪）を含む可能性がある
- テキストが長い場合は 2 行までの折返し対応推奨
- 改行は`\n`で制御

---

## 🔗 次の記事カード（back_content / Variant2）

### カード全体のレイアウト

| プロパティ           | 値                               |
| -------------------- | -------------------------------- |
| **コンポーネント名** | back_content（Variant2 variant） |
| **レイアウトモード** | Row（横並び）                    |
| **配置**             | Center（縦方向）                 |
| **ギャップ**         | 11px                             |
| **パディング**       | 16px（全方向）                   |
| **ボーダーラジアス** | 16px（全角）                     |
| **ボーダー**         | 1px #DEDEDE（ライトグレー）      |
| **背景色**           | #FFFFFF（白、推定）              |
| **高さ**             | Hug（自動）                      |

### 構成要素（右矢印が右側にくる）

```
back_content（Variant2 - 次の記事）
├── Frame
│   ├── label: "次"（10px, 500, Noto Sans JP）
│   └── title: "動画のやり方を真似して進めよう"（12px, 600, Hind）
└── left_arrown（右矢印 24x24px）
```

**重要**: Variant2 では、テキストフレームが**左側**に、矢印が**右側**に配置されます（前のカードと鏡像）。

---

### 4-1. テキストコンテナ（Frame 3467333）

#### 4-1-1. ラベルテキスト（"次"）

| プロパティ           | 値                |
| -------------------- | ----------------- |
| **テキスト**         | "次"              |
| **フォント**         | Noto Sans JP      |
| **フォントサイズ**   | 10px              |
| **フォントウェイト** | 500（Medium）     |
| **行高**             | 10px（1em）       |
| **文字間**           | -3.125%           |
| **色**               | #787878（グレー） |
| **配置**             | LEFT / TOP        |

#### 4-1-2. タイトルテキスト（記事タイトル）

| プロパティ           | 値                               |
| -------------------- | -------------------------------- |
| **テキスト**         | "動画のやり方を真似して進めよう" |
| **フォント**         | Hind                             |
| **フォントサイズ**   | 12px                             |
| **フォントウェイト** | 600（SemiBold）                  |
| **行高**             | 16px（1.3333333333333333em）     |
| **色**               | #101828（濃いスレートグレー）    |
| **配置**             | LEFT / CENTER                    |

---

### 4-2. 右矢印アイコン（left_arrown - right variant）

| プロパティ           | 値                                |
| -------------------- | --------------------------------- |
| **要素名**           | left_arrown                       |
| **コンポーネント**   | left_arrown / right（右向き矢印） |
| **幅**               | 24px（固定）                      |
| **高さ**             | 24px（固定）                      |
| **ボーダーラジアス** | 15000px（完全な円 - 未使用）      |
| **ボーダー**         | 1.5px #000000（黒）               |
| **タイプ**           | SVG Icon                          |

**矢印の仕様**

- 右向き矢印（→）
- ストローク：1.5px、黒色
- 24×24px のボックス内にセンタリング

---

## 🎨 色彩体系

| 用途                 | 色値    | 説明               |
| -------------------- | ------- | ------------------ |
| **ラベルテキスト**   | #787878 | グレー             |
| **タイトルテキスト** | #101828 | 濃いスレートグレー |
| **カードボーダー**   | #DEDEDE | ライトグレー       |
| **矢印ストローク**   | #000000 | 黒                 |
| **カード背景**       | #FFFFFF | 白                 |

---

## 🔤 フォント体系

| 用途         | フォント     | サイズ | ウェイト | 行高 |
| ------------ | ------------ | ------ | -------- | ---- |
| **ラベル**   | Noto Sans JP | 10px   | 500      | 10px |
| **タイトル** | Hind         | 12px   | 600      | 16px |

---

## 📏 スペーシング定義

| 箇所                         | サイズ | 説明               |
| ---------------------------- | ------ | ------------------ |
| **メインコンテナギャップ**   | 216px  | 前後カード間の距離 |
| **カード内ギャップ**         | 11px   | 矢印とテキスト間   |
| **カードパディング**         | 16px   | 全方向             |
| **テキストコンテナギャップ** | 4px    | ラベルとタイトル間 |

---

## 📐 主要な固定寸法

| 要素                 | 幅    | 高さ |
| -------------------- | ----- | ---- |
| **矢印アイコン**     | 24px  | 24px |
| **テキストコンテナ** | 199px | Hug  |
| **カード全体**       | Hug   | Hug  |

---

## 📦 完全なデータ構造（JSON）

### 基本構造

```json
{
  "contentNavigation": {
    "previousArticle": {
      "id": "article_prev_001",
      "label": "前",
      "title": "ToDoサービスの基本UIをつくろう 💪",
      "direction": "left",
      "articleUrl": "/articles/article_prev_001"
    },
    "nextArticle": {
      "id": "article_next_001",
      "label": "次",
      "title": "動画のやり方を真似して進めよう",
      "direction": "right",
      "articleUrl": "/articles/article_next_001"
    }
  }
}
```

### 拡張データ構造（管理用）

```json
{
  "contentNavigation": {
    "currentArticleId": "article_current_001",
    "previousArticle": {
      "id": "article_prev_001",
      "label": "前",
      "title": "ToDoサービスの基本UIをつくろう 💪",
      "direction": "left",
      "articleUrl": "/articles/article_prev_001",
      "sequence": 4,
      "isAvailable": true,
      "createdAt": "2025-01-15T10:00:00Z"
    },
    "nextArticle": {
      "id": "article_next_001",
      "label": "次",
      "title": "動画のやり方を真似して進めよう",
      "direction": "right",
      "articleUrl": "/articles/article_next_001",
      "sequence": 6,
      "isAvailable": true,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  }
}
```

### 片方が存在しない場合（最初 or 最後の記事）

```json
{
  "contentNavigation": {
    "previousArticle": null,
    "nextArticle": {
      "id": "article_next_001",
      "label": "次",
      "title": "...",
      "direction": "right",
      "articleUrl": "/articles/article_next_001"
    }
  }
}
```

---

## 🔄 インタラクション設定

### クリック動作

**前のカードをクリック**

```
クリック
  ↓
previousArticle.articleUrl にナビゲート
  ↓
ページ遷移（ブラウザ履歴に記録）
```

**次のカードをクリック**

```
クリック
  ↓
nextArticle.articleUrl にナビゲート
  ↓
ページ遷移（ブラウザ履歴に記録）
```

### ホバー状態

カード をホバー時：

- 背景色を薄いグレー（例：#F5F5F5）に変更
- ボーダー色を濃くする（例：#CCCCCC）
- トランジション: 0.2s ease

---

## 📱 レスポンシブ対応

### デスクトップ（720px+）

- コンテナ幅: 720px（固定）
- メインギャップ: 216px
- カードは横並び（2 列）

### タブレット（600px - 720px）

- コンテナ幅: 100% または max-width: 720px
- メインギャップ: 100px に縮小
- カードは横並び（2 列、スペース調整）

### モバイル（360px - 600px）

- **レイアウト変更**: Column（縦並び）に変更
- コンテナギャップ: 12px
- 各カード幅: 100%
- パディング両側: 8px に縮小
- フォント: 9px/11px に縮小（可読性調整）

### 超小型デバイス（360px 以下）

- 各カード幅: 90%（サイドマージン確保）
- パディング: 12px
- フォント: さらに縮小

---

## 🎭 ビジュアル定義

### ボーダーラジアス

| 箇所       | サイズ | 説明 |
| ---------- | ------ | ---- |
| **カード** | 16px   | 全角 |

### ボーダー

| 箇所       | 値            | 説明       |
| ---------- | ------------- | ---------- |
| **カード** | 1px #DEDEDE   | 薄いグレー |
| **矢印**   | 1.5px #000000 | 黒         |

---

## ✅ 実装チェックリスト

- [ ] メインコンテナ幅 720px、space-between 配置
- [ ] メインコンテナギャップ 216px
- [ ] 各カードパディング 16px
- [ ] 各カードボーダーラジアス 16px
- [ ] 各カードボーダー 1px #DEDEDE
- [ ] ラベルテキスト: Noto Sans JP 10px 500, 色#787878
- [ ] タイトルテキスト: Hind 12px 600, 色#101828
- [ ] テキストコンテナ幅 199px、ギャップ 4px
- [ ] 矢印アイコン 24x24px、ストローク 1.5px 黒
- [ ] 前のカード: 左矢印
- [ ] 次のカード: 右矢印（左右が反転）
- [ ] カードクリック時のナビゲーション
- [ ] ホバー状態の背景色変更
- [ ] 前後記事が存在しない場合の非表示処理
- [ ] モバイル（360px ～ 600px）で縦並び配置に変更
- [ ] 絵文字を含むタイトルの正常表示
- [ ] テキストの自動折返し対応

---

## 🚀 完全なコンポーネント実装例（React）

```jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./ContentNavigation.css";

export function ContentNavigation({ data }) {
  const navigate = useNavigate();

  const handleNavigate = (articleUrl) => {
    navigate(articleUrl);
  };

  const { previousArticle, nextArticle } = data.contentNavigation;

  return (
    <div className="content-navigation">
      {/* 前の記事カード */}
      {previousArticle && (
        <div
          className="nav-card nav-card-prev"
          onClick={() => handleNavigate(previousArticle.articleUrl)}
        >
          <div className="nav-arrow nav-arrow-left">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 6L9 12L15 18" stroke="#000000" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="nav-text-container">
            <span className="nav-label">{previousArticle.label}</span>
            <span className="nav-title">{previousArticle.title}</span>
          </div>
        </div>
      )}

      {/* 次の記事カード */}
      {nextArticle && (
        <div
          className="nav-card nav-card-next"
          onClick={() => handleNavigate(nextArticle.articleUrl)}
        >
          <div className="nav-text-container">
            <span className="nav-label">{nextArticle.label}</span>
            <span className="nav-title">{nextArticle.title}</span>
          </div>
          <div className="nav-arrow nav-arrow-right">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 6L15 12L9 18" stroke="#000000" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 CSS 実装例

```css
.content-navigation {
  display: flex;
  justify-content: space-between;
  gap: 216px;
  width: 720px;
  margin: 0 auto;
}

.nav-card {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #dedede;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  max-width: 300px;
}

.nav-card:hover {
  background-color: #f5f5f5;
  border-color: #cccccc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-card-prev {
  flex-direction: row;
}

.nav-card-next {
  flex-direction: row-reverse;
}

.nav-arrow {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.nav-text-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 199px;
}

.nav-label {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 10px;
  font-weight: 500;
  line-height: 10px;
  letter-spacing: -3.125%;
  color: #787878;
}

.nav-title {
  font-family: "Hind", sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  color: #101828;
  word-break: break-word;
}

/* モバイル対応 */
@media (max-width: 600px) {
  .content-navigation {
    flex-direction: column;
    gap: 12px;
    width: 100%;
    padding: 0 8px;
  }

  .nav-card {
    max-width: 100%;
    padding: 12px;
  }

  .nav-label {
    font-size: 9px;
  }

  .nav-title {
    font-size: 11px;
    line-height: 14px;
  }

  .nav-arrow {
    width: 20px;
    height: 20px;
  }
}
```

---

## 🔗 ナビゲーション時の状態管理

### 前後記事の取得ロジック

```jsx
// API から現在記事の前後を取得
const fetchContentNavigation = async (currentArticleId) => {
  const response = await fetch(`/api/articles/${currentArticleId}/navigation`);
  return response.json();
};

// 使用例
useEffect(() => {
  fetchContentNavigation(currentArticleId).then((data) => {
    setContentNavigation(data);
  });
}, [currentArticleId]);
```

### バックエンド想定エンドポイント

```
GET /api/articles/{articleId}/navigation
レスポンス:
{
  "previousArticle": { ... } or null,
  "nextArticle": { ... } or null
}
```

---

## 📱 モバイル CSS 追加例

```css
@media (max-width: 600px) {
  .content-navigation {
    flex-direction: column;
    gap: 12px;
    width: calc(100% - 16px);
    padding: 0 8px;
    margin: 24px 0;
  }

  .nav-card {
    width: 100%;
    max-width: none;
    padding: 12px;
    flex-direction: row;
  }

  .nav-card-next {
    flex-direction: row;
  }

  .nav-text-container {
    width: 100%;
    flex: 1;
  }

  .nav-title {
    max-width: 90%;
    white-space: normal;
  }
}
```

---

## 🚀 HTML マークアップ例

```html
<div class="content-navigation">
  <!-- 前の記事 -->
  <div class="nav-card nav-card-prev" data-article-id="article_prev_001">
    <div class="nav-arrow nav-arrow-left">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 6L9 12L15 18" stroke="#000000" strokeWidth="1.5" />
      </svg>
    </div>
    <div class="nav-text-container">
      <span class="nav-label">前</span>
      <span class="nav-title">ToDoサービスの基本UIをつくろう 💪</span>
    </div>
  </div>

  <!-- 次の記事 -->
  <div class="nav-card nav-card-next" data-article-id="article_next_001">
    <div class="nav-text-container">
      <span class="nav-label">次</span>
      <span class="nav-title">動画のやり方を真似して進めよう</span>
    </div>
    <div class="nav-arrow nav-arrow-right">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 6L15 12L9 18" stroke="#000000" strokeWidth="1.5" />
      </svg>
    </div>
  </div>
</div>
```

### イベントリスナー追加

```javascript
document.querySelectorAll(".nav-card").forEach((card) => {
  card.addEventListener("click", () => {
    const articleId = card.dataset.articleId;
    window.location.href = `/articles/${articleId}`;
  });
});
```

---

## 🔍 アクセシビリティ対応

### ARIA 属性の追加

```jsx
<div
  className="nav-card"
  onClick={() => handleNavigate(previousArticle.articleUrl)}
  role="link"
  tabIndex="0"
  aria-label={`前の記事: ${previousArticle.title}`}
  onKeyPress={(e) => {
    if (e.key === "Enter") {
      handleNavigate(previousArticle.articleUrl);
    }
  }}
>
  {/* ... */}
</div>
```

### キーボード操作対応

```jsx
const handleKeyDown = (event, articleUrl) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handleNavigate(articleUrl);
  }
};

// テンプレート内で使用
<div
  className="nav-card"
  onKeyDown={(e) => handleKeyDown(e, previousArticle.articleUrl)}
/>;
```

---

## 📊 データフロー

```
記事ページロード
    ↓
currentArticleId を取得
    ↓
API: GET /api/articles/{articleId}/navigation
    ↓
前後記事データを受け取る
    ↓
ContentNavigation コンポーネントに渡す
    ↓
画面にレンダリング（2つのカード表示）
    ↓
ユーザーがカードをクリック
    ↓
onClick ハンドラで articleUrl にナビゲート
    ↓
新しい記事ページを表示
```

---

## ✅ 実装チェックリスト（詳細版）

### ビジュアル確認

- [ ] メインコンテナが幅 720px で固定
- [ ] space-between で両端に配置
- [ ] 前後カード間のギャップが約 216px
- [ ] 各カード幅が自動調整（コンテンツ依存）
- [ ] カード背景が白、ボーダーが 1px #DEDEDE

### テキスト確認

- [ ] ラベル「前」「次」が Noto Sans JP 10px で表示
- [ ] タイトルが Hind 12px で表示
- [ ] ラベル色が #787878（グレー）
- [ ] タイトル色が #101828（濃紺）
- [ ] 絵文字が正常に表示される

### アイコン確認

- [ ] 前のカードに左矢印
- [ ] 次のカードに右矢印
- [ ] 矢印が 24x24px でセンタリング
- [ ] 矢印ストローク 1.5px 黒色

### インタラクション確認

- [ ] カードをクリックで記事に遷移
- [ ] ホバー時に背景色が変わる
- [ ] トランジション効果が滑らか（0.2s）
- [ ] 前後記事が存在しない場合は非表示

### レスポンシブ確認

- [ ] タブレット（600px ～ 720px）: ギャップ 100px、横並び
- [ ] モバイル（360px ～ 600px）: 縦並び配置、100%幅
- [ ] 超小型（360px 以下）: 90%幅、サイドマージン確保
- [ ] テキスト折返しが自然

### 機能確認

- [ ] API から前後記事データを正常に取得
- [ ] 片方の記事が存在しない場合の処理（null チェック）
- [ ] ページ遷移時に履歴に記録
- [ ] ブラウザ戻るボタンで前ページに戻る

### アクセシビリティ確認

- [ ] キーボードのみで操作可能
- [ ] ARIA ラベルが設定されている
- [ ] スクリーンリーダーで読み上げ可能

---

## 🔍 トラブルシューティング

### Q: 矢印が表示されない

**A:** SVG ファイルが正しく読み込まれているか確認。または、`<path>` 要素の `stroke` 属性が黒色（#000000）に設定されているか確認。

### Q: テキストが 2 行になって崩れる

**A:** `.nav-text-container` の幅を 199px で固定し、`word-break: break-word` を設定。タイトルの長さを制限するか、フォントサイズを調整。

### Q: モバイルで横幅を超える

**A:** コンテナに `width: 100%` を設定、サイドパディング（8px）を追加。または `box-sizing: border-box` を確認。

### Q: ホバー効果が反応しない

**A:** CSS の `:hover` が正しく設定されているか、JavaScript で `addEventListener('mouseenter')` を使用しているか確認。

### Q: 前後記事が null の場合、表示がおかしい

**A:** React の条件分岐 `{previousArticle && <div>...</div>}` で非表示処理を実装。

---

## 📋 完全な実装チェックリスト（最終版）

- [ ] デザイン仕様通りに実装完了
- [ ] ピクセル完全なマッチング確認
- [ ] カラーコード確認（#787878、#101828 など）
- [ ] フォント確認（Noto Sans JP、Hind）
- [ ] 前後カード間のギャップ 216px 確認
- [ ] アイコンが正しい向き（左・右）
- [ ] クリック時のナビゲーション動作確認
- [ ] ホバー状態の UI 確認
- [ ] レスポンシブ対応確認
- [ ] モバイルでの表示確認
- [ ] キーボード操作確認（Tab、Enter）
- [ ] スクリーンリーダー対応確認
- [ ] 前後記事が存在しない場合の処理確認
- [ ] パフォーマンステスト
- [ ] ブラウザ互換性テスト（Chrome、Firefox、Safari）
- [ ] iOS・Android での表示確認
