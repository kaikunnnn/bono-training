/**
 * OGP静的HTML生成スクリプト
 *
 * ビルド時にSanityから全ブログ記事を取得し、
 * 各記事のOGP用静的HTMLファイルを生成します。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// 環境変数読み込み
const projectId = process.env.VITE_SANITY_PROJECT_ID;
const dataset = process.env.VITE_SANITY_DATASET || 'production';
const siteUrl = process.env.VITE_SITE_URL || 'https://bono-training.vercel.app';

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function removeEmoji(text) {
  if (!text) return '';
  return text
    .replace(
      /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu,
      ''
    )
    .trim();
}

function generateOgpHtml({ title, description, imageUrl, pageUrl, author }) {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | BONO Blog</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="author" content="${escapeHtml(author)}">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:url" content="${escapeHtml(pageUrl)}">
  <meta property="og:site_name" content="BONO Blog">
  <meta property="og:locale" content="ja_JP">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">

  <script>window.location.href = "${escapeHtml(pageUrl)}";</script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=${escapeHtml(pageUrl)}">
  </noscript>
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(pageUrl)}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;
}

function generateDefaultOgpHtml() {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BONO Blog</title>
  <meta name="description" content="UIとUXのデザインスキルが身に付く動画コンテンツサービス「BONO」のブログです。">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="BONO Blog">
  <meta property="og:description" content="UIとUXのデザインスキルが身に付く動画コンテンツサービス「BONO」のブログです。">
  <meta property="og:image" content="${siteUrl}/og-default.svg">
  <meta property="og:url" content="${siteUrl}/blog">
  <meta property="og:site_name" content="BONO Blog">
  <meta property="og:locale" content="ja_JP">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="BONO Blog">
  <meta name="twitter:description" content="UIとUXのデザインスキルが身に付く動画コンテンツサービス「BONO」のブログです。">
  <meta name="twitter:image" content="${siteUrl}/og-default.svg">

  <script>window.location.href = "${siteUrl}/blog";</script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=${siteUrl}/blog">
  </noscript>
</head>
<body>
  <p>Redirecting to <a href="${siteUrl}/blog">BONO Blog</a>...</p>
</body>
</html>`;
}

async function fetchAllBlogPosts() {
  if (!projectId) {
    console.error('Error: VITE_SANITY_PROJECT_ID is not set');
    return [];
  }

  const query = `*[_type == "blogPost"]{
    _id,
    title,
    description,
    "slug": slug.current,
    "thumbnailUrl": thumbnail.asset->url,
    author,
    publishedAt
  }`;

  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Sanity API error:', response.status);
      return [];
    }
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return [];
  }
}

async function main() {
  console.log('🚀 Generating OGP HTML files...');

  // 出力ディレクトリ作成
  const ogpDir = path.join(rootDir, 'dist', 'ogp');
  fs.mkdirSync(ogpDir, { recursive: true });

  // ブログ一覧用のデフォルトOGP
  const defaultHtml = generateDefaultOgpHtml();
  fs.writeFileSync(path.join(ogpDir, 'index.html'), defaultHtml);
  console.log('✅ Generated: /ogp/index.html (default)');

  // 全ブログ記事を取得
  const posts = await fetchAllBlogPosts();
  console.log(`📝 Found ${posts.length} blog posts`);

  // 各記事のOGP HTMLを生成
  for (const post of posts) {
    if (!post.slug) continue;

    const title = removeEmoji(post.title || 'BONO Blog');
    const description = post.description || 'BONOのブログ記事';
    const pageUrl = `${siteUrl}/blog/${post.slug}`;

    let imageUrl = `${siteUrl}/og-default.svg`;
    if (post.thumbnailUrl) {
      imageUrl = post.thumbnailUrl;
    }

    const html = generateOgpHtml({
      title,
      description,
      imageUrl,
      pageUrl,
      author: post.author || 'BONO',
    });

    const filePath = path.join(ogpDir, `${post.slug}.html`);
    fs.writeFileSync(filePath, html);
    console.log(`✅ Generated: /ogp/${post.slug}.html`);
  }

  console.log(`\n🎉 Done! Generated ${posts.length + 1} OGP files.`);
}

main().catch(console.error);
