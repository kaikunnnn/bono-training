/**
 * BONO Blog - Background Gradation Component
 *
 * 99frontend 仕様に基づく背景グラデーションコンポーネント
 * 参照: .claude/docs/blog/99frontend/background-gradation-implementation.md
 *
 * @component BackgroundGradation
 * @description ブログページ全体の背景グラデーションを表示する装飾的なコンポーネント
 *              3つのSVGレイヤーで構成された微妙で洗練されたグラデーション
 */

import React from 'react';

// SVGレイヤーのパス
const imgVector = '/assets/blog/433ed0613bf25feb7bf8d3b6a7a1c4eba0d625a7.svg'; // Layer 1: ホワイトベース
const imgVector1 = '/assets/blog/3a6ecfd12b4419c7d8128d289ef5b66946b76dbd.svg'; // Layer 2: オレンジ/ピーチ
const imgVector2 = '/assets/blog/ee31314e116b707652dae3d9cd4c46fb7b9e0f26.svg'; // Layer 3: ブルー/パープル

interface BackgroundGradationProps {
  /** 追加のカスタムクラス名 */
  className?: string;
}

/**
 * BackgroundGradation Component
 *
 * 3つのSVGレイヤーで構成された背景グラデーション。
 * - Layer 1: ホワイトベース（#FFFFFF）
 * - Layer 2: オレンジ/ピーチ（#FFF2E3）
 * - Layer 3: ブルー/パープル
 *
 * @example
 * ```tsx
 * <div className="fixed inset-0 -z-10">
 *   <BackgroundGradation />
 * </div>
 * ```
 */
export const BackgroundGradation: React.FC<BackgroundGradationProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`relative w-full h-full opacity-100 ${className}`}
      data-name="background_gradation_color"
      data-node-id="19:113"
      aria-hidden="true"
      role="presentation"
    >
      {/* Layer 1: ホワイトベース */}
      <div
        className="absolute inset-0 opacity-100"
        data-name="Vector"
        data-node-id="1:193"
      >
        <img
          alt=""
          role="presentation"
          className="block max-w-none w-full h-full object-cover"
          src={imgVector}
          loading="lazy"
        />
      </div>

      {/* Layer 2: オレンジ/ピーチ */}
      <div
        className="absolute inset-0 opacity-100"
        data-name="Vector"
        data-node-id="1:194"
      >
        <img
          alt=""
          role="presentation"
          className="block max-w-none w-full h-full object-cover"
          src={imgVector1}
          loading="lazy"
        />
      </div>

      {/* Layer 3: ブルー/パープル */}
      <div
        className="absolute inset-0 opacity-100"
        data-name="Vector"
        data-node-id="1:195"
      >
        <img
          alt=""
          role="presentation"
          className="block max-w-none w-full h-full object-cover"
          src={imgVector2}
          loading="lazy"
        />
      </div>

      {/* Layer 4: 白オーバーレイ 20% */}
      <div
        className="absolute inset-0 bg-white/20"
        data-name="WhiteOverlay"
        aria-hidden="true"
      />
    </div>
  );
};

/**
 * BackgroundGradationCSS Component (代替実装)
 *
 * CSSのbackground-imageプロパティを使用した実装。
 * パフォーマンスが重要な場合はこちらを使用してください。
 *
 * @example
 * ```tsx
 * <BackgroundGradationCSS className="opacity-50" />
 * ```
 */
export const BackgroundGradationCSS: React.FC<BackgroundGradationProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`w-full h-full ${className}`}
      aria-hidden="true"
      role="presentation"
      style={{
        backgroundImage:
          'url(/assets/f1a2bfc49a149107a751573296609b867ed6b43e.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default BackgroundGradation;
