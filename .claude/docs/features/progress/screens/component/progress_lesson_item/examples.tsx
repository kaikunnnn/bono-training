import React, { useState } from 'react';
import { ProgressLesson } from './ProgressLesson';
import { 
  LessonData, 
  getCategoryStyle, 
  getProgressStatus 
} from './types';

/**
 * 使用例集
 */

// ============================================================================
// 例1: 基本的な使い方
// ============================================================================
export function Example1_Basic() {
  return (
    <ProgressLesson
      title="センスを盗む技術"
      progress={25}
      currentStep="送る視線①:ビジュアル"
      isStepCompleted={false}
    />
  );
}

// ============================================================================
// 例2: クリッカブルなカード
// ============================================================================
export function Example2_Clickable() {
  const handleClick = () => {
    console.log('レッスンカードがクリックされました');
    // ナビゲーション処理など
    window.location.href = '/lesson/detail';
  };

  return (
    <ProgressLesson
      title="UIデザインの基礎"
      progress={75}
      currentStep="レイアウト設計の基本"
      isStepCompleted={true}
      onClick={handleClick}
    />
  );
}

// ============================================================================
// 例3: 進捗の動的更新
// ============================================================================
export function Example3_DynamicProgress() {
  const [progress, setProgress] = useState(0);
  const [stepCompleted, setStepCompleted] = useState(false);

  const completeStep = () => {
    const newProgress = Math.min(progress + 25, 100);
    setProgress(newProgress);
    setStepCompleted(true);
    
    // 1秒後に次のステップへ
    setTimeout(() => {
      setStepCompleted(false);
    }, 1000);
  };

  return (
    <div>
      <ProgressLesson
        title="UXリサーチ入門"
        progress={progress}
        currentStep="ユーザーインタビュー実践"
        isStepCompleted={stepCompleted}
      />
      <button onClick={completeStep}>
        ステップを完了する
      </button>
    </div>
  );
}

// ============================================================================
// 例4: カテゴリー別のスタイル適用
// ============================================================================
export function Example4_CategoryStyles() {
  const lessons: LessonData[] = [
    {
      id: '1',
      title: 'UIデザイン基礎',
      category: 'ui',
      progress: 80,
      currentStep: 'カラー設計',
      isStepCompleted: true,
      ...getCategoryStyle('ui'),
    },
    {
      id: '2',
      title: 'React開発入門',
      category: 'coding',
      progress: 45,
      currentStep: 'Hooks活用',
      isStepCompleted: false,
      ...getCategoryStyle('coding'),
    },
  ];

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {lessons.map((lesson) => (
        <ProgressLesson
          key={lesson.id}
          icon={lesson.icon}
          iconBgColor={lesson.iconBgColor}
          title={lesson.title}
          progress={lesson.progress}
          currentStep={lesson.currentStep}
          isStepCompleted={lesson.isStepCompleted}
        />
      ))}
    </div>
  );
}

// ============================================================================
// 例5: グリッドレイアウト
// ============================================================================
export function Example5_Grid() {
  const lessons: LessonData[] = [
    {
      id: '1',
      icon: 'COPY',
      iconBgColor: '#FFE5E5',
      title: 'センスを盗む技術',
      progress: 25,
      currentStep: '送る視線①:ビジュアル',
      isStepCompleted: false,
    },
    {
      id: '2',
      icon: 'UI',
      iconBgColor: '#E3F2FD',
      title: 'UIデザインの基礎',
      progress: 75,
      currentStep: 'レイアウト設計の基本',
      isStepCompleted: true,
    },
    {
      id: '3',
      icon: '🎨',
      iconBgColor: '#E8F5E9',
      title: 'カラー理論',
      progress: 15,
      currentStep: '色彩の基礎知識',
      isStepCompleted: false,
    },
    {
      id: '4',
      icon: '📐',
      iconBgColor: '#FBE9E7',
      title: 'タイポグラフィ',
      progress: 60,
      currentStep: 'フォント選定のコツ',
      isStepCompleted: true,
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        padding: '20px',
      }}
    >
      {lessons.map((lesson) => (
        <ProgressLesson
          key={lesson.id}
          {...lesson}
        />
      ))}
    </div>
  );
}

