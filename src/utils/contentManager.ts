
import { supabase } from '@/integrations/supabase/client';
import { TrainingMeta, MdxContent } from '@/utils/mdxLoader';
import { ContentUploadResult } from '@/types/training';

/**
 * コンテンツファイルをアップロードする関数
 * @param trainingSlug トレーニングスラッグ
 * @param taskSlug タスクスラッグ
 * @param file MDファイル
 * @param overwrite 既存ファイルを上書きするかどうか
 */
export const uploadContentFile = async (
  trainingSlug: string, 
  taskSlug: string, 
  file: File,
  overwrite = false
): Promise<ContentUploadResult> => {
  try {
    // ファイルパスの構築
    const filePath = `content/${trainingSlug}/${taskSlug}/content.md`;
    
    // 既存ファイルの確認（上書きでない場合）
    if (!overwrite) {
      const { data: existingFiles } = await supabase
        .storage
        .from('content')
        .list(`content/${trainingSlug}/${taskSlug}`);
      
      // 既存ファイルがあり、上書きフラグがfalseの場合
      if (existingFiles && existingFiles.some(f => f.name === 'content.md')) {
        return {
          success: false,
          error: 'ファイルが既に存在します。上書きするにはoverwrite=trueを指定してください。',
          path: filePath
        };
      }
    }
    
    // ディレクトリ構造の確認と作成
    try {
      // trainingSlugディレクトリの確認
      const { data: trainingDir } = await supabase
        .storage
        .from('content')
        .list(`content`);
      
      if (!trainingDir || !trainingDir.some(d => d.name === trainingSlug)) {
        // 空のファイルをアップロードして擬似的にディレクトリを作成
        await supabase
          .storage
          .from('content')
          .upload(`content/${trainingSlug}/.placeholder`, new Blob(['']), {
            contentType: 'text/plain'
          });
      }
      
      // taskSlugディレクトリの確認
      const { data: taskDir } = await supabase
        .storage
        .from('content')
        .list(`content/${trainingSlug}`);
      
      if (!taskDir || !taskDir.some(d => d.name === taskSlug)) {
        // 空のファイルをアップロードして擬似的にディレクトリを作成
        await supabase
          .storage
          .from('content')
          .upload(`content/${trainingSlug}/${taskSlug}/.placeholder`, new Blob(['']), {
            contentType: 'text/plain'
          });
      }
    } catch (dirError) {
      console.error('ディレクトリ作成エラー:', dirError);
      // エラーが発生しても処理を続行（アップロード時に自動的にディレクトリが作成される場合もある）
    }
    
    // ファイルのアップロード
    const { data, error } = await supabase
      .storage
      .from('content')
      .upload(filePath, file, {
        contentType: 'text/markdown',
        upsert: overwrite
      });
    
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      path: filePath,
      data
    };
  } catch (error) {
    console.error('ファイルアップロードエラー:', error);
    return {
      success: false,
      error: error.message || 'ファイルのアップロードに失敗しました',
      path: `content/${trainingSlug}/${taskSlug}/content.md`
    };
  }
};

/**
 * トレーニングのメタデータをアップロードする関数
 * @param trainingSlug トレーニングスラッグ
 * @param metaFile メタデータファイル
 * @param overwrite 既存ファイルを上書きするかどうか
 */
export const uploadTrainingMeta = async (
  trainingSlug: string,
  metaFile: File,
  overwrite = false
): Promise<ContentUploadResult> => {
  try {
    // ファイルパスの構築
    const filePath = `content/${trainingSlug}/meta.md`;
    
    // 既存ファイルの確認（上書きでない場合）
    if (!overwrite) {
      const { data: existingFiles } = await supabase
        .storage
        .from('content')
        .list(`content/${trainingSlug}`);
      
      // 既存ファイルがあり、上書きフラグがfalseの場合
      if (existingFiles && existingFiles.some(f => f.name === 'meta.md')) {
        return {
          success: false,
          error: 'メタデータファイルが既に存在します。上書きするにはoverwrite=trueを指定してください。',
          path: filePath
        };
      }
    }
    
    // ディレクトリ構造の確認と作成
    try {
      const { data: trainingDir } = await supabase
        .storage
        .from('content')
        .list('content');
      
      if (!trainingDir || !trainingDir.some(d => d.name === trainingSlug)) {
        // 空のファイルをアップロードして擬似的にディレクトリを作成
        await supabase
          .storage
          .from('content')
          .upload(`content/${trainingSlug}/.placeholder`, new Blob(['']), {
            contentType: 'text/plain'
          });
      }
    } catch (dirError) {
      console.error('ディレクトリ作成エラー:', dirError);
      // エラーが発生しても処理を続行
    }
    
    // ファイルのアップロード
    const { data, error } = await supabase
      .storage
      .from('content')
      .upload(filePath, metaFile, {
        contentType: 'text/markdown',
        upsert: overwrite
      });
    
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      path: filePath,
      data
    };
  } catch (error) {
    console.error('メタデータアップロードエラー:', error);
    return {
      success: false,
      error: error.message || 'メタデータのアップロードに失敗しました',
      path: `content/${trainingSlug}/meta.md`
    };
  }
};

