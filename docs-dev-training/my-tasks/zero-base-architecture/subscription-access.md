# サブスクリプション・アクセス制御設計

## 基本方針

### 1. 階層的権限管理
```
free < community < standard < growth
```

### 2. コンテンツタイプ別アクセス制御
- **learning**: 学習コンテンツ (standard, growth)
- **member**: メンバー限定コンテンツ (community, standard, growth)
- **premium**: プレミアムコンテンツ (growth)

### 3. 柔軟なアクセスレベル設定
- トレーニング単位
- タスク単位  
- コンテンツセクション単位

## アクセス制御アーキテクチャ

<lov-mermaid>
graph TB
    subgraph "認証層"
        AU[Auth User]
        ST[Stripe Token]
        SU[Supabase Auth]
    end
    
    subgraph "権限判定層"
        SS[Subscription Service]
        AS[Access Service]
        PC[Permission Checker]
    end
    
    subgraph "コンテンツ制御層"
        CG[Content Guard]
        PB[Premium Banner]
        CR[Content Renderer]
    end
    
    subgraph "データ層"
        SB[Subscriptions DB]
        UP[User Progress DB]
        CT[Content Config]
    end
    
    AU --> SU
    ST --> SS
    SU --> AS
    
    SS --> SB
    AS --> PC
    PC --> UP
    
    AS --> CG
    CG --> PB
    CG --> CR
    
    CT --> AS
</lov-mermaid>

## サブスクリプションサービス設計

### src/services/subscription/SubscriptionService.ts
```typescript
import { supabase } from '@/integrations/supabase/client';
import { stripe } from '@/utils/stripe';
import type { UserSubscription, SubscriptionPlan } from '@/types/subscription';

export class SubscriptionService {
  /**
   * ユーザーのサブスクリプション状況取得
   */
  async getUserSubscription(userId: string): Promise<UserSubscription> {
    try {
      // Supabaseからサブスクリプション情報取得
      const { data: dbData, error: dbError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (dbError && dbError.code !== 'PGRST116') {
        throw dbError;
      }

      // サブスクリプションが存在しない場合はフリープラン
      if (!dbData) {
        return this.createFreeSubscription(userId);
      }

      // Stripeでサブスクリプション状況を確認
      const stripeValidation = await this.validateStripeSubscription(
        dbData.stripe_subscription_id
      );

      // DB情報とStripe情報の整合性確認
      if (stripeValidation.isActive !== dbData.is_active) {
        await this.syncSubscriptionStatus(userId, stripeValidation);
      }

      return {
        user_id: userId,
        plan_type: dbData.plan_type,
        is_active: stripeValidation.isActive,
        current_period_end: stripeValidation.current_period_end,
        stripe_subscription_id: dbData.stripe_subscription_id,
        permissions: this.calculatePermissions(dbData.plan_type, stripeValidation.isActive),
      };
    } catch (error) {
      console.error('Subscription fetch failed:', error);
      return this.createFreeSubscription(userId);
    }
  }

  /**
   * Stripeサブスクリプション検証
   */
  private async validateStripeSubscription(subscriptionId: string | null): Promise<StripeValidation> {
    if (!subscriptionId) {
      return { isActive: false, current_period_end: null };
    }

    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      return {
        isActive: subscription.status === 'active',
        current_period_end: new Date(subscription.current_period_end * 1000),
        stripe_status: subscription.status,
      };
    } catch (error) {
      console.error('Stripe validation failed:', error);
      return { isActive: false, current_period_end: null };
    }
  }

  /**
   * サブスクリプション状況同期
   */
  private async syncSubscriptionStatus(userId: string, stripeData: StripeValidation): Promise<void> {
    await supabase
      .from('subscriptions')
      .update({
        is_active: stripeData.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }

  /**
   * フリーサブスクリプション作成
   */
  private createFreeSubscription(userId: string): UserSubscription {
    return {
      user_id: userId,
      plan_type: 'free',
      is_active: true,
      current_period_end: null,
      stripe_subscription_id: null,
      permissions: {
        hasLearningAccess: false,
        hasMemberAccess: false,
        hasPremiumAccess: false,
        maxConcurrentSessions: 1,
      },
    };
  }

  /**
   * 権限計算
   */
  private calculatePermissions(planType: string, isActive: boolean): SubscriptionPermissions {
    if (!isActive) {
      return {
        hasLearningAccess: false,
        hasMemberAccess: false,
        hasPremiumAccess: false,
        maxConcurrentSessions: 1,
      };
    }

    switch (planType) {
      case 'community':
        return {
          hasLearningAccess: false,
          hasMemberAccess: true,
          hasPremiumAccess: false,
          maxConcurrentSessions: 2,
        };
      
      case 'standard':
        return {
          hasLearningAccess: true,
          hasMemberAccess: true,
          hasPremiumAccess: false,
          maxConcurrentSessions: 3,
        };
      
      case 'growth':
        return {
          hasLearningAccess: true,
          hasMemberAccess: true,
          hasPremiumAccess: true,
          maxConcurrentSessions: 5,
        };
      
      default:
        return {
          hasLearningAccess: false,
          hasMemberAccess: false,
          hasPremiumAccess: false,
          maxConcurrentSessions: 1,
        };
    }
  }
}

interface StripeValidation {
  isActive: boolean;
  current_period_end: Date | null;
  stripe_status?: string;
}

interface SubscriptionPermissions {
  hasLearningAccess: boolean;
  hasMemberAccess: boolean;
  hasPremiumAccess: boolean;
  maxConcurrentSessions: number;
}
```

