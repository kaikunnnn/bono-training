import React from 'react';
import { Clock, Tag, Hash, Book, Image } from 'lucide-react';

interface YamlMetaDisplayProps {
  title: string;
  description?: string;
  type?: string;
  tags?: string[];
  estimated_total_time?: string;
  task_count?: number;
  category?: string;
  thumbnailImage?: string;
  className?: string;
}

/**
 * YAMLメタデータ表示コンポーネント
 * difficultyフィールドは表示しない
 */
const YamlMetaDisplay: React.FC<YamlMetaDisplayProps> = ({
  title,
  description,
  type,
  tags,
  estimated_total_time,
  task_count,
  category,
  thumbnailImage,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${className}`}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">トレーニング情報</h2>
        <div className="h-px bg-gray-200"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* タイトル */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <Book className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">タイトル</span>
          </div>
          <p className="text-gray-800 font-medium">{title}</p>
        </div>

        {/* 説明 */}
        {description && (
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600">説明</span>
            </div>
            <p className="text-gray-700">{description}</p>
          </div>
        )}

        {/* タイプ */}
        {type && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">タイプ</span>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              type === 'challenge' 
                ? 'bg-orange-100 text-orange-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {type === 'challenge' ? 'チャレンジ' : 'スキル'}
            </span>
          </div>
        )}

        {/* 推定時間 */}
        {estimated_total_time && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">推定時間</span>
            </div>
            <p className="text-gray-800">{estimated_total_time}</p>
          </div>
        )}

        {/* タスク数 */}
        {task_count && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600">タスク数</span>
            </div>
            <p className="text-gray-800">{task_count} タスク</p>
          </div>
        )}

        {/* カテゴリ */}
        {category && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600">カテゴリ</span>
            </div>
            <p className="text-gray-800">{category}</p>
          </div>
        )}

        {/* サムネイル */}
        {thumbnailImage && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">サムネイル</span>
            </div>
            <div className="mt-2">
              <img 
                src={thumbnailImage} 
                alt="トレーニングサムネイル" 
                className="w-full max-w-xs h-auto rounded-lg shadow-sm"
              />
            </div>
          </div>
        )}

        {/* タグ */}
        {tags && tags.length > 0 && (
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-gray-600">タグ</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YamlMetaDisplay;