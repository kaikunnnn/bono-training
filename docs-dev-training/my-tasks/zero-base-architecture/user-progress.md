# ユーザー進捗管理システム設計

## 基本方針

### 1. 多層進捗管理
```
タスク進捗 → トレーニング進捗 → スキル進捗 → 全体進捗
```

### 2. リアルタイム更新
- 即座の進捗反映
- 他デバイスとの同期
- オフライン対応

### 3. インテリジェント推奨
- 学習パスの最適化
- 個人化されたコンテンツ推奨
- 効果的な学習順序の提案

## 進捗管理アーキテクチャ

<lov-mermaid>
graph TB
    subgraph "フロントエンド"
        PU[Progress UI]
        TC[Task Completion]
        DR[Dashboard]
        RC[Recommendation]
    end
    
    subgraph "進捗サービス層"
        PS[Progress Service]
        AS[Analytics Service]
        RS[Recommendation Service]
        SS[Sync Service]
    end
    
    subgraph "データ管理層"
        TP[Task Progress]
        TrP[Training Progress]
        SP[Skill Progress]
        UP[User Progress]
    end
    
    subgraph "分析・推奨層"
        PA[Progress Analytics]
        LPA[Learning Path Algorithm]
        PR[Progress Report]
    end
    
    subgraph "データベース"
        PG[(Progress DB)]
        AC[(Analytics Cache)]
        UC[(User Cache)]
    end
    
    TC --> PS
    PU --> PS
    DR --> AS
    
    PS --> TP
    PS --> TrP
    PS --> SP
    PS --> UP
    
    AS --> PA
    RS --> LPA
    
    TP --> PG
    TrP --> PG
    SP --> PG
    UP --> PG
    
    PA --> AC
    LPA --> UC
</lov-mermaid>

## データベース設計

### テーブル構造
```sql
-- ユーザー進捗メインテーブル
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  training_slug TEXT NOT NULL,
  task_slug TEXT NOT NULL,
  status progress_status NOT NULL DEFAULT 'todo',
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, training_slug, task_slug)
);

-- 進捗ステータス enum
CREATE TYPE progress_status AS ENUM ('todo', 'in_progress', 'completed', 'skipped');

-- トレーニング完了状況
CREATE TABLE training_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  training_slug TEXT NOT NULL,
  completion_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  total_tasks INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_time_spent_seconds INTEGER DEFAULT 0,
  
  UNIQUE(user_id, training_slug)
);

-- スキル習得状況
CREATE TABLE skill_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  skill_id TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 100),
  acquired_from_training TEXT[], -- どのトレーニングで習得したか
  first_acquired_at TIMESTAMP WITH TIME ZONE,
  last_practiced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  practice_count INTEGER DEFAULT 0,
  
  UNIQUE(user_id, skill_id)
);

-- 学習セッション記録
CREATE TABLE learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  training_slug TEXT NOT NULL,
  task_slug TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  actions JSONB, -- ユーザーアクション記録
  device_info JSONB,
  
  INDEX idx_learning_sessions_user_id (user_id),
  INDEX idx_learning_sessions_training (training_slug),
  INDEX idx_learning_sessions_date (started_at)
);

-- 進捗イベントログ
CREATE TABLE progress_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  event_type TEXT NOT NULL, -- task_started, task_completed, skill_acquired, etc.
  event_data JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_progress_events_user_id (user_id),
  INDEX idx_progress_events_type (event_type),
  INDEX idx_progress_events_timestamp (timestamp)
);
```

## 進捗サービス実装

