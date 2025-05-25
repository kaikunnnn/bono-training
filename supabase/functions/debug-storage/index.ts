
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORSヘッダーの設定
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function debugStorage(supabase) {
  try {
    console.log('=== Storage デバッグ情報取得開始 ===');
    
    // 1. 全バケット一覧
    console.log('1. 全バケット一覧取得...');
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('バケット一覧取得エラー:', bucketsError);
      return { error: 'バケット一覧取得に失敗', details: bucketsError };
    }
    
    console.log('利用可能なバケット:', buckets?.map(b => ({ name: b.name, public: b.public, id: b.id })));
    
    // 2. content バケットの詳細確認
    const contentBucket = buckets?.find(b => b.name === 'content');
    if (!contentBucket) {
      return { error: 'content バケットが存在しません', buckets };
    }
    
    console.log('2. content バケットの詳細:', contentBucket);
    
    // 3. content バケットのルートディレクトリ
    console.log('3. content バケットのルートディレクトリ確認...');
    const { data: rootFiles, error: rootError } = await supabase
      .storage
      .from('content')
      .list('', { limit: 100 });
    
    if (rootError) {
      console.error('ルートディレクトリアクセスエラー:', rootError);
      return { error: 'ルートディレクトリアクセス失敗', details: rootError };
    }
    
    console.log('ルートディレクトリの内容:', rootFiles);
    
    // 4. training フォルダの詳細
    console.log('4. training フォルダの詳細確認...');
    const trainingExists = rootFiles?.some(f => f.name === 'training');
    
    if (!trainingExists) {
      return { 
        error: 'training フォルダが見つかりません',
        rootContents: rootFiles,
        suggestion: 'content/training/ フォルダ構造を確認してください'
      };
    }
    
    const { data: trainingFiles, error: trainingError } = await supabase
      .storage
      .from('content')
      .list('training', { limit: 100 });
    
    if (trainingError) {
      console.error('training フォルダアクセスエラー:', trainingError);
      return { error: 'training フォルダアクセス失敗', details: trainingError };
    }
    
    console.log('training フォルダの内容:', trainingFiles);
    
    // 5. 各トレーニングフォルダの詳細
    const trainingDetails = [];
    
    for (const folder of trainingFiles || []) {
      if (folder.id && !folder.id.includes('.')) {
        console.log(`5.${folder.name} フォルダの詳細確認...`);
        const { data: folderContents, error: folderError } = await supabase
          .storage
          .from('content')
          .list(`training/${folder.name}`, { limit: 100 });
        
        if (folderError) {
          console.error(`${folder.name} フォルダエラー:`, folderError);
          trainingDetails.push({
            name: folder.name,
            error: folderError,
            accessible: false
          });
        } else {
          console.log(`${folder.name} フォルダ内容:`, folderContents);
          trainingDetails.push({
            name: folder.name,
            contents: folderContents,
            accessible: true,
            hasIndexMd: folderContents?.some(f => f.name === 'index.md') || false
          });
        }
      }
    }
    
    return {
      success: true,
      buckets,
      contentBucket,
      rootContents: rootFiles,
      trainingFolderExists: trainingExists,
      trainingContents: trainingFiles,
      trainingDetails
    };
    
  } catch (error) {
    console.error('Storage デバッグ中にエラー:', error);
    return { error: 'Storage デバッグに失敗', details: error };
  }
}

serve(async (req) => {
  // CORSプリフライトリクエストの処理
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    console.log('=== debug-storage API呼び出し開始 ===');
    
    // Supabaseクライアントの初期化
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Service Key 設定状況:', supabaseServiceKey ? '設定済み' : '未設定');
    
    if (!supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Service Role Key が設定されていません' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const debugInfo = await debugStorage(supabase);
    
    console.log('=== デバッグ情報取得完了 ===');
    
    return new Response(
      JSON.stringify(debugInfo, null, 2),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('=== debug-storage エラー ===');
    console.error('エラーメッセージ:', error.message);
    console.error('エラー詳細:', JSON.stringify(error, null, 2));
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Storage デバッグに失敗しました' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