// ============================================================================
// 例6: フィルタリング機能
// ============================================================================
export function Example6_Filtering() {
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  const lessons: LessonData[] = [
    {
      id: '1',
      icon: 'UI',
      iconBgColor: '#E3F2FD',
      title: 'UIデザイン基礎',
      progress: 100,
      currentStep: 'コース完了',
      isStepCompleted: true,
    },
    {
      id: '2',
      icon: 'CODE',
      iconBgColor: '#FFF9C4',
      title: 'フロントエンド開発',
      progress: 45,
      currentStep: 'React Hooks',
      isStepCompleted: false,
    },
    {
      id: '3',
      icon: '🎨',
      iconBgColor: '#E8F5E9',
      title: 'カラー理論',
      progress: 0,
      currentStep: '未開始',
      isStepCompleted: false,
    },
  ];

  const filteredLessons = lessons.filter((lesson) => {
    const status = getProgressStatus(lesson.progress);
    if (filter === 'all') return true;
    if (filter === 'completed') return status === 'completed';
    if (filter === 'in-progress') return status === 'in-progress';
    return true;
  });

  return (
    <div>
      {/* フィルターボタン */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setFilter('all')}>全て</button>
        <button onClick={() => setFilter('in-progress')}>学習中</button>
        <button onClick={() => setFilter('completed')}>完了</button>
      </div>

      {/* レッスン一覧 */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {filteredLessons.map((lesson) => (
          <ProgressLesson key={lesson.id} {...lesson} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 例7: APIから取得したデータで表示
// ============================================================================
export function Example7_ApiData() {
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // APIからレッスンデータを取得
    fetch('/api/lessons')
      .then((res) => res.json())
      .then((data) => {
        setLessons(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('レッスンデータの取得に失敗:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {lessons.map((lesson) => (
        <ProgressLesson
          key={lesson.id}
          icon={lesson.icon}
          iconBgColor={lesson.iconBgColor}
          title={lesson.title}
          progress={lesson.progress}
          currentStep={lesson.currentStep}
          isStepCompleted={lesson.isStepCompleted}
          onClick={() => {
            window.location.href = `/lessons/${lesson.id}`;
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// 例8: 進捗通知機能
// ============================================================================
export function Example8_ProgressNotification() {
  const [progress, setProgress] = useState(50);

  React.useEffect(() => {
    // 進捗が特定の値に達したら通知
    if (progress === 100) {
      alert('🎉 レッスン完了おめでとうございます!');
    }
  }, [progress]);

  const increaseProgress = () => {
    setProgress((prev) => Math.min(prev + 10, 100));
  };

  return (
    <div>
      <ProgressLesson
        title="React マスターコース"
        progress={progress}
        currentStep="Hooks完全理解"
        isStepCompleted={progress >= 75}
      />
      <button onClick={increaseProgress}>
        +10% 進める
      </button>
    </div>
  );
}

// ============================================================================
// 例9: Supabaseとの連携
// ============================================================================
export function Example9_SupabaseIntegration() {
  const [lessons, setLessons] = useState<LessonData[]>([]);

  // Supabaseからデータ取得
  React.useEffect(() => {
    const fetchLessons = async () => {
      // Supabaseクライアントの例
      // const { data, error } = await supabase
      //   .from('lessons')
      //   .select('*')
      //   .eq('user_id', currentUser.id);
      
      // if (error) {
      //   console.error('Error:', error);
      //   return;
      // }
      
      // setLessons(data);
    };

    fetchLessons();
  }, []);

  const updateProgress = async (lessonId: string, newProgress: number) => {
    // Supabaseで進捗を更新
    // await supabase
    //   .from('lesson_progress')
    //   .upsert({
    //     lesson_id: lessonId,
    //     user_id: currentUser.id,
    //     progress: newProgress,
    //     updated_at: new Date(),
    //   });
    
    // ローカルステートを更新
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === lessonId
          ? { ...lesson, progress: newProgress }
          : lesson
      )
    );
  };

  return (
    <div>
      {lessons.map((lesson) => (
        <ProgressLesson
          key={lesson.id}
          {...lesson}
          onClick={() => updateProgress(lesson.id, lesson.progress + 10)}
        />
      ))}
    </div>
  );
}

export default {
  Example1_Basic,
  Example2_Clickable,
  Example3_DynamicProgress,
  Example4_CategoryStyles,
  Example5_Grid,
  Example6_Filtering,
  Example7_ApiData,
  Example8_ProgressNotification,
  Example9_SupabaseIntegration,
};
