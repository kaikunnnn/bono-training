# BONO Blog - OGP（Open Graph Protocol）設定

## 概要

BONO BlogのOGP設定は、Ghost CMSのデータと完全に連携しています。ブログ記事をSNS（Twitter、Facebook、LINEなど）でシェアした際に、適切なタイトル、説明、画像が表示されるように設定されています。

## 実装状況

### ✅ 実装済み機能

1. **基本的なOGPタグ**
   - `og:title` - 記事タイトル
   - `og:description` - 記事の説明
   - `og:image` - サムネイル画像（Ghost CMSのfeature_image）
   - `og:url` - 記事の絶対URL
   - `og:type` - "article"（記事ページ）/ "website"（一覧ページ）
   - `og:site_name` - "BONO Training"
   - `og:locale` - "ja_JP"

2. **Twitter Card対応**
   - `twitter:card` - "summary_large_image"
   - `twitter:site` - "@bono_training"
   - `twitter:creator` - "@takumi_kai"
   - `twitter:title` - 記事タイトル
   - `twitter:description` - 記事の説明
   - `twitter:image` - サムネイル画像

3. **構造化データ（JSON-LD）**
   - Schema.org BlogPosting形式
   - 著者情報
   - 投稿日時
   - タグ（keywords）
   - 出版者情報

4. **Ghost CMSデータ連携**
   - タイトル: `ghostPost.title`
   - 説明: `ghostPost.excerpt` または `ghostPost.custom_excerpt`
   - 画像: `ghostPost.feature_image`（優先）→ フォールバック画像
   - 著者: `ghostPost.primary_author.name`
   - タグ: `ghostPost.tags[].name`

## ファイル構成

### 1. SEOコンポーネント
**ファイル**: `src/components/common/SEO.tsx`

OGPタグとTwitter Cardを生成するReactコンポーネント。
- react-helmet-asyncを使用
- 画像URLの自動補完（相対パス → 絶対URL）
- 構造化データ（JSON-LD）の埋め込み

### 2. ブログ詳細ページ
**ファイル**: `src/pages/blog/detail.tsx`

記事詳細ページでのOGP設定：
```typescript
// OGP用の画像URL取得（優先順位）
const getOgImage = () => {
  // 1. Ghost CMSのfeature_image
  if (post.thumbnail && post.thumbnail !== '/blog/images/default.jpg') {
    return post.thumbnail;
  }
  // 2. imageUrl（予備）
  if (post.imageUrl) {
    return post.imageUrl;
  }
  // 3. デフォルトOG画像
  return '/og-default.svg';
};

<SEO
  title={post.title}
  description={post.description || post.excerpt}
  keywords={post.tags?.join(', ')}
  author={post.author}
  ogTitle={post.title}
  ogDescription={post.description || post.excerpt}
  ogImage={getOgImage()}
  ogUrl={`/blog/${post.slug}`}
  ogType="article"
  twitterCard="summary_large_image"
  jsonLd={articleJsonLd}
/>
```

### 3. ブログ一覧ページ
**ファイル**: `src/pages/blog/index.tsx`

ブログトップページのOGP設定：
```typescript
<SEO
  title="BONO Blog - HOPE."
  description="BONOをつくる30代在宅独身男性のクラフト日誌。デザイン、開発、UI/UXに関する記事をお届けします。"
  keywords="BONO, ブログ, デザイン, UI/UX, Web開発, Ghost CMS"
  ogImage="/og-default.svg"
  ogUrl="/blog"
  ogType="website"
  twitterCard="summary_large_image"
/>
```

### 4. Ghost CMSサービス
**ファイル**: `src/services/ghostService.ts`

Ghost APIデータをBlogPost型に変換：
```typescript
export const convertGhostToBlogPost = (ghostPost: GhostPost): BlogPost => {
  return {
    // ...他のフィールド
    thumbnail: ghostPost.feature_image || '/blog/images/default.jpg',
    imageUrl: ghostPost.feature_image,
    description: ghostPost.excerpt || ghostPost.custom_excerpt || '',
    excerpt: ghostPost.excerpt || ghostPost.custom_excerpt || '',
    author: ghostPost.primary_author?.name || 'Unknown',
    tags: ghostPost.tags?.map(tag => tag.name) || [],
    // ...
  };
};
```

## 環境変数設定

**ファイル**: `.env`

