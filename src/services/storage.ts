import { supabase } from "@/integrations/supabase/client";
import matter from "gray-matter";

export interface MdxContent {
  content: string;
  frontmatter: {
    title: string;
    order_index?: number;
    is_premium?: boolean;
    video_full?: string;
    video_preview?: string;
    preview_sec?: number;
    preview_marker?: string;
    [key: string]: any;
  };
}

/**
 * Storageからトレーニングのメタデータを取得する
 */
export async function getTrainingMetaFromStorage(trainingSlug: string): Promise<MdxContent | null> {
  try {
    // メタファイルのパスを構築
    const filePath = `content/training/${trainingSlug}/meta.md`;
    
    // バケットの存在確認
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .getBucket('content');

    if (bucketError) {
      console.error('Storage bucketの確認エラー:', bucketError);
      throw new Error(`Storage bucket 'content' が見つかりません`);
    }

    // ファイルの存在確認
    const { data: existsData, error: existsError } = await supabase
      .storage
      .from('content')
      .list(`content/training/${trainingSlug}`);

    if (existsError) {
      console.error('ファイル一覧取得エラー:', existsError);
      throw new Error(`トレーニングフォルダの確認中にエラーが発生しました: ${trainingSlug}`);
    }

    if (!existsData || existsData.length === 0) {
      console.error('トレーニングフォルダが見つかりません:', trainingSlug);
      throw new Error(`トレーニングフォルダが見つかりません: ${trainingSlug}`);
    }

    const metaFile = existsData.find(file => file.name === 'meta.md');
    if (!metaFile) {
      console.error('メタファイルが見つかりません:', filePath);
      throw new Error(`メタファイルが見つかりません: ${filePath}\nトレーニングフォルダは存在しますが、meta.mdファイルがありません。`);
    }

    // ファイル内容の取得
    const { data, error } = await supabase
      .storage
      .from('content')
      .download(filePath);

    if (error) {
      console.error('ファイル取得エラー:', error);
      throw new Error(`メタファイルの取得に失敗しました: ${error.message}`);
    }

    // ファイル内容をテキストに変換
    const content = await data.text();
    
    // gray-matterでフロントマターをパース
    const { data: frontmatter, content: mdContent } = matter(content);

    console.log('メタデータ取得成功:', {
      filePath,
      frontmatter,
      contentPreview: mdContent.substring(0, 100) + '...'
    });

    return {
      content: mdContent,
      frontmatter: {
        title: frontmatter.title || '',
        ...frontmatter
      }
    };
  } catch (error) {
    // エラーをより詳細に記録
    console.error('メタデータ取得エラー:', {
      error,
      trainingSlug,
      timestamp: new Date().toISOString()
    });
    return null;
  }
}

/**
 * Storageからタスクのコンテンツを取得する
 */
export async function getMdxContentFromStorage(trainingSlug: string, taskSlug: string): Promise<MdxContent | null> {
  try {
    // コンテンツファイルのパスを構築
    const filePath = `content/training/${trainingSlug}/${taskSlug}/content.md`;
    
    // ファイルの存在確認
    const { data: existsData, error: existsError } = await supabase
      .storage
      .from('content')
      .list(`content/training/${trainingSlug}/${taskSlug}`);

    if (existsError || !existsData || existsData.length === 0 || !existsData.some(file => file.name === 'content.md')) {
      console.error('コンテンツファイルが見つかりません:', filePath);
      return null;
    }

    // ファイル内容の取得
    const { data, error } = await supabase
      .storage
      .from('content')
      .download(filePath);

    if (error) {
      console.error('ファイル取得エラー:', error);
      return null;
    }

    // ファイル内容をテキストに変換
    const content = await data.text();
    
    // gray-matterでフロントマターをパース
    const { data: frontmatter, content: mdContent } = matter(content);

    console.log('コンテンツ取得成功:', {
      filePath,
      frontmatter,
      contentPreview: mdContent.substring(0, 100) + '...'
    });

    return {
      content: mdContent,
      frontmatter: {
        title: frontmatter.title || '',
        order_index: frontmatter.order_index,
        is_premium: frontmatter.is_premium || false,
        video_full: frontmatter.video_full,
        video_preview: frontmatter.video_preview,
        preview_sec: frontmatter.preview_sec || 30,
        preview_marker: frontmatter.preview_marker,
        ...frontmatter
      }
    };
  } catch (error) {
    console.error('コンテンツ取得エラー:', error);
    return null;
  }
}