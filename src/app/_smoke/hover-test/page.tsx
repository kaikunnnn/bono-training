"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * ホバーアニメーション調査用テストページ
 * URL: /_smoke/hover-test
 *
 * 4つのパターンをテストして、何が動くか確認する
 */
export default function HoverTestPage() {
  return (
    <main className="min-h-screen bg-[#F9F9F7] p-8 space-y-12">
      <h1 className="text-2xl font-bold">ホバーアニメーションテスト</h1>
      <p className="text-sm text-gray-600">各カードをホバーして、スムーズにアニメーションするか確認</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* パターン1: 純粋なCSS transition（Tailwind不使用） */}
        <TestCard1 />

        {/* パターン2: onMouseEnter/Leave + useState */}
        <TestCard2 />

        {/* パターン3: CSS :hover 疑似クラス（inline style sheet） */}
        <TestCard3 />

        {/* パターン4: framer-motion whileHover */}
        <TestCard4 />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* パターン5: Link要素で useState */}
        <TestCard5 />

        {/* パターン6: Tailwind hover:クラス + transition */}
        <TestCard6 />

        {/* パターン7: CSS Module的アプローチ */}
        <TestCard7 />

        {/* パターン8: data属性 + CSS */}
        <TestCard8 />
      </div>
    </main>
  );
}

/** パターン1: 純粋CSS — style属性のみ */
function TestCard1() {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-500">1. 純粋CSS style</p>
      <div
        className="bg-white rounded-2xl p-6 cursor-pointer"
        style={{
          boxShadow: "0px 1px 8px rgba(0,0,0,0.08)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
          e.currentTarget.style.boxShadow = "0px 8px 24px rgba(0,0,0,0.16)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "0px 1px 8px rgba(0,0,0,0.08)";
        }}
      >
        <p className="font-bold">直接DOM操作</p>
        <p className="text-sm text-gray-500 mt-1">e.currentTarget.style</p>
      </div>
    </div>
  );
}

/** パターン2: React useState */
function TestCard2() {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-500">2. useState</p>
      <div
        className="bg-white rounded-2xl p-6 cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          transform: hovered ? "translateY(-4px) scale(1.02)" : "none",
          boxShadow: hovered ? "0px 8px 24px rgba(0,0,0,0.16)" : "0px 1px 8px rgba(0,0,0,0.08)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <p className="font-bold">useState制御</p>
        <p className="text-sm text-gray-500 mt-1">isHovered: {String(hovered)}</p>
      </div>
    </div>
  );
}

/** パターン3: CSS class + global style */
function TestCard3() {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-500">3. CSS :hover class</p>
      <style>{`
        .test-hover-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          box-shadow: 0px 1px 8px rgba(0,0,0,0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .test-hover-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0px 8px 24px rgba(0,0,0,0.16);
        }
      `}</style>
      <div className="test-hover-card">
        <p className="font-bold">CSS :hover</p>
        <p className="text-sm text-gray-500 mt-1">純粋なCSS疑似クラス</p>
      </div>
    </div>
  );
}

/** パターン4: Tailwind hover: クラス */
function TestCard4() {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-500">4. Tailwind hover:</p>
      <div
        className="bg-white rounded-2xl p-6 cursor-pointer shadow-[0px_1px_8px_rgba(0,0,0,0.08)] hover:shadow-[0px_8px_24px_rgba(0,0,0,0.16)] hover:-translate-y-1 hover:scale-[1.02]"
        style={{ transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
      >
        <p className="font-bold">Tailwind hover:</p>
        <p className="text-sm text-gray-500 mt-1">hover:scale + inline transition</p>
      </div>
    </div>
  );
}

/** パターン5: Link + useState */
function TestCard5() {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-500">5. Link + useState</p>
      <Link
        href="#"
        className="block bg-white rounded-2xl p-6 cursor-pointer no-underline text-inherit"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          transform: hovered ? "translateY(-4px) scale(1.02)" : "none",
          boxShadow: hovered ? "0px 8px 24px rgba(0,0,0,0.16)" : "0px 1px 8px rgba(0,0,0,0.08)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <p className="font-bold">Link要素</p>
        <p className="text-sm text-gray-500 mt-1">isHovered: {String(hovered)}</p>
      </Link>
    </div>
  );
}

/** パターン6: Tailwind transition + hover */
function TestCard6() {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-500">6. Tailwind transition class</p>
      <div
        className="bg-white rounded-2xl p-6 cursor-pointer shadow-[0px_1px_8px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.02]"
      >
        <p className="font-bold">Tailwind transition</p>
        <p className="text-sm text-gray-500 mt-1">transition-transform + duration-300</p>
      </div>
    </div>
  );
}

/** パターン7: data属性 + CSS */
function TestCard7() {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-500">7. data属性 + CSS</p>
      <style>{`
        [data-hover-card] {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        [data-hover-card][data-hovered="true"] {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0px 8px 24px rgba(0,0,0,0.16);
        }
      `}</style>
      <div
        className="bg-white rounded-2xl p-6 cursor-pointer shadow-[0px_1px_8px_rgba(0,0,0,0.08)]"
        data-hover-card
        data-hovered={hovered}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <p className="font-bold">data属性</p>
        <p className="text-sm text-gray-500 mt-1">data-hovered: {String(hovered)}</p>
      </div>
    </div>
  );
}

/** パターン8: CSS変数 */
function TestCard8() {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-500">8. CSS変数制御</p>
      <div
        className="bg-white rounded-2xl p-6 cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ["--card-y" as string]: hovered ? "-4px" : "0px",
          ["--card-scale" as string]: hovered ? "1.02" : "1",
          ["--card-shadow" as string]: hovered ? "0px 8px 24px rgba(0,0,0,0.16)" : "0px 1px 8px rgba(0,0,0,0.08)",
          transform: `translateY(var(--card-y)) scale(var(--card-scale))`,
          boxShadow: `var(--card-shadow)`,
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <p className="font-bold">CSS変数</p>
        <p className="text-sm text-gray-500 mt-1">hovered: {String(hovered)}</p>
      </div>
    </div>
  );
}
