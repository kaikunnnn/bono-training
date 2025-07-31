import yaml from 'js-yaml';
import { TrainingFrontmatter, validateTrainingMeta } from '@/types/training';

export interface TrainingContent {
  frontmatter: TrainingFrontmatter;
  content: string;
}

export const loadTrainingContent = async (trainingSlug: string): Promise<TrainingContent> => {
  try {
    // Viteの?rawインポートでindex.mdを読み込み
    const indexMdModule = await import(`../../content/training/${trainingSlug}/index.md?raw`);
    const indexMdContent = indexMdModule.default;
    
    // フロントマターとコンテンツを分離
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;
    const match = indexMdContent.match(frontmatterRegex);
    
    if (match) {
      const [, yamlString, content] = match;
      try {
        // js-yamlでフロントマターをパース
        const rawFrontmatter = yaml.load(yamlString);
        
        // Zodスキーマでバリデーション
        const validatedFrontmatter = validateTrainingMeta(rawFrontmatter);
        
        return {
          frontmatter: validatedFrontmatter,
          content: content.trim()
        };
      } catch (yamlError) {
        console.error('フロントマターの処理エラー:', yamlError);
        if (yamlError instanceof Error) {
          throw new Error(`フロントマターの処理に失敗しました: ${yamlError.message}`);
        }
        throw new Error('フロントマターの処理に失敗しました');
      }
    } else {
      throw new Error('フロントマターが見つかりません');
    }
  } catch (error) {
    console.error('トレーニングコンテンツの読み込みエラー:', error);
    throw error;
  }
};