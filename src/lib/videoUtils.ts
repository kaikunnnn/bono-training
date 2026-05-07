/**
 * 動画URLのユーティリティ
 * feature/bon-116-guide からコピー
 */

export type VideoInfo = {
  platform: "youtube" | "vimeo";
  id: string;
  embedUrl: string;
  thumbnailUrl: string;
};

/**
 * YouTube/VimeoのURLからプラットフォーム・ID・埋め込みURL・サムネイルURLを抽出
 */
export function getVideoInfo(url: string | null | undefined): VideoInfo | null {
  if (!url || typeof url !== "string") return null;

  const youtube = url.match(
    /(?:youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/
  );
  if (youtube) {
    return {
      platform: "youtube",
      id: youtube[1],
      embedUrl: `https://www.youtube.com/embed/${youtube[1]}`,
      thumbnailUrl: `https://img.youtube.com/vi/${youtube[1]}/maxresdefault.jpg`,
    };
  }

  const vimeo = url.match(
    /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/
  );
  if (vimeo) {
    return {
      platform: "vimeo",
      id: vimeo[1],
      embedUrl: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=0&muted=0`,
      thumbnailUrl: `https://vumbnail.com/${vimeo[1]}.jpg`,
    };
  }

  return null;
}
