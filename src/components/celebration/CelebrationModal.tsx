/**
 * CelebrationModal - レッスン完了時の全画面モーダル
 *
 * 熱血コーチング・セレブレーション機能 レベル3
 * 「優勝だ！！お前がNo.1だ！！」
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mainTitle: string;
  subTitle: string;
  body: string;
  footer: string;
}

export function CelebrationModal({
  isOpen,
  onClose,
  mainTitle,
  subTitle,
  body,
  footer,
}: CelebrationModalProps) {
  console.log('[CelebrationModal] render, isOpen:', isOpen);

  // isOpenがfalseでも常にレンダリング（AnimatePresenceが正しく動作するため）
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="celebration-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={onClose}
        >
          {/* モーダル本体 */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-red-50 to-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 閉じるボタン */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="閉じる"
            >
              <X className="h-5 w-5" />
            </button>

            {/* アイコンエリア */}
            <div className="relative flex justify-center items-center h-32 mb-6">
              {/* 左の稲妻 */}
              <motion.div
                animate={{
                  rotate: -10,
                  y: -5,
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
                className="absolute left-8"
              >
                <Zap className="h-12 w-12 text-yellow-500 fill-yellow-400" />
              </motion.div>

              {/* 中央の炎 */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1.1 }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
              >
                <Flame className="h-24 w-24 text-red-500 fill-red-400" />
              </motion.div>

              {/* 右のトロフィー */}
              <motion.div
                animate={{
                  rotate: 10,
                  y: -5,
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                  delay: 0.25,
                }}
                className="absolute right-8"
              >
                <Trophy className="h-12 w-12 text-yellow-500 fill-yellow-400" />
              </motion.div>
            </div>

            {/* メインタイトル */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center text-3xl font-extrabold text-red-600 mb-2"
              style={{ fontFamily: "'Hiragino Maru Gothic Pro', sans-serif" }}
            >
              {mainTitle}
            </motion.h2>

            {/* サブタイトル */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-lg font-bold text-red-800 mb-6"
            >
              {subTitle}
            </motion.p>

            {/* 本文 */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-base text-gray-700 mb-4 whitespace-pre-line leading-relaxed"
            >
              {body}
            </motion.p>

            {/* フッター */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-gray-500 mb-8"
            >
              {footer}
            </motion.p>

            {/* ボタン */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center"
            >
              <Button
                onClick={onClose}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                閉じる
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
