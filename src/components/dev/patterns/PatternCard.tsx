/**
 * PatternCard - 各UIパターンを表示するカードコンポーネント
 * プロジェクトのデザインシステムに準拠したスタイリング
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export interface PatternData {
  id: string;
  number: number;
  title: string;
  description: string;
  reference: string;
  category: 'entry' | 'progress' | 'action';
  icon: React.ReactNode;
  preview?: React.ReactNode;
  details?: string[];
}

interface PatternCardProps {
  pattern: PatternData;
}

const categoryColors = {
  entry: {
    bg: 'bg-gradient-to-br from-[#f0f4ff] to-[#e8edff]',
    border: 'border-[#c7d2fe]',
    badge: 'bg-[#e0e7ff] text-[#4338ca]',
    icon: 'bg-white text-[#4f46e5] shadow-sm',
  },
  progress: {
    bg: 'bg-gradient-to-br from-[#ecfdf5] to-[#d1fae5]',
    border: 'border-[#a7f3d0]',
    badge: 'bg-[#d1fae5] text-[#047857]',
    icon: 'bg-white text-[#059669] shadow-sm',
  },
  action: {
    bg: 'bg-gradient-to-br from-[#faf5ff] to-[#f3e8ff]',
    border: 'border-[#e9d5ff]',
    badge: 'bg-[#f3e8ff] text-[#7c3aed]',
    icon: 'bg-white text-[#8b5cf6] shadow-sm',
  },
};

const categoryLabels = {
  entry: '入口設計',
  progress: '進行中ガイド',
  action: '出口+全体',
};

const PatternCard: React.FC<PatternCardProps> = ({ pattern }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = categoryColors[pattern.category];

  return (
    <div
      className={`bg-white rounded-2xl border ${colors.border} overflow-hidden hover:shadow-xl transition-all duration-300`}
    >
      <div className="flex">
        {/* Preview Area */}
        <div
          className={`w-28 sm:w-36 flex-shrink-0 ${colors.bg} flex items-center justify-center p-5`}
        >
          <div
            className={`w-14 h-14 rounded-xl ${colors.icon} flex items-center justify-center`}
          >
            {pattern.icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {/* Badge */}
              <span
                className={`inline-block text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full ${colors.badge} mb-3`}
              >
                {categoryLabels[pattern.category]}
              </span>

              {/* Title */}
              <h3 className="text-lg font-bold text-lesson-quest-title font-rounded-mplus mb-1.5">
                Pattern {pattern.number}: {pattern.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-lesson-quest-detail leading-relaxed mb-2.5">
                {pattern.description}
              </p>

              {/* Reference */}
              <p className="text-xs text-lesson-quest-meta flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" />
                参考: {pattern.reference}
              </p>
            </div>

            {/* Expand Button */}
            {(pattern.preview || pattern.details) && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2.5 text-lesson-quest-meta hover:text-lesson-quest-title hover:bg-lesson-overview-checkbox-bg rounded-xl transition-all duration-200"
                aria-label={isExpanded ? '詳細を閉じる' : '詳細を表示'}
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (pattern.preview || pattern.details) && (
        <div className="border-t border-lesson-quest-border p-5 sm:p-6 bg-lesson-overview-checkbox-bg">
          {/* Preview */}
          {pattern.preview && (
            <div className="mb-5">
              <h4 className="text-xs font-bold text-lesson-quest-title tracking-wide uppercase mb-3">
                プレビュー
              </h4>
              <div className="bg-white rounded-xl border border-lesson-quest-border p-5 overflow-hidden shadow-sm">
                {pattern.preview}
              </div>
            </div>
          )}

          {/* Details */}
          {pattern.details && pattern.details.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-lesson-quest-title tracking-wide uppercase mb-3">
                実装詳細
              </h4>
              <ul className="space-y-2">
                {pattern.details.map((detail, index) => (
                  <li
                    key={index}
                    className="text-sm text-lesson-quest-detail flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-lesson-quest-meta mt-2 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatternCard;
