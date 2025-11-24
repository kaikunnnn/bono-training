/**
 * カラーパレット定義
 * index.cssとtailwind.config.tsから抽出
 */

import type { ColorDefinition } from '@/types/dev';

/**
 * テーマカラー (Light Mode)
 */
export const THEME_COLORS_LIGHT: ColorDefinition[] = [
  {
    name: 'background',
    cssVar: '--background',
    value: '0 0% 100%',
    category: 'theme',
    description: 'Default background color',
  },
  {
    name: 'foreground',
    cssVar: '--foreground',
    value: '222.2 84% 4.9%',
    category: 'theme',
    description: 'Default text color',
  },
  {
    name: 'card',
    cssVar: '--card',
    value: '0 0% 100%',
    category: 'theme',
    description: 'Card background',
  },
  {
    name: 'card-foreground',
    cssVar: '--card-foreground',
    value: '222.2 84% 4.9%',
    category: 'theme',
    description: 'Card text color',
  },
  {
    name: 'popover',
    cssVar: '--popover',
    value: '0 0% 100%',
    category: 'theme',
    description: 'Popover background',
  },
  {
    name: 'popover-foreground',
    cssVar: '--popover-foreground',
    value: '222.2 84% 4.9%',
    category: 'theme',
    description: 'Popover text color',
  },
  {
    name: 'primary',
    cssVar: '--primary',
    value: '222.2 47.4% 11.2%',
    category: 'theme',
    description: 'Primary brand color',
  },
  {
    name: 'primary-foreground',
    cssVar: '--primary-foreground',
    value: '210 40% 98%',
    category: 'theme',
    description: 'Text on primary color',
  },
  {
    name: 'secondary',
    cssVar: '--secondary',
    value: '210 40% 96.1%',
    category: 'theme',
    description: 'Secondary background color',
  },
  {
    name: 'secondary-foreground',
    cssVar: '--secondary-foreground',
    value: '222.2 47.4% 11.2%',
    category: 'theme',
    description: 'Text on secondary color',
  },
  {
    name: 'muted',
    cssVar: '--muted',
    value: '210 40% 96.1%',
    category: 'theme',
    description: 'Muted background',
  },
  {
    name: 'muted-foreground',
    cssVar: '--muted-foreground',
    value: '215.4 16.3% 46.9%',
    category: 'theme',
    description: 'Muted text color',
  },
  {
    name: 'accent',
    cssVar: '--accent',
    value: '210 40% 96.1%',
    category: 'theme',
    description: 'Accent background',
  },
  {
    name: 'accent-foreground',
    cssVar: '--accent-foreground',
    value: '222.2 47.4% 11.2%',
    category: 'theme',
    description: 'Text on accent color',
  },
  {
    name: 'destructive',
    cssVar: '--destructive',
    value: '0 84.2% 60.2%',
    category: 'theme',
    description: 'Destructive/error color',
  },
  {
    name: 'destructive-foreground',
    cssVar: '--destructive-foreground',
    value: '210 40% 98%',
    category: 'theme',
    description: 'Text on destructive color',
  },
  {
    name: 'border',
    cssVar: '--border',
    value: '214.3 31.8% 91.4%',
    category: 'theme',
    description: 'Border color',
  },
  {
    name: 'input',
    cssVar: '--input',
    value: '214.3 31.8% 91.4%',
    category: 'theme',
    description: 'Input border color',
  },
  {
    name: 'ring',
    cssVar: '--ring',
    value: '222.2 84% 4.9%',
    category: 'theme',
    description: 'Focus ring color',
  },
];

/**
 * テーマカラー (Dark Mode)
 */
