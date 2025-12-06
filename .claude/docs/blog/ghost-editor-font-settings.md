# Ghost エディタ - フォント設定ガイド

## 概要

Ghost管理画面のエディタで日本語を入力する際、デフォルトでは明朝体が使用されます。
ゴシック体に変更するためのカスタマイズ方法を説明します。

## 設定方法

### 基本設定（推奨）

**Ghost管理画面 → Settings → Code Injection → Site Header**

```html
<style>
/* ========================================
   Ghost エディタ - 日本語ゴシック体設定
   ======================================== */

/* エディタ全体のフォント設定 */
.gh-editor,
.gh-editor-title,
.gh-editor-title-container textarea,
.gh-editor-title-container input,
.koenig-editor,
.koenig-editor__editor,
.koenig-editor__editor-wrapper,
.kg-prose,
article[contenteditable="true"] {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN W3', Meiryo, メイリオ, sans-serif !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* タイトル入力欄 */
.gh-editor-title,
.gh-editor-title-container textarea {
  font-weight: 700 !important;
  letter-spacing: -0.01em !important;
}

/* 本文エディタ */
.koenig-editor__editor {
  line-height: 1.8 !important;
}

/* Bookmark カード */
.kg-bookmark-card,
.kg-bookmark-title,
.kg-bookmark-description {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN W3', Meiryo, メイリオ, sans-serif !important;
}

/* コードブロックは等幅フォント */
pre,
code,
.kg-code-card,
.kg-code-card-caption {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace !important;
}

/* 見出し */
.kg-prose h1,
.kg-prose h2,
.kg-prose h3,
.kg-prose h4,
.kg-prose h5,
.kg-prose h6 {
  font-weight: 700 !important;
  letter-spacing: -0.02em !important;
}
</style>
```

### カスタマイズオプション

#### オプション1: Noto Sans JPを優先

Google Fontsの「Noto Sans JP」を使いたい場合：

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">

<style>
.gh-editor,
.koenig-editor {
  font-family: 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
}
</style>
```

#### オプション2: 源ノ角ゴシックを使用

Adobe製の「源ノ角ゴシック」を使いたい場合：

```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Source+Han+Sans+JP:wght@400;700&display=swap" rel="stylesheet">

<style>
.gh-editor,
.koenig-editor {
  font-family: 'Source Han Sans JP', 'Noto Sans JP', sans-serif !important;
}
</style>
```

#### オプション3: メイリオを優先（Windows向け）

Windows環境で最適化したい場合：

```html
<style>
.gh-editor,
.koenig-editor {
  font-family: Meiryo, メイリオ, 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif !important;
}
</style>
```

## フォントスタック説明

### 推奨フォントスタック

```css
font-family:
  -apple-system,              /* macOS/iOS システムフォント */
  BlinkMacSystemFont,         /* macOS Chrome/Safari */
  'Segoe UI',                 /* Windows 10/11 */
  'Noto Sans JP',             /* Google Web Font（日本語） */
  'Hiragino Kaku Gothic ProN', /* macOS 標準日本語ゴシック */
  'ヒラギノ角ゴ ProN W3',      /* macOS 標準（日本語表記） */
  Meiryo,                     /* Windows 標準日本語ゴシック */
  メイリオ,                    /* Windows（日本語表記） */
  sans-serif;                 /* フォールバック */
```

### 各フォントの特徴

| フォント | OS | 特徴 |
|---------|-----|------|
| -apple-system | macOS/iOS | システムフォント（San Francisco） |
| Segoe UI | Windows | Windows 10/11 標準 |
| Noto Sans JP | Web | Google製、多言語対応 |
| ヒラギノ角ゴ | macOS | 日本語ゴシック、視認性高い |
| メイリオ | Windows | 日本語ゴシック、滑らか |

## トラブルシューティング

### Q1: フォントが変わらない

**原因**: キャッシュが残っている

**対処法**:
1. ブラウザのキャッシュをクリア（Cmd/Ctrl + Shift + R）
2. Ghost管理画面を再読み込み
3. 別のブラウザで確認

### Q2: 一部のテキストだけ明朝体のまま

**原因**: CSSの詳細度が不足

**対処法**:
- `!important` を追加
- より具体的なセレクタを使用

```css
.gh-editor article[contenteditable="true"] * {
  font-family: 'Noto Sans JP', sans-serif !important;
}
```

### Q3: コードブロックもゴシック体になってしまう

**原因**: コードブロックのスタイルが上書きされている

**対処法**:
```css
pre, code, .kg-code-card {
  font-family: 'SF Mono', Monaco, Consolas, monospace !important;
}
```

### Q4: Google Fontsが読み込まれない

**原因**: ネットワーク制限またはCSP設定

**対処法**:
1. Ghost設定でCSPを確認
2. システムフォントのみを使用（Google Fontsなし）

## 確認方法

### 1. ブラウザの開発者ツールで確認

1. Ghost管理画面の記事エディタを開く
2. F12キーで開発者ツールを開く
3. エディタ部分を選択（右クリック → 検証）
4. Stylesタブで `font-family` を確認

### 2. スクリーンショットで比較

**変更前**:
- 明朝体（細い線、セリフあり）
- 読みづらい

**変更後**:
- ゴシック体（太い線、セリフなし）
- 読みやすい

## 参考情報

### Ghost公式ドキュメント

- [Ghost Code Injection](https://ghost.org/docs/themes/tools-integrations/code-injection/)
- [Ghost Admin Customization](https://ghost.org/docs/admin/)

### Web フォント

- [Google Fonts - Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP)
- [Adobe Fonts - 源ノ角ゴシック](https://fonts.adobe.com/fonts/source-han-sans-japanese)

### CSS フォント指定

- [MDN - font-family](https://developer.mozilla.org/ja/docs/Web/CSS/font-family)
- [Web フォントのベストプラクティス](https://web.dev/i18n/ja/font-best-practices/)

## まとめ

Ghost管理画面のエディタフォントをゴシック体に変更することで：

✅ **視認性向上** - 日本語が読みやすくなる
✅ **執筆効率UP** - 文字がはっきり見える
✅ **統一感** - フロントエンドと同じフォント

設定は5分で完了します。ぜひお試しください！