### src/services/progress/ProgressService.ts
```typescript
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsService } from './AnalyticsService';
import { SkillService } from './SkillService';
import type { ProgressStatus, TaskProgress, TrainingProgress } from '@/types/progress';

export class ProgressService {
  private analyticsService = new AnalyticsService();
  private skillService = new SkillService();

  /**
   * タスク進捗更新
   */
  async updateTaskProgress(
    userId: string,
    trainingSlug: string,
    taskSlug: string,
    status: ProgressStatus,
    timeSpentSeconds?: number
  ): Promise<TaskProgress> {
    try {
      // 学習セッション記録
      await this.recordLearningSession(userId, trainingSlug, taskSlug, timeSpentSeconds);

      // 進捗更新
      const { data: progressData, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          training_slug: trainingSlug,
          task_slug: taskSlug,
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
          time_spent_seconds: timeSpentSeconds || 0,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,training_slug,task_slug'
        })
        .select()
        .single();

      if (error) throw error;

      // 完了時の追加処理
      if (status === 'completed') {
        await Promise.all([
          this.updateTrainingProgress(userId, trainingSlug),
          this.updateSkillProgress(userId, trainingSlug, taskSlug),
          this.recordProgressEvent(userId, 'task_completed', {
            training_slug: trainingSlug,
            task_slug: taskSlug,
            time_spent: timeSpentSeconds,
          }),
        ]);
      }

      return progressData;
    } catch (error) {
      console.error('Progress update failed:', error);
      throw error;
    }
  }

  /**
   * トレーニング進捗更新
   */
  private async updateTrainingProgress(
    userId: string, 
    trainingSlug: string
  ): Promise<void> {
    try {
      // 現在の進捗状況を集計
      const { data: taskProgresses } = await supabase
        .from('user_progress')
        .select('status')
        .eq('user_id', userId)
        .eq('training_slug', trainingSlug);

      if (!taskProgresses) return;

      const completedTasks = taskProgresses.filter(p => p.status === 'completed').length;
      const totalTasks = taskProgresses.length;
      const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // トレーニング完了状況更新
      await supabase
        .from('training_completions')
        .upsert({
          user_id: userId,
          training_slug: trainingSlug,
          completion_percentage: completionPercentage,
          completed_tasks: completedTasks,
          total_tasks: totalTasks,
          completed_at: completionPercentage === 100 ? new Date().toISOString() : null,
        }, {
          onConflict: 'user_id,training_slug'
        });

      // トレーニング完了時の処理
      if (completionPercentage === 100) {
        await this.onTrainingCompleted(userId, trainingSlug);
      }
    } catch (error) {
      console.error('Training progress update failed:', error);
    }
  }

  /**
   * スキル進捗更新
   */
  private async updateSkillProgress(
    userId: string,
    trainingSlug: string,
    taskSlug: string
  ): Promise<void> {
    try {
      // タスクから習得可能なスキルを取得
      const taskSkills = await this.getTaskSkills(trainingSlug, taskSlug);
      
      for (const skill of taskSkills) {
        await this.skillService.addSkillExperience(
          userId,
          skill.id,
          skill.experience_points,
          trainingSlug
        );
      }
    } catch (error) {
      console.error('Skill progress update failed:', error);
    }
  }

  /**
   * ユーザー進捗取得
   */
  async getUserProgress(userId: string, trainingSlug?: string): Promise<UserProgressSummary> {
    try {
      const queries = [
        // タスク進捗
        supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .apply(query => trainingSlug ? query.eq('training_slug', trainingSlug) : query),
        
        // トレーニング進捗
        supabase
          .from('training_completions')
          .select('*')
          .eq('user_id', userId)
          .apply(query => trainingSlug ? query.eq('training_slug', trainingSlug) : query),
        
        // スキル進捗
        supabase
          .from('skill_progress')
          .select('*')
          .eq('user_id', userId),
      ];

      const [taskProgress, trainingProgress, skillProgress] = await Promise.all(queries);

      return {
        taskProgress: taskProgress.data || [],
        trainingProgress: trainingProgress.data || [],
        skillProgress: skillProgress.data || [],
        summary: await this.calculateProgressSummary(userId, trainingSlug),
      };
    } catch (error) {
      console.error('Progress fetch failed:', error);
      throw error;
    }
  }

  /**
   * 進捗サマリー計算
   */
  private async calculateProgressSummary(
    userId: string, 
    trainingSlug?: string
  ): Promise<ProgressSummary> {
    try {
      const { data: analytics } = await supabase.rpc('calculate_user_progress_summary', {
        p_user_id: userId,
        p_training_slug: trainingSlug,
      });

      return {
        totalTasksCompleted: analytics?.total_tasks_completed || 0,
        totalTimeSpent: analytics?.total_time_spent_seconds || 0,
        skillsAcquired: analytics?.skills_acquired || 0,
        averageSessionTime: analytics?.average_session_time || 0,
        streakDays: analytics?.streak_days || 0,
        completionRate: analytics?.completion_rate || 0,
      };
    } catch (error) {
      console.error('Progress summary calculation failed:', error);
      return {
        totalTasksCompleted: 0,
        totalTimeSpent: 0,
        skillsAcquired: 0,
        averageSessionTime: 0,
        streakDays: 0,
        completionRate: 0,
      };
    }
  }

  /**
   * 学習セッション記録
   */
  private async recordLearningSession(
    userId: string,
    trainingSlug: string,
    taskSlug: string,
    durationSeconds?: number
  ): Promise<void> {
    if (!durationSeconds || durationSeconds < 10) return; // 短すぎるセッションは記録しない

    await supabase
      .from('learning_sessions')
      .insert({
        user_id: userId,
        training_slug: trainingSlug,
        task_slug: taskSlug,
        duration_seconds: durationSeconds,
        started_at: new Date(Date.now() - durationSeconds * 1000).toISOString(),
        ended_at: new Date().toISOString(),
      });
  }

  /**
   * 進捗イベント記録
   */
  private async recordProgressEvent(
    userId: string,
    eventType: string,
    eventData: Record<string, any>
  ): Promise<void> {
    await supabase
      .from('progress_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
      });
  }

  /**
   * トレーニング完了時の処理
   */
  private async onTrainingCompleted(userId: string, trainingSlug: string): Promise<void> {
    await Promise.all([
      // 完了イベント記録
      this.recordProgressEvent(userId, 'training_completed', { training_slug: trainingSlug }),
      
      // バッジ・アチーブメント処理
      this.checkAchievements(userId, trainingSlug),
      
      // 推奨コンテンツ更新
      this.updateRecommendations(userId),
    ]);
  }
}
```

