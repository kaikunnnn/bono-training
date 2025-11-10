/**
 * BONO Blog - Sun Decoration Component
 *
 * 99frontend 仕様に基づく太陽の装飾コンポーネント
 * 参照: .claude/docs/blog/99frontend/sun-decoration.md
 *
 * @component SunDecoration
 * @description ページ右下に配置される装飾的な太陽のイラスト。温かみと希望を表現する視覚的アクセント。
 */

import React from 'react';
import { motion } from 'framer-motion';

// 太陽SVGのパス
const imgSunSvg = '/assets/blog/82c8bc0c7e4edf6d630d1c217268bbafd904b609.svg';

interface SunDecorationProps {
  /** 追加のカスタムクラス名 */
  className?: string;
}

/**
 * SunDecoration Component
 *
 * 太陽の装飾コンポーネント。99frontend仕様に完全準拠した実装。
 *
 * 仕様:
 * - サイズ: 260×260px（固定）
 * - グラデーション: ピンク〜オレンジ〜レッド〜ブルー
 * - 配置: ページ右下（固定位置推奨）
 * - z-index: 0（背景より上、コンテンツより下）
 * - 役割: 装飾的要素（aria-hidden="true"）
 *
 * @example
 * ```tsx
 * // 右下固定配置
 * <div className="fixed right-[5%] bottom-[268px] w-[260px] h-[260px] z-0">
 *   <SunDecoration />
 * </div>
 * ```
 */
export const SunDecoration: React.FC<SunDecorationProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`content-stretch flex flex-col items-start relative size-full ${className}`}
      data-name="Container"
      data-node-id="1:6"
      aria-hidden="true"
      role="presentation"
    >
      <div
        className="content-stretch flex flex-col items-start max-w-[260px] overflow-clip relative shrink-0 w-[260px]"
        data-name="sun image"
        data-node-id="1:7"
      >
        <div
          className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[260px]"
          data-name="sun.svg fill"
          data-node-id="1:9"
        >
          <div
            className="opacity-100 relative shrink-0 size-[260px]"
            data-name="sun.svg"
            data-node-id="1:10"
          >
            <img
              alt=""
              className="block max-w-none size-full"
              src={imgSunSvg}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ResponsiveSunDecoration Component
 *
 * レスポンシブ対応の太陽装飾コンポーネント。
 * ページ右下に固定配置され、画面サイズに応じて位置が調整されます。
 * 下から登るふわっとしたアニメーション付き。
 *
 * @example
 * ```tsx
 * <ResponsiveSunDecoration />
 * ```
 */
export const ResponsiveSunDecoration: React.FC = () => {
  return (
    <motion.div
      className="fixed right-[5%] md:right-[3%] sm:right-[2%] w-[260px] h-[260px] pointer-events-none"
      style={{
        bottom: '-130px', // 太陽が半分見える位置（260pxの半分 = 130px下にオフセット）
        zIndex: -1, // 他のすべての要素の下、背景グラデーション（-10）より上
      }}
      aria-hidden="true"
      initial={{
        y: 150, // 初期位置：さらに下に隠れている
        opacity: 0, // 最初は透明
      }}
      animate={{
        y: 0, // 最終位置：通常の位置
        opacity: 1, // 完全に表示
      }}
      transition={{
        delay: 0.5, // 0.5秒遅延
        duration: 1.2, // 1.2秒かけてアニメーション
        ease: [0.25, 0.46, 0.45, 0.94], // ふわっとしたイージング（easeOutCubic相当）
      }}
    >
      <SunDecoration />
    </motion.div>
  );
};

/**
 * AnimatedSunDecoration Component
 *
 * フェードイン＋下から登るアニメーション付きの太陽装飾コンポーネント。
 *
 * @example
 * ```tsx
 * <AnimatedSunDecoration />
 * ```
 */
export const AnimatedSunDecoration: React.FC = () => {
  return (
    <motion.div
      className="fixed right-[5%] md:right-[3%] sm:right-[2%] w-[260px] h-[260px] pointer-events-none"
      aria-hidden="true"
      style={{
        bottom: '-130px', // 太陽が半分見える位置（260pxの半分 = 130px下にオフセット）
        zIndex: -1, // 他のすべての要素の下、背景グラデーション（-10）より上
      }}
      initial={{
        y: 150, // 初期位置：さらに下に隠れている
        opacity: 0, // 最初は透明
      }}
      animate={{
        y: 0, // 最終位置：通常の位置
        opacity: 1, // 完全に表示
      }}
      transition={{
        delay: 0.5, // 0.5秒遅延
        duration: 1.2, // 1.2秒かけてアニメーション
        ease: [0.25, 0.46, 0.45, 0.94], // ふわっとしたイージング（easeOutCubic相当）
      }}
    >
      <SunDecoration />
    </motion.div>
  );
};

export default SunDecoration;
