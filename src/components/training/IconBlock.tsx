import React from 'react';

interface IconBlockProps {
  iconSrc?: string;
  iconAlt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

interface IconBlockSizes {
  sm: string;
  md: string;
  lg: string;
}

export default function IconBlock({
  iconSrc,
  iconAlt = "アイコン",
  size = "md",
  className = "",
}: IconBlockProps) {
  // レスポンシブサイズ設定
  const containerSizes: IconBlockSizes = {
    sm: "size-[80px]",   // スマホ
    md: "size-[100px]",  // タブレット
    lg: "size-[120px]",  // デスクトップ
  };

  const innerSizes: IconBlockSizes = {
    sm: "size-[44px]",   // スマホ内側
    md: "size-[56px]",   // タブレット内側
    lg: "size-[68px]",   // デスクトップ内側
  };

  // 絵文字判定（簡易版）
  const isEmoji = iconSrc && /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(iconSrc);

  return (
    <div
      className={`bg-white box-border content-stretch flex flex-row gap-[15px] items-center justify-center pt-6 pb-6 px-0 relative rounded-bl-[16px] rounded-br-[16px] rounded-tl-[120px] rounded-tr-[120px] shrink-0 md:pt-8 md:pb-8 lg:pt-10 lg:pb-10 ${containerSizes[size]} ${className}`}
      data-name="icon_block"
      role="img"
      aria-label={iconAlt}
    >
      {/* ボーダー */}
      <div className="absolute border-[1.5px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-bl-[32px] rounded-br-[32px] rounded-tl-[120px] rounded-tr-[120px]" />
      
      {/* アイコン内容 */}
      <div
        className={`relative shrink-0 ${innerSizes[size]} flex items-center justify-center`}
        data-name="icon_content"
      >
        {iconSrc ? (
          isEmoji ? (
            // 絵文字の場合
            <span 
              className={`${size === 'sm' ? 'text-2xl' : size === 'md' ? 'text-3xl' : 'text-4xl'} leading-none`}
              role="img"
              aria-label={iconAlt}
            >
              {iconSrc}
            </span>
          ) : (
            // 画像URLの場合
            <div
              className="absolute bg-center bg-cover bg-no-repeat inset-0"
              style={{ backgroundImage: `url('${iconSrc}')` }}
              role="img"
              aria-label={iconAlt}
            />
          )
        ) : (
          // プレースホルダー
          <div className="absolute bg-gray-200 inset-0 rounded-full flex items-center justify-center">
            <span className="text-gray-500 text-xs leading-none">アイコン</span>
          </div>
        )}
      </div>
    </div>
  );
}