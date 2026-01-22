/**
 * アイコン デザインシステム
 *
 * このプロジェクトでは iconsax-react を標準アイコンライブラリとして使用します。
 * 新しいアイコンを使う際は、このファイルから import してください。
 *
 * @example
 * import { icons, ICON_SIZES } from "@/lib/icons";
 * <icons.Check size={ICON_SIZES.md} />
 *
 * // または直接 import
 * import { Check } from "@/lib/icons";
 * <Check size={16} />
 *
 * // バリアント指定
 * import { Star } from "@/lib/icons";
 * <Star size={16} variant="Bold" />
 */

// =============================================================================
// サイズ定数
// =============================================================================

/**
 * アイコンサイズの定数
 * Tailwind の size-* クラスと対応
 */
export const ICON_SIZES = {
  /** 14px - 小さいテキスト横のアイコン */
  sm: 14,
  /** 16px - 標準サイズ（デフォルト） */
  md: 16,
  /** 20px - ボタン内のアイコン */
  lg: 20,
  /** 24px - 大きめのアイコン */
  xl: 24,
} as const;

export type IconSize = keyof typeof ICON_SIZES;

/**
 * Iconsaxのバリアント
 * - Linear: 線のみ（デフォルト）
 * - Outline: アウトライン
 * - Bold: 塗りつぶし
 * - Bulk: 半透明の塗り
 * - TwoTone: 2色
 */
export type IconVariant = "Linear" | "Outline" | "Bold" | "Bulk" | "TwoTone";

// =============================================================================
// よく使うアイコンの再エクスポート (Iconsax)
// =============================================================================

// ナビゲーション
export {
  ArrowRight2 as ChevronRight,
  ArrowLeft2 as ChevronLeft,
  ArrowDown2 as ChevronDown,
  ArrowUp2 as ChevronUp,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  HambergerMenu as Menu,
  CloseSquare as X,
  Add as Plus,
  Minus,
} from "iconsax-react";

// サイドバー（記事の「一覧」開閉などで使用）
export {
  SidebarLeft,
  SidebarRight,
  ArrowSquareLeft,
  ArrowSquareRight,
} from "iconsax-react";

// アクション
export {
  TickCircle as Check,
  SearchNormal1 as Search,
  Setting2 as Settings,
  Share,
  ExportCurve as Share2,
  ExportSquare as ExternalLink,
  Copy,
  Trash,
  Trash as Trash2,
  Edit2 as Edit,
  More as MoreHorizontal,
  More as MoreVertical,
} from "iconsax-react";

// 状態・フィードバック
export {
  Danger as AlertCircle,
  Warning2 as AlertTriangle,
  InfoCircle as Info,
  MessageQuestion as HelpCircle,
  TickCircle as CheckCircle2,
  CloseCircle as XCircle,
  RefreshCircle as Loader2,
  Clock,
} from "iconsax-react";

// ユーザー・認証
export {
  User,
  Login as LogIn,
  Logout as LogOut,
  Lock1 as Lock,
  Unlock,
} from "iconsax-react";

// コンテンツ
export {
  Book1 as BookOpen,
  Play,
  Pause,
  Star1 as Star,
  Heart,
  ArchiveBook as Bookmark,
  Eye,
  EyeSlash as EyeOff,
  Image,
  Video,
  Document as File,
  DocumentText as FileText,
} from "iconsax-react";

// その他
export {
  Map1 as Map,
  Discover as Compass,
  Calendar,
  Sms as Mail,
  Link21 as Link,
  DocumentDownload as Download,
  DocumentUpload as Upload,
  Home2 as Home,
  Notification as Bell,
  Folder2 as Folder,
  Global as Globe,
} from "iconsax-react";

// =============================================================================
// アイコンマッピング（動的に使用する場合）
// =============================================================================

import {
  TickCircle,
  ArrowRight2,
  ArrowLeft2,
  ArrowDown2,
  ArrowUp2,
  ArrowRight as IcArrowRight,
  ArrowLeft as IcArrowLeft,
  HambergerMenu,
  CloseSquare,
  Add,
  Minus as IcMinus,
  SearchNormal1,
  Setting2,
  ExportCurve as IcShare,
  Danger,
  Warning2,
  InfoCircle,
  TickCircle as IcCheckCircle,
  RefreshCircle,
  Clock as IcClock,
  User as IcUser,
  Login,
  Logout,
  Lock1,
  Book1,
  Play as IcPlay,
  Star1,
  ArchiveBook,
  Eye as IcEye,
  Map1,
  Discover,
  type Icon,
} from "iconsax-react";

/**
 * アイコン名からコンポーネントを取得するためのマッピング
 * 動的にアイコンを表示する必要がある場合に使用
 */
export const icons = {
  // ナビゲーション
  chevronRight: ArrowRight2,
  chevronLeft: ArrowLeft2,
  chevronDown: ArrowDown2,
  chevronUp: ArrowUp2,
  arrowRight: IcArrowRight,
  arrowLeft: IcArrowLeft,
  menu: HambergerMenu,
  close: CloseSquare,

  // アクション
  check: TickCircle,
  plus: Add,
  minus: IcMinus,
  search: SearchNormal1,
  settings: Setting2,
  share: IcShare,

  // 状態
  alert: Danger,
  warning: Warning2,
  info: InfoCircle,
  success: IcCheckCircle,
  loading: RefreshCircle,
  clock: IcClock,

  // ユーザー
  user: IcUser,
  login: Login,
  logout: Logout,
  lock: Lock1,

  // コンテンツ
  book: Book1,
  play: IcPlay,
  star: Star1,
  bookmark: ArchiveBook,
  eye: IcEye,

  // その他
  map: Map1,
  compass: Discover,
} as const satisfies Record<string, Icon>;

export type IconName = keyof typeof icons;
