// src/components/common/SEO.tsx
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterCreator?: string;
  twitterSite?: string;
  jsonLd?: object;
  children?: React.ReactNode;
}

const defaultMeta = {
  title: 'BONO Training',
  description: 'UIとUXのデザインスキルが身に付く動画コンテンツサービス「BONO」のトレーニングサイトです。',
  keywords: 'UI, UX, デザイン, トレーニング, BONO, ブログ, Ghost CMS',
  author: 'Takumi Kai',
  ogImage: '/og-default.svg',
  ogType: 'website',
  twitterCard: 'summary_large_image' as const,
  twitterSite: '@bono_training',
  twitterCreator: '@takumi_kai',
};

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  author,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType,
  twitterCard,
  twitterCreator,
  twitterSite,
  jsonLd,
  children
}) => {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:8080';

  // メタデータの準備
  const metaTitle = title ? `${title} | ${defaultMeta.title}` : defaultMeta.title;
  const metaDescription = description || defaultMeta.description;
  const metaKeywords = keywords || defaultMeta.keywords;
  const metaAuthor = author || defaultMeta.author;

  // OGPデータの準備
  const metaOgTitle = ogTitle || metaTitle;
  const metaOgDescription = ogDescription || metaDescription;
  const metaOgImage = ogImage?.startsWith('http')
    ? ogImage
    : `${siteUrl}${ogImage || defaultMeta.ogImage}`;
  const metaOgUrl = ogUrl ? `${siteUrl}${ogUrl}` : siteUrl;
  const metaOgType = ogType || defaultMeta.ogType;

  // Twitter Cardデータの準備
  const metaTwitterCard = twitterCard || defaultMeta.twitterCard;
  const metaTwitterSite = twitterSite || defaultMeta.twitterSite;
  const metaTwitterCreator = twitterCreator || defaultMeta.twitterCreator;

  return (
    <Helmet>
      {/* 基本的なメタタグ */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content={metaAuthor} />

      {/* Open Graph Protocol */}
      <meta property="og:title" content={metaOgTitle} />
      <meta property="og:description" content={metaOgDescription} />
      <meta property="og:image" content={metaOgImage} />
      <meta property="og:url" content={metaOgUrl} />
      <meta property="og:type" content={metaOgType} />
      <meta property="og:site_name" content={defaultMeta.title} />
      <meta property="og:locale" content="ja_JP" />

      {/* Twitter Card */}
      <meta name="twitter:card" content={metaTwitterCard} />
      <meta name="twitter:site" content={metaTwitterSite} />
      <meta name="twitter:creator" content={metaTwitterCreator} />
      <meta name="twitter:title" content={metaOgTitle} />
      <meta name="twitter:description" content={metaOgDescription} />
      <meta name="twitter:image" content={metaOgImage} />

      {/* 追加のメタタグ */}
      <link rel="canonical" href={metaOgUrl} />

      {/* 構造化データ（JSON-LD） */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}

      {/* カスタムメタタグ */}
      {children}
    </Helmet>
  );
};

export default SEO;