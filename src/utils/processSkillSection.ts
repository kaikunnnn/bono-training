/**
 * マークダウンコンテンツから「このチャレンジで伸ばせる力」セクションを抽出するユーティリティ
 */

/**
 * マークダウンコンテンツからスキルセクションを抽出
 * @param markdownContent - 完全なマークダウンコンテンツ
 * @returns スキルセクションのみのマークダウン文字列
 */
export const extractSkillSection = (markdownContent: string): string => {
  if (!markdownContent) return '';

  // 「このチャレンジで伸ばせる力」セクションの開始を探す
  const skillSectionStart = markdownContent.indexOf('## このチャレンジで伸ばせる力');
  
  if (skillSectionStart === -1) {
    return ''; // セクションが見つからない場合
  }

  // 次の主要セクション（## 進め方ガイド）を探す
  const nextSectionStart = markdownContent.indexOf('## 進め方ガイド', skillSectionStart);
  
  let skillSectionContent: string;
  
  if (nextSectionStart === -1) {
    // 進め方ガイドが見つからない場合は、コンテンツの最後まで取得
    skillSectionContent = markdownContent.substring(skillSectionStart);
  } else {
    // 進め方ガイドまでの内容を取得
    skillSectionContent = markdownContent.substring(skillSectionStart, nextSectionStart);
  }

  // セクションをタイトル部分とスキルグループ部分に分割
  const titleAndDescMatch = skillSectionContent.match(/## このチャレンジで伸ばせる力\s*\n\s*(.*?)\s*\n\s*<div class="skill-group">/s);
  const skillGroupMatch = skillSectionContent.match(/<div class="skill-group">(.*?)<\/div>/s);
  
  if (!titleAndDescMatch || !skillGroupMatch) {
    return ''; // 必要な構造が見つからない場合
  }

  const description = titleAndDescMatch[1].trim();
  const skillGroupContent = skillGroupMatch[1].trim();

  // スキルグループ内のスキル項目を分割（### ■ で始まる項目）
  const skillItems = skillGroupContent.split(/(?=### ■|### \*)/g).filter(item => item.trim());
  
  // 各スキル項目をスタイル構造に変換
  const formattedSkillItems = skillItems.map((item, index) => {
    // h3 を h4 に変換
    const formattedItem = item.replace(/^### (■|\\*)/gm, '#### $1');
    
    let result = `<div class="skill-item">

${formattedItem.trim()}

</div>`;

    // 最後の項目以外には区切り線を追加
    if (index < skillItems.length - 1) {
      result += `

<div class="skill-separator"></div>`;
    }

    return result;
  }).join('\n\n');

  // 最終的な構造を組み立て
  const wrappedContent = `<div class="section-challenge-merit">

<div class="block-text">
💪

## このチャレンジで伸ばせる力

${description}
</div>

<div class="skill-group">

${formattedSkillItems}

</div>

</div>`;

  return wrappedContent;
};

/**
 * マークダウンコンテンツからスキルタイトル一覧を抽出
 * @param markdownContent - 完全なマークダウンコンテンツ
 * @returns スキルタイトルの配列
 */
export const extractSkillTitles = (markdownContent: string): string[] => {
  if (!markdownContent) return [];

  // 「このチャレンジで伸ばせる力」セクションの開始を探す
  const skillSectionStart = markdownContent.indexOf('## このチャレンジで伸ばせる力');
  
  if (skillSectionStart === -1) {
    return []; // セクションが見つからない場合
  }

  // 次の主要セクション（## 進め方ガイド）を探す
  const nextSectionStart = markdownContent.indexOf('## 進め方ガイド', skillSectionStart);
  
  let skillSectionContent: string;
  
  if (nextSectionStart === -1) {
    // 進め方ガイドが見つからない場合は、コンテンツの最後まで取得
    skillSectionContent = markdownContent.substring(skillSectionStart);
  } else {
    // 進め方ガイドまでの内容を取得
    skillSectionContent = markdownContent.substring(skillSectionStart, nextSectionStart);
  }

  // ### 見出しを抽出（■や*マークを除去）
  const skillTitleMatches = skillSectionContent.match(/### (?:■|\\*)\s*(.+)/g);
  
  if (!skillTitleMatches) {
    return []; // スキル項目が見つからない場合
  }

  // 見出しからタイトル部分のみを抽出
  return skillTitleMatches.map(match => {
    const titleMatch = match.match(/### (?:■|\\*)\s*(.+)/);
    return titleMatch ? titleMatch[1].trim() : '';
  }).filter(title => title.length > 0);
};

/**
 * マークダウンコンテンツから「進め方ガイド」セクションを抽出
 * @param markdownContent - 完全なマークダウンコンテンツ
 * @returns 進め方ガイドセクションのマークダウン文字列
 */
export const extractGuideSection = (markdownContent: string): string => {
  if (!markdownContent) return '';

  // 「## 進め方ガイド」セクションの開始を探す
  const guideSectionStart = markdownContent.indexOf('## 進め方ガイド');
  
  if (guideSectionStart === -1) {
    return ''; // セクションが見つからない場合
  }

  // 次の主要セクション（## で始まる）を探す
  const nextSectionMatch = markdownContent.substring(guideSectionStart + 1).match(/^## /m);
  
  let guideSectionContent: string;
  
  if (nextSectionMatch) {
    // 次のセクションが見つかった場合
    const nextSectionStart = guideSectionStart + 1 + (nextSectionMatch.index || 0);
    guideSectionContent = markdownContent.substring(guideSectionStart, nextSectionStart);
  } else {
    // 次のセクションが見つからない場合は、コンテンツの最後まで取得
    guideSectionContent = markdownContent.substring(guideSectionStart);
  }

  return guideSectionContent.trim();
};

/**
 * マークダウンコンテンツからスキルセクションを除外
 * @param markdownContent - 完全なマークダウンコンテンツ
 * @returns スキルセクションを除外したマークダウン文字列
 */
export const removeSkillSection = (markdownContent: string): string => {
  if (!markdownContent) return '';

  // 「このチャレンジで伸ばせる力」セクションの開始を探す
  const skillSectionStart = markdownContent.indexOf('## このチャレンジで伸ばせる力');
  
  if (skillSectionStart === -1) {
    return markdownContent; // セクションが見つからない場合はそのまま返す
  }

  // 次の主要セクション（## 進め方ガイド）を探す
  const nextSectionStart = markdownContent.indexOf('## 進め方ガイド', skillSectionStart);
  
  if (nextSectionStart === -1) {
    // 進め方ガイドが見つからない場合は、スキルセクション以降をすべて削除
    return markdownContent.substring(0, skillSectionStart).trim();
  } else {
    // スキルセクションの部分を削除して前後を結合
    const beforeSkillSection = markdownContent.substring(0, skillSectionStart);
    const afterSkillSection = markdownContent.substring(nextSectionStart);
    return (beforeSkillSection + afterSkillSection).trim();
  }
};

/**
 * マークダウンコンテンツからスキルセクションと進め方ガイドセクションを除外
 * @param markdownContent - 完全なマークダウンコンテンツ
 * @returns 両セクションを除外したマークダウン文字列
 */
export const removeSkillAndGuideSection = (markdownContent: string): string => {
  if (!markdownContent) return '';

  let result = markdownContent;

  // スキルセクション（## このチャレンジで伸ばせる力）を除外
  const skillSectionStart = result.indexOf('## このチャレンジで伸ばせる力');
  if (skillSectionStart !== -1) {
    const guideSectionStart = result.indexOf('## 進め方ガイド', skillSectionStart);
    if (guideSectionStart !== -1) {
      // スキルセクションのみを削除
      const beforeSkill = result.substring(0, skillSectionStart);
      const afterSkill = result.substring(guideSectionStart);
      result = (beforeSkill + afterSkill).trim();
    } else {
      // 進め方ガイドが見つからない場合は、スキルセクション以降をすべて削除
      result = result.substring(0, skillSectionStart).trim();
    }
  }

  // 進め方ガイドセクション（## 進め方ガイド）を除外
  const guideSectionStart = result.indexOf('## 進め方ガイド');
  if (guideSectionStart !== -1) {
    // 次の主要セクション（## で始まる）を探す
    const nextSectionMatch = result.substring(guideSectionStart + 1).match(/^## /m);
    
    if (nextSectionMatch) {
      // 次のセクションが見つかった場合
      const nextSectionStart = guideSectionStart + 1 + (nextSectionMatch.index || 0);
      const beforeGuide = result.substring(0, guideSectionStart);
      const afterGuide = result.substring(nextSectionStart);
      result = (beforeGuide + afterGuide).trim();
    } else {
      // 次のセクションが見つからない場合は、進め方ガイド以降をすべて削除
      result = result.substring(0, guideSectionStart).trim();
    }
  }

  // 余分な空行を除去
  result = result.replace(/\n{3,}/g, '\n\n').trim();

  return result;
};

/**
 * 進め方ガイドコンテンツの構造
 */
export interface GuideContent {
  title: string;
  description: string;
  lessonCard?: {
    title: string;
    emoji: string;
    description: string;
    link: string;
  };
  steps: Array<{
    title: string;
    description: string;
    referenceLink?: {
      text: string;
      url: string;
    };
  }>;
}

/**
 * 進め方ガイドのマークダウンコンテンツを解析
 * @param guideMarkdown - 進め方ガイドセクションのマークダウン
 * @returns 解析された進め方ガイドデータ
 */
export const parseGuideContent = (guideMarkdown: string): GuideContent => {
  const defaultContent: GuideContent = {
    title: '進め方ガイド',
    description: 'デザイン基礎を身につけながらデザインするための\nやり方の流れを説明します。',
    steps: []
  };

  if (!guideMarkdown) return defaultContent;

  // タイトルを抽出（## 進め方ガイド）
  const titleMatch = guideMarkdown.match(/^## (.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : defaultContent.title;

  // 引用文から説明を抽出（> で始まる行）
  const descriptionMatch = guideMarkdown.match(/^> (.+?)(?=\n\n|\n####|$)/ms);
  let description = defaultContent.description;
  if (descriptionMatch) {
    description = descriptionMatch[1]
      .split('\n')
      .map(line => line.replace(/^> ?/, ''))
      .join('\n')
      .trim();
  }

  // レッスンカード情報を抽出（#### レッスンで身につける セクション）
  let lessonCard: GuideContent['lessonCard'];
  const lessonSectionMatch = guideMarkdown.match(/#### レッスンで身につける\s*\n(.*?)(?=####|$)/s);
  
  if (lessonSectionMatch) {
    const lessonContent = lessonSectionMatch[1];
    
    // <div class="lesson"> 内のコンテンツを抽出
    const lessonDivMatch = lessonContent.match(/<div class="lesson">\s*(.*?)\s*<\/div>/s);
    
    if (lessonDivMatch) {
      const lessonInnerContent = lessonDivMatch[1];
      
      // タイトルを抽出（##### で始まる行）
      const titleMatch = lessonInnerContent.match(/^##### (.+)$/m);
      const lessonTitle = titleMatch ? titleMatch[1].trim() : 'ゼロからはじめる情報設計';
      
      // 説明文を抽出（タイトルの後の行、画像は除外）
      const descriptionPart = lessonInnerContent.replace(/^##### .+$/m, '').trim();
      const lessonDescription = descriptionPart
        .replace(/!\[.*?\]\(.*?\)/g, '') // 画像を除外
        .replace(/\n+/g, ' ') // 改行を空白に変換
        .trim() || '進め方の基礎はBONOで詳細に学習・実践できます';
      
      lessonCard = {
        title: lessonTitle,
        emoji: '📚',
        description: lessonDescription,
        link: '/training'
      };
    }
  }

  // ステップを抽出（#### 進め方 セクション）
  const steps: GuideContent['steps'] = [];
  const stepSectionMatch = guideMarkdown.match(/#### 進め方\s*\n(.*?)(?=####|$)/s);
  
  if (stepSectionMatch) {
    const stepSectionContent = stepSectionMatch[1];
    
    // 各 <div class="step"> ブロックを抽出
    const stepMatches = stepSectionContent.match(/<div class="step">\s*(.*?)\s*<\/div>/gs);
    
    if (stepMatches) {
      stepMatches.forEach(stepMatch => {
        const stepContent = stepMatch.replace(/<div class="step">\s*|\s*<\/div>/g, '');
        
        // ステップタイトルを抽出（##### で始まる行）
        const stepTitleMatch = stepContent.match(/^##### (.+)$/m);
        const stepTitle = stepTitleMatch ? stepTitleMatch[1].trim() : '';
        
        if (stepTitle) {
          // ステップの説明文を抽出（タイトルの後の内容）
          const descriptionPart = stepContent.replace(/^##### .+$/m, '').trim();
          
          // リストアイテムを統合して一つの説明文にする
          const stepDescription = descriptionPart
            .replace(/^- /gm, '')  // リストマーカーを除去
            .replace(/\n{2,}/g, '\n') // 余分な改行を除去
            .trim();
          
          steps.push({
            title: stepTitle,
            description: stepDescription
          });
        }
      });
    }
  }

  return {
    title,
    description,
    lessonCard,
    steps
  };
};