/**
 * コンテンツファイルを削除する関数
 * @param path ファイルパス
 */
export const deleteContentFile = async (path: string): Promise<{success: boolean; error?: string}> => {
  try {
    const { error } = await supabase
      .storage
      .from('content')
      .remove([path]);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('ファイル削除エラー:', error);
    return {
      success: false,
      error: error.message || 'ファイルの削除に失敗しました'
    };
  }
};

/**
 * トレーニングディレクトリの内容をリストアップする関数
 * @param trainingSlug トレーニングスラッグ
 */
export const listTrainingContents = async (trainingSlug: string): Promise<{
  success: boolean;
  files?: Array<{name: string; path: string; isDirectory: boolean}>;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .storage
      .from('content')
      .list(`content/${trainingSlug}`);
    
    if (error) {
      throw error;
    }
    
    // ファイルとディレクトリを分類
    const files = data
      .filter(item => item.name !== '.placeholder')
      .map(item => ({
        name: item.name,
        path: `content/${trainingSlug}/${item.name}`,
        isDirectory: !item.metadata
      }));
    
    return {
      success: true,
      files
    };
  } catch (error) {
    console.error('ディレクトリリストアップエラー:', error);
    return {
      success: false,
      error: error.message || 'ディレクトリの内容取得に失敗しました'
    };
  }
};

/**
 * ストレージ内の全トレーニングをリストアップする関数
 */
export const listAllTrainings = async (): Promise<{
  success: boolean;
  trainings?: Array<{slug: string}>;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .storage
      .from('content')
      .list('content');
    
    if (error) {
      throw error;
    }
    
    // ディレクトリのみを抽出
    const trainings = data
      .filter(item => !item.metadata)
      .map(item => ({
        slug: item.name
      }));
    
    return {
      success: true,
      trainings
    };
  } catch (error) {
    console.error('トレーニングリストアップエラー:', error);
    return {
      success: false,
      error: error.message || 'トレーニング一覧の取得に失敗しました'
    };
  }
};

/**
 * MDXコンテンツの内容を解析する関数
 * @param content MDXコンテンツ
 */
export const parseMdxContent = (content: string): {
  frontmatter: Record<string, any>;
  body: string;
} => {
  // front matterと本文を分離
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (!frontmatterMatch) {
    return {
      frontmatter: {},
      body: content
    };
  }
  
  const [_, frontmatterText, body] = frontmatterMatch;
  
  // frontmatterをパース
  const frontmatterLines = frontmatterText.split('\n');
  const frontmatter: Record<string, any> = {};
  
  frontmatterLines.forEach(line => {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const [__, key, valueStr] = match;
      let value: any = valueStr.trim();
      
      // Boolean値の変換
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      // 数値の変換
      else if (!isNaN(Number(value)) && value !== '') value = Number(value);
      // 配列の変換
      else if (value.startsWith('[') && value.endsWith(']')) {
        try {
          value = JSON.parse(value.replace(/'/g, '"'));
        } catch (e) {
          // パース失敗時は文字列のまま
        }
      }
      
      frontmatter[key.trim()] = value;
    }
  });
  
  return {
    frontmatter,
    body: body.trim()
  };
};

/**
 * ファイルの内容を取得する関数
 * @param path ファイルパス
 */
export const getFileContent = async (path: string): Promise<{
  success: boolean;
  content?: string;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .storage
      .from('content')
      .download(path);
    
    if (error) {
      throw error;
    }
    
    const content = await data.text();
    return {
      success: true,
      content
    };
  } catch (error) {
    console.error('ファイル取得エラー:', error);
    return {
      success: false,
      error: error.message || 'ファイルの取得に失敗しました'
    };
  }
};
