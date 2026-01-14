/**
 * カスタムコンポーネントレジストリ
 * プロジェクト固有のコンポーネント一覧
 */

import React from 'react';
import DottedSeparator from '@/components/common/DottedSeparator';
import CategoryBadge from '@/components/guide/CategoryBadge';
import { IconButton } from '@/components/ui/button/IconButton';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressLesson, CompletedLessonCard } from '@/components/progress';
import { User, Settings, Heart } from 'lucide-react';
import type { ComponentInfo } from '@/types/dev';

export const CUSTOM_COMPONENTS: Record<string, ComponentInfo[]> = {
  Button: [
    {
      name: 'IconButton',
      category: 'Button',
      description: 'アイコン付きボタン/リンクコンポーネント（マイページのプロフィールボタンなどで使用）',
      example: (
        <div className="flex gap-4 flex-wrap">
          <IconButton
            to="/profile"
            icon={<User size={14} color="#020817" />}
            label="プロフィール"
          />
          <IconButton
            to="/settings"
            icon={<Settings size={14} color="#020817" />}
            label="設定"
          />
          <IconButton
            onClick={() => alert('Clicked!')}
            icon={<Heart size={14} color="#020817" />}
            label="お気に入り"
          />
        </div>
      ),
      path: '@/components/ui/button/IconButton',
    },
  ],

  Pattern: [
    {
      name: 'EmptyState',
      category: 'Pattern',
      description: '空状態表示パターン（マイページの「進行中がない」「お気に入りがない」などで使用）',
      example: (
        <div className="flex flex-col gap-4 w-full">
          <EmptyState
            message={<>デザインスキルの獲得を<br />はじめよう</>}
            linkHref="/lessons"
            linkLabel="身につけるレッスンを探す"
          />
          <EmptyState
            message={<>記事をお気に入りすると<br />こちらに表示されます</>}
          />
        </div>
      ),
      path: '@/components/ui/empty-state',
    },
  ],

  Progress: [
    {
      name: 'ProgressLesson',
      category: 'Progress',
      description: '進行中レッスンカード（プログレスバー付き）',
      example: (
        <div className="flex flex-col gap-4 w-full max-w-md">
          <ProgressLesson
            title="UIデザイン基礎"
            progress={45}
            currentStep="レイアウトの基本"
            iconImageUrl="https://via.placeholder.com/48x73"
            onCardClick={() => alert('Card clicked')}
          />
          <ProgressLesson
            title="UIデザイン応用"
            progress={100}
            currentStep="完了"
            iconImageUrl="https://via.placeholder.com/48x73"
            showCompleteButton={true}
            onCompleteClick={() => alert('Complete clicked')}
          />
        </div>
      ),
      path: '@/components/progress/ProgressLesson',
    },
    {
      name: 'CompletedLessonCard',
      category: 'Progress',
      description: '完了済みレッスンカード',
      example: (
        <div className="w-full max-w-md">
          <CompletedLessonCard
            title="UIデザイン基礎"
            iconImageUrl="https://via.placeholder.com/48x73"
            lessonSlug="ui-design-basics"
          />
        </div>
      ),
      path: '@/components/progress/CompletedLessonCard',
    },
  ],

  Common: [
    {
      name: 'DottedSeparator',
      category: 'Common',
      description: 'Dotted line separator for visual division',
      example: (
        <div className="w-full">
          <p className="mb-2">Content above</p>
          <DottedSeparator />
          <p className="mt-2">Content below</p>
        </div>
      ),
      path: '@/components/common/DottedSeparator',
    },
  ],

  Guide: [
    {
      name: 'CategoryBadge',
      category: 'Guide',
      description: 'Category badge for guide articles with dynamic icons',
      example: (
        <div className="flex gap-2 flex-wrap">
          <CategoryBadge category="career" />
          <CategoryBadge category="learning" />
          <CategoryBadge category="industry" />
          <CategoryBadge category="tools" />
        </div>
      ),
      path: '@/components/guide/CategoryBadge',
    },
  ],

  Training: [
    {
      name: 'CategoryTag',
      category: 'Training',
      description: 'Category tag for training content',
      example: (
        <div className="flex gap-2 flex-wrap">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
            UI/UX
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
            フロントエンド
          </span>
        </div>
      ),
      path: '@/components/training/CategoryTag',
    },
  ],
};
