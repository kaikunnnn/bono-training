"use client";

import Image from "next/image";
import { Dongle, Noto_Sans_JP } from "next/font/google";
import TitleSection from "./components/TitleSection";
import DecorationSection from "./components/DecorationSection";
import TableOfContents from "./components/TableOfContents";

// Dongleフォントの設定
const dongle = Dongle({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dongle",
});

// Noto Sans JPフォントの設定
const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

// カテゴリーリストの定義
const categories = [
  { id: 1, title: "未経験からUIUXデザイナーになれるの？" },
  { id: 2, title: "身につけるスキル" },
  { id: 4, title: "ポートフォリオ作成" },
  { id: 5, title: "未経験で転職した人のインタビュー" },
  { id: 6, title: "採用と面接" },
];

// アニメーションのバリエーション定義
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// 子要素を順番にアニメーションさせるコンテナのバリエーション
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // 子要素のアニメーション間隔
      delayChildren: 0.3, // 最初の子要素のディレイ
    },
  },
};

// アイコンのアニメーション
const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      delay: 0.2,
    },
  },
};

export default function HeroSection() {
  return (
    <div className="md:w-full mx-auto px-4 py-12 md:py-24 md:-mb-4 flex flex-col justify-start items-center relative w-full z-10">
      <div className="w-full md:w-full mx-auto flex items-center flex-col">
        <h1 className="sr-only">未経験からのUIUXデザイナー転職ガイド</h1>

        <TitleSection />
        <DecorationSection />
        <TableOfContents />
      </div>
    </div>
  );
}
