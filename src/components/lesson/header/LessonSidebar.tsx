import { urlFor } from "@/lib/sanity";

interface LessonSidebarProps {
  lesson: {
    title: string;
    iconImage?: any;
    iconImageUrl?: string;
  };
}

/**
 * レッスンサイドバー（アイコン画像）
 *
 * Figma仕様:
 * - デスクトップ: 幅278.25px、高さ420.41px、左配置
 * - モバイル: 幅200px、高さ302px、中央配置
 * - 角丸: 右上・右下のみ 16px（左側は画面端に接するため角丸なし）
 * - シャドウ: 0px 2px 40px rgba(0,0,0,0.24)
 *
 * レスポンシブ:
 * - モバイル: 上部に中央配置
 * - デスクトップ: 左側に配置
 *
 * @example
 * <LessonSidebar lesson={{ title: "UIデザイン", iconImageUrl: "..." }} />
 */
export function LessonSidebar({ lesson }: LessonSidebarProps) {
  // 画像URL取得
  const getImageUrl = () => {
    if (lesson.iconImageUrl) {
      return lesson.iconImageUrl;
    }
    if (lesson.iconImage?.asset?._ref) {
      return urlFor(lesson.iconImage).width(556).height(841).url();
    }
    return null;
  };

  const imageUrl = getImageUrl();

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center">
        {/* モバイル: 200x302px、デスクトップ: 278x420px */}
        <div className="relative w-[200px] h-[302px] md:w-[278.255px] md:h-[420.407px] rounded-tr-[16px] rounded-br-[16px] shadow-[0px_2px_40px_0px_rgba(0,0,0,0.24)] overflow-hidden">
          <img
            src={imageUrl}
            alt={lesson.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default LessonSidebar;