## スキル進捗管理

### src/services/progress/SkillService.ts
```typescript
import { supabase } from '@/integrations/supabase/client';
import type { SkillProgress, SkillLevel } from '@/types/progress';

export class SkillService {
  /**
   * スキル経験値追加
   */
  async addSkillExperience(
    userId: string,
    skillId: string,
    experiencePoints: number,
    trainingSlug: string
  ): Promise<SkillProgress> {
    try {
      // 現在のスキル進捗取得
      const { data: currentProgress } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_id', skillId)
        .single();

      const currentLevel = currentProgress?.level || 0;
      const currentTrainings = currentProgress?.acquired_from_training || [];
      
      // 新しいレベル計算
      const newLevel = this.calculateSkillLevel(currentLevel, experiencePoints);
      const updatedTrainings = currentTrainings.includes(trainingSlug) 
        ? currentTrainings 
        : [...currentTrainings, trainingSlug];

      // スキル進捗更新
      const { data: updatedProgress, error } = await supabase
        .from('skill_progress')
        .upsert({
          user_id: userId,
          skill_id: skillId,
          level: newLevel,
          acquired_from_training: updatedTrainings,
          first_acquired_at: currentProgress?.first_acquired_at || new Date().toISOString(),
          last_practiced_at: new Date().toISOString(),
          practice_count: (currentProgress?.practice_count || 0) + 1,
        }, {
          onConflict: 'user_id,skill_id'
        })
        .select()
        .single();

      if (error) throw error;

      // レベルアップ時の処理
      if (newLevel > currentLevel) {
        await this.onSkillLevelUp(userId, skillId, newLevel, currentLevel);
      }

      return updatedProgress;
    } catch (error) {
      console.error('Skill experience update failed:', error);
      throw error;
    }
  }

  /**
   * スキルレベル計算
   */
  private calculateSkillLevel(currentLevel: number, experiencePoints: number): number {
    // 経験値からレベル計算（非線形成長）
    const baseExperience = currentLevel * 100;
    const newExperience = baseExperience + experiencePoints;
    
    // レベル計算（平方根ベース）
    const newLevel = Math.floor(Math.sqrt(newExperience / 10));
    
    return Math.min(newLevel, 100); // 最大レベル100
  }

  /**
   * スキルレベルアップ時の処理
   */
  private async onSkillLevelUp(
    userId: string,
    skillId: string,
    newLevel: number,
    oldLevel: number
  ): Promise<void> {
    // レベルアップイベント記録
    await supabase
      .from('progress_events')
      .insert({
        user_id: userId,
        event_type: 'skill_level_up',
        event_data: {
          skill_id: skillId,
          old_level: oldLevel,
          new_level: newLevel,
        },
      });

    // 特定レベルでのバッジ付与
    if (newLevel >= 25 && oldLevel < 25) {
      await this.awardSkillBadge(userId, skillId, 'beginner');
    } else if (newLevel >= 50 && oldLevel < 50) {
      await this.awardSkillBadge(userId, skillId, 'intermediate');
    } else if (newLevel >= 75 && oldLevel < 75) {
      await this.awardSkillBadge(userId, skillId, 'advanced');
    } else if (newLevel >= 100 && oldLevel < 100) {
      await this.awardSkillBadge(userId, skillId, 'master');
    }
  }

  /**
   * ユーザーのスキル一覧取得
   */
  async getUserSkills(userId: string): Promise<UserSkillSummary[]> {
    try {
      const { data: skillProgresses, error } = await supabase
        .from('skill_progress')
        .select(`
          skill_id,
          level,
          acquired_from_training,
          first_acquired_at,
          last_practiced_at,
          practice_count
        `)
        .eq('user_id', userId)
        .order('level', { ascending: false });

      if (error) throw error;

      // スキル詳細情報を追加
      return Promise.all(
        skillProgresses.map(async (progress) => {
          const skillInfo = await this.getSkillInfo(progress.skill_id);
          return {
            ...progress,
            ...skillInfo,
            levelName: this.getLevelName(progress.level),
            nextLevelProgress: this.getNextLevelProgress(progress.level),
          };
        })
      );
    } catch (error) {
      console.error('User skills fetch failed:', error);
      return [];
    }
  }

  /**
   * レベル名取得
   */
  private getLevelName(level: number): string {
    if (level < 25) return '初心者';
    if (level < 50) return '中級者';
    if (level < 75) return '上級者';
    if (level < 100) return 'エキスパート';
    return 'マスター';
  }

  /**
   * 次のレベルまでの進捗
   */
  private getNextLevelProgress(level: number): number {
    if (level >= 100) return 100;
    
    const currentExp = level * level * 10;
    const nextLevel = level + 1;
    const nextExp = nextLevel * nextLevel * 10;
    
    return ((currentExp % 100) / 100) * 100;
  }
}
```

