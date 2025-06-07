
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import LearningGoals from './LearningGoals';
import SectionCard from './SectionCard';
import PremiumBanner from './PremiumBanner';

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
 * プレミアムコンテンツの分割処理
 */
const getDisplayContent = (
  content: string,
  isPremium: boolean,
  hasMemberAccess: boolean,
  marker: string = '<!-- PREMIUM_ONLY -->'
): { content: string; showBanner: boolean } => {
  // 無料コンテンツまたはプレミアムアクセスがある場合は全文表示
  if (!isPremium || hasMemberAccess) {
    return { content, showBanner: false };
  }

  // プレミアムコンテンツかつアクセス権がない場合
  if (content.includes(marker)) {
    const [freeContent] = content.split(marker);
    return { content: freeContent.trim(), showBanner: true };
  }

  // マーカーがない場合は全文表示してバナーも表示
  return { content, showBanner: true };
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
  // プレミアムコンテンツの分割処理
  const { content: displayContent, showBanner } = getDisplayContent(
    content,
    isPremium,
    hasMemberAccess
  );

  // 汎用的なセクション解析関数
  const parseSection = (markdown: string, sectionTitle: string): SectionData | null => {
    const escapedTitle = sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const sectionRegex = new RegExp(`## ${escapedTitle}\\s*\\n\\n?(.*?)(?=\\n##|\\n---|\\n\\n##|$)`, 's');
    const match = markdown.match(sectionRegex);
    
    if (!match) return null;
    
    const sectionContent = match[1].trim();
    const lines = sectionContent.split('\n').filter(line => line.trim());
    
    let description = '';
    const items: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.match(/^\d+\.\s/)) {
        // 番号付きリスト（例: "1. ..."）
        items.push(trimmedLine.replace(/^\d+\.\s/, ''));
      } else if (trimmedLine.startsWith('- ')) {
        // 箇条書きリスト
        items.push(trimmedLine.substring(2));
      } else if (trimmedLine && !trimmedLine.startsWith('#')) {
        description = trimmedLine;
      }
    }
    
    return { description: description || undefined, items };
  };

  // 処理済みセクションをマークダウンから除去する関数
  const removeSections = (markdown: string, sectionTitles: string[]): string => {
    let result = markdown;
    sectionTitles.forEach(title => {
      const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`## ${escapedTitle}\\s*\\n\\n?(.*?)(?=\\n##|\\n---|\\n\\n##|$)`, 's');
      result = result.replace(regex, '');
    });
    return result;
  };

  // 各セクションのデータを取得
  const learningGoalsData = parseSection(displayContent, '学習のゴール');
  const procedureData = parseSection(displayContent, '手順');
  const completionImageData = parseSection(displayContent, '完成イメージ');
  const premiumData = parseSection(displayContent, 'プレミアム限定：デザイン改善の実例');

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
        >
          {contentWithoutProcessedSections}
        </ReactMarkdown>
      </article>

      {/* プレミアムバナー */}
      {showBanner && (
        <div className="mt-8">
          <PremiumBanner />
        </div>
      )}
    </div>
  );
};

export default MarkdownRenderer;
