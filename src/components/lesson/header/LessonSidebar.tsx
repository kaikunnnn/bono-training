import { useState, useRef, useEffect } from "react";
import { urlFor } from "@/lib/sanity";

interface LessonSidebarProps {
  lesson: {
    title: string;
    iconImage?: any;
    iconImageUrl?: string;
  };
}

/**
 * レッスンサイドバー（アイコン画像）- 3Dホバーエフェクト付き
 *
 * Figma仕様:
 * - デスクトップ: 幅278.25px、高さ420.41px、左配置
 * - モバイル: 幅200px、高さ302px、中央配置
 * - 角丸: 右上・右下のみ 16px（左側は画面端に接するため角丸なし）
 * - シャドウ: 0px 2px 40px rgba(0,0,0,0.24)
 *
 * インタラクション:
 * - マウスオーバーで3D風に傾くエフェクト
 * - マウス位置に応じて動的に回転
 * - 登場アニメーション: 左からスライド + 軽い回転（パターンC）
 *
 * @example
 * <LessonSidebar lesson={{ title: "UIデザイン", iconImageUrl: "..." }} />
 */
export function LessonSidebar({ lesson }: LessonSidebarProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 登場アニメーション: ページロード時にすぐ表示
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

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

  // マウス移動時の回転計算
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // マウス位置から中心までの距離を-1〜1に正規化
    const normalizedX = (e.clientX - centerX) / (rect.width / 2);
    const normalizedY = (e.clientY - centerY) / (rect.height / 2);

    // 最大回転角度（度）
    const maxRotation = 15;

    // X軸回転（上下の傾き）はY方向の移動に対応（反転）
    // Y軸回転（左右の傾き）はX方向の移動に対応
    setRotateX(-normalizedY * maxRotation);
    setRotateY(normalizedX * maxRotation);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotateX(0);
    setRotateY(0);
  };

  // クリックで横に1回転（Y軸）
  const handleClick = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 600);
  };

  if (!imageUrl) {
    return null;
  }

  // 登場アニメーションとホバーの transform を組み合わせる
  const getTransform = () => {
    if (!isVisible) {
      // 登場前: 下からフェードイン
      return "translateY(20px)";
    }
    if (isSpinning) {
      // クリック時: 横に1回転（Y軸360度）
      return "rotateY(360deg)";
    }
    // 登場後: ホバーの3D回転を適用
    return `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  // transition の制御
  const getTransition = () => {
    if (!isVisible) {
      return "none";
    }
    if (isSpinning) {
      return "transform 0.6s ease-out";
    }
    if (isHovering) {
      return "transform 0.1s ease-out";
    }
    // 登場アニメーション: 下からふわっと
    return "opacity 0.4s ease-out, transform 0.5s ease-out";
  };

  return (
    <div className="flex flex-col items-start" style={{ perspective: "1000px" }}>
      <div className="flex items-center">
        {/* モバイル: 200x302px、デスクトップ: 278x420px */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          className="relative w-[200px] h-[302px] md:w-[278.255px] md:h-[420.407px] rounded-tr-[16px] rounded-br-[16px] overflow-hidden cursor-pointer"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: getTransform(),
            transition: getTransition(),
            transformStyle: "preserve-3d",
            boxShadow: isHovering
              ? "0px 4px 45px rgba(0,0,0,0.28)"
              : "0px 2px 40px rgba(0,0,0,0.24)",
          }}
        >
          <img
            src={imageUrl}
            alt={lesson.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: "translateZ(0)",
            }}
          />

          {/* 光沢エフェクト（ホバー時） */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isHovering
                ? `linear-gradient(
                    ${105 + rotateY * 2}deg,
                    rgba(255,255,255,0) 0%,
                    rgba(255,255,255,0.1) 45%,
                    rgba(255,255,255,0.3) 50%,
                    rgba(255,255,255,0.1) 55%,
                    rgba(255,255,255,0) 100%
                  )`
                : "none",
              opacity: isHovering ? 1 : 0,
              transition: "opacity 0.3s ease-out",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default LessonSidebar;
