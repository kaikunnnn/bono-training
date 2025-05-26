
import { parseFrontmatter } from './simple-frontmatter';
import { TrainingFrontmatter, TaskFrontmatter } from '@/types/training';

/**
 * ビルド時にマークダウンファイルをパースして型安全なデータを提供
 * ブラウザにはパース済みのJSONデータのみが配布される
 */

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
 * ビルド時にパースされたトレーニングデータ
 */
export const PARSED_TRAININGS = Object.entries(trainingIndexFiles).map(([path, rawContent]) => {
  try {
    const { data: frontmatter, content } = parseFrontmatter(rawContent);
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
    const { data: frontmatter, content } = parseFrontmatter(rawContent);
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
