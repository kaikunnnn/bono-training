
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORSヘッダーの設定
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MdxContentRequest {
  trainingSlug: string;
  taskSlug: string;
}

interface MdxContentResponse {
  content: string;
  frontmatter: {
    title: string;
    order_index?: number;
    is_premium?: boolean;
    video_full?: string;
    video_preview?: string;
    [key: string]: any;
  };
  error?: string;
}

// サンプルMDXコンテンツ（実際の実装では、ファイルシステムやDBから取得する）
const SAMPLE_MDX_CONTENTS: Record<string, Record<string, MdxContentResponse>> = {
  "react-basics": {
    "components-intro": {
      content: `# Reactコンポーネント入門

Reactの最も重要な概念の一つが「コンポーネント」です。コンポーネントを使うことで、UIを独立した再利用可能なパーツに分割できます。

## コンポーネントとは何か？

コンポーネントは、アプリケーションのUIの一部を表すJavaScriptの関数やクラスです。コンポーネントは入力としてプロパティ（props）を受け取り、画面に表示されるReact要素を返します。

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
\`\`\`

## コンポーネントの種類

Reactには主に2種類のコンポーネントがあります：

1. **関数コンポーネント**: JavaScriptの関数として定義されたコンポーネント
2. **クラスコンポーネント**: ES6のクラスとして定義されたコンポーネント`,
      frontmatter: {
        title: "Reactコンポーネント入門",
        order_index: 1,
        is_premium: false,
        video_full: "845235294",
        video_preview: "845235294"
      }
    },
    "state-and-hooks": {
      content: `# StateとHooksの使い方

Reactアプリケーションで動的なUIを作成するには、「State（状態）」の管理が不可欠です。
React Hooksを使うと、関数コンポーネントでもStateや他のReact機能を使用できます。

## useState Hookの基本

\`useState\`は、関数コンポーネントでStateを使うための最も基本的なHookです。

\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
  // [現在の状態, 状態を更新する関数] = useState(初期値);
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\``,
      frontmatter: {
        title: "StateとHooksの使い方",
        order_index: 2,
        is_premium: true,
        video_full: "845235300",
        video_preview: "845235301"
      }
    }
  }
};

// MDXコンテンツ取得ハンドラ
const handleGetMdxContent = async (req: Request): Promise<Response> => {
  try {
    // リクエストボディからトレーニングとタスクのスラッグを取得
    const requestData = await req.json() as MdxContentRequest;
    const { trainingSlug, taskSlug } = requestData;
    
    if (!trainingSlug || !taskSlug) {
      return new Response(
        JSON.stringify({ 
          error: "トレーニングスラッグとタスクスラッグが必要です"
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Supabaseクライアントの初期化
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    // 認証情報を取得
    const { data: { user } } = await supabaseAdmin.auth.getUser();
    
    // ここでは簡易的にサンプルデータを返していますが、
    // 実際の実装ではファイルシステムやDBからMDXコンテンツを取得します
    let mdxContent = SAMPLE_MDX_CONTENTS[trainingSlug]?.[taskSlug];
    
    if (!mdxContent) {
      // 見つからない場合はダミーデータを返す
      mdxContent = {
        content: `# ${taskSlug} タスク\n\n${trainingSlug}の詳細を説明します。`,
        frontmatter: {
          title: `${taskSlug} タスク`,
          order_index: 1,
          is_premium: false
        }
      };
    }
    
    // プレミアムコンテンツのアクセス制御
    const isPremium = mdxContent.frontmatter.is_premium;
    
    // プレミアムコンテンツで非認証ユーザーまたは非サブスクライバーの場合プレビュー表示
    let isFreePreview = false;
    
    if (isPremium) {
      // ユーザーのサブスクリプション情報を取得
      if (!user) {
        // 未認証ユーザー：プレビューのみ表示
        isFreePreview = true;
      } else {
        // サブスクリプション情報を確認
        const { data: subscription } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('plan_members', true)
          .single();
        
        // サブスクリプションがない場合はプレビューのみ表示
        if (!subscription) {
          isFreePreview = true;
        }
      }
    }
    
    // プレビュー表示の場合はコンテンツを制限
    if (isFreePreview) {
      // コンテンツの最初の一部分のみを返す
      const previewLength = 500; // 500文字までをプレビューとする
      mdxContent.content = mdxContent.content.substring(0, previewLength) + '...';
    }
    
    return new Response(
      JSON.stringify({ 
        ...mdxContent,
        isFreePreview
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('MDXコンテンツ取得エラー:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'MDXコンテンツの取得に失敗しました' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

// リクエストハンドラ
serve(async (req) => {
  // CORSプリフライトリクエストの処理
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // POSTリクエストの処理
  if (req.method === 'POST') {
    return await handleGetMdxContent(req);
  }
  
  // その他のメソッドはエラー
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
});