## リアルタイム進捗同期

### src/hooks/useProgressSync.ts
```typescript
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProgress } from '@/contexts/ProgressContext';
import type { RealtimeChannel } from '@supabase/supabase-js';

export const useProgressSync = (userId: string) => {
  const { updateProgress, setProgressData } = useProgress();

  const handleProgressUpdate = useCallback((payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
      case 'UPDATE':
        updateProgress(newRecord);
        break;
      case 'DELETE':
        // 進捗削除の処理（通常は発生しない）
        break;
    }
  }, [updateProgress]);

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtimeSubscription = async () => {
      // ユーザー進捗の変更を監視
      channel = supabase
        .channel(`progress_changes_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_progress',
            filter: `user_id=eq.${userId}`,
          },
          handleProgressUpdate
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'training_completions',
            filter: `user_id=eq.${userId}`,
          },
          handleProgressUpdate
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'skill_progress',
            filter: `user_id=eq.${userId}`,
          },
          handleProgressUpdate
        )
        .subscribe();
    };

    if (userId) {
      setupRealtimeSubscription();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, handleProgressUpdate]);

  // オフライン対応の同期機能
  const syncOfflineProgress = useCallback(async () => {
    try {
      const offlineProgress = localStorage.getItem('offline_progress');
      if (!offlineProgress) return;

      const progressData = JSON.parse(offlineProgress);
      
      // オフライン中の進捗をサーバーに同期
      for (const progress of progressData) {
        await supabase
          .from('user_progress')
          .upsert(progress, { onConflict: 'user_id,training_slug,task_slug' });
      }

      // ローカルストレージをクリア
      localStorage.removeItem('offline_progress');
    } catch (error) {
      console.error('Offline progress sync failed:', error);
    }
  }, []);

  // オンライン復帰時の同期
  useEffect(() => {
    const handleOnline = () => {
      syncOfflineProgress();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncOfflineProgress]);

  return {
    syncOfflineProgress,
  };
};
```

## 進捗可視化コンポーネント

### src/components/progress/ProgressDashboard.tsx
```typescript
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Trophy, Zap } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import type { UserProgressSummary } from '@/types/progress';

