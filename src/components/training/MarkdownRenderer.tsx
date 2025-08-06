
import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import LearningGoals from './LearningGoals';
import SectionCard from './SectionCard';
import PremiumBanner from './PremiumBanner';
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

// マークダウンコンポーネントの定義
const markdownComponents: Components = {
  // 箇条書きスタイリング
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-inside space-y-2 mb-4 ml-4" {...props}>
      {children}
    </ul>
  ),
  li: ({ children, ...props }) => (
    <li className="text-gray-700 leading-relaxed" {...props}>
      {children}
    </li>
  ),
  
  // リンクスタイリング
  a: ({ href, children, ...props }) => (
    <a
      href={href}
      className="text-blue-600 hover:text-blue-800 underline transition-colors"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  ),

  // 見出しスタイリング
  h2: ({ children, ...props }) => (
    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-lg font-medium text-gray-800 mt-4 mb-2" {...props}>
      {children}
    </h4>
  ),

  // 段落スタイリング
  p: ({ children, ...props }) => (
    <p className="text-gray-700 leading-relaxed mb-4" {...props}>
      {children}
    </p>
  ),

  // インラインコードスタイリング
  code: ({ children, ...props }) => (
    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono" {...props}>
      {children}
    </code>
  ),
};

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

  // 各セクションのデータを取得（エラーハンドリング付き）
  let learningGoalsData: SectionData | null = null;
  let procedureData: SectionData | null = null;
  let completionImageData: SectionData | null = null;
  let premiumData: SectionData | null = null;

  try {
    learningGoalsData = parseSection(displayContent, '学習のゴール');
    procedureData = parseSection(displayContent, '手順');
    completionImageData = parseSection(displayContent, '完成イメージ');
    premiumData = parseSection(displayContent, 'プレミアム限定：デザイン改善の実例');
  } catch (error) {
    console.error('セクション解析中にエラーが発生:', error);
  }

  // 処理したセクションを除外したマークダウンを作成
  const processedSections = ['学習のゴール', '手順', '完成イメージ', 'プレミアム限定：デザイン改善の実例'];
  const contentWithoutProcessedSections = removeSections(displayContent, processedSections);

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
