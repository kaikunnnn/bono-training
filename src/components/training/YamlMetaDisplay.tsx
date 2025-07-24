/**
 * YamlMetaDisplay - YAMLメタデータ表示コンポーネント
 * Phase 4: YAMLメタデータ表示コンポーネントの作成
 * 
 * 新フィールド（icon, thumbnail, type: "portfolio"）の表示対応
 * difficultyは表示しないが型定義では互換性維持
 */

import React from 'react';
import { YamlMetaDisplayProps } from '@/types/training-v2';

const YamlMetaDisplay: React.FC<YamlMetaDisplayProps> = ({ frontmatter }) => {
  // 型マッピング（日本語表示）
  const getTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      'challenge': 'チャレンジ',
      'portfolio': 'ポートフォリオ',
      'skill': 'スキル'
    };
    return typeMap[type] || type;
  };

  // タグの色を取得
  const getTagColor = (tag: string): string => {
    const tagColors: Record<string, string> = {
      'ポートフォリオ': 'bg-purple-100 text-purple-800',
      '情報設計': 'bg-blue-100 text-blue-800',
      'デザイン': 'bg-green-100 text-green-800',
      'UI/UX': 'bg-indigo-100 text-indigo-800',
      'フロントエンド': 'bg-yellow-100 text-yellow-800',
      'バックエンド': 'bg-red-100 text-red-800'
    };
    return tagColors[tag] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
      {/* ヘッダー部分：アイコン、タイトル、説明 */}
      <div className="flex items-start space-x-4 mb-6">
        {/* アイコン */}
        {frontmatter.icon && (
          <div className="flex-shrink-0">
            <img 
              src={frontmatter.icon} 
              alt="Training Icon"
              className="w-16 h-16 rounded-lg shadow-sm"
            />
          </div>
        )}
        
        {/* タイトルと説明 */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 break-words">
            {frontmatter.title}
          </h1>
          <p className="text-gray-600 leading-relaxed">
            {frontmatter.description}
          </p>
        </div>
      </div>

      {/* サムネイル画像 */}
      {frontmatter.thumbnail && (
        <div className="mb-6">
          <img 
            src={frontmatter.thumbnail} 
            alt="Training Thumbnail"
            className="w-full max-w-2xl h-auto rounded-lg border shadow-sm"
          />
        </div>
      )}

      {/* メタデータグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* タイプ */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500 mb-1">タイプ</div>
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {getTypeLabel(frontmatter.type)}
            </span>
          </div>
        </div>

        {/* カテゴリ */}
        {frontmatter.category && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500 mb-1">カテゴリ</div>
            <div className="text-gray-900 font-medium">{frontmatter.category}</div>
          </div>
        )}

        {/* 推定時間 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500 mb-1">推定時間</div>
          <div className="flex items-center text-gray-900 font-medium">
            <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {frontmatter.estimated_total_time}
          </div>
        </div>

        {/* タスク数 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500 mb-1">タスク数</div>
          <div className="flex items-center text-gray-900 font-medium">
            <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            {frontmatter.task_count}個
          </div>
        </div>
      </div>

      {/* タグ表示 */}
      {frontmatter.tags && frontmatter.tags.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-500 mb-3">タグ</div>
          <div className="flex flex-wrap gap-2">
            {frontmatter.tags.map((tag, index) => (
              <span 
                key={index}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTagColor(tag)}`}
              >
                <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default YamlMetaDisplay;