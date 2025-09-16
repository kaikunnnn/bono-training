// src/lib/ghost.ts
import GhostContentAPI from '@tryghost/content-api';

// Ghost APIが有効かどうかを確認する関数
export const isGhostEnabled = (): boolean => {
  return import.meta.env.VITE_BLOG_DATA_SOURCE === 'ghost' &&
         !!(import.meta.env.VITE_GHOST_URL && import.meta.env.VITE_GHOST_KEY) &&
         import.meta.env.VITE_GHOST_KEY !== 'YOUR_CONTENT_API_KEY_HERE';
};

// Ghost APIクライアントの初期化（条件付き）
let ghostApi: GhostContentAPI | null = null;

export const getGhostApi = (): GhostContentAPI | null => {
  if (!isGhostEnabled()) {
    return null;
  }

  if (!ghostApi) {
    ghostApi = new GhostContentAPI({
      url: import.meta.env.VITE_GHOST_URL!,
      key: import.meta.env.VITE_GHOST_KEY!,
      version: import.meta.env.VITE_GHOST_VERSION || 'v5.0'
    });
  }

  return ghostApi;
};

// Ghost APIの接続テスト
export const testGhostConnection = async (): Promise<boolean> => {
  const api = getGhostApi();
  if (!api) {
    return false;
  }

  try {
    await api.posts.browse({ limit: 1 });
    return true;
  } catch (error) {
    console.warn('Ghost API connection failed:', error);
    return false;
  }
};