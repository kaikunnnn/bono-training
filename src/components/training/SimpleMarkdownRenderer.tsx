import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';

interface SimpleMarkdownRendererProps {
  content: string;
  className?: string;
  options?: {
    isPremium?: boolean;
    hasMemberAccess?: boolean;
  };
}

const SimpleMarkdownRenderer: React.FC<SimpleMarkdownRendererProps> = ({
  content,
  className = '',
  options = {}
}) => {
  const { isPremium = false, hasMemberAccess = true } = options;

  // プレミアムコンテンツの処理
  const getDisplayContent = (content: string) => {
    if (!isPremium || hasMemberAccess) {
      return { content, showBanner: false };
    }

    const marker = '<!-- PREMIUM_ONLY -->';
    if (content.includes(marker)) {
      const freeContent = content.split(marker)[0].trim();
      return { content: freeContent, showBanner: true };
    }

    return { content, showBanner: false };
  };

  const { content: displayContent, showBanner } = getDisplayContent(content);

  // カスタムコンポーネントの定義
  const components: Components = {
    // divタグの処理（skill-group, lesson, step クラスに対応）
    div: ({ className: divClassName, children, ...props }) => {
      const classMap: Record<string, string> = {
        // セクション全体のスタイル
        'section-challenge-merit': 'w-full bg-white py-8 px-4 border border-slate-400 flex flex-col items-center',
        // テキストブロック
        'block-text': 'w-full max-w-2xl mb-9 py-6 border-b border-slate-300 flex flex-col items-center text-center space-y-3',
        // スキルグループ
        'skill-group': 'w-full max-w-2xl bg-white border-2 border-black rounded-3xl px-12 py-4 space-y-0',
        // 個別スキル項目
        'skill-item': 'py-5 px-0',
        // 区切り線
        'skill-separator': 'w-full h-0 border-t-2 border-dotted border-slate-700',
        // 既存のクラス
        'lesson': 'flex gap-4 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4',
        'step': 'bg-white border-l-4 border-blue-500 pl-4 py-3 mb-4 shadow-sm'
      };

      const finalClassName = divClassName && classMap[divClassName] 
        ? classMap[divClassName] 
        : divClassName || '';

      return <div className={finalClassName} {...props}>{children}</div>;
    },

    // 見出しのスタイリング
    h2: ({ children, ...props }) => (
      <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900" {...props}>
        {children}
      </h2>
    ),

    h3: ({ children, ...props }) => {
      // セクションタイトル用の特別なスタイリング
      const childrenStr = React.Children.toArray(children).join('');
      if (childrenStr.includes('このチャレンジで伸ばせる力')) {
        return (
          <h3 className="text-2xl font-bold text-black leading-tight" {...props}>
            {children}
          </h3>
        );
      }
      return (
        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800" {...props}>
          {children}
        </h3>
      );
    },

    h4: ({ children, ...props }) => (
      <h4 className="text-lg font-semibold mb-6 text-gray-800" {...props}>
        {children}
      </h4>
    ),

    h5: ({ children, ...props }) => (
      <h5 className="text-base font-semibold mt-3 mb-2 text-gray-700" {...props}>
        {children}
      </h5>
    ),

    // 段落
    p: ({ children, ...props }) => {
      // 絵文字のみの段落の場合の特別な処理
      const childrenStr = React.Children.toArray(children).join('');
      if (childrenStr.trim() === '💪') {
        return (
          <div className="text-sm font-semibold text-slate-900 mb-3" {...props}>
            {children}
          </div>
        );
      }
      return (
        <p className="text-gray-700 leading-relaxed mb-4" {...props}>
          {children}
        </p>
      );
    },

    // リスト
    ul: ({ children, ...props }) => (
      <ul className="list-disc list-outside space-y-2 mb-4 ml-6" {...props}>
        {children}
      </ul>
    ),

    ol: ({ children, ...props }) => (
      <ol className="list-decimal list-outside space-y-2 mb-4 ml-6" {...props}>
        {children}
      </ol>
    ),

    li: ({ children, ...props }) => (
      <li className="text-gray-700 pl-2" {...props}>
        {children}
      </li>
    ),

    // 引用
    blockquote: ({ children, ...props }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4" {...props}>
        {children}
      </blockquote>
    ),

    // 画像
    img: ({ src, alt, title, ...props }) => (
      <img 
        src={src} 
        alt={alt || ''} 
        title={title}
        className="max-w-full h-auto rounded-lg shadow-md my-4" 
        loading="lazy"
        {...props} 
      />
    ),

    // リンク
    a: ({ href, children, ...props }) => (
      <a 
        href={href} 
        className="text-blue-600 hover:text-blue-800 underline"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {children}
      </a>
    ),

    // コード
    code: ({ className, children, ...props }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm" {...props}>
            {children}
          </code>
        );
      }
      return (
        <code className={`${className} block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto`} {...props}>
          {children}
        </code>
      );
    },

    // 水平線
    hr: ({ ...props }) => (
      <hr className="my-8 border-gray-300" {...props} />
    ),
  };

  return (
    <div className={className}>
      <ReactMarkdown 
        components={components}
        rehypePlugins={[rehypeRaw]}
      >
        {displayContent}
      </ReactMarkdown>

      {/* プレミアムバナー */}
      {showBanner && (
        <div className="mt-8 p-6 border-2 border-yellow-400 rounded-lg bg-yellow-50">
          <p className="text-yellow-800 font-semibold flex items-center gap-2">
            <span className="text-2xl">🔒</span>
            続きはメンバー限定コンテンツです
          </p>
          <p className="text-yellow-700 mt-2 text-sm">
            すべてのコンテンツを見るにはメンバー登録が必要です。
          </p>
        </div>
      )}
    </div>
  );
};

export default SimpleMarkdownRenderer;