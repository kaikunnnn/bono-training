/**
 * ロードマップ詳細ページ - クリア祝福ブロック
 *
 * ロードマップを完了した人を祝福し、次のアクションへ誘導するコンポーネント
 */

import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { Cup, Edit, MessageText1, ArrowRight } from "iconsax-react";

interface ClearBlockProps {
  /** ロードマップタイトル */
  roadmapTitle?: string;
}

export default function ClearBlock({ roadmapTitle }: ClearBlockProps) {
  const [celebrated, setCelebrated] = useState(false);

  // 紙吹雪を発射する関数
  const fireCelebration = useCallback(() => {
    if (celebrated) return;

    // 複数回の紙吹雪を発射してより豪華に
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    // ランダムな位置から紙吹雪を発射
    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // 左側から
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#667eea", "#764ba2", "#f97316", "#14b8a6", "#fbbf24"],
      });

      // 右側から
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#667eea", "#764ba2", "#ec4899", "#06b6d4", "#22c55e"],
      });
    }, 250);

    // 中央から大きな紙吹雪
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.5 },
      colors: ["#667eea", "#764ba2", "#f97316", "#14b8a6", "#fbbf24", "#ec4899"],
      zIndex: 1000,
    });

    setCelebrated(true);
  }, [celebrated]);

  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-[1100px] mx-auto">
        {/* メインカード */}
        <div className="relative bg-gradient-to-br from-[#f8f9f7] to-[#e8ebe6] rounded-3xl border border-[#d4dbd1] overflow-hidden">
          {/* 装飾的な背景パターン */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-8 h-8 rounded-full bg-[#52674e]"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    transform: `scale(${0.5 + Math.random() * 1.5})`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="relative px-8 py-12 md:px-16 md:py-16">
            {/* ステップバッジ */}
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] px-4 py-2">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-[#52674e] uppercase tracking-wider">
                    ステップ
                  </span>
                  <span className="text-[24px] font-bold text-[#293525] font-['Unbounded',sans-serif] leading-none mt-1">
                    OK
                  </span>
                </div>
              </div>
            </div>

            {/* 祝福メッセージ */}
            <div className="text-center mb-8">
              <h2 className="text-[28px] md:text-[32px] font-extrabold text-[#293525] leading-[1.4] mb-4">
                ロードマップクリア 🎉
              </h2>
              {roadmapTitle && (
                <p className="text-[16px] text-[#52674e] mb-2">
                  「{roadmapTitle}」を完了しました！
                </p>
              )}
              <p className="text-[18px] text-[#293525]/70 leading-[1.8] max-w-[600px] mx-auto">
                お疲れさまでした！
                <br />
                学びの旅を一緒に歩んでくれてありがとう。
                <br />
                お茶でも一息ついてください 🍵
              </p>
            </div>

            {/* お祝いボタン */}
            <div className="flex justify-center mb-12">
              <button
                onClick={fireCelebration}
                disabled={celebrated}
                className={`
                  flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-[16px] transition-all
                  ${
                    celebrated
                      ? "bg-[#52674e]/10 text-[#52674e] cursor-default"
                      : "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-[0_4px_16px_rgba(102,126,234,0.4)] hover:shadow-[0_6px_24px_rgba(102,126,234,0.5)] hover:scale-[1.02] active:scale-[0.98]"
                  }
                `}
              >
                <Cup
                  size={24}
                  variant={celebrated ? "Bold" : "Outline"}
                  color={celebrated ? "#52674e" : "white"}
                />
                {celebrated ? "おめでとう！" : "クリアをお祝いする！"}
              </button>
            </div>

            {/* 次のアクション */}
            <div className="border-t border-[#d4dbd1] pt-10">
              <p className="text-center text-[14px] font-bold text-[#52674e] uppercase tracking-wider mb-6">
                次のステップ
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mx-auto">
                {/* ブログにまとめる */}
                <div className="bg-white rounded-2xl border border-[#e2e8e0] p-6 hover:border-[#52674e]/30 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#f0f4ee] rounded-xl flex items-center justify-center group-hover:bg-[#52674e]/10 transition-colors">
                      <Edit size={24} color="#52674e" variant="Linear" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[16px] font-bold text-[#293525] mb-2">
                        学びをブログにまとめよう
                      </h3>
                      <p className="text-[14px] text-[#293525]/60 leading-[1.6] mb-4">
                        学んだことをアウトプットすることで、知識が定着します。
                        自分の言葉でまとめてみましょう。
                      </p>
                      <a
                        href="https://note.com/new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[14px] font-bold text-[#52674e] hover:text-[#3d4d3a] transition-colors"
                      >
                        noteで書く
                        <ArrowRight size={16} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* フィードバックを受ける */}
                <Link
                  to="/feedback-apply"
                  className="bg-white rounded-2xl border border-[#e2e8e0] p-6 hover:border-[#667eea]/30 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all group block"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#f0f0fa] rounded-xl flex items-center justify-center group-hover:bg-[#667eea]/10 transition-colors">
                      <MessageText1 size={24} color="#667eea" variant="Linear" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[16px] font-bold text-[#293525] mb-2">
                        15分フィードバックを受けよう
                      </h3>
                      <p className="text-[14px] text-[#293525]/60 leading-[1.6] mb-4">
                        ブログにまとめたら、プロのフィードバックを受けてみませんか？
                        新しい視点が得られます。
                      </p>
                      <span className="inline-flex items-center gap-2 text-[14px] font-bold text-[#667eea] group-hover:text-[#5468d4] transition-colors">
                        フィードバックに申し込む
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* 励ましメッセージ */}
            <div className="mt-10 text-center">
              <p className="text-[14px] text-[#293525]/50 leading-[1.8]">
                よかったら学びの過程と成果をブログにまとめて
                <br />
                旅をセーブしましょう 📝
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
