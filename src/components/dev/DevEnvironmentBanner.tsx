/**
 * ENV-001 恒久対策: 開発環境バナー
 *
 * 開発環境でのみ表示される小さなバナー。
 * 本番環境では絶対に表示されない（import.meta.env.DEVで制御）
 */

import { useState } from 'react';

export const DevEnvironmentBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  // 本番環境では何も表示しない
  if (!import.meta.env.DEV) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '(not set)';
  const isLocal = supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost');

  return (
    <div
      className="fixed bottom-2 left-2 z-50 flex items-center gap-2 bg-yellow-500 text-yellow-900 text-xs font-mono px-2 py-1 rounded shadow-lg cursor-pointer hover:bg-yellow-400 transition-colors"
      onClick={() => setIsVisible(false)}
      title={`Supabase: ${supabaseUrl}\nClick to hide`}
    >
      <span>🔧</span>
      <span>DEV</span>
      {isLocal && <span className="text-yellow-700">(local)</span>}
    </div>
  );
};

export default DevEnvironmentBanner;
