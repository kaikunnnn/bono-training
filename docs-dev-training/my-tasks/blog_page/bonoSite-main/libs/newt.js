import { createClient } from 'newt-client-js'

const client = createClient({
  spaceUid: process.env.NEWT_SPACE_UID + '',
  token: process.env.NEWT_CDN_API_TOKEN + '',
  apiType: 'cdn',
})

// 記事・動画コンテンツ
export const getArticles = async () => {
  try {
    const { items } = await client.getContents({
      appUid: 'blog',
      modelUid: 'article',
      query: {
        select: [],
      },
    })
    return items
  } catch (err) {
    console.error("Error fetching articles:", err);
    return [];
  }
}

export const getArticleBySlug = async (slug) => {
    try {
      const article = await client.getFirstContent({
        appUid: 'blog',
        modelUid: 'article',
        query: {
          slug,
          select: [],
        },
      });
      return article;
    } catch (err) {
      console.error('Error fetching article by slug:', err);
      return null;
    }
};

// 『シリーズコンテンツ』 from NEWT "contnet"
export const getSeries = async () => {
  try {
    const { items } = await client.getContents({
      appUid: 'contentArticle',
      modelUid: 'series',
      query: {
        select: [],
      },
    })
    return items
  } catch (err) {
    console.error("Error fetching articles:", err);
    return [];
  }
}

export const getSeriesBySlug = async (slug) => {
    try {
      const article = await client.getFirstContent({
        appUid: 'contentArticle',
        modelUid: 'series',
        query: {
          slug,
          select: [],
        },
      });
      return article;
    } catch (err) {
      console.error('Error fetching article by slug:', err);
      return null;
    }
};

// 『コンテンツ』 from NEWT "contnet"
export const getContents = async () => {
  try {
    const { items } = await client.getContents({
      appUid: 'contentArticle',
      modelUid: 'article',
      query: {
        select: [],
      },
    })
    return items
  } catch (err) {
    console.error("Error fetching articles:", err);
    return [];
  }
}

export const getContentsBySlug = async (slug) => {
    try {
      const article = await client.getFirstContent({
        appUid: 'contentArticle',
        modelUid: 'article',
        query: {
          slug,
          select: [],
        },
      });
      return article;
    } catch (err) {
      console.error('Error fetching article by slug:', err);
      return null;
    }
};