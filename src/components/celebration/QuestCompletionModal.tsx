/**
 * QuestCompletionModal - クエスト完了時のモーダル
 *
 * 熱血コーチング・セレブレーション機能 レベル2
 * シンプルデザイン + 5秒後に自動で閉じる
 */
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

interface QuestCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questTitle: string;
  autoCloseDelay?: number; // ミリ秒（デフォルト5000）
}

export function QuestCompletionModal({
  isOpen,
  onClose,
  questTitle,
  autoCloseDelay = 5000,
}: QuestCompletionModalProps) {
  // 自動で閉じる
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, autoCloseDelay]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="quest-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={onClose}
        >
          {/* モーダル本体 */}
          <motion.div
            key="quest-modal-content"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 閉じるボタン */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="閉じる"
            >
              <X className="h-4 w-4" />
            </button>

            {/* コンテンツ */}
            <div className="text-center">
              {/* アイコン - ふわふわアニメーション付き */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F0FDF4]"
              >
                <motion.div
                  animate={{ scale: 1.05 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                  }}
                >
                  <CheckCircle className="h-10 w-10 text-[#22C55E]" />
                </motion.div>
              </motion.div>

              {/* タイトル */}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-lg font-bold text-gray-900 mb-2"
              >
                クエスト完了！
              </motion.h3>

              {/* クエスト名 */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-gray-600 mb-4"
              >
                『{questTitle}』をクリアしました
              </motion.p>

              {/* メッセージ */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-base font-medium text-gray-800"
              >
                ナイスマッスル！その調子だ！
              </motion.p>

              {/* プログレスバー（自動閉じインジケーター） */}
              <motion.div
                className="mt-6 h-1 bg-gray-100 rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: autoCloseDelay / 1000, ease: 'linear' }}
                  className="h-full bg-gray-400"
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
