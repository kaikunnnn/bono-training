import React from 'react';
import ReactMarkdown from 'react-markdown';
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
        'skill-group': 'bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 space-y-6',
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

    h3: ({ children, ...props }) => (
      <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800" {...props}>
        {children}
      </h3>
    ),

    h4: ({ children, ...props }) => (
      <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-800" {...props}>
        {children}
      </h4>
    ),

    h5: ({ children, ...props }) => (
      <h5 className="text-base font-semibold mt-3 mb-2 text-gray-700" {...props}>
        {children}
      </h5>
    ),

    // 段落
    p: ({ children, ...props }) => (
      <p className="text-gray-700 leading-relaxed mb-4" {...props}>
        {children}
      </p>
    ),

    // リスト
    ul: ({ children, ...props }) => (
      <ul className="list-disc list-inside space-y-2 mb-4 ml-4" {...props}>
        {children}
      </ul>
    ),

    ol: ({ children, ...props }) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 ml-4" {...props}>
        {children}
      </ol>
    ),

    li: ({ children, ...props }) => (
      <li className="text-gray-700" {...props}>
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
      <ReactMarkdown components={components}>
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