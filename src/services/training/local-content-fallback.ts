import { TaskDetailData } from "@/types/training";
import { TrainingError } from "@/utils/errors";

/**
 * ローカルコンテンツファイルからタスク詳細を取得する緊急フォールバック
 */
export const getLocalTaskContent = async (trainingSlug: string, taskSlug: string): Promise<TaskDetailData | null> => {
  console.log(`🔄 ローカルフォールバック実行: ${trainingSlug}/${taskSlug}`);
  
  try {
    // 既知のマッピング: blog -> ui-layout-basic01
    const taskMappings: Record<string, string> = {
      'blog': 'ui-layout-basic01',
      'introduction': 'introduction'
    };
    
    const actualTaskFolder = taskMappings[taskSlug] || taskSlug;
    const contentPath = `/content/training/${trainingSlug}/tasks/${actualTaskFolder}/content.md`;
    
    console.log(`📁 ローカルファイルパス: ${contentPath}`);
    
    // ハードコーディングされたフォールバックコンテンツ（開発・テスト用）
    let content: string;
    
    if (trainingSlug === 'info-odai-book-rental' && taskSlug === 'blog') {
      // blog タスクのハードコーディングされたコンテンツ
      content = `---
title: "ブログを書こう"
slug: "blog"
description: "デザインシステムの基本的な考え方から実装まで..."
thumbnail: "https://assets.st-note.com/production/uploads/images/176617746/rectangle_large_type_2_869fc7896ec9c07a842065899de7f4f5.png?width=1200"
category: "情報設計"
tags: ["やってみよう"]
order_index: 2
is_premium: false
estimated_time: false
video_free: "https://example.com/preview.mp4"
video_member: "https://example.com/full.mp4"
---

## チャレンジ内容

### 社内で利用する本の貸し出しシステムをデザインしよう

🧑‍💼 会社の社内で利用する社員向け本棚の本貸し出しシステムをデザインします。
本貸し出しをしているんだけど、期限が曖昧だったり、今どこにその本があるのかわからないからシステムにすることにしたのが背景です。

社員の感想などもデータにして、知識での写真コミュニケーションが広が理、社内の意識を少しでも変えられると良いなと思っています。

### 本を借りる側の体験をデザインしましょう

- 本を借りる側が「本を探す〜予約〜借りる」→「返却する」までの UI 体験をデザインしてください。
- 本管理側（本の登録など）の体験は考えなくて OK です。
- 社内なので本自体は物理本を想定しています。
- 物理本に付いている『QR』で、貸し出しと返却を照合できます。

## デザインするもの

### 要件から必要な情報を整理したもの

- コンポーネントの階層構造
- デザイントークンの活用
- 再利用性を考慮した設計

### 必要なユーザーの行動の流れを整理したもの

- インタビューした結果をまとめましょう。
- [リンクも表示できる](https://bo-no.design)

### UI 的な細やか設計のワークフロー

- コンポーネントの作成手順
- バリエーションの管理方法
- ドキュメンテーションの重要性

## デザイン解答例

<!-- PREMIUM_ONLY -->

### 解答例とプロの考え方

- 実際の制作プロセス
- 意思決定の根拠
- 改善のポイント

### より実践的なテクニック

- 効率的な作業方法
- チーム共有のコツ
- トラブルシューティング`;
    } else {
      console.warn(`❌ ハードコーディングされたフォールバックがありません: ${trainingSlug}/${taskSlug}`);
      return null;
    }
    
    // Front-matterとコンテンツを分離
    console.log('📋 Front-matter解析開始 - コンテンツ長:', content.length);
    
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontmatterMatch) {
      console.error('❌ Front-matter形式が不正です');
      console.error('📄 コンテンツの最初の200文字:', content.substring(0, 200));
      return null;
    }
    
    const [, frontmatterText, markdownContent] = frontmatterMatch;
    console.log('📋 Front-matter抽出完了 - Front-matter長:', frontmatterText.length, 'コンテンツ長:', markdownContent.length);
    
    // Front-matterをパース
    const frontmatter: Record<string, any> = {};
    const frontmatterLines = frontmatterText.split('\n').filter(line => line.trim());
    
    console.log('📋 Front-matter行数:', frontmatterLines.length);
    
    frontmatterLines.forEach((line, index) => {
      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (match) {
        const [, key, value] = match;
        let parsedValue: any = value.replace(/^["'](.*)["']$/, '$1'); // クォート除去
        
        // 型変換
        if (parsedValue === 'true') parsedValue = true;
        else if (parsedValue === 'false') parsedValue = false;
        else if (!isNaN(Number(parsedValue)) && parsedValue !== '') parsedValue = Number(parsedValue);
        
        const cleanKey = key.trim();
        frontmatter[cleanKey] = parsedValue;
        console.log(`📋 Front-matter[${index}]: ${cleanKey} = ${parsedValue} (${typeof parsedValue})`);
      } else {
        console.warn(`⚠️ Front-matter行 ${index} をパースできませんでした:`, line);
      }
    });
    
    console.log('✅ ローカルコンテンツ解析完了:', { 
      title: frontmatter.title,
      slug: frontmatter.slug,
      contentLength: markdownContent.length 
    });
    
    // TaskDetailData形式に変換
    const taskDetail: TaskDetailData = {
      id: `${trainingSlug}-${taskSlug}`,
      slug: taskSlug,
      title: frontmatter.title || 'タイトル未設定',
      content: markdownContent.trim(),
      is_premium: Boolean(frontmatter.is_premium || false),
      order_index: frontmatter.order_index || 1,
      training_id: trainingSlug,
      created_at: new Date().toISOString(),
      video_full: frontmatter.video_member,
      video_preview: frontmatter.video_free,
      preview_sec: frontmatter.preview_sec || 30,
      trainingTitle: `${trainingSlug} トレーニング`,
      trainingSlug: trainingSlug,
      next_task: frontmatter.next_task,
      prev_task: frontmatter.prev_task,
      isPremiumCut: false,
      hasAccess: true,
      estimated_time: frontmatter.estimated_time,
      difficulty: frontmatter.difficulty,
      description: frontmatter.description
    };
    
    console.log('🎯 TaskDetailData変換完了:', {
      id: taskDetail.id,
      title: taskDetail.title,
      contentLength: taskDetail.content.length,
      is_premium: taskDetail.is_premium,
      order_index: taskDetail.order_index
    });
    
    return taskDetail;
    
  } catch (error) {
    console.error('❌ ローカルフォールバック処理エラー:', error);
    return null;
  }
};

/**
 * タスクスラッグからフォルダ名にマッピングする関数
 */
export const getTaskFolderMapping = (trainingSlug: string, taskSlug: string): string | null => {
  // info-odai-book-rental 専用のマッピング
  if (trainingSlug === 'info-odai-book-rental') {
    const mappings: Record<string, string> = {
      'blog': 'ui-layout-basic01',
      'introduction': 'introduction'
    };
    return mappings[taskSlug] || null;
  }
  
  // 他のトレーニングでは直接マッピング
  return taskSlug;
};