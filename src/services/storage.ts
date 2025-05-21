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
    const filePath = `content/${trainingSlug}/meta.md`;
    
    // ファイルの存在確認
    const { data: existsData, error: existsError } = await supabase
      .storage
      .from('content')
      .list(`content/${trainingSlug}`);

    if (existsError || !existsData || existsData.length === 0 || !existsData.some(file => file.name === 'meta.md')) {
      console.error('メタファイルが見つかりません:', filePath);
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
    console.error('メタデータ取得エラー:', error);
    return null;
  }
}

/**
 * Storageからタスクのコンテンツを取得する
 */
export async function getMdxContentFromStorage(trainingSlug: string, taskSlug: string): Promise<MdxContent | null> {
  try {
    // コンテンツファイルのパスを構築
    const filePath = `content/${trainingSlug}/${taskSlug}/content.md`;
    
    // ファイルの存在確認
    const { data: existsData, error: existsError } = await supabase
      .storage
      .from('content')
      .list(`content/${trainingSlug}/${taskSlug}`);

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