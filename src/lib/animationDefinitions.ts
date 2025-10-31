/**
 * アニメーション定義
 * tailwind.config.tsから抽出
 */

import type { AnimationDefinition } from '@/types/dev';

export const ANIMATIONS: AnimationDefinition[] = [
  {
    name: 'accordion-down',
    className: 'animate-accordion-down',
    duration: '0.2s',
    easing: 'ease-out',
    description: 'Accordion expand animation',
  },
  {
    name: 'accordion-up',
    className: 'animate-accordion-up',
    duration: '0.2s',
    easing: 'ease-out',
    description: 'Accordion collapse animation',
  },
  {
    name: 'fade-in',
    className: 'animate-fade-in',
    duration: '0.6s',
    easing: 'ease-out',
    description: 'Fade in with upward movement',
  },
  {
    name: 'gradient-fade-in',
    className: 'animate-gradient-fade-in',
    duration: '0.8s',
    easing: 'ease-out',
    description: 'Gradient fade in effect',
  },
  {
    name: 'gradient-slide',
    className: 'animate-gradient-slide',
    duration: '1.2s',
    easing: 'ease-out',
    description: 'Gradient slide animation',
  },
  {
    name: 'gradient-scale-slide',
    className: 'animate-gradient-scale-slide',
    duration: '2.0s',
    easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    description: 'Gradient scale and slide animation',
  },
];
