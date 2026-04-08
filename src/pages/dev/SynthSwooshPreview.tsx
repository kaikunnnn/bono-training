import { useEffect, useState } from 'react';
import { useSynthSwoosh } from '@/hooks/useSynthSwoosh';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Volume2, VolumeX } from 'lucide-react';

/**
 * Web Audio APIで生成した「シュッ」音のプレビューページ
 *
 * 音声ファイル不要で動作確認可能
 */
export default function SynthSwooshPreview() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ヘッダー */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Volume2 className="w-10 h-10" />
            Web Audio API - シンセサイズ音プレビュー
          </h1>
          <p className="text-gray-600">
            音声ファイル不要。ブラウザで「シュッ」音を生成します。
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
            <p className="font-semibold mb-2">✅ 音声ファイル不要</p>
            <p>
              Web Audio APIでホワイトノイズを生成し、フィルターで加工して「シュッ」という音を作ります。
            </p>
          </div>
        </header>

        {/* パターン比較 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PatternA />
          <PatternB />
          <PatternC />
        </div>

        {/* 補足説明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold text-blue-900">📝 各パターンの特徴</h2>

          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <strong className="font-semibold">Pattern A: ページロード直後</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>最もシンプル。ページ表示と同時に音を鳴らす試み</li>
                <li>❌ ブラウザの自動再生ポリシーでブロックされる可能性が高い</li>
                <li>Chrome/Safariでは初回アクセス時は鳴らない</li>
              </ul>
            </div>

            <div>
              <strong className="font-semibold">Pattern B: アニメーション完了後</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>フェードインアニメーション（1秒）の後に音を鳴らす</li>
                <li>❌ 自動再生ポリシーの問題は残る</li>
                <li>✅ タイミング的には自然（視覚効果の後に音）</li>
              </ul>
            </div>

            <div>
              <strong className="font-semibold">Pattern C: ユーザーインタラクション後（推奨）</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>最初のクリックやスクロール後に音を鳴らす</li>
                <li>✅ 確実に音が鳴る</li>
                <li>✅ 自動再生ポリシーをクリア</li>
                <li>⚠️ ユーザーが何もしないと音は鳴らない</li>
                <li>本番環境で最も安定した動作が期待できる</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Web Audio API 技術情報 */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 space-y-3 text-sm text-purple-700">
          <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Web Audio API 仕組み
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>ホワイトノイズ生成</strong>: ランダムな値で波形を作成</li>
            <li><strong>ハイパスフィルター</strong>: 3000Hz以下をカット（低音除去）</li>
            <li><strong>バンドパスフィルター</strong>: 5000Hz周辺を強調（「シュッ」感を出す）</li>
            <li><strong>エンベロープ</strong>: 瞬時立ち上がり → 0.4秒で減衰</li>
            <li><strong>ファイルサイズ</strong>: 0バイト（生成のみ）</li>
          </ul>
        </div>

        {/* 音声ファイル版との比較 */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 space-y-3 text-sm text-amber-700">
          <h2 className="text-lg font-bold text-amber-900">🎵 音声ファイル版 vs Web Audio版</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">音声ファイル版（/sounds/swoosh.mp3）</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>✅ プロフェッショナルな音質</li>
                <li>✅ デザイナーが選んだ音</li>
                <li>❌ ファイルダウンロードが必要（5-20KB）</li>
                <li>❌ 読み込み時間がわずかにかかる</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-purple-900 mb-2">Web Audio版（このページ）</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>✅ ファイル不要（0バイト）</li>
                <li>✅ 即座に利用可能</li>
                <li>⚠️ やや機械的な音</li>
                <li>⚠️ 調整に技術知識が必要</li>
              </ul>
            </div>
          </div>

          <p className="mt-4 font-semibold text-amber-900">
            💡 推奨: 最終的には音声ファイル版を使用。このWeb Audio版はプロトタイプや動作確認用。
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Pattern A: ページロード直後に自動再生を試みる
 */
function PatternA() {
  const [mounted, setMounted] = useState(false);
  const { play, isReady } = useSynthSwoosh({
    volume: 0.3,
    duration: 0.4,
    debug: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // ページロード直後に自動再生を試みる
  useEffect(() => {
    if (mounted && isReady) {
      play();
    }
  }, [mounted, isReady, play]);

  return (
    <PatternCard
      title="Pattern A"
      subtitle="ページロード直後"
      status={isReady ? 'loaded' : 'loading'}
      statusText={isReady ? '読み込み完了（自動再生を試みました）' : '準備中...'}
      recommendation="⚠️ 自動再生ポリシーでブロックされる可能性大"
    >
      <div
        className={cn(
          'w-full h-32 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold transition-all duration-1000',
          mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
      >
        シュッ！
      </div>
      <Button onClick={play} variant="outline" className="w-full mt-4" disabled={!isReady}>
        手動で再生テスト
      </Button>
    </PatternCard>
  );
}

/**
 * Pattern B: アニメーション完了後に再生
 */
function PatternB() {
  const [mounted, setMounted] = useState(false);
  const { play, isReady } = useSynthSwoosh({
    volume: 0.3,
    duration: 0.4,
    debug: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // アニメーション完了後（1秒後）に自動再生を試みる
  useEffect(() => {
    if (mounted && isReady) {
      const timer = setTimeout(() => {
        play();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [mounted, isReady, play]);

  return (
    <PatternCard
      title="Pattern B"
      subtitle="アニメーション完了後"
      status={isReady ? 'loaded' : 'loading'}
      statusText={isReady ? '読み込み完了（1秒後に自動再生を試みました）' : '準備中...'}
      recommendation="⚠️ 自動再生ポリシーの問題は残る"
    >
      <div
        className={cn(
          'w-full h-32 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold transition-all duration-1000',
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}
      >
        シュッ！
      </div>
      <Button onClick={play} variant="outline" className="w-full mt-4" disabled={!isReady}>
        手動で再生テスト
      </Button>
    </PatternCard>
  );
}

/**
 * Pattern C: ユーザーインタラクション後に再生（推奨）
 */
function PatternC() {
  const [mounted, setMounted] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const { play, isReady } = useSynthSwoosh({
    volume: 0.3,
    duration: 0.4,
    debug: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // ユーザーインタラクション後に自動再生
  useEffect(() => {
    if (mounted && isReady && interacted) {
      play();
    }
  }, [mounted, isReady, interacted, play]);

  // クリックまたはタッチを検知
  useEffect(() => {
    if (!mounted || interacted) return;

    const handleInteraction = () => {
      setInteracted(true);
    };

    const card = document.getElementById('pattern-c-card-synth');
    if (card) {
      card.addEventListener('click', handleInteraction, { once: true });
      card.addEventListener('touchstart', handleInteraction, { once: true });

      return () => {
        card.removeEventListener('click', handleInteraction);
        card.removeEventListener('touchstart', handleInteraction);
      };
    }
  }, [mounted, interacted]);

  return (
    <PatternCard
      id="pattern-c-card-synth"
      title="Pattern C"
      subtitle="ユーザーインタラクション後"
      status={isReady ? 'loaded' : 'loading'}
      statusText={
        interacted
          ? '✅ インタラクション検知！音を再生しました'
          : isReady
          ? 'このカードをクリックしてください'
          : '準備中...'
      }
      recommendation="✅ 推奨パターン（確実に音が鳴る）"
    >
      <div
        className={cn(
          'w-full h-32 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold transition-all duration-500 cursor-pointer hover:scale-105',
          mounted ? 'opacity-100' : 'opacity-0',
          interacted && 'ring-4 ring-green-300'
        )}
      >
        {interacted ? 'シュッ！' : 'クリックして'}
      </div>
      <Button onClick={play} variant="outline" className="w-full mt-4" disabled={!isReady}>
        手動で再生テスト
      </Button>
    </PatternCard>
  );
}

/**
 * パターンカード共通コンポーネント
 */
interface PatternCardProps {
  id?: string;
  title: string;
  subtitle: string;
  status: 'loading' | 'loaded' | 'error';
  statusText: string;
  recommendation: string;
  children: React.ReactNode;
}

function PatternCard({
  id,
  title,
  subtitle,
  status,
  statusText,
  recommendation,
  children,
}: PatternCardProps) {
  return (
    <div
      id={id}
      className="bg-white rounded-xl shadow-lg p-6 space-y-4 border border-gray-200 hover:shadow-xl transition-shadow"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">{subtitle}</p>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-block w-2 h-2 rounded-full',
              status === 'loaded' && 'bg-green-500',
              status === 'loading' && 'bg-yellow-500 animate-pulse',
              status === 'error' && 'bg-red-500'
            )}
          />
          <span className="text-xs text-gray-500">{statusText}</span>
        </div>
      </div>

      <div className="space-y-4">{children}</div>

      <div
        className={cn(
          'text-xs px-3 py-2 rounded-lg font-medium',
          recommendation.startsWith('✅')
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        )}
      >
        {recommendation}
      </div>
    </div>
  );
}
