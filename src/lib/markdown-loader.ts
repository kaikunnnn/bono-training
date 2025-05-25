
import { matter } from 'fast-matter';
import { TrainingFrontmatter, TaskFrontmatter, MarkdownFile, assertTrainingMeta, assertTaskMeta } from '@/types/training';

/**
 * Windowsパスを POSIX パスに変換
 */
function toPosix(path: string): string {
  return path.replace(/\\/g, '/');
}

/**
 * パスからスラッグを抽出
 */
function extractSlugFromPath(path: string): string {
  const posixPath = toPosix(path);
  const parts = posixPath.split('/');
  // content/training/todo-app/index.md -> todo-app
  // content/training/todo-app/tasks/01-introduction/content.md -> todo-app
  const trainingIndex = parts.findIndex(part => part === 'training');
  if (trainingIndex !== -1 && parts[trainingIndex + 1]) {
    return parts[trainingIndex + 1];
  }
  return 'unknown';
}

/**
 * タスクスラッグをパスから抽出
 */
function extractTaskSlugFromPath(path: string): string {
  const posixPath = toPosix(path);
  const parts = posixPath.split('/');
  // content/training/todo-app/tasks/01-introduction/content.md -> 01-introduction
  const tasksIndex = parts.findIndex(part => part === 'tasks');
  if (tasksIndex !== -1 && parts[tasksIndex + 1]) {
    return parts[tasksIndex + 1];
  }
  return 'unknown';
}

/**
 * すべてのトレーニングファイルのメタデータを取得
 * （関数名を変更して mdxLoader.ts との衝突を回避）
 */
export function getAllTrainingFiles(): MarkdownFile[] {
  console.time('getAllTrainingFiles');
  
  try {
    // トレーニングのindex.mdファイルを取得（eager読み込み + Vite v5対応）
    const trainingIndexFiles = import.meta.glob('/content/training/**/index.md', {
      query: '?raw', 
      import: 'default', 
      eager: true
    }) as Record<string, string>;
    
    console.log('Found training files:', Object.keys(trainingIndexFiles));
    
    const trainings: MarkdownFile[] = [];
    const slugMap = new Map<string, string>(); // slug -> filePath
    
    for (const [path, content] of Object.entries(trainingIndexFiles)) {
      try {
        const { data: frontmatter, content: markdownContent } = matter(content);
        
        // 型安全性をチェック
        assertTrainingMeta(frontmatter);
        
        const pathSlug = extractSlugFromPath(path);
        const metaSlug = frontmatter.slug || pathSlug;
        
        // slug重複チェック
        if (slugMap.has(metaSlug)) {
          console.warn(`[WARN] duplicate slug "${metaSlug}" in ${path} and ${slugMap.get(metaSlug)}`);
          continue;
        }
        slugMap.set(metaSlug, path);
        
        trainings.push({
          path: toPosix(path),
          content: markdownContent,
          frontmatter: frontmatter as TrainingFrontmatter,
          slug: metaSlug
        });
        
      } catch (error) {
        console.warn(`Failed to parse training file ${path}:`, error);
        continue;
      }
    }
    
    console.log(`Loaded ${trainings.length} training files`);
    return trainings;
    
  } catch (error) {
    console.error('Error loading training metadata:', error);
    return [];
  } finally {
    console.timeEnd('getAllTrainingFiles');
  }
}

/**
 * 特定のトレーニングのタスクを取得
 */
export function loadTrainingTasks(trainingSlug: string): MarkdownFile[] {
  console.time(`loadTrainingTasks-${trainingSlug}`);
  
  try {
    // 特定のトレーニングのタスクファイルを取得（eager読み込み + Vite v5対応）
    const taskFiles = import.meta.glob('/content/training/**/tasks/**/content.md', {
      query: '?raw',
      import: 'default',
      eager: true
    }) as Record<string, string>;
    
    const tasks: MarkdownFile[] = [];
    
    for (const [path, content] of Object.entries(taskFiles)) {
      try {
        // パスからトレーニングスラッグをチェック
        if (!path.includes(`/training/${trainingSlug}/`)) {
          continue;
        }
        
        const { data: frontmatter, content: markdownContent } = matter(content);
        
        // 型安全性をチェック
        assertTaskMeta(frontmatter);
        
        const taskSlug = frontmatter.slug || extractTaskSlugFromPath(path);
        
        tasks.push({
          path: toPosix(path),
          content: markdownContent,
          frontmatter: frontmatter as TaskFrontmatter,
          slug: taskSlug
        });
        
      } catch (error) {
        console.warn(`Failed to parse task file ${path}:`, error);
        continue;
      }
    }
    
    // order_indexでソート
    tasks.sort((a, b) => {
      const aOrder = (a.frontmatter as TaskFrontmatter).order_index || 0;
      const bOrder = (b.frontmatter as TaskFrontmatter).order_index || 0;
      return aOrder - bOrder;
    });
    
    console.log(`Loaded ${tasks.length} tasks for training ${trainingSlug}`);
    return tasks;
    
  } catch (error) {
    console.error(`Error loading tasks for training ${trainingSlug}:`, error);
    return [];
  } finally {
    console.timeEnd(`loadTrainingTasks-${trainingSlug}`);
  }
}

/**
 * 特定のタスクコンテンツを取得
 */
export function loadTaskContent(trainingSlug: string, taskSlug: string): MarkdownFile | null {
  try {
    const taskFiles = import.meta.glob('/content/training/**/tasks/**/content.md', {
      query: '?raw',
      import: 'default',
      eager: true
    }) as Record<string, string>;
    
    for (const [path, content] of Object.entries(taskFiles)) {
      // パスからトレーニングスラッグとタスクスラッグをチェック
      if (!path.includes(`/training/${trainingSlug}/`) || !path.includes(`/tasks/${taskSlug}/`)) {
        continue;
      }
      
      const { data: frontmatter, content: markdownContent } = matter(content);
      
      // 型安全性をチェック
      assertTaskMeta(frontmatter);
      
      return {
        path: toPosix(path),
        content: markdownContent,
        frontmatter: frontmatter as TaskFrontmatter,
        slug: taskSlug
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error loading task content for ${trainingSlug}/${taskSlug}:`, error);
    return null;
  }
}
