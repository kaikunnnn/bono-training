import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";

/**
 * アイコン画像の登場アニメーション検証ページ
 * 全体的にゆっくりふわっとした感じ
 * ページロード時のように「何もないところから」表示される
 */

// 実際のレッスン画像（Webflow CDN）
const sampleImageUrl = "https://cdn.prod.website-files.com/6029d01deccd0a2530d2d878/67efb7295bb3a3db69ce138e_book-steel.jpg";

// パターンA: フェードイン + 下からスライド
function PatternA({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-2">
        <h3 className="font-bold text-lg text-gray-900">A: フェード + スライドアップ</h3>
        <p className="text-sm text-gray-500">定番で安心感のある動き</p>
      </div>

      <div
        className="relative w-[140px] h-[211px] rounded-tr-[12px] rounded-br-[12px] overflow-hidden"
        style={{
          boxShadow: "0px 2px 30px rgba(0,0,0,0.2)",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 1s ease-out, transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        <img
          src={sampleImageUrl}
          alt="Pattern A"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

// パターンB: フェードイン + スケール
function PatternB({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-2">
        <h3 className="font-bold text-lg text-gray-900">B: フェード + スケール</h3>
        <p className="text-sm text-gray-500">ポップで印象的</p>
      </div>

      <div
        className="relative w-[140px] h-[211px] rounded-tr-[12px] rounded-br-[12px] overflow-hidden"
        style={{
          boxShadow: "0px 2px 30px rgba(0,0,0,0.2)",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0.9)",
          transition: "opacity 1s ease-out, transform 1.2s cubic-bezier(0.34, 1.2, 0.64, 1)",
        }}
      >
        <img
          src={sampleImageUrl}
          alt="Pattern B"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

// パターンC: 左からスライド + 軽い回転
function PatternC({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-2">
        <h3 className="font-bold text-lg text-gray-900">C: スライド + 回転</h3>
        <p className="text-sm text-gray-500">本棚から取り出す感じ</p>
      </div>

      <div
        className="relative w-[140px] h-[211px] rounded-tr-[12px] rounded-br-[12px] overflow-hidden"
        style={{
          boxShadow: "0px 2px 30px rgba(0,0,0,0.2)",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateX(0) rotate(0deg)" : "translateX(-25px) rotate(-5deg)",
          transition: "opacity 1s ease-out, transform 1.3s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <img
          src={sampleImageUrl}
          alt="Pattern C"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

// パターンD: バウンス付きスケール
function PatternD({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-2">
        <h3 className="font-bold text-lg text-gray-900">D: ソフトバウンス</h3>
        <p className="text-sm text-gray-500">柔らかく弾む</p>
      </div>

      <div
        className="relative w-[140px] h-[211px] rounded-tr-[12px] rounded-br-[12px] overflow-hidden"
        style={{
          boxShadow: "0px 2px 30px rgba(0,0,0,0.2)",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0.85)",
          transition: "opacity 0.8s ease-out, transform 1.4s cubic-bezier(0.34, 1.3, 0.64, 1)",
        }}
      >
        <img
          src={sampleImageUrl}
          alt="Pattern D"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

// パターンE: 3D回転で登場
function PatternE({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-2">
        <h3 className="font-bold text-lg text-gray-900">E: 3D回転</h3>
        <p className="text-sm text-gray-500">本をめくるような動き</p>
      </div>

      <div style={{ perspective: "800px" }}>
        <div
          className="relative w-[140px] h-[211px] rounded-tr-[12px] rounded-br-[12px] overflow-hidden"
          style={{
            boxShadow: "0px 2px 30px rgba(0,0,0,0.2)",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "rotateY(0deg)" : "rotateY(-60deg)",
            transformOrigin: "left center",
            transition: "opacity 0.6s ease-out, transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <img
            src={sampleImageUrl}
            alt="Pattern E"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

// パターンF: 浮き上がり + シャドウ
function PatternF({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-2">
        <h3 className="font-bold text-lg text-gray-900">F: 浮き上がり</h3>
        <p className="text-sm text-gray-500">優雅でプレミアム感</p>
      </div>

      <div
        className="relative w-[140px] h-[211px] rounded-tr-[12px] rounded-br-[12px] overflow-hidden"
        style={{
          boxShadow: isVisible
            ? "0px 2px 30px rgba(0,0,0,0.2)"
            : "0px 0px 10px rgba(0,0,0,0.05)",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(15px)",
          transition: "all 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        <img
          src={sampleImageUrl}
          alt="Pattern F"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

// パターンG: 落下 + ソフトバウンド
function PatternG({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-2">
        <h3 className="font-bold text-lg text-gray-900">G: ふわり落下</h3>
        <p className="text-sm text-gray-500">上からふわっと降りる</p>
      </div>

      <div
        className="relative w-[140px] h-[211px] rounded-tr-[12px] rounded-br-[12px] overflow-hidden"
        style={{
          boxShadow: "0px 2px 30px rgba(0,0,0,0.2)",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(-40px)",
          transition: "opacity 0.8s ease-out, transform 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <img
          src={sampleImageUrl}
          alt="Pattern G"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

// パターンH: ゆっくりスピン
function PatternH({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-2">
        <h3 className="font-bold text-lg text-gray-900">H: ゆっくり回転</h3>
        <p className="text-sm text-gray-500">回転しながら現れる</p>
      </div>

      <div
        className="relative w-[140px] h-[211px] rounded-tr-[12px] rounded-br-[12px] overflow-hidden"
        style={{
          boxShadow: "0px 2px 30px rgba(0,0,0,0.2)",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1) rotate(0deg)" : "scale(0.8) rotate(-15deg)",
          transition: "opacity 0.8s ease-out, transform 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <img
          src={sampleImageUrl}
          alt="Pattern H"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

// パターンI: フリップ（裏返し）
function PatternI({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-2">
        <h3 className="font-bold text-lg text-gray-900">I: フリップ</h3>
        <p className="text-sm text-gray-500">カードを裏返す</p>
      </div>

      <div style={{ perspective: "1000px" }}>
        <div
          className="relative w-[140px] h-[211px] rounded-tr-[12px] rounded-br-[12px] overflow-hidden"
          style={{
            boxShadow: "0px 2px 30px rgba(0,0,0,0.2)",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "rotateX(0deg)" : "rotateX(70deg)",
            transformOrigin: "center bottom",
            transition: "opacity 0.5s ease-out, transform 1.3s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <img
            src={sampleImageUrl}
            alt="Pattern I"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

// パターンJ: ズームイン（遠くから飛んでくる）
function PatternJ({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-2">
        <h3 className="font-bold text-lg text-gray-900">J: ズームイン</h3>
        <p className="text-sm text-gray-500">奥からふわっと</p>
      </div>

      <div style={{ perspective: "800px" }}>
        <div
          className="relative w-[140px] h-[211px] rounded-tr-[12px] rounded-br-[12px] overflow-hidden"
          style={{
            boxShadow: "0px 2px 30px rgba(0,0,0,0.2)",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateZ(0) scale(1)" : "translateZ(-200px) scale(0.8)",
            transition: "opacity 0.8s ease-out, transform 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <img
            src={sampleImageUrl}
            alt="Pattern J"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

// パターンK: ふわっと広がる
function PatternK({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-2">
        <h3 className="font-bold text-lg text-gray-900">K: ふわっと広がる</h3>
        <p className="text-sm text-gray-500">中心から優しく</p>
      </div>

      <div
        className="relative w-[140px] h-[211px] rounded-tr-[12px] rounded-br-[12px] overflow-hidden"
        style={{
          boxShadow: "0px 2px 30px rgba(0,0,0,0.2)",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0.7)",
          transition: "opacity 1s ease-out, transform 1.6s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <img
          src={sampleImageUrl}
          alt="Pattern K"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

// パターンL: スライド + 3D傾き
function PatternL({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-2">
        <h3 className="font-bold text-lg text-gray-900">L: 3Dスライド</h3>
        <p className="text-sm text-gray-500">傾きながらスライド</p>
      </div>

      <div style={{ perspective: "800px" }}>
        <div
          className="relative w-[140px] h-[211px] rounded-tr-[12px] rounded-br-[12px] overflow-hidden"
          style={{
            boxShadow: "0px 2px 30px rgba(0,0,0,0.2)",
            opacity: isVisible ? 1 : 0,
            transform: isVisible
              ? "translateX(0) rotateY(0deg)"
              : "translateX(-30px) rotateY(25deg)",
            transition: "opacity 0.8s ease-out, transform 1.4s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <img
            src={sampleImageUrl}
            alt="Pattern L"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default function IconAnimations() {
  // 初期状態は非表示（ページロードを再現）
  const [isVisible, setIsVisible] = useState(false);

  // ページロード時に少し遅延してからアニメーション開始
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleReset = () => {
    setIsVisible(false);
    setTimeout(() => setIsVisible(true), 300);
  };

  return (
    <Layout>
      {/* 固定リプレイボタン */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-lg font-bold"
        >
          リプレイ
        </button>
      </div>

      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            アイコン画像 登場アニメーション
          </h1>
          <p className="text-gray-600">
            ゆっくりふわっとした登場アニメーション
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PatternA isVisible={isVisible} />
          <PatternB isVisible={isVisible} />
          <PatternC isVisible={isVisible} />
          <PatternD isVisible={isVisible} />
          <PatternE isVisible={isVisible} />
          <PatternF isVisible={isVisible} />
          <PatternG isVisible={isVisible} />
          <PatternH isVisible={isVisible} />
          <PatternI isVisible={isVisible} />
          <PatternJ isVisible={isVisible} />
          <PatternK isVisible={isVisible} />
          <PatternL isVisible={isVisible} />
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="font-bold text-gray-900 mb-2">パフォーマンス考慮</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>・CSS transform と opacity のみ使用（GPU アクセラレーション）</li>
            <li>・JavaScript アニメーションライブラリ不使用</li>
            <li>・ゆっくりふわっとしたイージング (1〜1.6秒)</li>
            <li>・prefers-reduced-motion 対応も追加可能</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
