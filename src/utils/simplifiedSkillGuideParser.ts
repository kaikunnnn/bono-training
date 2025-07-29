/**
 * 簡素化されたスキル・ガイドパーサー
 * HTMLタグ依存を除去し、YAMLフロントマターから直接データを取得
 */

import { TrainingFrontmatter, SkillData, GuideData } from '@/types/training';
import { GuideContent } from './processSkillSection';

/**
 * フロントマターからスキル情報を取得
 */
export const getSkillsFromFrontmatter = (frontmatter: TrainingFrontmatter): SkillData[] => {
  return frontmatter.skills || [];
};

/**
 * フロントマターからガイド情報を取得
 */
export const getGuideFromFrontmatter = (frontmatter: TrainingFrontmatter): GuideData | null => {
  return frontmatter.guide || null;
};

/**
 * GuideDataを既存のGuideContentフォーマットに変換
 * 既存コンポーネントとの互換性を保つため
 */
export const convertGuideDataToGuideContent = (guideData: GuideData): GuideContent => {
  return {
    title: guideData.title,
    description: guideData.description,
    lessonCard: guideData.lesson ? {
      title: guideData.lesson.title,
      emoji: guideData.lesson.emoji,
      description: guideData.lesson.description,
      link: guideData.lesson.link
    } : undefined,
    steps: guideData.steps.map(step => ({
      title: step.title,
      description: step.description
    }))
  };
};

/**
 * スキル情報をHTML形式に変換（既存のChallengeMeritSectionとの互換性のため）
 */
export const convertSkillsToHtml = (skills: SkillData[]): string => {
  if (!skills || skills.length === 0) {
    return '';
  }

  const skillItems = skills.map((skill, index) => {
    const referenceLink = skill.reference_link 
      ? `- 参考リンク：[詳細はこちら](${skill.reference_link})` 
      : '';
    
    let result = `<div class="skill-item">

#### ■ ${skill.title}

- ${skill.description}
${referenceLink}

</div>`;

    // 最後の項目以外には区切り線を追加
    if (index < skills.length - 1) {
      result += `

<div class="skill-separator"></div>`;
    }

    return result;
  }).join('\n\n');

  return `<div class="section-challenge-merit">

<div class="block-text">
💪

## このチャレンジで伸ばせる力

トレーニングはそのままやってもいいです。基礎も合わせて学習して、実践をトレーニングで行うと土台を築けるでしょう。
</div>

<div class="skill-group">

${skillItems}

</div>

</div>`;
};