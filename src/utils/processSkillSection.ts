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