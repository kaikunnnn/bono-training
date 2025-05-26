
import { TrainingFrontmatter, TaskFrontmatter, MarkdownFile, assertTrainingMeta, assertTaskMeta } from '@/types/training';
import { PARSED_TRAININGS, PARSED_TASKS } from './markdown-data';

/**
 * すべてのトレーニングファイルのメタデータを取得
 * ビルド時にパース済みのデータを使用
 */
export function getAllTrainingFiles(): MarkdownFile[] {
  console.time('getAllTrainingFiles');
  
  try {
    const trainings: MarkdownFile[] = [];
    const slugMap = new Map<string, string>();
    
    for (const parsedTraining of PARSED_TRAININGS) {
      try {
        // 型安全性をチェック
        assertTrainingMeta(parsedTraining.frontmatter);
        
        // slug重複チェック
        if (slugMap.has(parsedTraining.slug)) {
          console.warn(`[WARN] duplicate slug "${parsedTraining.slug}" in ${parsedTraining.path} and ${slugMap.get(parsedTraining.slug)}`);
          continue;
        }
        slugMap.set(parsedTraining.slug, parsedTraining.path);
        
        trainings.push({
          path: parsedTraining.path,
          content: parsedTraining.content,
          frontmatter: parsedTraining.frontmatter,
          slug: parsedTraining.slug
        });
        
      } catch (error) {
        console.warn(`Failed to validate training file ${parsedTraining.path}:`, error);
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
 * ビルド時にパース済みのデータを使用
 */
export function loadTrainingTasks(trainingSlug: string): MarkdownFile[] {
  console.time(`loadTrainingTasks-${trainingSlug}`);
  
  try {
    const tasks: MarkdownFile[] = [];
    
    for (const parsedTask of PARSED_TASKS) {
      // 指定されたトレーニングのタスクのみをフィルタ
      if (parsedTask.trainingSlug !== trainingSlug) {
        continue;
      }
      
      try {
        // 型安全性をチェック
        assertTaskMeta(parsedTask.frontmatter);
        
        tasks.push({
          path: parsedTask.path,
          content: parsedTask.content,
          frontmatter: parsedTask.frontmatter,
          slug: parsedTask.slug
        });
        
      } catch (error) {
        console.warn(`Failed to validate task file ${parsedTask.path}:`, error);
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
 * ビルド時にパース済みのデータを使用
 */
export function loadTaskContent(trainingSlug: string, taskSlug: string): MarkdownFile | null {
  try {
    for (const parsedTask of PARSED_TASKS) {
      // 指定されたトレーニングとタスクの組み合わせを検索
      if (parsedTask.trainingSlug === trainingSlug && parsedTask.slug === taskSlug) {
        // 型安全性をチェック
        assertTaskMeta(parsedTask.frontmatter);
        
        return {
          path: parsedTask.path,
          content: parsedTask.content,
          frontmatter: parsedTask.frontmatter,
          slug: parsedTask.slug
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error loading task content for ${trainingSlug}/${taskSlug}:`, error);
    return null;
  }
}