## アクセスサービス設計

### src/services/subscription/AccessService.ts
```typescript
import type { UserSubscription } from '@/types/subscription';
import type { AccessLevel } from '@/types/content';

export class AccessService {
  /**
   * コンテンツアクセス権限チェック
   */
  hasContentAccess(
    userSubscription: UserSubscription, 
    contentAccessLevel: AccessLevel
  ): boolean {
    // フリーコンテンツは常にアクセス可能
    if (contentAccessLevel === 'free') {
      return true;
    }

    // 非アクティブサブスクリプションは有料コンテンツアクセス不可
    if (!userSubscription.is_active) {
      return false;
    }

    const permissions = userSubscription.permissions;

    switch (contentAccessLevel) {
      case 'learning':
        return permissions.hasLearningAccess;
      
      case 'member':
        return permissions.hasMemberAccess;
      
      case 'premium':
        return permissions.hasPremiumAccess;
      
      default:
        return false;
    }
  }

  /**
   * タスクアクセス権限チェック（アンロック条件含む）
   */
  hasTaskAccess(
    userSubscription: UserSubscription,
    task: TaskMeta,
    userProgress?: UserProgress
  ): TaskAccessResult {
    // 基本アクセス権限チェック
    const hasContentAccess = this.hasContentAccess(
      userSubscription, 
      task.access_level
    );

    if (!hasContentAccess) {
      return {
        hasAccess: false,
        reason: 'subscription_required',
        requiredPlan: this.getRequiredPlan(task.access_level),
      };
    }

    // アンロック条件チェック
    const unlockResult = this.checkUnlockCondition(task, userProgress);
    if (!unlockResult.isUnlocked) {
      return {
        hasAccess: false,
        reason: 'unlock_condition_not_met',
        unlockCondition: unlockResult.condition,
      };
    }

    return { hasAccess: true };
  }

  /**
   * アンロック条件チェック
   */
  private checkUnlockCondition(
    task: TaskMeta, 
    userProgress?: UserProgress
  ): UnlockResult {
    if (!task.unlock_condition) {
      return { isUnlocked: true };
    }

    switch (task.unlock_condition.type) {
      case 'sequential':
        return this.checkSequentialUnlock(task, userProgress);
      
      case 'skill_based':
        return this.checkSkillBasedUnlock(task, userProgress);
      
      case 'time_based':
        return this.checkTimeBasedUnlock(task, userProgress);
      
      case 'custom':
        return this.checkCustomUnlock(task, userProgress);
      
      default:
        return { isUnlocked: true };
    }
  }

  /**
   * 順次アンロックチェック
   */
  private checkSequentialUnlock(
    task: TaskMeta, 
    userProgress?: UserProgress
  ): UnlockResult {
    if (!userProgress || task.order <= 1) {
      return { isUnlocked: true };
    }

    // 前のタスクが完了しているかチェック
    const prevTaskCompleted = userProgress.completed_tasks.some(
      completedTask => 
        completedTask.training_slug === task.training_slug &&
        completedTask.order === task.order - 1
    );

    return {
      isUnlocked: prevTaskCompleted,
      condition: prevTaskCompleted ? undefined : {
        type: 'sequential',
        message: '前のタスクを完了してください',
        required_task: task.order - 1,
      },
    };
  }

  /**
   * スキルベースアンロックチェック
   */
  private checkSkillBasedUnlock(
    task: TaskMeta, 
    userProgress?: UserProgress
  ): UnlockResult {
    const requiredSkills = task.unlock_condition?.requirements?.required_skills || [];
    
    if (requiredSkills.length === 0) {
      return { isUnlocked: true };
    }

    const userSkills = userProgress?.acquired_skills || [];
    const hasAllSkills = requiredSkills.every(skill => 
      userSkills.includes(skill)
    );

    return {
      isUnlocked: hasAllSkills,
      condition: hasAllSkills ? undefined : {
        type: 'skill_based',
        message: '必要なスキルを習得してください',
        required_skills: requiredSkills.filter(skill => !userSkills.includes(skill)),
      },
    };
  }

  /**
   * 必要プラン取得
   */
  private getRequiredPlan(accessLevel: AccessLevel): string[] {
    switch (accessLevel) {
      case 'learning':
        return ['standard', 'growth'];
      case 'member':
        return ['community', 'standard', 'growth'];
      case 'premium':
        return ['growth'];
      default:
        return [];
    }
  }
}

interface TaskAccessResult {
  hasAccess: boolean;
  reason?: 'subscription_required' | 'unlock_condition_not_met';
  requiredPlan?: string[];
  unlockCondition?: UnlockCondition;
}

interface UnlockResult {
  isUnlocked: boolean;
  condition?: UnlockCondition;
}

interface UnlockCondition {
  type: string;
  message: string;
  required_task?: number;
  required_skills?: string[];
}
```

