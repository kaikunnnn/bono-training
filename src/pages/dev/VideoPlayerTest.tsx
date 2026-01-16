/**
 * VideoPlayerTest
 *
 * Vimeo標準iframe埋め込みとカスタムUIの動作検証用ページ
 */

import { useState } from 'react';
import { VimeoFallbackPlayer } from '@/components/video/VimeoFallbackPlayer';
import { CustomVimeoPlayer } from '@/components/video/CustomVimeoPlayer';

// テスト用のVimeo動画ID（BONO所有の動画）
const TEST_VIMEO_ID = '1148597513';

export default function VideoPlayerTest() {
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Vimeo Player テスト</h1>

      <div className="mb-6">
        <p className="text-gray-400 mb-4">
          このページでVimeo標準iframe埋め込みとカスタムUIの動作を検証します。
        </p>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowCustom(false)}
            className={`px-4 py-2 rounded ${!showCustom ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            標準 Vimeo iframe
          </button>
          <button
            onClick={() => setShowCustom(true)}
            className={`px-4 py-2 rounded ${showCustom ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            カスタム UI
          </button>
        </div>
      </div>

      <div className="max-w-4xl">
        <h2 className="text-lg font-semibold mb-2">
          {showCustom ? 'カスタム UI' : '標準 Vimeo iframe'}
        </h2>

        {showCustom ? (
          <CustomVimeoPlayer vimeoId={TEST_VIMEO_ID} />
        ) : (
          <VimeoFallbackPlayer vimeoId={TEST_VIMEO_ID} />
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded">
        <h3 className="font-semibold mb-2">検証手順</h3>
        <ol className="list-decimal list-inside space-y-1 text-gray-300">
          <li>「標準 Vimeo iframe」で再生できるか確認</li>
          <li>「カスタム UI」で再生できるか確認</li>
          <li>アドブロッカーON/OFFで両方テスト</li>
        </ol>
      </div>
    </div>
  );
}
