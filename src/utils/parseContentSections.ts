// content.mdの解析とセクション分割ユーティリティ（構造化データ対応版）

export interface ContentSectionData {
  title: string;
  content: string;
  type: 'regular' | 'design-solution' | 'premium-only';
}

// フロントマターからの構造化データ型
export interface StructuredSection {
  title: string;
  content: string;
  type?: 'regular' | 'design-solution' | 'premium-only';
  subsections?: {
    title: string;
    content: string;
  }[];
}

export interface SubSectionData {
  title: string;
  content: string;
}

/**
 * 構造化データを優先して、フォールバックでマークダウン解析を行う
 */
export const parseContentSections = (
  markdown: string | null | undefined,
  structuredSections?: StructuredSection[]
): ContentSectionData[] => {
  // 構造化データが利用可能な場合は優先して使用
  if (structuredSections && structuredSections.length > 0) {
    console.log('📋 parseContentSections - 構造化データを使用:', structuredSections);
    return structuredSections.map(section => ({
      title: section.title,
      content: section.content,
      type: section.type || 'regular'
    }));
  }

  // フォールバック: 従来のマークダウン解析
  console.log('📋 parseContentSections - マークダウン解析にフォールバック');
  
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
      let type: 'regular' | 'design-solution' | 'premium-only' = 'regular';
      
      if (title === 'デザイン解答例') {
        type = 'design-solution';
      }
      
      currentSection = {
        title,
        content: '',
        type
      };
    } else if (currentSection) {
      // PREMIUM_ONLY コメントチェック
      if (line.includes('<!-- PREMIUM_ONLY -->')) {
        currentSection.type = 'premium-only';
      } else {
        // 現在のセクションにコンテンツを追加
        currentSection.content += line + '\n';
      }
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