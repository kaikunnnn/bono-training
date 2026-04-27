/**
 * UIUX転職アイキャッチ
 * - Figmaデザイン（node-id: 280-18090）に基づく実装
 * - 4枚の画像カードを重ねた3Dスタック
 */

export default function UIUXCareerEyecatch() {
  return (
    <div className="absolute inset-0 overflow-visible">
      {/* カードスタックコンテナ - Figmaデザインの正確な座標系 */}
      <div className="relative w-full h-full">
        {/* カード1 - 左奥（Figma座標: left:0 top:0） */}
        <div
          className="absolute left-0 top-0 w-[290.266px] h-[290.266px] flex items-center justify-center"
          style={{ zIndex: 1 }}
        >
          <div
            className="w-[257px] h-[257px] shadow-[0px_1px_32px_0px_rgba(0,0,0,0.2)] transition-transform duration-[800ms] ease-out rotate-[-8deg] group-hover:rotate-[-16deg] group-hover:scale-105"
          >
            <img
              src="/images/training-cards/uiux-career/card-125.png"
              alt="UIUX Career Card 1"
              className="w-full h-full object-cover rounded-[20px]"
            />
          </div>
        </div>

        {/* カード2（Figma座標: left:30px top:14px） */}
        <div
          className="absolute left-[30px] top-[14px] w-[265.813px] h-[265.813px] flex items-center justify-center"
          style={{ zIndex: 2 }}
        >
          <div
            className="w-[257px] h-[257px] shadow-[0px_1px_32px_0px_rgba(0,0,0,0.2)] transition-transform duration-[800ms] ease-out rotate-[-2deg] group-hover:rotate-[-6deg] group-hover:scale-105"
          >
            <img
              src="/images/training-cards/uiux-career/card-126.png"
              alt="UIUX Career Card 2"
              className="w-full h-full object-cover rounded-[20px]"
            />
          </div>
        </div>

        {/* カード3（Figma座標: left:39px top:5px） */}
        <div
          className="absolute left-[39px] top-[5px] w-[265.813px] h-[265.813px] flex items-center justify-center"
          style={{ zIndex: 3 }}
        >
          <div
            className="w-[257px] h-[257px] transition-transform duration-[800ms] ease-out rotate-[-2deg] group-hover:rotate-[4deg] group-hover:scale-105"
          >
            <img
              src="/images/training-cards/uiux-career/card-127.png"
              alt="UIUX Career Card 3"
              className="w-full h-full object-cover rounded-[20px]"
            />
          </div>
        </div>

        {/* カード4 - 右奥（Figma座標: left:53px top:3px） */}
        <div
          className="absolute left-[53px] top-[3px] w-[282.456px] h-[282.456px] flex items-center justify-center"
          style={{ zIndex: 4 }}
        >
          <div
            className="w-[257px] h-[257px] shadow-[0px_1px_32px_0px_rgba(0,0,0,0.2)] transition-transform duration-[800ms] ease-out rotate-[6deg] group-hover:rotate-[14deg] group-hover:scale-105"
          >
            <img
              src="/images/training-cards/uiux-career/card-124.png"
              alt="UIUX Career Card 4"
              className="w-full h-full object-cover rounded-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
