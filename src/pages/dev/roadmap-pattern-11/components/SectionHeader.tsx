/**
 * SectionHeader - セクション見出しコンポーネント
 * 黒いドット + タイトル
 */
import React from 'react';

interface SectionHeaderProps {
  title: string;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-4 py-4 ${className}`}>
      <div className="w-3 h-3 bg-slate-900 rounded-full flex-shrink-0" />
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    </div>
  );
};

export default SectionHeader;
