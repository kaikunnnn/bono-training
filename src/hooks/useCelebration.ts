/**
 * useCelebration - 熱血コーチング・セレブレーション管理フック
 *
 * 記事完了、クエスト完了、レッスン完了時の演出を一元管理
 */
import { useCallback, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { fireQuestConfetti, fireLessonConfetti } from '@/lib/confetti';
import {
  getRandomArticleMessage,
  getLessonCompleteMessage,
} from '@/lib/celebration-messages';
import {
  playArticleCompleteSound,
  playQuestCompleteSound,
  playLessonCompleteSound,
} from '@/lib/celebration-sounds';

interface UseCelebrationReturn {
  // クエスト完了モーダル表示状態
  showQuestModal: boolean;
  questModalTitle: string;
  closeQuestModal: () => void;

  // レッスン完了モーダル表示状態
  showLessonModal: boolean;
  lessonModalData: {
    mainTitle: string;
    subTitle: string;
    body: string;
    footer: string;
  } | null;
  closeLessonModal: () => void;

  // セレブレーション発火関数
  celebrateArticleComplete: () => void;
  celebrateQuestComplete: (questTitle: string) => void;
  celebrateLessonComplete: (lessonTitle: string) => void;
}

export function useCelebration(): UseCelebrationReturn {
  // クエスト完了モーダル状態
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [questModalTitle, setQuestModalTitle] = useState('');

  // レッスン完了モーダル状態
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonModalData, setLessonModalData] = useState<{
    mainTitle: string;
    subTitle: string;
    body: string;
    footer: string;
  } | null>(null);

  /**
   * レベル1: 記事完了セレブレーション
   * - ランダムな熱血メッセージでトースト表示
   * - 軽い効果音
   */
  const celebrateArticleComplete = useCallback(() => {
    // 効果音
    playArticleCompleteSound();

    const message = getRandomArticleMessage();
    toast({
      title: message.title,
      description: message.description,
    });
  }, []);

  /**
   * レベル2: クエスト完了セレブレーション
   * - シンプルなモーダル（5秒後に自動閉じ） + 紙吹雪
   * - 達成感のある効果音
   */
  const celebrateQuestComplete = useCallback((questTitle: string) => {
    console.log('[useCelebration] celebrateQuestComplete called with:', questTitle);

    // 効果音
    playQuestCompleteSound();

    // 紙吹雪発射
    fireQuestConfetti();

    // モーダル表示
    setQuestModalTitle(questTitle);
    setShowQuestModal(true);
  }, []);

  const closeQuestModal = useCallback(() => {
    setShowQuestModal(false);
    setQuestModalTitle('');
  }, []);

  /**
   * レベル3: レッスン完了セレブレーション
   * - 全画面モーダル + 紙吹雪連続
   * - ファンファーレ効果音
   */
  const celebrateLessonComplete = useCallback((lessonTitle: string) => {
    console.log('[useCelebration] celebrateLessonComplete called with:', lessonTitle);
    const message = getLessonCompleteMessage(lessonTitle);
    console.log('[useCelebration] message:', message);

    // 0.5秒のタメを作ってからモーダル表示
    setTimeout(() => {
      console.log('[useCelebration] Setting modal data and showing modal');

      // ファンファーレ効果音
      playLessonCompleteSound();

      setLessonModalData(message);
      setShowLessonModal(true);

      // 紙吹雪連続発射
      fireLessonConfetti();
    }, 500);
  }, []);

  const closeLessonModal = useCallback(() => {
    setShowLessonModal(false);
    setLessonModalData(null);
  }, []);

  return {
    // クエスト完了モーダル
    showQuestModal,
    questModalTitle,
    closeQuestModal,
    // レッスン完了モーダル
    showLessonModal,
    lessonModalData,
    closeLessonModal,
    // セレブレーション発火関数
    celebrateArticleComplete,
    celebrateQuestComplete,
    celebrateLessonComplete,
  };
}
