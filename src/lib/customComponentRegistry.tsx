/**
 * カスタムコンポーネントレジストリ
 * プロジェクト固有のコンポーネント一覧
 */

import React from 'react';
import DottedSeparator from '@/components/common/DottedSeparator';
import CategoryBadge from '@/components/guide/CategoryBadge';
import type { ComponentInfo } from '@/types/dev';

export const CUSTOM_COMPONENTS: Record<string, ComponentInfo[]> = {
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
