import { supabase } from "@/integrations/supabase/client";

/**
 * MDXファイルのコンテンツ型定義
 */
export interface MdxContent {
  content: string;
  frontmatter: {
    title: string;
    order_index?: number;
    is_premium?: boolean;
    video_full?: string;
    video_preview?: string;
    [key: string]: any;
  };
}

/**
 * MDXファイルを読み込む関数
 * @param trainingSlug トレーニングのスラッグ
 * @param taskSlug タスクのスラッグ 
 */
export const loadMdxContent = async (trainingSlug: string, taskSlug: string): Promise<MdxContent> => {
  try {
    // 実際の実装では、エッジ関数を通してMDXファイルを取得する
    // または、インポート機能を使ってwebpackなどで直接ファイルを取り込む
    
    // エッジ関数を呼び出す例（実際の実装では使用）
    // const { data, error } = await supabase.functions.invoke('get-mdx-content', {
    //   body: { trainingSlug, taskSlug }
    // });
    
    // if (error) throw error;
    // return data;
    
    // 仮のデータ（開発用）
    const frontmatter = {
      title: `${taskSlug} タスク`,
      order_index: 1,
      is_premium: taskSlug.includes('premium'),
      video_full: taskSlug.includes('premium') ? "845235300" : "845235294",
      video_preview: "845235294"
    };
    
    const content = `
# ${taskSlug} タスク

## 目的

このタスクでは、${trainingSlug}の基本的な概念を学びます。

## 手順

1. まずは基本的な構造を理解しましょう
2. 次に実践的な例を見ていきます
3. 最後に自分で実装してみましょう

## コード例

\`\`\`javascript
function example() {
  console.log("Hello, Training!");
}
\`\`\`

## 参考リソース

- [公式ドキュメント](https://example.com)
- [チュートリアル](https://example.com/tutorial)

## 課題

以下の要件を満たすアプリケーションを実装してください：

- 要件1: xxx
- 要件2: xxx
- 要件3: xxx

## プレミアムコンテンツ（ここから先はプレミアム会員のみ）

こちらは詳細な解説と実装のヒントです。

### 実装のポイント

- ポイント1
- ポイント2
- ポイント3

### 解答例

\`\`\`javascript
// 解答例のコード
function solution() {
  // 詳細な実装
}
\`\`\`
`;

    return { content, frontmatter };
  } catch (error) {
    console.error('MDXコンテンツ読み込みエラー:', error);
    throw new Error('コンテンツの読み込みに失敗しました');
  }
};

/**
 * トレーニングのメタデータを読み込む関数
 * @param trainingSlug トレーニングのスラッグ
 */
export const loadTrainingMeta = async (trainingSlug: string): Promise<any> => {
  try {
    // 実際の実装では、エッジ関数を通してMDXファイルを取得する
    // const { data, error } = await supabase.functions.invoke('get-training-meta', {
    //   body: { trainingSlug }
    // });
    
    // if (error) throw error;
    // return data;
    
    // 仮のデータ（開発用）
    return {
      title: `${trainingSlug} トレーニング`,
      description: `${trainingSlug}の基本的な概念と実践的な使い方を学びます。`,
      type: "skill",
      difficulty: "初級",
      tags: ["React", "JavaScript", "フロントエンド"]
    };
  } catch (error) {
    console.error('トレーニングメタデータ読み込みエラー:', error);
    throw new Error('メタデータの読み込みに失敗しました');
  }
};

/**
 * すべてのトレーニングのメタ情報を取得する
 */
export async function loadAllTrainingMeta() {
  try {
    const trainings = [];
    
    // content/training/ ディレクトリ内のトレーニングディレクトリを取得
    // 注: ここでは実際のファイルシステム走査の代わりに既知のトレーニングスラッグを使用
    const knownTrainingSlugs = ['react-basics']; // 既知のトレーニングスラッグリスト
    
    // 各トレーニングのメタデータを取得
    for (const slug of knownTrainingSlugs) {
      try {
        const meta = await loadTrainingMeta(slug);
        if (meta) {
          trainings.push(meta);
        }
      } catch (error) {
        console.warn(`トレーニング ${slug} のメタデータ取得エラー:`, error);
        // エラーが発生しても続行
      }
    }
    
    return trainings;
  } catch (error) {
    console.error('トレーニングメタデータの取得に失敗しました:', error);
    return [];
  }
}
