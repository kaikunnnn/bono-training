/**
 * 新しいマークダウン構造に対応したトレーニング詳細取得サービス
 * Phase 5: データ取得ロジックの対応
 */

import { supabase } from "@/integrations/supabase/client";
import { TrainingDetailDataV2, assertTrainingMetaV2 } from "@/types/training-v2";
import { TrainingError } from "@/utils/errors";
import { handleEdgeFunctionError, validateEdgeFunctionResponse } from "./error-handlers";
import { getTrainingDetail } from "./training-detail"; // フォールバック用

/**
 * 新しい構造対応のトレーニング詳細情報を取得（v2）
 */
export const getTrainingDetailV2 = async (slug: string): Promise<TrainingDetailDataV2> => {
  try {
    console.log(`Edge Function V2からトレーニング詳細を取得: ${slug}`);
    
    if (!slug || slug.trim() === '') {
      throw new TrainingError('トレーニングスラッグが指定されていません', 'INVALID_REQUEST', 400);
    }
    
    // まず新しいEdge Functionを試行
    try {
      const { data, error } = await supabase.functions.invoke('get-training-detail-v2', {
        body: { slug }
      });

      if (error) {
        console.warn('新しいAPI失敗、フォールバックします:', error);
        throw error;
      }

      // 新フィールドの型チェック
      if (data?.frontmatter) {
        assertTrainingMetaV2(data.frontmatter);
      }

      return validateEdgeFunctionResponse(data, 'トレーニング詳細V2') as TrainingDetailDataV2;
      
    } catch (v2Error) {
      console.warn('V2 API失敗、既存システムにフォールバック:', v2Error);
      
      // 既存システムにフォールバック
      const legacyData = await getTrainingDetail(slug);
      
      // 既存データを新フォーマットに変換
      return convertLegacyToV2(legacyData, slug);
    }
    
  } catch (err) {
    // カスタムエラーは再スロー
    if (err instanceof TrainingError) {
      throw err;
    }
    
    console.error('getTrainingDetailV2 予期しないエラー:', err);
    throw new TrainingError('トレーニング詳細V2の取得中に予期しないエラーが発生しました', 'UNKNOWN_ERROR');
  }
};

/**
 * 既存データを新V2フォーマットに変換
 */
const convertLegacyToV2 = async (legacyData: any, slug: string): Promise<TrainingDetailDataV2> => {
  try {
    // マークダウンコンテンツを直接Storageから取得
    const content = await fetchMarkdownContent(slug);
    
    // 新フォーマットに変換
    const v2Data: TrainingDetailDataV2 = {
      id: legacyData.id || slug,
      slug: slug,
      frontmatter: {
        icon: legacyData.icon || '/default-icon.png',
        title: legacyData.title || 'タイトルなし',
        description: legacyData.description || '',
        thumbnail: legacyData.thumbnail || legacyData.thumbnailImage || '/default-thumbnail.png',
        type: (legacyData.type as any) || 'challenge',
        difficulty: legacyData.difficulty,
        tags: legacyData.tags || [],
        estimated_total_time: legacyData.estimated_total_time || '不明',
        task_count: legacyData.task_count || legacyData.tasks?.length || 0,
        category: legacyData.category,
        is_premium: legacyData.has_premium_content || false
      },
      content: content,
      tasks: legacyData.tasks,
      isPremium: legacyData.has_premium_content || false,
      hasAccess: true // 既存データなのでアクセス許可
    };

    return v2Data;
    
  } catch (error) {
    console.error('レガシーデータ変換エラー:', error);
    throw new TrainingError('データ変換中にエラーが発生しました', 'CONVERSION_ERROR');
  }
};

/**
 * Storageから直接マークダウンコンテンツを取得
 */
const fetchMarkdownContent = async (slug: string): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from('training-content')
      .download(`training/${slug}/index.md`);

    if (error) {
      console.warn('Storage直接取得失敗:', error);
      return `# ${slug}\n\nコンテンツを読み込めませんでした。`;
    }

    const text = await data.text();
    
    // フロントマターを除去してコンテンツ部分のみ抽出
    const frontmatterMatch = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (frontmatterMatch) {
      return frontmatterMatch[2].trim();
    }
    
    return text;
    
  } catch (error) {
    console.error('マークダウンコンテンツ取得エラー:', error);
    return `# ${slug}\n\nコンテンツの取得中にエラーが発生しました。`;
  }
};