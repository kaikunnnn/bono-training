import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeaderProps {
  /** ラベル（例: "Q&A", "Feedback"） */
  label: string;
  /** ページタイトル */
  title: string;
  /** 説明文 */
  description: string;
  /** ボタンエリア（ReactNodeで柔軟に対応） */
  children?: ReactNode;
}

/**
 * ページヘッダーコンポーネント
 *
 * 質問ページ、フィードバックページなどで使用する共通ヘッダー
 * - ラベル（カテゴリ表示）
 * - タイトル
 * - 説明文
 * - ボタンエリア（children）
 */
const PageHeader = ({
  label,
  title,
  description,
  children,
}: PageHeaderProps) => {
  return (
    <motion.div
      className="text-center -mt-12 md:mt-12 mb-10 md:mb-[88px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <span className="text-sm text-muted-foreground mb-1 block">{label}</span>
      <h1 className="text-[28px] md:text-[48px] font-bold text-foreground font-rounded-mplus mb-2">
        {title}
      </h1>
      <p className="text-[15px] text-muted-foreground mb-6">{description}</p>
      {children && <div className="flex justify-center">{children}</div>}
    </motion.div>
  );
};

export default PageHeader;
