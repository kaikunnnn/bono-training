import * as React from "react"

interface SectionHeadingProps {
  /** セクションタイトル */
  title: string
  /** 「すべてみる」ボタンのクリックハンドラ */
  onSeeAllClick?: () => void
  /** コンテンツの総数 */
  totalCount?: number
  /** 表示上限（この数を超えると「すべてみる」が表示される） */
  displayLimit?: number
  /** 「すべてみる」を強制的に非表示にする */
  hideSeeAll?: boolean
}

// Figma仕様に基づくスタイル定数
const styles = {
  colors: {
    titleText: "#020817",
    seeAllText: "rgba(2, 8, 23, 0.64)",
  },
  typography: {
    fontFamily: "'Rounded Mplus 1c', sans-serif",
  },
}

/**
 * SectionHeading - MyPageのセクション見出しコンポーネント
 *
 * 「すべてみる」ボタンは以下の条件で表示:
 * - onSeeAllClick が指定されている
 * - hideSeeAll が false
 * - totalCount > displayLimit (両方指定時)
 */
export function SectionHeading({
  title,
  onSeeAllClick,
  totalCount,
  displayLimit,
  hideSeeAll = false,
}: SectionHeadingProps) {
  // 「すべてみる」を表示するかどうか
  const showSeeAll = React.useMemo(() => {
    if (hideSeeAll) return false
    if (!onSeeAllClick) return false

    // totalCount と displayLimit が両方指定されている場合、上限を超えた時のみ表示
    if (totalCount !== undefined && displayLimit !== undefined) {
      return totalCount > displayLimit
    }

    // それ以外は常に表示
    return true
  }, [hideSeeAll, onSeeAllClick, totalCount, displayLimit])

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        width: "100%",
        fontFamily: styles.typography.fontFamily,
        fontWeight: 700,
        lineHeight: "normal",
      }}
    >
      <h2
        style={{
          fontSize: "16px",
          lineHeight: "32px",
          color: styles.colors.titleText,
          margin: 0,
        }}
      >
        {title}
      </h2>
      {showSeeAll && (
        <button
          onClick={onSeeAllClick}
          style={{
            fontSize: "13px",
            lineHeight: "32px",
            color: styles.colors.seeAllText,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontFamily: styles.typography.fontFamily,
            fontWeight: 700,
          }}
        >
          すべてみる
        </button>
      )}
    </div>
  )
}