```bash
# サイトURL（本番環境では実際のURLに変更してください）
VITE_SITE_URL=http://localhost:8080

# Blog / Ghost CMS設定
VITE_BLOG_DATA_SOURCE=ghost
VITE_GHOST_URL=http://localhost:2368
VITE_GHOST_KEY=your-ghost-content-api-key
```

**重要**: 本番環境では`VITE_SITE_URL`を実際のドメインに変更してください。
例: `VITE_SITE_URL=https://bono-training.com`

## OGP画像の優先順位

ブログ記事のOGP画像は以下の優先順位で選択されます：

1. **Ghost CMSのfeature_image**（最優先）
   - Ghost管理画面で設定した記事のアイキャッチ画像
   - 絶対URLで取得される

2. **imageUrl**（予備）
   - Ghost CMSから取得した画像URL

3. **デフォルトOG画像**（フォールバック）
   - `/og-default.svg`
   - サイト全体で使用するデフォルト画像

## OGPの確認方法

### 1. 開発環境での確認

**ブラウザの開発者ツール**:
1. ブログ記事ページを開く
2. 開発者ツール（F12）を開く
3. `<head>`セクション内のメタタグを確認

確認するタグ:
```html
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="..." />
<meta property="og:url" content="..." />
<meta property="og:type" content="article" />
<meta name="twitter:card" content="summary_large_image" />
```

### 2. SNSシェアテスト

**Facebook Sharing Debugger**:
- URL: https://developers.facebook.com/tools/debug/
- 記事URLを入力して「デバッグ」をクリック
- OGP情報が正しく表示されるか確認

**Twitter Card Validator**:
- URL: https://cards-dev.twitter.com/validator
- 記事URLを入力して「Preview card」をクリック
- Twitter Cardのプレビューを確認

**LINE OGP確認ツール**:
- ブラウザで `https://line.me` にアクセス
- LINEアプリで記事URLを送信してプレビュー確認

### 3. オンラインツール

**OGP画像シミュレーター**:
- [OGP.me](https://ogp.me/) - OGP仕様の確認
- [Metatags.io](https://metatags.io/) - OGPプレビュー
- [OpenGraph.xyz](https://www.opengraph.xyz/) - OGPチェッカー

## トラブルシューティング

### 問題: OGP画像が表示されない

**原因と対処法**:
1. **画像URLが相対パスになっている**
   → SEOコンポーネントが自動的に絶対URLに変換します
   → `VITE_SITE_URL`が正しく設定されているか確認

2. **Ghost CMSのfeature_imageが設定されていない**
   → Ghost管理画面で記事のアイキャッチ画像を設定
   → 設定されていない場合は`/og-default.svg`が使用される

3. **画像サイズが推奨サイズと異なる**
   → 推奨: 1200×630px（Facebook）、1200×600px（Twitter）
   → Ghost CMSで適切なサイズの画像をアップロード

### 問題: キャッシュされた古いOGP情報が表示される

**対処法**:
1. Facebook Sharing Debuggerで「もう一度スクレイピング」をクリック
2. Twitter Card Validatorで再検証
3. ブラウザのキャッシュをクリア

### 問題: 本番環境でlocalhost URLが表示される

**対処法**:
- `.env`の`VITE_SITE_URL`を本番環境のURLに変更
- 環境変数を再読み込み（ビルド・デプロイ）

## Ghost CMS側の設定

### 記事ごとの設定

1. **アイキャッチ画像の設定**:
   - Ghost管理画面 → 記事編集
   - 右サイドバー → "Feature image"
   - 推奨サイズ: 1200×630px

2. **記事の説明（excerpt）**:
   - 記事編集 → "Excerpt"フィールド
   - OGP descriptionとして使用される
   - 文字数: 150-160文字推奨

3. **タグの設定**:
   - 記事編集 → "Tags"
   - OGP keywordsとして使用される

### サイト全体の設定

Ghost管理画面 → Settings → General:
- **Site title**: サイト名
- **Site description**: サイトの説明
- **Publication icon**: サイトアイコン

## 今後の改善案

1. **動的OGP画像生成**:
   - 記事タイトルと絵文字を含むOGP画像を自動生成
   - Vercel OGや@vercel/ogを使用

2. **Twitter Card種類の動的切り替え**:
   - 画像あり: `summary_large_image`
   - 画像なし: `summary`

3. **OGP画像のフォールバック改善**:
   - カテゴリ別のデフォルト画像
   - 絵文字ベースの動的画像生成

## 参考リンク

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/best-practices)
- [Ghost Content API](https://ghost.org/docs/content-api/)
- [Schema.org BlogPosting](https://schema.org/BlogPosting)
