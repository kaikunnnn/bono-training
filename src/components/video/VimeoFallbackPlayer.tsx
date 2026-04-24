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

  return (
    <div
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
    >
      <div className="w-full aspect-video">
        <iframe
          src={`https://player.vimeo.com/video/${extractedId}?title=0&byline=0&portrait=0`}
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
