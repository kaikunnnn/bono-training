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

  // ドキュメント仕様に完全準拠したスタイル定義
  const blockStyles: Record<string, string> = {
    // セクション全体
    'section-challenge-merit': 'w-full max-w-2xl mx-auto',
    // ブロックテキスト系（ドキュメント仕様準拠）
    'block-text': 'box-border content-stretch flex flex-col gap-9 items-start justify-start px-4 md:px-0 py-6 relative size-full w-full',
    // ブロックテキストラッパー（中央配置、最大幅472px）
    'block-text-wrapper': 'box-border content-stretch flex flex-col gap-3 items-center justify-start p-0 relative shrink-0 w-full max-w-[472px] mx-auto',
    // 絵文字（Inter Semi Bold、14pxベース、実際は大きく表示）
    'block-text-emoji': 'font-inter font-semibold relative shrink-0 text-center text-slate-900 w-full text-2xl md:text-3xl leading-tight',
    // タイトル（Rounded Mplus 1c Bold、白色、24px、tracking-1px）
    'block-text-title': 'font-rounded-mplus text-black text-xl md:text-[24px] tracking-[1px] leading-[1.6] text-center w-full whitespace-normal md:whitespace-nowrap',
    // 説明文（Inter+Noto Sans JP、16px、line-height: 1.88）
    'block-text-description': 'font-inter font-normal text-[14px] md:text-[16px] text-center text-slate-900 leading-[1.7] md:leading-[1.88] w-full',
    // スキルグループ
    'skill-group': 'w-full max-w-2xl bg-white border-2 border-black rounded-3xl px-12 py-4 space-y-0',
    // スキルアイテム
    'skill-item': 'w-full py-4',
    // スキルセパレーター
    'skill-separator': 'w-full h-px bg-gray-200 my-4',
    // スキル項目のタイトル
    'skill-title': 'text-lg font-bold text-black mb-2'
  };

  // カスタムコンポーネントの定義
  const components: Components = {
    div: ({ children, className, ...props }) => {
      // Block-text-wrapper クラスのハンドリング
      if (className?.includes('block-text-wrapper')) {
        return (
          <div
            className={blockStyles['block-text-wrapper']}
            {...props}
          >
            {children}
          </div>
        );
      }
      
      // Block-text-emoji クラスのハンドリング
      if (className?.includes('block-text-emoji')) {
        return (
          <div className={blockStyles['block-text-emoji']} {...props}>
            {children}
          </div>
        );
      }
      
      // Block-text クラスのハンドリング
      if (className?.includes('block-text')) {
        return (
          <div
            className={blockStyles['block-text']}
            data-name="block-text"
            {...props}
          >
            {children}
          </div>
        );
      }
      
      // その他のdivクラスのハンドリング
      const style = blockStyles[className || ''] || className || '';
      return (
        <div className={style} {...props}>
          {children}
        </div>
      );
    },

    h2: ({ children, className, ...props }) => {
      // Block-text-title のスタイル適用
      if (className?.includes('block-text-title')) {
        return (
          <h2 className={`${blockStyles['block-text-title']} adjustLetterSpacing`} {...props}>
            {children}
          </h2>
        );
      }
      
      return (
        <h2 className="text-2xl font-bold text-training-text-primary mb-4" {...props}>
          {children}
        </h2>
      );
    },

    h3: ({ children, ...props }) => {
      return (
        <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-800" {...props}>
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

    p: ({ children, className, ...props }) => {
      // Block-text-description のスタイル適用
      if (className?.includes('block-text-description')) {
        return (
          <p className={blockStyles['block-text-description']} {...props}>
            {children}
          </p>
        );
      }
      
      // 絵文字のpタグの特別処理
      if (typeof children === 'string' && children.match(/^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u)) {
        return (
          <p 
            className="block text-2xl md:text-3xl leading-tight" 
            role="img" 
            aria-label="力こぶ"
            {...props}
          >
            {children}
          </p>
        );
      }
      
      return (
        <p className="text-gray-700 mb-4 leading-relaxed" {...props}>
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