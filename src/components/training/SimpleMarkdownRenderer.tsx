/**
 * SimpleMarkdownRenderer - 新しいマークダウンレンダリングシステム
 * Phase 3: ReactMarkdownベースのレンダラー作成
 * 
 * 複雑な旧パーサーを置き換えるシンプルなReactMarkdownベースのシステム
 * <div class="skill-group">, <div class="lesson">, <div class="step"> 対応
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { getDisplayContent } from '@/lib/content-splitter';
import { SimpleMarkdownRendererProps } from '@/types/training-v2';

const SimpleMarkdownRenderer: React.FC<SimpleMarkdownRendererProps> = ({
  content,
  className,
  isPremium = false,
  hasMemberAccess = false
}) => {
  // 入力検証
  if (!content || typeof content !== 'string') {
    console.warn('SimpleMarkdownRenderer: 無効なコンテンツが渡されました');
    return (
      <div className={className}>
        <p className="text-gray-500">コンテンツが利用できません。</p>
      </div>
    );
  }

  // プレミアムコンテンツ分割処理
  const { content: displayContent, showBanner } = getDisplayContent(
    content,
    isPremium,
    hasMemberAccess
  );

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // divコンポーネント - メインのカスタムクラス処理
          div: ({ className: divClassName, children, ...props }) => {
            const styleMap: Record<string, string> = {
              'skill-group': 'bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6',
              'lesson': 'bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-4',
              'step': 'relative bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 rounded-r-lg p-5 mb-4'
            };

            const finalClassName = divClassName ? 
              (styleMap[divClassName] || divClassName) : 
              undefined;

            return (
              <div className={finalClassName} {...props}>
                {children}
              </div>
            );
          },

          // 見出し要素のスタイリング
          h1: ({ children, ...props }) => (
            <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-500" {...props}>
              {children}
            </h1>
          ),

          h2: ({ children, ...props }) => (
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-500" {...props}>
              {children}
            </h2>
          ),

          h3: ({ children, node, ...props }) => {
            // skill-group内のh3は特別なスタイル（■マーク付き）
            const parentDiv = node?.parent;
            const isInSkillGroup = parentDiv?.type === 'element' && 
              parentDiv.tagName === 'div' && 
              parentDiv.properties?.className?.includes('skill-group');

            if (isInSkillGroup) {
              return (
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center" {...props}>
                  <span className="text-blue-600 mr-2 text-xl">■</span>
                  {children}
                </h3>
              );
            }

            return (
              <h3 className="text-xl font-semibold text-gray-800 mb-4" {...props}>
                {children}
              </h3>
            );
          },

          h4: ({ children, ...props }) => (
            <h4 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100" {...props}>
              {children}
            </h4>
          ),

          h5: ({ children, node, ...props }) => {
            // step内のh5は特別なスタイル（ステップ番号付き）
            const parentDiv = node?.parent;
            const isInStep = parentDiv?.type === 'element' && 
              parentDiv.tagName === 'div' && 
              parentDiv.properties?.className?.includes('step');

            if (isInStep) {
              // ステップ番号を抽出（例：「ステップ 1:」から「1」を取得）
              const stepText = React.Children.toArray(children).join('');
              const stepMatch = stepText.match(/ステップ\s*(\d+)/);
              const stepNumber = stepMatch ? stepMatch[1] : '?';

              return (
                <h5 className="text-lg font-bold text-indigo-800 mb-3 flex items-center" {...props}>
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-500 text-white rounded-full text-sm font-bold mr-3">
                    {stepNumber}
                  </span>
                  {children}
                </h5>
              );
            }

            return (
              <h5 className="text-base font-medium text-gray-700 mb-2" {...props}>
                {children}
              </h5>
            );
          },

          // リスト要素
          ul: ({ children, node, ...props }) => {
            // skill-group内のulは特別なスタイル（■マーク付きリスト）
            const parentDiv = node?.parent;
            const isInSkillGroup = parentDiv?.type === 'element' && 
              parentDiv.tagName === 'div' && 
              parentDiv.properties?.className?.includes('skill-group');

            if (isInSkillGroup) {
              return (
                <ul className="space-y-2" {...props}>
                  {children}
                </ul>
              );
            }

            return (
              <ul className="list-disc list-inside space-y-1 ml-4" {...props}>
                {children}
              </ul>
            );
          },

          li: ({ children, node, ...props }) => {
            // skill-group内のliは特別なスタイル
            const parentUl = node?.parent;
            const grandparentDiv = parentUl?.parent;
            const isInSkillGroup = grandparentDiv?.type === 'element' && 
              grandparentDiv.tagName === 'div' && 
              grandparentDiv.properties?.className?.includes('skill-group');

            if (isInSkillGroup) {
              return (
                <li className="flex items-start text-gray-700" {...props}>
                  <span className="text-blue-500 mr-3 mt-1 text-sm flex-shrink-0">■</span>
                  <span>{children}</span>
                </li>
              );
            }

            return (
              <li className="text-gray-600" {...props}>
                {children}
              </li>
            );
          },

          // パラグラフ
          p: ({ children, node, ...props }) => {
            // step内のpは特別なスタイル
            const parentDiv = node?.parent;
            const isInStep = parentDiv?.type === 'element' && 
              parentDiv.tagName === 'div' && 
              parentDiv.properties?.className?.includes('step');

            if (isInStep) {
              return (
                <p className="text-gray-700 leading-relaxed pl-11" {...props}>
                  {children}
                </p>
              );
            }

            // lesson内のpは特別なスタイル
            const isInLesson = parentDiv?.type === 'element' && 
              parentDiv.tagName === 'div' && 
              parentDiv.properties?.className?.includes('lesson');

            if (isInLesson) {
              return (
                <p className="text-gray-600 leading-relaxed mb-3 last:mb-0" {...props}>
                  {children}
                </p>
              );
            }

            return (
              <p className="text-gray-700 leading-relaxed mb-4" {...props}>
                {children}
              </p>
            );
          },

          // 引用
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 py-2 my-4 bg-gray-50 italic text-gray-600" {...props}>
              {children}
            </blockquote>
          ),

          // 画像
          img: ({ src, alt, ...props }) => (
            <img 
              src={src} 
              alt={alt}
              className="max-w-full h-auto rounded border my-4 shadow-sm" 
              {...props} 
            />
          ),

          // リンク
          a: ({ href, children, ...props }) => (
            <a 
              href={href} 
              className="text-blue-600 hover:text-blue-800 underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),

          // コードブロック
          pre: ({ children, ...props }) => (
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4" {...props}>
              {children}
            </pre>
          ),

          // インラインコード
          code: ({ children, className, ...props }) => {
            // ブロックコードかインラインコードかを判定
            const isInlineCode = !className?.includes('language-');
            
            if (isInlineCode) {
              return (
                <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {displayContent}
      </ReactMarkdown>

      {/* プレミアムバナー */}
      {showBanner && (
        <div className="mt-8 p-4 border border-yellow-300 rounded-lg bg-yellow-50">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🔒</span>
            <div>
              <p className="text-yellow-800 font-medium">続きはメンバー限定コンテンツです</p>
              <p className="text-yellow-700 text-sm mt-1">
                すべてのコンテンツにアクセスするには、メンバーシップにご登録ください。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMarkdownRenderer;