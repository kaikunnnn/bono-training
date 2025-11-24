import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * コンテンツプレビューオーバーレイコンポーネント
 * プレミアムコンテンツの続きをロックする際に表示
 */
export default function ContentPreviewOverlay() {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/subscription');
  };

  return (
    <div className="relative -mt-20">
      {/* グラデーション */}
      <div
        className="absolute inset-x-0 top-0 h-40 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,1) 100%)'
        }}
      />

      {/* CTA */}
      <div className="relative bg-white pt-24 pb-16 text-center z-20 border-t-2 border-gray-100">
        {/* ロックアイコン */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
          <Lock className="w-8 h-8 text-blue-600" strokeWidth={2} />
        </div>

        {/* メッセージ */}
        <h3 className="font-noto-sans-jp font-bold text-xl text-gray-800 mb-2">
          続きを読むにはプランが必要です
        </h3>
        <p className="font-noto-sans-jp text-sm text-gray-600 mb-6 leading-relaxed max-w-md mx-auto">
          スタンダードプラン以上で、<br />
          全てのレッスンと記事コンテンツにアクセスできます
        </p>

        {/* CTAボタン */}
        <button
          onClick={handleUpgrade}
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-8 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <span className="font-noto-sans-jp text-sm">プランを見る</span>
        </button>

        {/* 補足テキスト */}
        <div className="mt-6 pt-6 border-t border-gray-200 max-w-md mx-auto">
          <p className="font-noto-sans-jp text-xs text-gray-500">
            スタンダードプランの特典
          </p>
          <ul className="mt-3 space-y-2 text-left">
            <li className="flex items-start gap-2 text-xs text-gray-600">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>全ての動画レッスンとテキストコンテンツ</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-gray-600">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>進捗管理とTODO機能</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-gray-600">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>新規コンテンツの優先アクセス</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
