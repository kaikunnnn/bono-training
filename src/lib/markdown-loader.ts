
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
  console.log(`=== Loading tasks for training: ${trainingSlug} ===`);
  
  try {
    const tasks: MarkdownFile[] = [];
    
    // デバッグ: 利用可能なタスク一覧を表示
    console.log('Available PARSED_TASKS:', PARSED_TASKS.map(t => ({
      path: t.path,
      trainingSlug: t.trainingSlug,
      slug: t.slug
    })));
    
    for (const parsedTask of PARSED_TASKS) {
      console.log(`Checking task: ${parsedTask.trainingSlug}/${parsedTask.slug} against ${trainingSlug}`);
      
      // 指定されたトレーニングのタスクのみをフィルタ
      if (parsedTask.trainingSlug !== trainingSlug) {
        continue;
      }
      
      console.log(`Found matching task: ${parsedTask.slug}`);
      
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
    
    console.log(`=== Loaded ${tasks.length} tasks for training ${trainingSlug} ===`);
    console.log('Task slugs found:', tasks.map(t => t.slug));
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
  console.log(`=== Loading task content: ${trainingSlug}/${taskSlug} ===`);
  
  try {
    // デバッグ: 利用可能なタスク一覧を表示
    console.log('All available tasks in PARSED_TASKS:');
    PARSED_TASKS.forEach((task, index) => {
      console.log(`  ${index}: ${task.trainingSlug}/${task.slug} (path: ${task.path})`);
    });
    
    console.log(`Searching for: training="${trainingSlug}" task="${taskSlug}"`);
    
    for (const parsedTask of PARSED_TASKS) {
      console.log(`Comparing: "${parsedTask.trainingSlug}" === "${trainingSlug}" && "${parsedTask.slug}" === "${taskSlug}"`);
      
      // 指定されたトレーニングとタスクの組み合わせを検索
      if (parsedTask.trainingSlug === trainingSlug && parsedTask.slug === taskSlug) {
        console.log(`=== MATCH FOUND ===`);
        console.log('Found task:', {
          path: parsedTask.path,
          trainingSlug: parsedTask.trainingSlug,
          slug: parsedTask.slug,
          frontmatter: parsedTask.frontmatter
        });
        
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
    
    console.log(`=== NO MATCH FOUND ===`);
    console.log(`Could not find task: ${trainingSlug}/${taskSlug}`);
    return null;
    
  } catch (error) {
    console.error(`Error loading task content for ${trainingSlug}/${taskSlug}:`, error);
    return null;
  }
}
