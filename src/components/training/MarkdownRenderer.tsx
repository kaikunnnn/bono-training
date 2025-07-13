
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import LearningGoals from './LearningGoals';
import SectionCard from './SectionCard';
import PremiumBanner from './PremiumBanner';
import DesignAnswerSection from './DesignAnswerSection';
import { getDisplayContent } from '@/lib/content-splitter';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isPremium?: boolean;
  hasMemberAccess?: boolean;
}

interface SectionData {
  description?: string;
  items: string[];
}

/**
 * マークダウンをレンダリングし、特定のセクションをカスタムコンポーネントに置き換える
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className,
  isPremium = false,
  hasMemberAccess = false
}) => {
  // 入力検証
  if (!content || typeof content !== 'string') {
    console.warn('MarkdownRenderer: 無効なコンテンツが渡されました');
    return (
      <div className={className}>
        <p className="text-gray-500">コンテンツが利用できません。</p>
      </div>
    );
  }

  // デバッグログを強化
  console.log('MarkdownRenderer - レンダリング開始:', {
    isPremium,
    hasMemberAccess,
    contentLength: content.length,
    shouldShowBanner: isPremium && !hasMemberAccess
  });

  // コンテンツ分割処理（エラーハンドリング強化版）
  const { content: displayContent, showBanner } = getDisplayContent(
    content,
    isPremium,
    hasMemberAccess
  );

  // プレミアムバナー表示時のログ（JSX外で実行）
  if (showBanner) {
    console.log('MarkdownRenderer - PremiumBanner表示:', { isPremium, hasMemberAccess });
  }

  // 汎用的なセクション解析関数（エラーハンドリング強化）
  const parseSection = (markdown: string, sectionTitle: string): SectionData | null => {
    try {
      if (!markdown || !sectionTitle) return null;
      
      const escapedTitle = sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const sectionRegex = new RegExp(`## ${escapedTitle}\\s*\\n\\n?(.*?)(?=\\n##|\\n---|\\n\\n##|$)`, 's');
      const match = markdown.match(sectionRegex);
      
      if (!match) return null;
      
      const sectionContent = match[1]?.trim();
      if (!sectionContent) return null;
      
      const lines = sectionContent.split('\n').filter(line => line.trim());
      
      let description = '';
      const items: string[] = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.match(/^\d+\.\s/)) {
          items.push(trimmedLine.replace(/^\d+\.\s/, ''));
        } else if (trimmedLine.startsWith('- ')) {
          items.push(trimmedLine.substring(2));
        } else if (trimmedLine && !trimmedLine.startsWith('#')) {
          description = trimmedLine;
        }
      }
      
      return { description: description || undefined, items };
    } catch (error) {
      console.error(`parseSection エラー (${sectionTitle}):`, error);
      return null;
    }
  };

  // 処理済みセクションをマークダウンから除去する関数（エラーハンドリング強化）
  const removeSections = (markdown: string, sectionTitles: string[]): string => {
    try {
      let result = markdown;
      sectionTitles.forEach(title => {
        const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`## ${escapedTitle}\\s*\\n\\n?(.*?)(?=\\n##|\\n---|\\n\\n##|$)`, 's');
        result = result.replace(regex, '');
      });
      return result;
    } catch (error) {
      console.error('removeSections エラー:', error);
      return markdown; // エラー時は元のマークダウンを返す
    }
  };

  // カスタムマーカーセクションの解析関数
  const parseCustomSection = (markdown: string, markerName: string): { content: string; cleanedMarkdown: string } => {
    try {
      const startMarker = `<!-- ${markerName}_START -->`;
      const endMarker = `<!-- ${markerName}_END -->`;
      
      const startIndex = markdown.indexOf(startMarker);
      if (startIndex === -1) {
        return { content: '', cleanedMarkdown: markdown };
      }
      
      const endIndex = markdown.indexOf(endMarker, startIndex);
      if (endIndex === -1) {
        console.warn(`カスタムマーカー "${markerName}" の終了マーカーが見つかりません`);
        return { content: '', cleanedMarkdown: markdown };
      }
      
      const content = markdown.substring(startIndex + startMarker.length, endIndex).trim();
      const cleanedMarkdown = markdown.substring(0, startIndex) + markdown.substring(endIndex + endMarker.length);
      
      return { content, cleanedMarkdown };
    } catch (error) {
      console.error(`カスタムマーカー解析エラー (${markerName}):`, error);
      return { content: '', cleanedMarkdown: markdown };
    }
  };

  // 各セクションのデータを取得（エラーハンドリング付き）
  let learningGoalsData: SectionData | null = null;
  let procedureData: SectionData | null = null;
  let completionImageData: SectionData | null = null;
  let premiumData: SectionData | null = null;
  let designAnswerContent: string = '';

  try {
    learningGoalsData = parseSection(displayContent, '学習のゴール');
    procedureData = parseSection(displayContent, '手順');
    completionImageData = parseSection(displayContent, '完成イメージ');
    premiumData = parseSection(displayContent, 'プレミアム限定：デザイン改善の実例');
    
    // カスタムマーカーでのデザイン解答例セクションを解析
    const { content: customDesignContent, cleanedMarkdown: afterCustomParsing } = parseCustomSection(displayContent, 'DESIGN_ANSWER');
    designAnswerContent = customDesignContent;
  } catch (error) {
    console.error('セクション解析中にエラーが発生:', error);
  }

  // HTMLコメントを削除する関数
  const removeHtmlComments = (markdown: string): string => {
    try {
      // HTML コメント（<!-- -->）を削除
      return markdown.replace(/<!--[\s\S]*?-->/g, '');
    } catch (error) {
      console.error('HTMLコメント削除エラー:', error);
      return markdown;
    }
  };

  // カスタムマーカーの処理後のコンテンツを取得
  const { cleanedMarkdown: afterCustomParsing } = parseCustomSection(displayContent, 'DESIGN_ANSWER');
  
  // 処理したセクションを除外したマークダウンを作成
  const processedSections = ['学習のゴール', '手順', '完成イメージ', 'プレミアム限定：デザイン改善の実例'];
  const contentWithoutProcessedSections = removeHtmlComments(removeSections(afterCustomParsing, processedSections));

  // カスタム Markdown コンポーネント
  const markdownComponents = {
    // 見出し拡張（h2-h6対応）
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-bold text-slate-800 mb-4 mt-8 border-b border-gray-200 pb-2">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-lg font-medium text-slate-700 mb-2 mt-5">
        {children}
      </h4>
    ),
    h5: ({ children }: any) => (
      <h5 className="text-base font-medium text-slate-600 mb-2 mt-4">
        {children}
      </h5>
    ),
    h6: ({ children }: any) => (
      <h6 className="text-sm font-medium text-slate-500 mb-1 mt-3">
        {children}
      </h6>
    ),

    // 引用
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-200 bg-blue-50 p-4 my-4 italic text-slate-700 rounded-r-lg">
        {children}
      </blockquote>
    ),

    // 画像
    img: ({ src, alt }: any) => (
      <img
        src={src}
        alt={alt || ''}
        className="max-w-full h-auto rounded-lg shadow-md my-4 mx-auto"
      />
    ),

    // リンク
    a: ({ href, children }: any) => (
      <a
        href={href}
        className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),

    // パラグラフ
    p: ({ children }: any) => (
      <p className="text-gray-700 leading-relaxed mb-4">
        {children}
      </p>
    ),

    // リスト
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1">
        {children}
      </ol>
    ),

    // コードブロック
    code: ({ children, className }: any) => (
      <code className={`${className} bg-gray-100 px-2 py-1 rounded text-sm font-mono`}>
        {children}
      </code>
    ),
    pre: ({ children }: any) => (
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4">
        {children}
      </pre>
    ),
  };

  return (
    <div className={className}>
      {/* 学習のゴールコンポーネント */}
      {learningGoalsData && learningGoalsData.items.length > 0 && (
        <div className="mb-8">
          <LearningGoals 
            description={learningGoalsData.description}
            goals={learningGoalsData.items}
          />
        </div>
      )}

      {/* 手順セクション */}
      {procedureData && procedureData.items.length > 0 && (
        <div className="mb-8">
          <SectionCard
            title="手順"
            description={procedureData.description}
            items={procedureData.items}
            isNumbered={true}
          />
        </div>
      )}

      {/* 完成イメージセクション */}
      {completionImageData && completionImageData.items.length > 0 && (
        <div className="mb-8">
          <SectionCard
            title="完成イメージ"
            description={completionImageData.description}
            items={completionImageData.items}
            isNumbered={false}
          />
        </div>
      )}

      {/* プレミアム限定セクション */}
      {premiumData && premiumData.items.length > 0 && (
        <div className="mb-8">
          <SectionCard
            title="プレミアム限定：デザイン改善の実例"
            description={premiumData.description}
            items={premiumData.items}
            isNumbered={false}
            variant="premium"
          />
        </div>
      )}

      {/* カスタムマーカーによるデザイン解答例セクション */}
      {designAnswerContent && (
        <div className="mb-8">
          <DesignAnswerSection content={designAnswerContent} />
        </div>
      )}

      {/* 残りのマークダウンコンテンツ */}
      <article className="prose prose-lg max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={markdownComponents}
        >
          {contentWithoutProcessedSections}
        </ReactMarkdown>
      </article>

      {/* プレミアムバナー - 強化されたロジック */}
      {showBanner && (
        <div className="mt-8">
          <PremiumBanner />
        </div>
      )}
    </div>
  );
};

export default MarkdownRenderer;