interface ProgressDashboardProps {
  userId: string;
  trainingSlug?: string;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  userId,
  trainingSlug,
}) => {
  const { progressSummary, skillProgress, isLoading } = useProgress(userId, trainingSlug);

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 全体サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          icon={<Trophy className="w-5 h-5" />}
          title="完了タスク"
          value={progressSummary.totalTasksCompleted}
          subtitle="タスク"
        />
        <StatsCard
          icon={<Clock className="w-5 h-5" />}
          title="学習時間"
          value={Math.floor(progressSummary.totalTimeSpent / 3600)}
          subtitle="時間"
        />
        <StatsCard
          icon={<Zap className="w-5 h-5" />}
          title="習得スキル"
          value={progressSummary.skillsAcquired}
          subtitle="スキル"
        />
        <StatsCard
          icon={<Calendar className="w-5 h-5" />}
          title="連続学習"
          value={progressSummary.streakDays}
          subtitle="日間"
        />
      </div>

      {/* スキル進捗 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">スキル進捗</h3>
        <div className="space-y-4">
          {skillProgress.slice(0, 5).map((skill) => (
            <div key={skill.skill_id} className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{skill.name}</span>
                  <Badge variant="secondary">{skill.levelName}</Badge>
                </div>
                <Progress value={skill.level} className="h-2" />
              </div>
              <span className="text-sm text-muted-foreground">
                Lv.{skill.level}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* 学習パターン分析 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">学習パターン</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">平均セッション時間</p>
            <p className="text-2xl font-bold">
              {Math.floor(progressSummary.averageSessionTime / 60)}分
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">完了率</p>
            <p className="text-2xl font-bold">
              {Math.floor(progressSummary.completionRate)}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

const StatsCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: number;
  subtitle: string;
}> = ({ icon, title, value, subtitle }) => (
  <Card className="p-4">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-primary/10 text-primary rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  </Card>
);
```

## 進捗管理の利点

### 1. 学習動機の向上
- リアルタイム進捗表示
- 達成感のあるフィードバック
- ゲーミフィケーション要素

### 2. 個人化された学習体験
- 学習パターンの分析
- 個別最適化された推奨
- 弱点の特定と補強

### 3. データドリブンな改善
- 学習効果の測定
- コンテンツ品質の評価
- ユーザー行動の理解

### 4. 継続的な学習促進
- 学習習慣の可視化
- 目標設定と達成追跡
- ソーシャル機能との連携