/**
 * VimeoFallbackPlayer
 *
 * Vimeo動画の埋め込みプレイヤー。
 * 標準のiframe埋め込みを使用し、アドブロッカー環境でも再生可能。
 */

interface VimeoFallbackPlayerProps {
  vimeoId: string;
  className?: string;
}

export function VimeoFallbackPlayer({
  vimeoId,
  className = "",
}: VimeoFallbackPlayerProps) {
  const extractedId = extractVimeoId(vimeoId);
  const extractedHash = extractVimeoHash(vimeoId);
  const hashQuery = extractedHash ? `&h=${extractedHash}` : "";

  return (
    <div
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
    >
      <div className="w-full aspect-video">
        <iframe
          src={`https://player.vimeo.com/video/${extractedId}?title=0&byline=0&portrait=0${hashQuery}`}
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Vimeo video player"
        />
      </div>
    </div>
  );
}

function extractVimeoId(url: string): string {
  if (/^\d+$/.test(url)) {
    return url;
  }
  const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  return match ? match[1] : url;
}

function extractVimeoHash(url: string): string | null {
  if (/^\d+$/.test(url)) return null;
  const pathMatch = url.match(/vimeo\.com\/\d+\/([a-f0-9]+)/);
  if (pathMatch) return pathMatch[1];
  const queryMatch = url.match(/[?&]h=([a-f0-9]+)/);
  if (queryMatch) return queryMatch[1];
  return null;
}
