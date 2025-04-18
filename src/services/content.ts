
import { supabase } from '@/integrations/supabase/client';
import { ContentItem } from '@/types/content';

/**
 * 指定されたIDのコンテンツを取得する
 * @param contentId コンテンツID
 * @returns コンテンツとエラー情報
 */
export async function getContentById(contentId: string): Promise<{
  content: ContentItem | null;
  error: Error | null;
  isFreePreview?: boolean;
}> {
  try {
    if (!contentId) {
      return {
        content: null,
        error: new Error('コンテンツIDが指定されていません'),
      };
    }

    console.log('Fetching content with ID:', contentId); // IDが正しく渡されているか確認

    // POSTメソッドを使用してJSONボディにIDを送信
    const { data, error } = await supabase.functions.invoke('get-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: contentId }) // 必ずJSONとして文字列化する
    });

    if (error) {
      console.error('コンテンツ取得エラー:', error);
      return {
        content: null,
        error: new Error(error.message || 'コンテンツの取得に失敗しました'),
      };
    }

    // エラーステータスの場合でもコンテンツの無料プレビュー部分を返す場合がある
    if (data.error && data.content) {
      return {
        content: data.content as ContentItem,
        error: new Error(data.message || 'このコンテンツにアクセスするには、サブスクリプションが必要です'),
        isFreePreview: true
      };
    }

    if (data.error) {
      return {
        content: null,
        error: new Error(data.message || 'コンテンツの取得に失敗しました'),
      };
    }

    return {
      content: data.content as ContentItem,
      error: null
    };
  } catch (err) {
    console.error('コンテンツ取得エラー:', err);
    return {
      content: null,
      error: err instanceof Error ? err : new Error('不明なエラーが発生しました'),
    };
  }
}
