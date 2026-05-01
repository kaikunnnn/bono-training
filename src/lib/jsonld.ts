// src/lib/jsonld.ts — JSON-LD 構造化データ生成ユーティリティ
// schema.org 準拠の構造化データを各ページに提供

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://app.bo-no.design";
const SITE_NAME = "BONO";
const ORGANIZATION_LOGO = `${SITE_URL}/logo.png`;

/**
 * WebSite + Organization schema（トップページ用）
 */
export function generateWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description:
          "UIUXデザインを体系的に学べるオンライン学習プラットフォーム",
        inLanguage: "ja",
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: ORGANIZATION_LOGO,
        },
      },
    ],
  };
}

/**
 * Article schema（ブログ・記事ページ用）
 */
export function generateArticleJsonLd(params: {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  modifiedAt?: string;
  author?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.title,
    description: params.description,
    url: `${SITE_URL}${params.url}`,
    datePublished: params.publishedAt,
    dateModified: params.modifiedAt || params.publishedAt,
    author: {
      "@type": "Person",
      name: params.author || "BONO",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: ORGANIZATION_LOGO,
      },
    },
    ...(params.image && {
      image: {
        "@type": "ImageObject",
        url: params.image,
      },
    }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}${params.url}`,
    },
  };
}

/**
 * Course schema（レッスンページ用）
 */
export function generateCourseJsonLd(params: {
  title: string;
  description: string;
  url: string;
  image?: string;
  provider?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: params.title,
    description: params.description,
    url: `${SITE_URL}${params.url}`,
    provider: {
      "@type": "Organization",
      name: params.provider || SITE_NAME,
      url: SITE_URL,
    },
    ...(params.image && {
      image: params.image,
    }),
  };
}

/**
 * BreadcrumbList schema（パンくずリスト用）
 */
export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * JSON-LDをscriptタグとして埋め込むためのコンポーネント用ヘルパー
 */
export function jsonLdScriptProps(data: Record<string, unknown>) {
  return {
    type: "application/ld+json" as const,
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data),
    },
  };
}
