
import React from 'react';
import { Award, Star, BookOpen, Target, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';

type BadgeType = 'beginner' | 'intermediate' | 'advanced' | 'master' | 'expert';

interface AchievementBadgeProps {
  type: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

/**
 * 達成バッジコンポーネント
 * トレーニングや課題の達成時に表示する視覚的な報酬
 */
const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  type,
  size = 'md',
  animated = false,
  className
}) => {
  // バッジタイプごとの設定
  const badgeConfig = {
    beginner: {
      icon: BookOpen,
      label: 'ビギナー',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-700 dark:text-blue-400',
      borderColor: 'border-blue-300 dark:border-blue-700',
      iconColor: 'text-blue-500'
    },
    intermediate: {
      icon: Target,
      label: '中級者',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-400',
      borderColor: 'border-green-300 dark:border-green-700',
      iconColor: 'text-green-500'
    },
    advanced: {
      icon: Star,
      label: '上級者',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      textColor: 'text-amber-700 dark:text-amber-400',
      borderColor: 'border-amber-300 dark:border-amber-700',
      iconColor: 'text-amber-500'
    },
    master: {
      icon: Gem,
      label: 'マスター',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      textColor: 'text-purple-700 dark:text-purple-400',
      borderColor: 'border-purple-300 dark:border-purple-700',
      iconColor: 'text-purple-500'
    },
    expert: {
      icon: Award,
      label: 'エキスパート',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-700 dark:text-red-400',
      borderColor: 'border-red-300 dark:border-red-700',
      iconColor: 'text-red-500'
    }
  };
  
  const config = badgeConfig[type];
  const Icon = config.icon;
  
  // サイズに基づくスタイル設定
  const sizeClasses = {
    sm: 'text-xs p-1.5 rounded-md',
    md: 'text-sm p-2 rounded-lg',
    lg: 'text-base p-3 rounded-lg'
  };
  
  // アイコンサイズの設定
  const iconSize = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  return (
    <div 
      className={cn(
        'flex items-center gap-1.5 border shadow-sm transition-all',
        config.bgColor,
        config.textColor,
        config.borderColor,
        sizeClasses[size],
        animated && 'hover:scale-105 hover:shadow-md',
        className
      )}
    >
      <Icon className={cn(config.iconColor, iconSize[size])} />
      <span className="font-medium">{config.label}</span>
    </div>
  );
};

export default AchievementBadge;
