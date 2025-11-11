# BONO Blog - リンクカード（Bookmark Card）機能

## 概要

ブログ記事内にURLを挿入すると、そのサイトのOGPデータ（タイトル、説明、サムネイル画像）を自動取得してカード形式で美しく表示する機能です。

Inkdropのようなモダンでシンプルなデザインを採用しています。

## 機能の特徴

- ✅ **Ghost CMS の Bookmark カード機能を活用**
- ✅ **OGPデータの自動取得**（タイトル、説明、画像、アイコン）
- ✅ **レスポンシブデザイン**（PC/タブレット/モバイル対応）
- ✅ **ホバーエフェクト**（浮き上がるアニメーション）
- ✅ **ダークモード対応**（オプション）

## 使い方

### Ghost管理画面での操作

#### 方法1: スラッシュコマンドで挿入

1. Ghost管理画面（http://localhost:2368/ghost）にログイン
2. 記事編集画面を開く
3. 記事本文で `/bookmark` と入力
4. 表示されるメニューから「Bookmark」を選択
5. URLを入力（例: `https://www.inkdrop.app/`）
6. Enterキーを押す
7. Ghostが自動的にOGPデータを取得してカードを生成

#### 方法2: プラスボタンから挿入

1. 記事編集画面で `+` ボタンをクリック
2. 「Bookmark」を選択
3. URLを入力してEnterキー

### 対応するURL例

以下のようなURLをBookmarkカードとして挿入できます：

- **Webサイト**: `https://www.inkdrop.app/`
- **GitHubリポジトリ**: `https://github.com/inkdropapp/inkdrop`
- **記事ページ**: `https://qiita.com/craftzdog/items/xxxxx`
- **YouTube動画**: `https://www.youtube.com/watch?v=xxxxx`
- **Twitter/X**: `https://twitter.com/username/status/xxxxx`

## 表示例

### デスクトップ表示

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Inkdrop - Note-taking App                   [画像]   │
│  The Note-Taking App with Robust             [サム]   │
│  Markdown Editor                              [ネイル] │
│                                                         │
│  🔗 inkdrop.app                                        │
└─────────────────────────────────────────────────────────┘
```

### モバイル表示

```
┌─────────────────────┐
│                     │
│   [サムネイル画像]  │
│                     │
├─────────────────────┤
│ Inkdrop - Note-...  │
│ The Note-Taking ... │
│                     │
│ 🔗 inkdrop.app     │
└─────────────────────┘
```

## 技術仕様

### Ghost CMS側のHTML構造

Ghost CMSが生成するHTML：

```html
<figure class="kg-card kg-bookmark-card">
  <a class="kg-bookmark-container" href="https://www.inkdrop.app/">
    <div class="kg-bookmark-content">
      <div class="kg-bookmark-title">Inkdrop - Note-taking App with Robust Markdown Editor</div>
      <div class="kg-bookmark-description">The Note-Taking App with Robust Markdown Editor</div>
      <div class="kg-bookmark-metadata">
        <img class="kg-bookmark-icon" src="https://www.inkdrop.app/favicon.ico" alt="favicon">
        <span class="kg-bookmark-author">inkdrop.app</span>
      </div>
    </div>
    <div class="kg-bookmark-thumbnail">
      <img src="https://www.inkdrop.app/og-image.png" alt="thumbnail">
    </div>
  </a>
</figure>
```

### スタイル定義

ファイル: `src/styles/blog/link-card.css`

主な特徴：
- **カードデザイン**: 白背景、1px グレーボーダー、12px角丸
- **ホバー効果**: 2px浮き上がり、シャドウ強調
- **レイアウト**: Flexboxで左右2カラム（コンテンツ60% / サムネイル40%）
- **レスポンシブ**: 768px以下で縦並び
- **ダークモード**: `prefers-color-scheme: dark` 対応

### デザイントークン

```css
/* カラー */
background: #ffffff
border: #e5e7eb
text-primary: #0f172a
text-secondary: #64748b
text-meta: #94a3b8

/* サイズ */
border-radius: 12px
padding: 20px
thumbnail-max-width: 300px
thumbnail-height: 200px (mobile)

/* エフェクト */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05)
box-shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.08)
transform-hover: translateY(-2px)
transition: all 0.3s ease
```

## トラブルシューティング

### OGPデータが取得されない

**原因**: 対象サイトがOGPタグを設定していない

**対処法**:
1. 別のURLを試す
2. 通常のリンク（`<a>`タグ）として挿入

### カードが表示されない

**原因1**: CSSが読み込まれていない

**対処法**:
```bash
# 開発サーバーを再起動
npm run dev
```

**原因2**: Ghost APIの応答が遅い

**対処法**:
1. Ghost管理画面で保存後、少し待つ
2. ブラウザをリロード

### サムネイル画像が表示されない

**原因**: 対象サイトの画像URLが無効またはCORS制限

**対処法**:
- Ghostが取得した画像URLを確認
- 必要に応じて手動で編集（Ghost管理画面のHTMLモード）

### スタイルが崩れる

**原因**: カスタムCSSとの競合

**対処法**:
1. `src/styles/blog/link-card.css`のスタイルを確認
2. 必要に応じて`!important`を追加
3. ブラウザの開発者ツールでCSSを検証

## カスタマイズ

### カードサイズの変更

```css
/* src/styles/blog/link-card.css */

.kg-bookmark-container {
  /* 最大幅を設定 */
  max-width: 800px;
  margin: 0 auto;
}
```

### カラースキームの変更

```css
.kg-bookmark-container {
  background: #f8fafc; /* 背景色 */
  border-color: #cbd5e1; /* ボーダー色 */
}

.kg-bookmark-title {
  color: #1e293b; /* タイトル色 */
}
```

### サムネイル比率の変更

```css
.kg-bookmark-thumbnail {
  aspect-ratio: 16 / 9; /* アスペクト比 */
}
```

## 参考リンク

- [Ghost Bookmark Card Documentation](https://ghost.org/docs/content-api/)
- [Open Graph Protocol](https://ogp.me/)
- [Inkdrop](https://www.inkdrop.app/)

## 実装ファイル

- `src/styles/blog/link-card.css` - リンクカードのスタイル定義
- `src/styles/blog.css` - メインブログスタイル（link-card.cssをインポート）
- `src/pages/blog/detail.tsx` - 記事詳細ページ（カードを表示）

## 今後の拡張案

1. **カスタムショートコード**
   - Ghost HTML以外のフォーマットもサポート
   - 例: `[link-card]https://example.com[/link-card]`

2. **OGP取得のフォールバック**
   - Ghost APIが失敗した場合の独自OGP取得機能

3. **キャッシュ機能**
   - 取得したOGPデータをキャッシュして高速化

4. **アナリティクス**
   - リンククリック数の追跡
