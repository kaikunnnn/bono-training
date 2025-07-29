// content.mdの解析とセクション分割ユーティリティ（構造化データ対応版）

export interface ContentSectionData {
  title: string;
  content: string;
  type: 'regular' | 'design-solution';
}

export interface SubSectionData {
  title: string;
  content: string;
}

/**
 * content.mdのマークダウンコンテンツを ## セクションごとに分割
 */
export const parseContentSections = (markdown: string | null | undefined): ContentSectionData[] => {
  // エラーガード: nullやundefinedの場合は空配列を返す
  if (!markdown || typeof markdown !== 'string') {
    console.warn('parseContentSections: 無効なマークダウンコンテンツ:', { markdown, type: typeof markdown });
    return [];
  }

  // 空文字列の場合も空配列を返す
  if (markdown.trim() === '') {
    console.warn('parseContentSections: 空のマークダウンコンテンツ');
    return [];
  }

  const sections: ContentSectionData[] = [];
  const lines = markdown.split('\n');
  let currentSection: ContentSectionData | null = null;
  
  for (const line of lines) {
    if (line.startsWith('## ')) {
      // 前のセクションを保存
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // 新しいセクションを開始
      const title = line.replace('## ', '').trim();
      const isDesignSolution = title === 'デザイン解答例';
      
      currentSection = {
        title,
        content: '',
        type: isDesignSolution ? 'design-solution' : 'regular'
      };
    } else if (currentSection) {
      // 現在のセクションにコンテンツを追加
      currentSection.content += line + '\n';
    }
  }
  
  // 最後のセクションを保存
  if (currentSection) {
    sections.push(currentSection);
  }
  
  console.log('📋 parseContentSections - 解析結果:', sections);
  return sections;
};

/**
 * セクション内の ### サブセクションを抽出
 */
export const extractSubSections = (content: string | null | undefined): SubSectionData[] => {
  // エラーガード: nullやundefinedの場合は空配列を返す
  if (!content || typeof content !== 'string') {
    console.warn('extractSubSections: 無効なコンテンツ:', { content, type: typeof content });
    return [];
  }

  // 空文字列の場合も空配列を返す
  if (content.trim() === '') {
    return [];
  }

  const subSections: SubSectionData[] = [];
  const lines = content.split('\n');
  let currentSubSection: SubSectionData | null = null;
  
  for (const line of lines) {
    if (line.startsWith('### ')) {
      // 前のサブセクションを保存
      if (currentSubSection) {
        subSections.push(currentSubSection);
      }
      
      // 新しいサブセクションを開始
      currentSubSection = {
        title: line.replace('### ', '').trim(),
        content: ''
      };
    } else if (currentSubSection) {
      // 現在のサブセクションにコンテンツを追加
      currentSubSection.content += line + '\n';
    }
  }
  
  // 最後のサブセクションを保存
  if (currentSubSection) {
    subSections.push(currentSubSection);
  }
  
  console.log('📋 extractSubSections - サブセクション解析結果:', subSections);
  return subSections;
};

/**
 * マークダウンコンテンツから特定の ## セクションを除去
 */
export const removeSection = (markdown: string, sectionTitle: string): string => {
  const sections = parseContentSections(markdown);
  const filteredSections = sections.filter(section => section.title !== sectionTitle);
  
  return filteredSections
    .map(section => `## ${section.title}\n${section.content}`)
    .join('\n');
};

/**
 * レッスンカード情報を抽出
 */
export interface LessonCardData {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export const extractLessonCard = (content: string): LessonCardData | null => {
  const lessonCardRegex = /<!-- lesson-card -->([\s\S]*?)<!-- \/lesson-card -->/;
  const match = content.match(lessonCardRegex);
  
  if (match) {
    const cardContent = match[1];
    const titleMatch = cardContent.match(/lesson_title:\s*(.+)/);
    const descriptionMatch = cardContent.match(/lesson_description:\s*(.+)/);
    const imageMatch = cardContent.match(/lesson_image:\s*(.+)/);
    const urlMatch = cardContent.match(/lesson_url:\s*(.+)/);
    
    const lessonCard = {
      title: titleMatch?.[1]?.trim() || '',
      description: descriptionMatch?.[1]?.trim() || '',
      image: imageMatch?.[1]?.trim(),
      url: urlMatch?.[1]?.trim()
    };
    
    console.log('📋 extractLessonCard - レッスンカード解析結果:', lessonCard);
    return lessonCard;
  }
  
  return null;
};