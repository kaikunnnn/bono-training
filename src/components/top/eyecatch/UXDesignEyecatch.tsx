/**
 * UXデザインアイキャッチ
 * - Figmaデザイン（node-id: 280-21225）に基づく実装
 * - 1枚の画像カード（回転あり）
 */

export default function UXDesignEyecatch() {
  return (
    <div className="absolute inset-0 overflow-visible">
      {/* 画像カード - Figmaデザインの正確な座標系 */}
      <div className="relative w-full h-full">
        {/* 1枚のカード */}
        <div
          className="absolute left-0 top-0 w-[274.301px] h-[274.301px] flex items-center justify-center"
          style={{ zIndex: 1 }}
        >
          <div
            className="w-[257px] h-[257px] rounded-[32px] shadow-[0px_1px_32px_0px_rgba(0,0,0,0.32)] transition-transform duration-[800ms] ease-out rotate-[-4deg] group-hover:rotate-0 group-hover:scale-105"
          >
            <img
              src="/images/training-cards/ux-design/card.png"
              alt="UXデザイン"
              className="w-full h-full object-cover rounded-[32px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
