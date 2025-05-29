
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import LearningGoals from './LearningGoals';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * マークダウンをレンダリングし、特定のセクションをカスタムコンポーネントに置き換える
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className 
}) => {
  // 学習のゴールセクションを検出してパースする
  const parseLearningGoals = (markdown: string) => {
    const goalsSectionRegex = /## 学習のゴール\s*\n\n?(.*?)(?=\n##|\n---|\n\n##|$)/s;
    const match = markdown.match(goalsSectionRegex);
    
    if (!match) return null;
    
    const goalsContent = match[1].trim();
    const lines = goalsContent.split('\n').filter(line => line.trim());
    
    let description = '';
    const goals: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('- ')) {
        goals.push(trimmedLine.substring(2));
      } else if (trimmedLine && !trimmedLine.startsWith('#')) {
        description = trimmedLine;
      }
    }
    
    return { description: description || undefined, goals };
  };

  // 学習のゴールセクションを除外したマークダウンを作成
  const removeLearningGoalsSection = (markdown: string) => {
    return markdown.replace(/## 学習のゴール\s*\n\n?(.*?)(?=\n##|\n---|\n\n##|$)/s, '');
  };

  const learningGoalsData = parseLearningGoals(content);
  const contentWithoutGoals = removeLearningGoalsSection(content);

  return (
    <div className={className}>
      {/* 学習のゴールコンポーネント */}
      {learningGoalsData && learningGoalsData.goals.length > 0 && (
        <div className="mb-8">
          <LearningGoals 
            description={learningGoalsData.description}
            goals={learningGoalsData.goals}
          />
        </div>
      )}

      {/* 残りのマークダウンコンテンツ */}
      <article className="prose prose-lg max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {contentWithoutGoals}
        </ReactMarkdown>
      </article>
    </div>
  );
};

export default MarkdownRenderer;
