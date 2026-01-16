import React, { useState } from 'react';
import { ProgressLesson } from '@/components/progress/ProgressLesson';
import { ProgressSection } from '@/components/progress/ProgressSection';
import { TabNavigation, TabId, TabNavigationPill, TabPillId } from '@/components/navigation';

export default function ProgressComponents() {
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [activePillTab, setActivePillTab] = useState<TabPillId>('all');
  const [isCompleting, setIsCompleting] = useState(false);
  const [completedLessonId, setCompletedLessonId] = useState<string | null>(null);

  // 完了ボタンのデモ動作
  const handleCompleteDemo = (lessonId: string) => {
    setIsCompleting(true);
    setTimeout(() => {
      setIsCompleting(false);
      setCompletedLessonId(lessonId);
      alert(`レッスン「${lessonId}」を完了しました！`);
    }, 1500);
  };

  // ProgressSection用のサンプルデータ（新しいProps構造）
  const sampleLessons = [
    {
      title: 'センスを盗む技術',
      progress: 25,
      currentStep: '盗む視点①：ビジュアル',
      iconImageUrl: 'https://via.placeholder.com/48x73',
      nextArticleUrl: '/articles/visual-basics',
    },
    {
      title: 'UIデザインの基礎',
      progress: 60,
      currentStep: 'レイアウト設計の基本',
      iconImageUrl: 'https://via.placeholder.com/48x73',
      nextArticleUrl: '/articles/layout-basics',
    },
  ];

  const completedLessons = [
    {
      title: 'フロントエンド開発入門',
      progress: 100,
      currentStep: '全て完了',
      iconImageUrl: 'https://via.placeholder.com/48x73',
    },
    {
      title: 'デザインシステム構築',
      progress: 100,
      currentStep: '全て完了',
      iconImageUrl: 'https://via.placeholder.com/48x73',
    },
  ];

  return (
    <div style={{ padding: '40px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>
        Progress Components 開発プレビュー
      </h1>

      {/* TabNavigation セクション（下線スタイル） */}
      <section style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          TabNavigation（下線スタイル）
        </h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          マイページのタブ切り替えコンポーネント（下線でアクティブ表示）
        </p>

        <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px' }}>
          {/* インタラクティブなデモ */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>
              インタラクティブデモ（クリックでタブ切り替え）
            </p>
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            <div style={{
              padding: '24px',
              backgroundColor: '#F8F9FA',
              borderRadius: '8px',
              marginTop: '16px',
            }}>
              <p style={{ color: '#666', margin: 0 }}>
                現在のタブ: <strong style={{ color: '#1A1A1A' }}>{activeTab}</strong>
              </p>
            </div>
          </div>

          {/* 各タブの状態 */}
          <div>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>
              各タブがアクティブな状態
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {(['all', 'progress', 'favorite', 'history'] as TabId[]).map((tab) => (
                <div key={tab}>
                  <p style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>
                    activeTab="{tab}"
                  </p>
                  <TabNavigation
                    activeTab={tab}
                    onTabChange={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TabNavigationPill セクション（Pill/Chipスタイル） */}
      <section style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          TabNavigationPill（Pill/Chipスタイル）
        </h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          Figma MCP取得仕様に基づくタブナビゲーション（背景色でアクティブ表示）
        </p>

        <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px' }}>
          {/* インタラクティブなデモ */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>
              インタラクティブデモ（クリックでタブ切り替え）
            </p>
            <TabNavigationPill
              activeTab={activePillTab}
              onTabChange={setActivePillTab}
            />
            <div style={{
              padding: '24px',
              backgroundColor: '#F8F9FA',
              borderRadius: '8px',
              marginTop: '16px',
            }}>
              <p style={{ color: '#666', margin: 0 }}>
                現在のタブ: <strong style={{ color: '#1A1A1A' }}>{activePillTab}</strong>
              </p>
            </div>
          </div>

          {/* 各タブの状態 */}
          <div>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>
              各タブがアクティブな状態
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {(['all', 'progress', 'favorite', 'history'] as TabPillId[]).map((tab) => (
                <div key={tab}>
                  <p style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>
                    activeTab="{tab}"
                  </p>
                  <TabNavigationPill
                    activeTab={tab}
                    onTabChange={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* デザイン仕様 */}
          <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px', fontWeight: 'bold' }}>
              デザイン仕様（Figma MCP取得）
            </p>
            <ul style={{ fontSize: '11px', color: '#666', margin: 0, paddingLeft: '16px', lineHeight: '1.8' }}>
              <li>コンテナ: #F2F2F2, padding: 3px, gap: 8px, border-radius: 8px</li>
              <li>タブ: padding: 6px, border-radius: 6px</li>
              <li>アクティブ: 白背景, shadow: 0px 2px 2px rgba(0,0,0,0.04)</li>
              <li>非アクティブテキスト: rgba(0,0,0,0.48)</li>
              <li>フォント: Rounded Mplus 1c, 12px, Bold</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ProgressSection セクション */}
      <section style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          ProgressSection（進行中セクション）
        </h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          マイページに表示する「進行中」セクションコンポーネント
        </p>

        <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px' }}>
          {/* パターン1: 通常表示（2件） */}
          <div style={{ marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>
              パターン1: 通常表示（2件、進行中）
            </p>
            <ProgressSection
              lessons={sampleLessons}
              onViewAll={() => alert('「すべてみる」がクリックされました')}
              onCardClick={(title) => alert(`カードクリック: ${title}`)}
              onNextArticleClick={(url) => alert(`次の記事へ: ${url}`)}
            />
          </div>

          {/* パターン2: 100%完了時 */}
          <div style={{ marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>
              パターン2: 100%完了時
            </p>
            <ProgressSection
              lessons={completedLessons}
              onCardClick={(title) => alert(`カードクリック: ${title}`)}
            />
          </div>

          {/* パターン3: 1件のみ */}
          <div style={{ marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>
              パターン3: 1件のみ
            </p>
            <ProgressSection
              lessons={[sampleLessons[0]]}
              onViewAll={() => alert('「すべてみる」がクリックされました')}
            />
          </div>

          {/* パターン4: 0件（非表示になる） */}
          <div>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>
              パターン4: 0件（セクション自体が非表示）
            </p>
            <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', color: '#999' }}>
              ↓ ProgressSection lessons=&#123;[]&#125; は何も表示されません
            </div>
            <ProgressSection lessons={[]} />
          </div>
        </div>
      </section>

      {/* 100%完了状態 - スタイリング確定用 */}
      <section style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#22C55E' }}>
          100%完了状態（スタイリング確定用）
        </h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          このセクションで100%完了時のデザインを確定してください
        </p>

        <div style={{
          backgroundColor: '#ffffff',
          padding: '32px',
          borderRadius: '12px',
          border: '2px dashed #22C55E',
        }}>
          {/* 完了ボタン付きプレビュー */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '14px', color: '#22C55E', marginBottom: '16px', fontWeight: 'bold' }}>
              完了ボタン付き（showCompleteButton=true）
            </p>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
                <p style={{ fontSize: '12px', color: '#22C55E', marginBottom: '8px' }}>
                  クリックで完了処理をデモ
                </p>
                <ProgressLesson
                  title="センスを盗む技術"
                  progress={100}
                  currentStep="全て完了"
                  iconImageUrl="https://via.placeholder.com/48x73"
                  showCompleteButton={completedLessonId !== 'demo1'}
                  onCompleteClick={() => handleCompleteDemo('demo1')}
                  isCompleting={isCompleting}
                />
              </div>
              <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                  ローディング状態（isCompleting=true）
                </p>
                <ProgressLesson
                  title="UIデザインの基礎"
                  progress={100}
                  currentStep="全て完了"
                  iconImageUrl="https://via.placeholder.com/48x73"
                  showCompleteButton={true}
                  isCompleting={true}
                />
              </div>
            </div>
          </div>

          {/* ボタンなし vs ボタンあり比較 */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', fontWeight: 'bold' }}>
              ボタンなし vs ボタンあり比較
            </p>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                  ボタンなし（showCompleteButton=false）
                </p>
                <ProgressLesson
                  title="React Hooks"
                  progress={100}
                  currentStep="全て完了"
                  iconImageUrl="https://via.placeholder.com/48x73"
                  showCompleteButton={false}
                />
              </div>
              <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
                <p style={{ fontSize: '12px', color: '#22C55E', marginBottom: '8px' }}>
                  ボタンあり（showCompleteButton=true）
                </p>
                <ProgressLesson
                  title="React Hooks"
                  progress={100}
                  currentStep="全て完了"
                  iconImageUrl="https://via.placeholder.com/48x73"
                  showCompleteButton={true}
                  onCompleteClick={() => alert('完了ボタンクリック')}
                />
              </div>
            </div>
          </div>

          {/* 進行中との比較 */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', fontWeight: 'bold' }}>
              100%完了ボタン vs 進行中（次の記事）
            </p>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
                <p style={{ fontSize: '12px', color: '#22C55E', marginBottom: '8px' }}>
                  100% + 完了ボタン
                </p>
                <ProgressLesson
                  title="TypeScript基礎"
                  progress={100}
                  currentStep="全て完了"
                  iconImageUrl="https://via.placeholder.com/48x73"
                  showCompleteButton={true}
                  onCompleteClick={() => alert('完了！')}
                />
              </div>
              <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                  75% + 次の記事
                </p>
                <ProgressLesson
                  title="TypeScript基礎"
                  progress={75}
                  currentStep="ジェネリクス入門"
                  iconImageUrl="https://via.placeholder.com/48x73"
                  nextArticleUrl="/articles/generics"
                />
              </div>
            </div>
          </div>

          {/* 複数パターン */}
          <div>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', fontWeight: 'bold' }}>
              100%完了 - 複数パターン（ボタンなし）
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', maxWidth: '850px' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>
                  短いタイトル
                </p>
                <ProgressLesson
                  title="React入門"
                  progress={100}
                  currentStep="全て完了"
                  iconImageUrl="https://via.placeholder.com/48x73"
                />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>
                  長いタイトル
                </p>
                <ProgressLesson
                  title="長いタイトルのレッスン名がここに入ります"
                  progress={100}
                  currentStep="全て完了"
                  iconImageUrl="https://via.placeholder.com/48x73"
                />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>
                  クリック可能
                </p>
                <ProgressLesson
                  title="CSS Grid入門"
                  progress={100}
                  currentStep="全て完了"
                  iconImageUrl="https://via.placeholder.com/48x73"
                  onCardClick={() => alert('レッスンページへ')}
                />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>
                  表示のみ
                </p>
                <ProgressLesson
                  title="Flexbox入門"
                  progress={100}
                  currentStep="全て完了"
                  iconImageUrl="https://via.placeholder.com/48x73"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ProgressLesson 単体セクション */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          ProgressLesson（単体カード）
        </h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          レッスン進捗カードコンポーネント（Figma準拠デザイン）
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '24px',
          maxWidth: '900px'
        }}>
          {/* パターン1: 進行中（次の記事あり） */}
          <div>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
              パターン1: 進行中（次の記事あり）
            </p>
            <ProgressLesson
              title="センスを盗む技術"
              progress={25}
              currentStep="盗む視点①：ビジュアル"
              iconImageUrl="https://via.placeholder.com/48x73"
              nextArticleUrl="/articles/visual-basics"
              onCardClick={() => alert('カードクリック')}
              onNextArticleClick={() => alert('次の記事へ')}
            />
          </div>

          {/* パターン2: 進行中 60% */}
          <div>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
              パターン2: 進行中 60%
            </p>
            <ProgressLesson
              title="UIデザインの基礎"
              progress={60}
              currentStep="レイアウト設計の基本"
              iconImageUrl="https://via.placeholder.com/48x73"
              nextArticleUrl="/articles/layout-basics"
            />
          </div>

          {/* パターン3: 100%完了 */}
          <div>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
              パターン3: 100%完了
            </p>
            <ProgressLesson
              title="フロントエンド開発入門"
              progress={100}
              currentStep="全て完了"
              iconImageUrl="https://via.placeholder.com/48x73"
            />
          </div>

          {/* パターン4: 長いタイトル */}
          <div>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
              パターン4: 長いタイトル
            </p>
            <ProgressLesson
              title="長いタイトルのレッスン名がここに入ります"
              progress={45}
              currentStep="とても長い記事タイトルがここに表示されます"
              iconImageUrl="https://via.placeholder.com/48x73"
              nextArticleUrl="/articles/long-article"
            />
          </div>

          {/* パターン5: 0% */}
          <div>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
              パターン5: 0%（未開始）
            </p>
            <ProgressLesson
              title="カラー理論"
              progress={0}
              currentStep="はじめに"
              iconImageUrl="https://via.placeholder.com/48x73"
              nextArticleUrl="/articles/color-intro"
            />
          </div>

          {/* パターン6: クリックなし */}
          <div>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
              パターン6: クリックなし（表示のみ）
            </p>
            <ProgressLesson
              title="React入門"
              progress={15}
              currentStep="Hooks入門"
              iconImageUrl="https://via.placeholder.com/48x73"
            />
          </div>
        </div>
      </section>

      {/* 今後追加するコンポーネント用のプレースホルダー */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#999' }}>
          （今後追加予定）
        </h2>
        <ul style={{ color: '#999', lineHeight: '2' }}>
          <li>FavoriteArticleCard - お気に入り記事カード</li>
          <li>ArticleHistoryCard - 閲覧履歴カード</li>
        </ul>
      </section>
    </div>
  );
}
