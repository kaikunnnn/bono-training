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
  console.log('🔍 parseGuideContent - 開始');
  console.log('🔍 入力コンテンツ:', guideMarkdown);
  console.log('🔍 入力コンテンツ長:', guideMarkdown?.length || 0);
  
  const defaultContent: GuideContent = {
    title: '進め方ガイド',
    description: 'デザイン基礎を身につけながらデザインするための\nやり方の流れを説明します。',
    steps: []
  };

  if (!guideMarkdown) {
    console.log('⚠️ ガイドマークダウンが空です');
    return defaultContent;
  }

  // タイトルを抽出（## 進め方ガイド）
  const titleMatch = guideMarkdown.match(/^## (.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : defaultContent.title;
  console.log('🔍 抽出されたタイトル:', title);

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
  console.log('🔍 抽出された説明文:', description);

  // レッスンカード情報を抽出（#### レッスンで身につける セクション）
  let lessonCard: GuideContent['lessonCard'];
  console.log('🔍 レッスンセクション検索開始...');
  
  // 複数のパターンでレッスンセクションを探す
  const lessonPatterns = [
    /#### レッスンで身につける\s*\n(.*?)(?=####|$)/s,
    /#### (.+?レッスン.+?)\s*\n(.*?)(?=####|$)/s,
    /####\s*(.+)\s*\n(.*?<div\s+class="lesson">.*?<\/div>.*?)(?=####|$)/s
  ];
  
  let lessonSectionMatch = null;
  let patternUsed = -1;
  
  for (let i = 0; i < lessonPatterns.length; i++) {
    lessonSectionMatch = guideMarkdown.match(lessonPatterns[i]);
    if (lessonSectionMatch) {
      patternUsed = i;
      console.log(`✅ レッスンセクション発見 (パターン${i + 1}):`, lessonSectionMatch[1] || lessonSectionMatch[0]);
      break;
    }
  }
  
  if (lessonSectionMatch) {
    const lessonContent = lessonSectionMatch[patternUsed === 1 ? 2 : 1];
    console.log('🔍 レッスンコンテンツ:', lessonContent);
    
    // HTMLコメントを除去
    const cleanedContent = lessonContent.replace(/<!--.*?-->/gs, '').trim();
    console.log('🔍 コメント除去後:', cleanedContent);
    
    // <div class="lesson"> の抽出（より柔軟な正規表現）
    const lessonDivPatterns = [
      /<div\s+class="lesson">\s*(.*?)\s*<\/div>/s,
      /<div\s+class='lesson'>\s*(.*?)\s*<\/div>/s,
      /<div[^>]*class[^>]*lesson[^>]*>\s*(.*?)\s*<\/div>/s
    ];
    
    let lessonDivMatch = null;
    for (const pattern of lessonDivPatterns) {
      lessonDivMatch = cleanedContent.match(pattern);
      if (lessonDivMatch) {
        console.log('✅ レッスンdiv発見:', lessonDivMatch[1].substring(0, 100));
        break;
      }
    }
    
    if (lessonDivMatch) {
      let lessonInnerContent = lessonDivMatch[1].trim();
      console.log('🔍 レッスン内部コンテンツ:', lessonInnerContent);
      
      // 画像記述を除去
      const beforeImageRemoval = lessonInnerContent;
      lessonInnerContent = lessonInnerContent.replace(/!\[.*?\]\(.*?(?:\s+".*?")?\)/g, '').trim();
      console.log('🔍 画像除去前:', beforeImageRemoval);
      console.log('🔍 画像除去後:', lessonInnerContent);
      
      // タイトルを抽出（##### で始まる行）
      const titleMatch = lessonInnerContent.match(/^##### (.+)$/m);
      const lessonTitle = titleMatch ? titleMatch[1].trim() : 'ゼロからはじめる情報設計';
      console.log('🔍 抽出されたレッスンタイトル:', lessonTitle);
      
      // 説明文を抽出（タイトルの後の部分）
      const descriptionPart = lessonInnerContent.replace(/^##### .+$/m, '').trim();
      const lessonDescription = descriptionPart
        .replace(/\n+/g, ' ') // 改行を空白に変換
        .trim() || '進め方の基礎はBONOで詳細に学習・実践できます';
      console.log('🔍 抽出されたレッスン説明文:', lessonDescription);
      
      lessonCard = {
        title: lessonTitle,
        emoji: '📚',
        description: lessonDescription,
        link: '/training'
      };
      
      console.log('✅ レッスンカード作成成功:', lessonCard);
    } else {
      console.warn('⚠️ レッスンdivが見つかりません');
      console.log('🔍 検索対象コンテンツ:', cleanedContent.substring(0, 500));
    }
  } else {
    console.warn('⚠️ レッスンセクションが見つかりません');
    console.log('🔍 検索対象の全コンテンツ:', guideMarkdown.substring(0, 1000));
  }

  // ステップを抽出（#### 進め方 セクション）
  const steps: GuideContent['steps'] = [];
  const stepSectionMatch = guideMarkdown.match(/#### 進め方\s*\n(.*?)(?=####|$)/s);
  console.log('🔍 ステップセクション検索:', stepSectionMatch ? 'マッチしました' : 'マッチしませんでした');
  
  if (stepSectionMatch) {
    const stepSectionContent = stepSectionMatch[1];
    console.log('🔍 ステップセクションコンテンツ:', stepSectionContent.substring(0, 200));
    
    // 各 <div class="step"> ブロックを抽出
    const stepMatches = stepSectionContent.match(/<div class="step">\s*(.*?)\s*<\/div>/gs);
    console.log('🔍 ステップマッチ数:', stepMatches?.length || 0);
    
    if (stepMatches) {
      stepMatches.forEach((stepMatch, index) => {
        const stepContent = stepMatch.replace(/<div class="step">\s*|\s*<\/div>/g, '');
        console.log(`🔍 ステップ${index + 1}コンテンツ:`, stepContent.substring(0, 100));
        
        // ステップタイトルを抽出（##### で始まる行）
        const stepTitleMatch = stepContent.match(/^##### (.+)$/m);
        const stepTitle = stepTitleMatch ? stepTitleMatch[1].trim() : '';
        console.log(`🔍 ステップ${index + 1}タイトル:`, stepTitle);
        
        if (stepTitle) {
          // ステップの説明文を抽出（タイトルの後の内容）
          const descriptionPart = stepContent.replace(/^##### .+$/m, '').trim();
          
          // リストアイテムを統合して一つの説明文にする
          const stepDescription = descriptionPart
            .replace(/^- /gm, '')  // リストマーカーを除去
            .replace(/\n{2,}/g, '\n') // 余分な改行を除去
            .trim();
          
          console.log(`🔍 ステップ${index + 1}説明文:`, stepDescription);
          
          steps.push({
            title: stepTitle,
            description: stepDescription
          });
        }
      });
    }
  }

  const result = {
    title,
    description,
    lessonCard,
    steps
  };
  
  console.log('📋 parseGuideContent - 最終結果:', result);
  return result;
};