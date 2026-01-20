/**
 * OGP Meta Tags Edge Function
 *
 * SNSクローラー用にブログ記事のOGPタグを返すEdge Function
 * - クローラーの場合: OGPタグ入りHTMLを返す
 * - 通常ユーザーの場合: SPAにリダイレクト
 */

import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const config = {
  runtime: 'edge',
};

// Sanity Client (Edge Function用)
const sanityClient = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID,
  dataset: process.env.VITE_SANITY_DATASET || process.env.SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

const imageBuilder = imageUrlBuilder(sanityClient);

function urlFor(source: any) {
  return imageBuilder.image(source);
}

// SNSクローラーのUser-Agent判定
const CRAWLER_USER_AGENTS = [
  'Twitterbot',
  'facebookexternalhit',
  'LinkedInBot',
  'Slackbot',
  'Discordbot',
  'TelegramBot',
  'WhatsApp',
  'Line',
  'Googlebot',
  'bingbot',
  'Applebot',
];

function isCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return CRAWLER_USER_AGENTS.some(crawler =>
    userAgent.toLowerCase().includes(crawler.toLowerCase())
  );
}

// 絵文字を除去
function removeEmoji(text: string): string {
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '').trim();
}

// Sanityからブログ記事を取得
async function getBlogPost(slug: string) {
  const query = `*[_type == "blogPost" && slug.current == $slug][0]{
    _id,
    title,
    description,
    slug,
    thumbnail,
    thumbnailUrl,
    author,
    publishedAt
  }`;

  return sanityClient.fetch(query, { slug });
}

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const slug = url.pathname.replace('/api/og/', '').replace('/blog/', '');
  const userAgent = request.headers.get('user-agent');
  const siteUrl = process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://app.bo-no.design';

  // クローラーでない場合はSPAにリダイレクト
  if (!isCrawler(userAgent)) {
    return Response.redirect(`${siteUrl}/blog/${slug}`, 302);
  }

  try {
    const post = await getBlogPost(slug);

    if (!post) {
      // 記事が見つからない場合はデフォルトOGPを返す
      return new Response(generateDefaultHtml(siteUrl), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // サムネイル画像URL
    let thumbnailUrl = '/og-default.svg';
    if (post.thumbnailUrl) {
      thumbnailUrl = post.thumbnailUrl;
    } else if (post.thumbnail) {
      thumbnailUrl = urlFor(post.thumbnail).width(1200).height(630).fit('crop').url();
    }

    // 絶対URLに変換
    if (!thumbnailUrl.startsWith('http')) {
      thumbnailUrl = `${siteUrl}${thumbnailUrl}`;
    }

    const title = removeEmoji(post.title || 'BONO Blog');
    const description = post.description || 'BONOのブログ記事';
    const pageUrl = `${siteUrl}/blog/${slug}`;

    const html = generateOgHtml({
      title,
      description,
      imageUrl: thumbnailUrl,
      pageUrl,
      siteUrl,
      author: post.author || 'BONO',
    });

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('OGP Edge Function Error:', error);
    return new Response(generateDefaultHtml(siteUrl), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}

function generateOgHtml(params: {
  title: string;
  description: string;
  imageUrl: string;
  pageUrl: string;
  siteUrl: string;
  author: string;
}) {
  const { title, description, imageUrl, pageUrl, siteUrl, author } = params;

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

  <!-- Redirect for JavaScript-enabled browsers -->
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

function generateDefaultHtml(siteUrl: string) {
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
