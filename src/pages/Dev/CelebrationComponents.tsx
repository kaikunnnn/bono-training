/**
 * CelebrationComponents - セレブレーション機能開発プレビュー
 *
 * トースト・モーダル・紙吹雪のスタイル調整・確認用
 */
import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { CelebrationModal } from '@/components/celebration/CelebrationModal';
import { QuestCompletionModal } from '@/components/celebration/QuestCompletionModal';
import { fireQuestConfetti, fireLessonConfetti, fireArticleConfetti } from '@/lib/confetti';
import {
  playArticleCompleteSound,
  playQuestCompleteSound,
  playLessonCompleteSound,
} from '@/lib/celebration-sounds';
import {
  ARTICLE_COMPLETE_MESSAGES,
  getLessonCompleteMessage,
  getRandomArticleMessage,
} from '@/lib/celebration-messages';
import { Button } from '@/components/ui/button';
import { Flame, Zap, Trophy, Sparkles, CheckCircle } from 'lucide-react';

export default function CelebrationComponents() {
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);

  // サンプルデータ
  const sampleQuestTitle = 'UI上達サイクルの4ステップ';
  const sampleLessonTitle = 'センスを盗む技術';

  // トースト発火関数
  const showArticleToast = () => {
    const message = getRandomArticleMessage();
    toast({
      title: message.title,
      description: message.description,
    });
  };

  const showQuestCelebration = () => {
    fireQuestConfetti();
    setShowQuestModal(true);
  };

  const showLessonCelebration = () => {
    fireLessonConfetti();
    setShowLessonModal(true);
  };

  const lessonModalData = getLessonCompleteMessage(sampleLessonTitle);

  return (
    <div style={{ padding: '40px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
        Celebration Components 開発プレビュー
      </h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        熱血コーチング・セレブレーション機能のスタイル調整・動作確認
      </p>

      {/* クエスト完了モーダル */}
      <QuestCompletionModal
        isOpen={showQuestModal}
        onClose={() => setShowQuestModal(false)}
        questTitle={sampleQuestTitle}
      />

      {/* レッスン完了モーダル */}
      <CelebrationModal
        isOpen={showLessonModal}
        onClose={() => setShowLessonModal(false)}
        mainTitle={lessonModalData.mainTitle}
        subTitle={lessonModalData.subTitle}
        body={lessonModalData.body}
        footer={lessonModalData.footer}
      />

      {/* セクション1: トリガーボタン */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          セレブレーション発火テスト
        </h2>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Button onClick={showArticleToast} variant="outline">
              <Sparkles className="w-4 h-4 mr-2" />
              記事完了トースト
            </Button>
            <Button onClick={showQuestCelebration} className="bg-orange-500 hover:bg-orange-600 text-white">
              <CheckCircle className="w-4 h-4 mr-2" />
              クエスト完了（モーダル + 紙吹雪）
            </Button>
            <Button onClick={showLessonCelebration} className="bg-red-600 hover:bg-red-700 text-white">
              <Trophy className="w-4 h-4 mr-2" />
              レッスン完了（モーダル + 紙吹雪）
            </Button>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <Button onClick={fireArticleConfetti} variant="ghost" size="sm">
              紙吹雪（小）
            </Button>
            <Button onClick={fireQuestConfetti} variant="ghost" size="sm">
              紙吹雪（中）
            </Button>
            <Button onClick={fireLessonConfetti} variant="ghost" size="sm">
              紙吹雪（大・連続）
            </Button>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
            <Button onClick={playArticleCompleteSound} variant="ghost" size="sm">
              効果音（記事）
            </Button>
            <Button onClick={playQuestCompleteSound} variant="ghost" size="sm">
              効果音（クエスト）
            </Button>
            <Button onClick={playLessonCompleteSound} variant="ghost" size="sm">
              効果音（レッスン）
            </Button>
          </div>
        </div>
      </section>

      {/* セクション2: 記事完了メッセージ一覧 */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          レベル1: 記事完了メッセージ
        </h2>
        <p style={{ color: '#666', marginBottom: '16px', fontSize: '14px' }}>
          ランダムで表示される熱血メッセージ
        </p>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'grid', gap: '12px' }}>
            {ARTICLE_COMPLETE_MESSAGES.map((msg, index) => (
              <div
                key={index}
                style={{
                  padding: '16px',
                  backgroundColor: '#FAFAFA',
                  borderRadius: '8px',
                  border: '1px solid #E5E5E5',
                }}
              >
                <p style={{ fontWeight: 'bold', margin: 0, marginBottom: '4px' }}>
                  {msg.title}
                </p>
                <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
                  {msg.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* セクション3: クエスト完了モーダル */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          レベル2: クエスト完了モーダル
        </h2>
        <p style={{ color: '#666', marginBottom: '16px', fontSize: '14px' }}>
          シンプルなモーダル（5秒後に自動閉じ） + 紙吹雪（中規模）
        </p>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px' }}>
          {/* プレビュー表示 */}
          <div
            style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '400px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '1px solid #E5E5E5',
            }}
          >
            {/* アイコン - 緑色＋ふわふわアニメーション */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                backgroundColor: '#F0FDF4',
                borderRadius: '50%',
              }}>
                <CheckCircle style={{ width: '40px', height: '40px', color: '#22C55E' }} />
              </div>
            </div>
            <p style={{ fontWeight: 'bold', color: '#111827', margin: 0, marginBottom: '8px', fontSize: '18px', textAlign: 'center' }}>
              クエスト完了！
            </p>
            <p style={{ color: '#6B7280', margin: 0, marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
              『{sampleQuestTitle}』をクリアしました
            </p>
            <p style={{ color: '#374151', margin: 0, fontSize: '16px', textAlign: 'center', fontWeight: '500' }}>
              ナイスマッスル！その調子だ！
            </p>
            {/* 自動閉じインジケーター */}
            <div style={{ marginTop: '24px', height: '4px', backgroundColor: '#F3F4F6', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '60%', height: '100%', backgroundColor: '#9CA3AF' }} />
            </div>
          </div>
          <p style={{ marginTop: '16px', color: '#999', fontSize: '12px' }}>
            ※ 5秒後に自動で閉じます。手動で閉じることも可能です。
          </p>
          <Button onClick={() => setShowQuestModal(true)} variant="outline" size="sm" style={{ marginTop: '8px' }}>
            モーダルを表示
          </Button>
        </div>
      </section>

      {/* セクション4: レッスン完了モーダル */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          レベル3: レッスン完了モーダル
        </h2>
        <p style={{ color: '#666', marginBottom: '16px', fontSize: '14px' }}>
          全画面モーダル + 紙吹雪（大規模・連続）
        </p>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px' }}>
          {/* モーダルプレビュー（縮小版） */}
          <div
            style={{
              background: 'linear-gradient(to bottom, #FEF2F2, #FFFFFF)',
              padding: '32px',
              borderRadius: '16px',
              maxWidth: '500px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            }}
          >
            {/* アイコンエリア */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
              <Zap style={{ width: '32px', height: '32px', color: '#EAB308', fill: '#FDE047' }} />
              <Flame style={{ width: '48px', height: '48px', color: '#EF4444', fill: '#FCA5A5' }} />
              <Trophy style={{ width: '32px', height: '32px', color: '#EAB308', fill: '#FDE047' }} />
            </div>

            {/* テキスト */}
            <h3 style={{ textAlign: 'center', fontSize: '24px', fontWeight: '800', color: '#DC2626', marginBottom: '8px' }}>
              {lessonModalData.mainTitle}
            </h3>
            <p style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold', color: '#991B1B', marginBottom: '16px' }}>
              {lessonModalData.subTitle}
            </p>
            <p style={{ textAlign: 'center', color: '#374151', marginBottom: '8px', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
              {lessonModalData.body}
            </p>
            <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>
              {lessonModalData.footer}
            </p>

            {/* ボタン */}
            <div style={{ textAlign: 'center' }}>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 text-lg rounded-full"
                onClick={() => setShowLessonModal(true)}
              >
                次の大会へ！
              </Button>
            </div>
          </div>
          <p style={{ marginTop: '16px', color: '#999', fontSize: '12px' }}>
            ※ 上のボタンをクリックすると実際のモーダルが表示されます
          </p>
        </div>
      </section>

      {/* セクション5: スタイル調整ガイド */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          スタイル調整ガイド
        </h2>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #86EFAC' }}>
              <p style={{ fontWeight: 'bold', margin: 0, marginBottom: '8px' }}>
                トーストスタイル
              </p>
              <code style={{ fontSize: '12px', color: '#166534' }}>
                src/components/ui/toast.tsx → toastVariants.celebration
              </code>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #93C5FD' }}>
              <p style={{ fontWeight: 'bold', margin: 0, marginBottom: '8px' }}>
                メッセージ文言
              </p>
              <code style={{ fontSize: '12px', color: '#1E40AF' }}>
                src/lib/celebration-messages.ts
              </code>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#FEF3C7', borderRadius: '8px', border: '1px solid #FCD34D' }}>
              <p style={{ fontWeight: 'bold', margin: 0, marginBottom: '8px' }}>
                モーダルスタイル
              </p>
              <code style={{ fontSize: '12px', color: '#92400E' }}>
                src/components/celebration/CelebrationModal.tsx
              </code>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#FDF2F8', borderRadius: '8px', border: '1px solid #F9A8D4' }}>
              <p style={{ fontWeight: 'bold', margin: 0, marginBottom: '8px' }}>
                紙吹雪設定
              </p>
              <code style={{ fontSize: '12px', color: '#9D174D' }}>
                src/lib/confetti.ts
              </code>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #86EFAC' }}>
              <p style={{ fontWeight: 'bold', margin: 0, marginBottom: '8px' }}>
                効果音設定
              </p>
              <code style={{ fontSize: '12px', color: '#166534' }}>
                src/lib/celebration-sounds.ts
              </code>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