## コンテンツガード設計

### src/components/subscription/ContentGuard.tsx
```typescript
import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { AccessService } from '@/services/subscription/AccessService';
import { PremiumBanner } from './PremiumBanner';
import { UnlockBanner } from './UnlockBanner';
import type { AccessLevel } from '@/types/content';
import type { TaskMeta } from '@/schemas/training';

interface ContentGuardProps {
  accessLevel: AccessLevel;
  children: React.ReactNode;
  task?: TaskMeta;
  fallback?: React.ReactNode;
  showPreview?: boolean;
}

export const ContentGuard: React.FC<ContentGuardProps> = ({
  accessLevel,
  children,
  task,
  fallback,
  showPreview = false,
}) => {
  const { subscription, userProgress } = useSubscription();
  const accessService = new AccessService();

  // アクセス権限チェック
  const hasContentAccess = accessService.hasContentAccess(subscription, accessLevel);
  
  // タスクの場合はアンロック条件もチェック
  const taskAccessResult = task 
    ? accessService.hasTaskAccess(subscription, task, userProgress)
    : { hasAccess: hasContentAccess };

  // アクセス可能な場合はそのまま表示
  if (taskAccessResult.hasAccess) {
    return <>{children}</>;
  }

  // サブスクリプション必要な場合
  if (taskAccessResult.reason === 'subscription_required') {
    return (
      <div className="content-guard">
        {showPreview && (
          <div className="preview-content">
            {children}
          </div>
        )}
        <PremiumBanner
          accessLevel={accessLevel}
          requiredPlans={taskAccessResult.requiredPlan}
          currentPlan={subscription.plan_type}
        />
      </div>
    );
  }

  // アンロック条件未達の場合
  if (taskAccessResult.reason === 'unlock_condition_not_met') {
    return (
      <UnlockBanner
        condition={taskAccessResult.unlockCondition}
        task={task}
      />
    );
  }

  // フォールバック表示
  return <>{fallback || <div>アクセスできません</div>}</>;
};
```