export const THEME_COLORS_DARK: ColorDefinition[] = [
  {
    name: 'background',
    cssVar: '--background',
    value: '222.2 84% 4.9%',
    category: 'theme',
    description: 'Default background color (dark)',
  },
  {
    name: 'foreground',
    cssVar: '--foreground',
    value: '210 40% 98%',
    category: 'theme',
    description: 'Default text color (dark)',
  },
  {
    name: 'card',
    cssVar: '--card',
    value: '222.2 84% 4.9%',
    category: 'theme',
    description: 'Card background (dark)',
  },
  {
    name: 'card-foreground',
    cssVar: '--card-foreground',
    value: '210 40% 98%',
    category: 'theme',
    description: 'Card text color (dark)',
  },
  {
    name: 'popover',
    cssVar: '--popover',
    value: '222.2 84% 4.9%',
    category: 'theme',
    description: 'Popover background (dark)',
  },
  {
    name: 'popover-foreground',
    cssVar: '--popover-foreground',
    value: '210 40% 98%',
    category: 'theme',
    description: 'Popover text color (dark)',
  },
  {
    name: 'primary',
    cssVar: '--primary',
    value: '210 40% 98%',
    category: 'theme',
    description: 'Primary brand color (dark)',
  },
  {
    name: 'primary-foreground',
    cssVar: '--primary-foreground',
    value: '222.2 47.4% 11.2%',
    category: 'theme',
    description: 'Text on primary color (dark)',
  },
  {
    name: 'secondary',
    cssVar: '--secondary',
    value: '217.2 32.6% 17.5%',
    category: 'theme',
    description: 'Secondary background color (dark)',
  },
  {
    name: 'secondary-foreground',
    cssVar: '--secondary-foreground',
    value: '210 40% 98%',
    category: 'theme',
    description: 'Text on secondary color (dark)',
  },
  {
    name: 'muted',
    cssVar: '--muted',
    value: '217.2 32.6% 17.5%',
    category: 'theme',
    description: 'Muted background (dark)',
  },
  {
    name: 'muted-foreground',
    cssVar: '--muted-foreground',
    value: '215 20.2% 65.1%',
    category: 'theme',
    description: 'Muted text color (dark)',
  },
  {
    name: 'accent',
    cssVar: '--accent',
    value: '217.2 32.6% 17.5%',
    category: 'theme',
    description: 'Accent background (dark)',
  },
  {
    name: 'accent-foreground',
    cssVar: '--accent-foreground',
    value: '210 40% 98%',
    category: 'theme',
    description: 'Text on accent color (dark)',
  },
  {
    name: 'destructive',
    cssVar: '--destructive',
    value: '0 62.8% 30.6%',
    category: 'theme',
    description: 'Destructive/error color (dark)',
  },
  {
    name: 'destructive-foreground',
    cssVar: '--destructive-foreground',
    value: '210 40% 98%',
    category: 'theme',
    description: 'Text on destructive color (dark)',
  },
  {
    name: 'border',
    cssVar: '--border',
    value: '217.2 32.6% 17.5%',
    category: 'theme',
    description: 'Border color (dark)',
  },
  {
    name: 'input',
    cssVar: '--input',
    value: '217.2 32.6% 17.5%',
    category: 'theme',
    description: 'Input border color (dark)',
  },
  {
    name: 'ring',
    cssVar: '--ring',
    value: '212.7 26.8% 83.9%',
    category: 'theme',
    description: 'Focus ring color (dark)',
  },
];

/**
 * カスタムカラー (Training, etc.)
 */
export const CUSTOM_COLORS: ColorDefinition[] = [
  {
    name: 'training',
    cssVar: '',
    value: '#FF9900',
    category: 'custom',
    description: 'Primary training color',
  },
  {
    name: 'training-background',
    cssVar: '',
    value: '#FFF9F4',
    category: 'custom',
    description: 'Training background color',
  },
  {
    name: 'training-dark',
    cssVar: '',
    value: '#0D221D',
    category: 'custom',
    description: 'Training dark color',
  },
  {
    name: 'training-text-primary',
    cssVar: '--training-text-primary',
    value: '29 45% 15%',
    category: 'custom',
    description: 'Training primary text color',
  },
  {
    name: 'training-text-secondary',
    cssVar: '--training-text-secondary',
    value: '215 16% 47%',
    category: 'custom',
    description: 'Training secondary text color',
  },
  {
    name: 'training-gradient-start',
    cssVar: '--training-gradient-start',
    value: '237 35% 93%',
    category: 'custom',
    description: 'Training gradient start (#e0e5f8)',
  },
  {
    name: 'training-gradient-middle',
    cssVar: '--training-gradient-middle',
    value: '33 20% 97%',
    category: 'custom',
    description: 'Training gradient middle (#faf4f0)',
  },
  {
    name: 'training-gradient-end',
    cssVar: '--training-gradient-end',
    value: '33 20% 95%',
    category: 'custom',
    description: 'Training gradient end (#faf2f0)',
  },
];
