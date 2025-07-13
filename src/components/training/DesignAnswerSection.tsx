import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Lightbulb, ExternalLink } from 'lucide-react';

interface DesignAnswerSectionProps {
  content: string;
  className?: string;
}

/**
 * デザイン解答例セクション専用コンポーネント
 * カスタムマーカーで囲まれたコンテンツを特別なスタイルで表示
 */
const DesignAnswerSection: React.FC<DesignAnswerSectionProps> = ({ 
  content, 
  className = '' 
}) => {
  // カスタムマークダウンコンポーネント（デザイン解答例専用）
  const designAnswerComponents = {
    // 見出し（デザイン解答例専用スタイル）
    h2: ({ children }: any) => (
      <h2 className="text-xl font-bold text-purple-800 mb-3 mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg font-semibold text-purple-700 mb-2 mt-4">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-base font-medium text-purple-600 mb-2 mt-3">
        {children}
      </h4>
    ),

    // パラグラフ
    p: ({ children }: any) => (
      <p className="text-gray-700 leading-relaxed mb-3">
        {children}
      </p>
    ),

    // リンク（外部リンク専用スタイル）
    a: ({ href, children }: any) => (
      <a
        href={href}
        className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium underline hover:no-underline transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
        <ExternalLink className="w-3 h-3" />
      </a>
    ),

    // リスト
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1 ml-4">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside text-gray-700 mb-3 space-y-1 ml-4">
        {children}
      </ol>
    ),

    // リストアイテム
    li: ({ children }: any) => (
      <li className="text-gray-700">
        {children}
      </li>
    ),

    // 特別なマーカー（□）の処理
    // これは通常のテキストとして処理されるが、スタイルを当てることができる
  };

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6 shadow-md ${className}`}>
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-full">
          <Lightbulb className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-purple-800">デザイン解答例</h3>
          <p className="text-sm text-purple-600">BONO の専門的なデザイン解説</p>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="pl-2">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={designAnswerComponents}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* フッター */}
      <div className="mt-4 pt-4 border-t border-purple-200">
        <p className="text-xs text-purple-600">
          💡 このセクションは BONO の専門的なデザイン解説コンテンツです
        </p>
      </div>
    </div>
  );
};

export default DesignAnswerSection;