### src/components/subscription/PremiumBanner.tsx
```typescript
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Crown, Star, ArrowRight } from 'lucide-react';
import type { AccessLevel } from '@/types/content';

interface PremiumBannerProps {
  accessLevel: AccessLevel;
  requiredPlans?: string[];
  currentPlan?: string;
  customMessage?: string;
}

export const PremiumBanner: React.FC<PremiumBannerProps> = ({
  accessLevel,
  requiredPlans,
  currentPlan,
  customMessage,
}) => {
  const getBannerConfig = () => {
    switch (accessLevel) {
      case 'learning':
        return {
          icon: <Star className="w-6 h-6 text-primary" />,
          title: '学習コンテンツアクセス',
          description: 'この学習コンテンツを閲覧するには学習プラン以上が必要です',
          gradient: 'from-blue-500 to-purple-600',
        };
      
      case 'member':
        return {
          icon: <Crown className="w-6 h-6 text-primary" />,
          title: 'メンバー限定コンテンツ',
          description: 'このコンテンツはメンバー限定です。メンバーシップに加入してアクセスしてください',
          gradient: 'from-purple-500 to-pink-600',
        };
      
      case 'premium':
        return {
          icon: <Crown className="w-6 h-6 text-primary" />,
          title: 'プレミアムコンテンツ',
          description: 'この高度なコンテンツはプレミアムプラン専用です',
          gradient: 'from-amber-500 to-orange-600',
        };
      
      default:
        return {
          icon: <Star className="w-6 h-6 text-primary" />,
          title: '有料コンテンツ',
          description: 'このコンテンツを閲覧するには有料プランが必要です',
          gradient: 'from-gray-500 to-gray-600',
        };
    }
  };

  const config = getBannerConfig();

  return (
    <Card className="p-6 bg-gradient-to-r from-background to-muted border-2 border-primary/20">
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-full bg-gradient-to-r ${config.gradient}`}>
          {config.icon}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
          <p className="text-muted-foreground mb-4">
            {customMessage || config.description}
          </p>
          
          {requiredPlans && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">利用可能プラン:</p>
              <div className="flex flex-wrap gap-2">
                {requiredPlans.map(plan => (
                  <span 
                    key={plan}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {plan}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button 
              variant="default" 
              className="bg-gradient-to-r from-primary to-primary/80"
              onClick={() => window.location.href = '/pricing'}
            >
              プランを見る
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            {currentPlan && currentPlan !== 'free' && (
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/account'}
              >
                プラン変更
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
```

## Edge Function実装

### supabase/functions/check-content-access/index.ts
```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { SubscriptionService } from "./subscription-service.ts";
import { AccessService } from "./access-service.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content_id, content_type, access_level } = await req.json();
    
    // 認証チェック
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "認証が必要です" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // ユーザー情報取得
    const user = await getUser(authHeader);
    
    // サブスクリプション情報取得
    const subscriptionService = new SubscriptionService();
    const subscription = await subscriptionService.getUserSubscription(user.id);
    
    // アクセス権限チェック
    const accessService = new AccessService();
    const hasAccess = accessService.hasContentAccess(subscription, access_level);
    
    return new Response(
      JSON.stringify({
        has_access: hasAccess,
        subscription_type: subscription.plan_type,
        is_active: subscription.is_active,
        content_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Access check failed:", error);
    return new Response(
      JSON.stringify({ error: "アクセスチェックに失敗しました" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
```

## アクセス制御の利点

### 1. 細かい権限管理
- コンテンツレベルでの柔軟な制御
- プラン別の段階的なアクセス提供
- 時間やスキルベースのアンロック条件

### 2. リアルタイム同期
- Stripe Webhookによる即座な反映
- DBとStripeの整合性保証
- 自動的な権限更新

### 3. ユーザビリティ
- 分かりやすいアクセス制限表示
- 適切なアップグレード導線
- プレビューコンテンツの提供

### 4. 開発者体験
- 宣言的なアクセス制御
- コンポーネントレベルでの権限管理
- 型安全なアクセスチェック