
/**
 * ビルド時にマークダウンファイルをパースして型安全なデータを提供
 * ブラウザにはパース済みのJSONデータのみが配布される
 */

// gray-matterは開発時のみ使用し、ブラウザには含めない
let matter: any = null;

// サーバーサイド（ビルド時）でのみgray-matterを読み込む
if (typeof window === 'undefined') {
  try {
    matter = require('gray-matter');
  } catch (e) {
    console.warn('gray-matter not available in this environment');
  }
}

import { TrainingFrontmatter, TaskFrontmatter } from '@/types/training';

// トレーニングのindex.mdファイルを取得（ビルド時実行）
const trainingIndexFiles = import.meta.glob('/content/training/**/index.md', {
  query: '?raw', 
  import: 'default', 
  eager: true
}) as Record<string, string>;

// タスクのcontent.mdファイルを取得（ビルド時実行）
const taskFiles = import.meta.glob('/content/training/**/tasks/**/content.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

/**
 * パスからスラッグを抽出するヘルパー関数
 */
function extractSlugFromPath(path: string): string {
  const posixPath = path.replace(/\\/g, '/');
  const parts = posixPath.split('/');
  const trainingIndex = parts.findIndex(part => part === 'training');
  if (trainingIndex !== -1 && parts[trainingIndex + 1]) {
    return parts[trainingIndex + 1];
  }
  return 'unknown';
}

function extractTaskSlugFromPath(path: string): string {
  const posixPath = path.replace(/\\/g, '/');
  const parts = posixPath.split('/');
  const tasksIndex = parts.findIndex(part => part === 'tasks');
  if (tasksIndex !== -1 && parts[tasksIndex + 1]) {
    return parts[tasksIndex + 1];
  }
  return 'unknown';
}

/**
 * 簡易フロントマターパーサー（ブラウザ対応）
 */
function parseMarkdown(content: string): { data: any; content: string } {
  // gray-matterが利用可能な場合（ビルド時）は使用
  if (matter) {
    return matter(content);
  }
  
  // ブラウザ環境での簡易パーサー
  const lines = content.split('\n');
  if (lines[0] !== '---') {
    return { data: {}, content };
  }
  
  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') {
      endIndex = i;
      break;
    }
  }
  
  if (endIndex === -1) {
    return { data: {}, content };
  }
  
  const frontmatterLines = lines.slice(1, endIndex);
  const contentLines = lines.slice(endIndex + 1);
  
  // 簡易YAMLパーサー
  const data: any = {};
  frontmatterLines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // 文字列値の処理
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      
      // 配列の簡易処理
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(item => item.trim().replace(/['"]/g, ''));
      }
      
      // ブール値の処理
      if (value === 'true') value = true;
      if (value === 'false') value = false;
      
      // 数値の処理
      if (!isNaN(Number(value)) && value !== '') {
        value = Number(value);
      }
      
      data[key] = value;
    }
  });
  
  return { data, content: contentLines.join('\n') };
}

/**
 * ビルド時にパースされたトレーニングデータ
 */
export const PARSED_TRAININGS = Object.entries(trainingIndexFiles).map(([path, rawContent]) => {
  try {
    const { data: frontmatter, content } = parseMarkdown(rawContent);
    const pathSlug = extractSlugFromPath(path);
    const slug = frontmatter.slug || pathSlug;
    
    return {
      path: path.replace(/\\/g, '/'),
      content,
      frontmatter: frontmatter as TrainingFrontmatter,
      slug
    };
  } catch (error) {
    console.warn(`Failed to parse training file ${path}:`, error);
    return null;
  }
}).filter((item): item is NonNullable<typeof item> => item !== null);

/**
 * ビルド時にパースされたタスクデータ
 */
export const PARSED_TASKS = Object.entries(taskFiles).map(([path, rawContent]) => {
  try {
    const { data: frontmatter, content } = parseMarkdown(rawContent);
    const taskSlug = frontmatter.slug || extractTaskSlugFromPath(path);
    const trainingSlug = extractSlugFromPath(path);
    
    return {
      path: path.replace(/\\/g, '/'),
      content,
      frontmatter: frontmatter as TaskFrontmatter,
      slug: taskSlug,
      trainingSlug
    };
  } catch (error) {
    console.warn(`Failed to parse task file ${path}:`, error);
    return null;
  }
}).filter((item): item is NonNullable<typeof item> => item !== null);
