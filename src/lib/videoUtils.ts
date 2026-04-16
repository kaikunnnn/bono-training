/**
 * 動画URLのユーティリティ
 */

export type VideoInfo = {
  platform: 'youtube' | 'vimeo';
  id: string;
  embedUrl: string;
};

/**
 * YouTube/VimeoのURLからプラットフォームとIDを抽出する
 * Sanity の { url?: string } オブジェクト形式にも対応
 */
export function getVideoInfo(
  url: string | null | undefined | { url?: string; metadata?: any }
): VideoInfo | null {
  if (!url) return null;

  const urlString = typeof url === 'string' ? url : url?.url;
  if (!urlString || typeof urlString !== 'string') return null;

  const youtube = urlString.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/);
  if (youtube) {
    return {
      platform: 'youtube',
      id: youtube[1],
      embedUrl: `https://www.youtube.com/embed/${youtube[1]}`,
    };
  }

  const vimeo = urlString.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeo) {
    return {
      platform: 'vimeo',
      id: vimeo[1],
      embedUrl: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=0&muted=0`,
    };
  }

  return null;
}
