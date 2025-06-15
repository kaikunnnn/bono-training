# /training 実装ガイド - 開発者向け詳細仕様

## 📋 **実装概要**

### 🎯 **目標**
`/training` 以下のページを段階的に実装し、Communityプラン（1,480円/月）の課金導線を完成させる

### 📊 **3段階の実装計画**
```
Phase 1 (最優先): Community課金完成 → 即リリース可能
Phase 2 (次優先): /training コンテンツ基盤 → 公開準備完了
Phase 3 (将来): 全プラン対応 → 必要に応じて拡張
```

---

## 🚀 **Phase 1: Community課金完成**
**期間**: 0.5日 | **優先度**: 最高 | **リリース**: 即座に可能

### 1.1 環境変数設定
**場所**: Supabase Dashboard → Settings → Edge Functions → Environment Variables

```env
# 追加する環境変数
STRIPE_TEST_COMMUNITY_PRICE_ID=price_1RI4ClKUVUnt8GtygLpincko
STRIPE_COMMUNITY_PRICE_ID=[本番で新規作成するPrice ID]

# 削除する環境変数  
❌ STRIPE_PRICE_ID
❌ STRIPE_TEST_PRICE_ID
```

### 1.2 Stripe Dashboard作業
**本番Price ID作成**:
1. [Stripe Dashboard](https://dashboard.stripe.com) にログイン
2. 「本番データを表示」に切り替え
3. 新商品作成:
   ```
   商品名: Training Community Plan
   説明: BONOトレーニングの全コンテンツアクセス
   価格: ¥1,480
   請求期間: 毎月
   ```
4. 作成されたPrice IDをSupabaseに設定

### 1.3 確認テスト
- [ ] `/training/plan` でCommunityプラン表示
- [ ] 決済ボタンクリック → Stripe Checkout遷移
- [ ] テスト決済完了 → member権限付与確認
- [ ] Training コンテンツへのアクセス確認

---

## 🛠 **Phase 2: /training コンテンツ基盤整備**
**期間**: 2日 | **優先度**: 高 | **目標**: コンテンツ公開準備完了

### 2.1 ページ構成
```
/training/
├── index.tsx          # ホーム・カタログページ
├── [slug]/
│   ├── index.tsx      # トレーニング詳細ページ  
│   └── [task].tsx     # タスク詳細ページ
└── plan/
    └── index.tsx      # 課金ページ ✅ 完成済み
```

### 2.2 データ構造
```typescript
// トレーニング情報
interface Training {
  slug: string;
  title: string;
  description: string;
  type: 'challenge' | 'skill';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPremium: boolean;
  tasks: Task[];
  tags: string[];
}

// タスク情報  
interface Task {
  slug: string;
  title: string;
  description: string;
  isPremium: boolean;
  content: string; // Markdown content
  videoUrl?: string;
  estimatedTime: number;
  order: number;
}
```

### 2.3 Supabase Storage セットアップ

#### A. バケット作成（SQL実行）
```sql
-- プライベートバケット作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('training-content', 'training-content', false);
```

#### B. RLS ポリシー設定（SQL実行）
```sql
-- 無料コンテンツは匿名でも閲覧可能
CREATE POLICY "anon_read_free_content"
  ON storage.objects FOR SELECT  
  TO anon
  USING (
    bucket_id = 'training-content' 
    AND metadata->>'is_free' = 'true'
  );

-- 認証ユーザーは全コンテンツ閲覧可能
CREATE POLICY "authenticated_read_all"
  ON storage.objects FOR SELECT
  TO authenticated  
  USING (bucket_id = 'training-content');
```

### 2.4 Edge Function実装

#### A. get-training-content Function
**ファイル**: `supabase/functions/get-training-content/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { slug, task } = await req.json();
    
    // Supabase client初期化
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // JWT トークンから ユーザー情報取得
    const authHeader = req.headers.get("authorization");
    const { data: { user } } = await supabase.auth.getUser(
      authHeader?.replace("Bearer ", "") ?? ""
    );
    
    // ファイルパス決定
    const path = task 
      ? `training/${slug}/tasks/${task}.md`
      : `training/${slug}/index.md`;
    
    // Storage からファイル取得
    const { data, error } = await supabase.storage
      .from('training-content')
      .download(path);
      
    if (error) {
      return new Response(JSON.stringify({ error: "Content not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const content = await data.text();
    const { frontMatter, body } = parseFrontMatter(content);
    
    // アクセス権限チェック
    const hasAccess = frontMatter.isPremium 
      ? user?.app_metadata?.subscription?.hasMemberAccess 
      : true;
    
    // コンテンツ出し分け
    const displayContent = hasAccess 
      ? body
      : body.split('<!-- PREMIUM_ONLY -->')[0];
    
    return new Response(JSON.stringify({
      frontMatter,
      content: displayContent,
      hasAccess,
      showPremiumBanner: frontMatter.isPremium && !hasAccess
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Front Matter パース関数
function parseFrontMatter(content: string) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontMatter: {}, body: content };
  
  const [, frontMatterStr, body] = match;
  const frontMatter = Object.fromEntries(
    frontMatterStr.split('\n')
      .filter(line => line.includes(':'))
      .map(line => {
        const [key, ...valueParts] = line.split(':');
        return [key.trim(), valueParts.join(':').trim()];
      })
  );
  
  return { frontMatter, body };
}
```

### 2.5 フロントエンド実装

#### A. Training ホームページ
**ファイル**: `src/pages/Training/index.tsx`

```tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';

interface Training {
  slug: string;
  title: string;
  description: string;
  type: 'challenge' | 'skill';
  difficulty: string;
  isPremium: boolean;
  taskCount: number;
  estimatedTime: string;
  tags: string[];
}

const TrainingHome: React.FC = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasMemberAccess } = useSubscriptionContext();

  useEffect(() => {
    // TODO: Training一覧を取得するAPI実装
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      // 暫定的なモックデータ
      setTrainings([
        {
          slug: 'ui-todo',
          title: 'Todo アプリのUI設計',
          description: 'シンプルなTodoアプリのUIを設計し、Figmaでプロトタイプを作成',
          type: 'challenge',
          difficulty: 'beginner',
          isPremium: true,
          taskCount: 5,
          estimatedTime: '2-3時間',
          tags: ['UI', 'Figma', 'プロトタイプ']
        },
        {
          slug: 'design-system-basics',
          title: 'デザインシステムの基礎',
          description: 'コンポーネント設計とスタイルガイドの作成方法を学ぶ',
          type: 'skill',
          difficulty: 'intermediate', 
          isPremium: false,
          taskCount: 3,
          estimatedTime: '1-2時間',
          tags: ['デザインシステム', 'コンポーネント']
        }
      ]);
    } catch (error) {
      console.error('Training一覧取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TrainingLayout>
      <TrainingHeader />
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-4">BONO Training</h1>
            <p className="text-lg text-gray-600">
              実践的なデザインスキルを身につける筋トレ型トレーニング
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">読み込み中...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainings.map((training) => (
                <TrainingCard 
                  key={training.slug}
                  training={training}
                  hasAccess={!training.isPremium || hasMemberAccess}
                />
              ))}
            </div>
          )}
          
          {!hasMemberAccess && (
            <div className="mt-12 text-center">
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-2">
                    すべてのトレーニングにアクセス
                  </h3>
                  <p className="text-gray-600 mb-4">
                    プレミアムトレーニングを含む全コンテンツにアクセス
                  </p>
                  <Link to="/training/plan">
                    <Button>プランを見る</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </TrainingLayout>
  );
};

const TrainingCard: React.FC<{
  training: Training;
  hasAccess: boolean;
}> = ({ training, hasAccess }) => {
  return (
    <Link to={`/training/${training.slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <Badge variant={training.type === 'challenge' ? 'default' : 'secondary'}>
              {training.type === 'challenge' ? 'チャレンジ' : 'スキル'}
            </Badge>
            {training.isPremium && !hasAccess && (
              <Badge variant="outline">Premium</Badge>
            )}
          </div>
          <CardTitle className="text-lg">{training.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{training.description}</p>
          <div className="space-y-2 text-sm text-gray-500">
            <div>📚 {training.taskCount}個のタスク</div>
            <div>⏱️ 目安時間: {training.estimatedTime}</div>
            <div>📊 難易度: {training.difficulty}</div>
          </div>
          <div className="flex flex-wrap gap-1 mt-3">
            {training.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TrainingHome;
```

#### B. Training詳細ページ
**ファイル**: `src/pages/Training/[slug].tsx`

```tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import TrainingGuard from '@/components/training/TrainingGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, ArrowRight } from 'lucide-react';

interface Task {
  slug: string;
  title: string;
  description: string;
  isPremium: boolean;
  estimatedTime: number;
  isCompleted: boolean;
  order: number;
}

interface TrainingDetail {
  slug: string;
  title: string;
  description: string;
  type: 'challenge' | 'skill';
  difficulty: string;
  isPremium: boolean;
  tasks: Task[];
  totalTime: string;
  objectives: string[];
}

const TrainingDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [training, setTraining] = useState<TrainingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchTrainingDetail(slug);
    }
  }, [slug]);

  const fetchTrainingDetail = async (trainingSlug: string) => {
    try {
      // TODO: Training詳細を取得するAPI実装
      // 暫定的なモックデータ
      setTraining({
        slug: trainingSlug,
        title: 'Todo アプリのUI設計',
        description: 'ユーザビリティを重視したTodoアプリのインターフェースを設計し、Figmaでプロトタイプを作成します。',
        type: 'challenge',
        difficulty: 'beginner',
        isPremium: true,
        totalTime: '2-3時間',
        objectives: [
          'ユーザーのメンタルモデルを理解する',
          '情報アーキテクチャを設計する',
          'プロトタイプで操作性を検証する'
        ],
        tasks: [
          {
            slug: 'user-research',
            title: 'ユーザーリサーチ',
            description: 'Todoアプリのユーザーニーズを分析',
            isPremium: false,
            estimatedTime: 30,
            isCompleted: false,
            order: 1
          },
          {
            slug: 'wireframe',
            title: 'ワイヤーフレーム作成',
            description: '画面構成と情報設計を決める',
            isPremium: true,
            estimatedTime: 45,
            isCompleted: false,
            order: 2
          }
        ]
      });
    } catch (error) {
      console.error('Training詳細取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <TrainingLayout>
        <TrainingHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">読み込み中...</div>
        </div>
      </TrainingLayout>
    );
  }

  if (!training) {
    return (
      <TrainingLayout>
        <TrainingHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Training が見つかりません</h1>
            <Link to="/training">
              <Button>一覧に戻る</Button>
            </Link>
          </div>
        </div>
      </TrainingLayout>
    );
  }

  return (
    <TrainingLayout>
      <TrainingHeader />
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー部分 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={training.type === 'challenge' ? 'default' : 'secondary'}>
                {training.type === 'challenge' ? 'チャレンジ' : 'スキル'}
              </Badge>
              <span className="text-sm text-gray-500">難易度: {training.difficulty}</span>
              <span className="text-sm text-gray-500">⏱️ {training.totalTime}</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">{training.title}</h1>
            <p className="text-lg text-gray-600">{training.description}</p>
          </div>

          {/* 学習目標 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>学習目標</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {training.objectives.map((objective, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    {objective}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* タスク一覧 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">タスク一覧</h2>
            {training.tasks.map((task, index) => (
              <TrainingGuard key={task.slug} isPremium={task.isPremium}>
                <TaskCard 
                  task={task} 
                  trainingSlug={training.slug}
                  index={index}
                />
              </TrainingGuard>
            ))}
          </div>
        </div>
      </div>
    </TrainingLayout>
  );
};

const TaskCard: React.FC<{
  task: Task;
  trainingSlug: string;
  index: number;
}> = ({ task, trainingSlug, index }) => {
  return (
    <Link to={`/training/${trainingSlug}/${task.slug}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">{index + 1}</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium">{task.title}</h3>
                <p className="text-gray-600">{task.description}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{task.estimatedTime}分</span>
                  {task.isPremium && (
                    <Badge variant="outline" className="ml-2">Premium</Badge>
                  )}
                </div>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TrainingDetailPage;
```

### 2.6 権限制御コンポーネント

#### TrainingGuard 最終調整
**ファイル**: `src/components/training/TrainingGuard.tsx`

```tsx
import React, { ReactNode } from 'react';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import PremiumContentBanner from './PremiumContentBanner';
import { Loader2 } from 'lucide-react';

interface TrainingGuardProps {
  children: ReactNode;
  isPremium?: boolean;
  fallbackComponent?: React.ReactNode;
}

const TrainingGuard: React.FC<TrainingGuardProps> = ({
  children,
  isPremium = false,
  fallbackComponent
}) => {
  const { isSubscribed, hasMemberAccess, loading } = useSubscriptionContext();
  
  // 無料コンテンツは常にアクセス可能
  if (!isPremium) {
    return <>{children}</>;
  }
  
  // ローディング中
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // member権限を持つユーザーはアクセス可能
  if (isSubscribed && hasMemberAccess) {
    return <>{children}</>;
  }
  
  // カスタム表示コンポーネント
  if (fallbackComponent) {
    return <>{fallbackComponent}</>;
  }
  
  // デフォルトのプレミアムバナー
  return <PremiumContentBanner />;
};

export default TrainingGuard;
```

---

## ✅ **Phase 2 完了チェックリスト**

### Supabase設定
- [ ] training-content バケット作成
- [ ] RLS ポリシー設定
- [ ] get-training-content Edge Function デプロイ

### フロントエンド実装  
- [ ] `/training` ホームページ実装
- [ ] `/training/[slug]` 詳細ページ実装
- [ ] `/training/[slug]/[task]` タスクページ実装
- [ ] TrainingGuard 権限制御動作確認

### 動作確認
- [ ] 無料ユーザーでプレビュー表示確認
- [ ] Community会員でフルアクセス確認
- [ ] 課金導線からの権限付与確認

---

## 🎯 **Phase 3: 全プラン対応（将来実装）**

### 実装タイミング
以下の条件を満たしてから検討:
- [ ] Phase 2完了
- [ ] Communityプランでの実ユーザー獲得  
- [ ] Learning専用コンテンツの企画完了
- [ ] Standard/Growthプランの差別化明確化

### 主な変更点
1. **Price ID拡張**: 12個のPrice ID管理
2. **UI拡張**: 複数プラン・期間選択
3. **権限拡張**: `hasLearningAccess` 追加
4. **API拡張**: `planType` + `duration` パラメータ

---

## 🚨 **重要な実装ポイント**

### セキュリティ
- **JWT検証**: Edge Function でのユーザー認証
- **RLS適用**: Storage アクセス制御
- **フロント制御**: TrainingGuard による UI制御

### パフォーマンス  
- **遅延ローディング**: 大きなMarkdownファイルの分割読み込み
- **キャッシュ戦略**: 静的コンテンツのキャッシュ
- **プリフェッチ**: ナビゲーション時の先読み

### エラーハンドリング
- **ネットワークエラー**: 再試行機能
- **認証エラー**: ログイン誘導
- **権限エラー**: 課金誘導

---

## 🎯 **開発開始の手順**

1. **今すぐ**: Phase 1（Community課金）完成
2. **来週**: Phase 2（コンテンツ基盤）着手  
3. **必要時**: Phase 3（全プラン）検討

この実装ガイドに従い、段階的に確実に進めることで、リスクを最小化しながら `/training` を公開できます。