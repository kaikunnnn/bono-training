import yaml from 'js-yaml';
import { TrainingFrontmatter } from '@/types/training';

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
        const parsedFrontmatter = yaml.load(yamlString) as TrainingFrontmatter;
        return {
          frontmatter: parsedFrontmatter,
          content: content.trim()
        };
      } catch (yamlError) {
        console.error('YAMLパースエラー:', yamlError);
        throw new Error('YAMLパースに失敗しました');
      }
    } else {
      throw new Error('フロントマターが見つかりません');
    }
  } catch (error) {
    console.error('トレーニングコンテンツの読み込みエラー:', error);
    throw error;
  }
};