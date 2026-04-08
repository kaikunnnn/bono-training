import { useEffect, useState } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * サウンドエフェクトプレビューページ
 *
 * トップページ読み込み時のサウンド効果を3パターンで比較
 */
export default function SoundEffectPreview() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ヘッダー */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            サウンドエフェクト プレビュー
          </h1>
          <p className="text-gray-600">
            トップページ読み込み時のサウンド効果を3パターンで比較できます
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <p className="font-semibold mb-2">⚠️ 音声ファイルが必要です</p>
            <p>
              <code className="bg-amber-100 px-2 py-1 rounded">/public/sounds/swoosh.mp3</code>
              を配置してください。
              <br />
              詳細は <code className="bg-amber-100 px-2 py-1 rounded">/public/sounds/README.md</code> を参照。
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
                <li>再訪問時（インタラクション履歴あり）なら鳴る可能性あり</li>
              </ul>
            </div>

            <div>
              <strong className="font-semibold">Pattern B: アニメーション完了後</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>フェードインアニメーション（1秒）の後に音を鳴らす</li>
                <li>❌ 自動再生ポリシーの問題は残る</li>
                <li>✅ タイミング的には自然（視覚効果の後に音）</li>
                <li>音が鳴らなくてもアニメーションは見える</li>
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

        {/* 技術情報 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-3 text-sm text-gray-700">
          <h2 className="text-lg font-bold text-gray-900">🔧 技術情報</h2>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>自動再生ポリシー</strong>: Chrome 66+, Safari 11+で導入。ユーザー操作なしの音声再生を制限</li>
            <li><strong>prefers-reduced-motion</strong>: アクセシビリティ設定で動きを減らす場合、音も無効化</li>
            <li><strong>ファイルサイズ</strong>: 短い効果音（0.3-0.5秒）なら5-20KB程度で、画像1枚より軽量</li>
            <li><strong>推奨実装</strong>: Pattern Cをベースに、フォールバック（音が鳴らなくてもOK）を前提とした設計</li>
          </ul>
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
  const { play, isLoaded, error } = useSoundEffect({
    src: '/sounds/swoosh.mp3',
    volume: 0.5,
    debug: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // ページロード直後に自動再生を試みる
  useEffect(() => {
    if (mounted && isLoaded) {
      play();
    }
  }, [mounted, isLoaded, play]);

  return (
    <PatternCard
      title="Pattern A"
      subtitle="ページロード直後"
      status={error ? 'error' : isLoaded ? 'loaded' : 'loading'}
      statusText={
        error
          ? '音声ファイルが見つかりません'
          : isLoaded
          ? '読み込み完了（自動再生を試みました）'
          : '読み込み中...'
      }
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
      <Button onClick={play} variant="outline" className="w-full mt-4" disabled={!isLoaded}>
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
  const { play, isLoaded, error } = useSoundEffect({
    src: '/sounds/swoosh.mp3',
    volume: 0.5,
    debug: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // アニメーション完了後（1秒後）に自動再生を試みる
  useEffect(() => {
    if (mounted && isLoaded) {
      const timer = setTimeout(() => {
        play();
      }, 1000); // アニメーション時間と同じ

      return () => clearTimeout(timer);
    }
  }, [mounted, isLoaded, play]);

  return (
    <PatternCard
      title="Pattern B"
      subtitle="アニメーション完了後"
      status={error ? 'error' : isLoaded ? 'loaded' : 'loading'}
      statusText={
        error
          ? '音声ファイルが見つかりません'
          : isLoaded
          ? '読み込み完了（1秒後に自動再生を試みました）'
          : '読み込み中...'
      }
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
      <Button onClick={play} variant="outline" className="w-full mt-4" disabled={!isLoaded}>
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
  const { play, isLoaded, error } = useSoundEffect({
    src: '/sounds/swoosh.mp3',
    volume: 0.5,
    debug: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // ユーザーインタラクション後に自動再生
  useEffect(() => {
    if (mounted && isLoaded && interacted) {
      play();
    }
  }, [mounted, isLoaded, interacted, play]);

  // クリックまたはスクロールを検知
  useEffect(() => {
    if (!mounted || interacted) return;

    const handleInteraction = () => {
      setInteracted(true);
    };

    // このカード内でのクリック・タッチを検知
    const card = document.getElementById('pattern-c-card');
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
      id="pattern-c-card"
      title="Pattern C"
      subtitle="ユーザーインタラクション後"
      status={error ? 'error' : isLoaded ? 'loaded' : 'loading'}
      statusText={
        error
          ? '音声ファイルが見つかりません'
          : interacted
          ? '✅ インタラクション検知！音を再生しました'
          : isLoaded
          ? 'このカードをクリックしてください'
          : '読み込み中...'
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
      <Button onClick={play} variant="outline" className="w-full mt-4" disabled={!isLoaded}>
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
