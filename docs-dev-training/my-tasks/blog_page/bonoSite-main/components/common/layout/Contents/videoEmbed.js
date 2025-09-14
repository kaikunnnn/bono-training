import React from 'react';

const VideoEmbed = ({ videoUrl }) => {
  // YouTubeのURLからビデオIDを取得する正規表現
  const getYoutubeId = url => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // VimeoのURLからビデオIDを取得する正規表現
  const getVimeoId = url => {
    const regex = /(?:vimeo\.com\/(.*\/)?)([0-9]+)/i;
    const match = url.match(regex);
    return match ? match[2] : null;
  };

  // URLからプラットフォームを識別し、対応する埋め込みURLを生成する
  const getEmbedUrl = () => {
    const youtubeId = getYoutubeId(videoUrl);
    const vimeoId = getVimeoId(videoUrl);

    if (youtubeId) {
      return `https://www.youtube.com/embed/${youtubeId}`;
    } else if (vimeoId) {
      return `https://player.vimeo.com/video/${vimeoId}`;
    } else {
      return null;
    }
  };

  const embedUrl = getEmbedUrl();

  // 対応する埋め込みURLがない場合は何も表示しない
  if (!embedUrl) {
    return <div>Invalid video URL</div>;
  }

  return (
    <iframe
      width="560"
      height="315"
      src={embedUrl}
      frameBorder="0"
      allowFullScreen
      allow="autoplay; encrypted-media; picture-in-picture"
      title="Embedded video"
    />
  );
};

export default VideoEmbed;