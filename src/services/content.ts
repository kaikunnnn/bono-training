
import { supabase } from '@/integrations/supabase/client';
import { ContentItem } from '@/types/content';
import { getContentById as getMockContentById } from '@/data/mockContent';

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
      console.error('コンテンツID未指定エラー');
      return {
        content: null,
        error: new Error('コンテンツIDが指定されていません'),
      };
    }

    console.log(`リクエスト開始 - コンテンツID: ${contentId}`);

    // ユーザーの認証状態を確認
    const { data: { session } } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.user;
    
    console.log(`認証状態: ${isAuthenticated ? '認証済み' : '未認証'}`);

    // TODO: Phase-1でGitHub/ローカルファイルベースの実装に変更予定
    // Supabase Edge Functionの呼び出しは一時的に無効化
    /*
    const { data, error } = await supabase.functions.invoke('get-content', {
      method: 'POST',
      body: { id: contentId },
    });

    console.log('レスポンス:', { data, error });

    // APIからエラーが返された場合（コンテンツがない、サーバーエラーなど）
    if (error && !data?.content) {
      console.error('コンテンツ取得エラー:', error);
      return {
        content: null,
        error: new Error(error.message || 'コンテンツの取得に失敗しました'),
      };
    }

    // 無料プレビューコンテンツの場合
    if (data?.isFreePreview && data?.content) {
      console.log('無料プレビューコンテンツを返却:', data.content);
      return {
        content: data.content as ContentItem,
        error: new Error(data.message || 'このコンテンツにアクセスするには、サブスクリプションが必要です'),
        isFreePreview: true
      };
    }

    // 正常なレスポンス
    if (data?.content) {
      console.log('コンテンツ取得成功:', data.content);
      return {
        content: data.content as ContentItem,
        error: null
      };
    }
    */

    // Phase-0: モックデータから直接取得
    const mockContent = getMockContentById(contentId);
    if (mockContent) {
      if (mockContent.accessLevel === 'free' || isAuthenticated) {
        // 無料コンテンツまたは認証済みユーザーには完全なコンテンツを返す
        return {
          content: mockContent,
          error: null,
          isFreePreview: false
        };
      } else {
        // 未認証ユーザーには無料プレビューを返す
        return {
          content: {
            ...mockContent,
            videoUrl: mockContent.freeVideoUrl || mockContent.videoUrl,
            content: mockContent.freeContent || mockContent.content
          },
          error: new Error('このコンテンツの完全版を閲覧するには、ログインが必要です'),
          isFreePreview: true
        };
      }
    }

    // ここまで到達したが、コンテンツが見つからない場合はエラーを返す
    return {
      content: null,
      error: new Error('コンテンツが見つかりませんでした'),
    };
  } catch (err) {
    console.error('予期せぬエラー:', err);
    return {
      content: null,
      error: err instanceof Error ? err : new Error('不明なエラーが発生しました'),
    };
  }
}
