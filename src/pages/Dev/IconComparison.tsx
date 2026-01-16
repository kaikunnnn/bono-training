/**
 * アイコン比較ページ
 * Lucide vs Iconsax のビジュアル比較
 */

import React, { useState } from "react";
import { cn } from "@/lib/utils";

// Lucide icons (現在使用中)
import {
  Map,
  BookOpen,
  Compass,
  Settings,
  User,
  LogIn,
  LogOut,
  Play,
  Star,
  Home,
  Heart,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  Check,
  Plus,
  Minus,
  Eye,
  Bookmark,
  Share2,
  ExternalLink,
  Clock,
  Calendar,
  Mail,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Image,
  Video,
  File,
  Folder,
  HelpCircle,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// Iconsax icons
import {
  Map1 as IcMap,
  Book1 as IcBook,
  Discover as IcCompass,
  Setting2 as IcSettings,
  User as IcUser,
  Login as IcLogin,
  Logout as IcLogout,
  Play as IcPlay,
  Star1 as IcStar,
  Home2 as IcHome,
  Heart as IcHeart,
  Notification as IcBell,
  SearchNormal1 as IcSearch,
  HambergerMenu as IcMenu,
  CloseSquare as IcX,
  ArrowRight2 as IcChevronRight,
  ArrowRight as IcArrowRight,
  TickCircle as IcCheck,
  Add as IcPlus,
  Minus as IcMinus,
  Eye as IcEye,
  ArchiveBook as IcBookmark,
  Share as IcShare,
  ExportSquare as IcExternalLink,
  Clock as IcClock,
  Calendar as IcCalendar,
  Sms as IcMail,
  Lock1 as IcLock,
  Unlock as IcUnlock,
  Edit2 as IcEdit,
  Trash as IcTrash,
  Copy as IcCopy,
  DocumentDownload as IcDownload,
  DocumentUpload as IcUpload,
  Image as IcImage,
  Video as IcVideo,
  Document as IcFile,
  Folder2 as IcFolder,
  MessageQuestion as IcHelpCircle,
  InfoCircle as IcInfo,
  Danger as IcAlertCircle,
  Warning2 as IcAlertTriangle,
  TickCircle as IcCheckCircle,
  CloseCircle as IcXCircle,
} from "iconsax-react";

// アイコン比較データ
const iconGroups = [
  {
    label: "グローバルナビゲーション（サイドバー）",
    icons: [
      { name: "マイページ", lucide: User, iconsax: IcUser },
      { name: "ロードマップ", lucide: Map, iconsax: IcMap },
      { name: "レッスン", lucide: BookOpen, iconsax: IcBook },
      { name: "ガイド", lucide: Compass, iconsax: IcCompass },
      { name: "トレーニング", lucide: Play, iconsax: IcPlay },
      { name: "設定", lucide: Settings, iconsax: IcSettings },
      { name: "ログイン", lucide: LogIn, iconsax: IcLogin },
      { name: "ログアウト", lucide: LogOut, iconsax: IcLogout },
    ],
  },
  {
    label: "アクションアイコン",
    icons: [
      { name: "お気に入り", lucide: Star, iconsax: IcStar },
      { name: "いいね", lucide: Heart, iconsax: IcHeart },
      { name: "ブックマーク", lucide: Bookmark, iconsax: IcBookmark },
      { name: "シェア", lucide: Share2, iconsax: IcShare },
      { name: "検索", lucide: Search, iconsax: IcSearch },
      { name: "編集", lucide: Edit, iconsax: IcEdit },
      { name: "削除", lucide: Trash2, iconsax: IcTrash },
      { name: "コピー", lucide: Copy, iconsax: IcCopy },
    ],
  },
  {
    label: "ナビゲーション",
    icons: [
      { name: "ホーム", lucide: Home, iconsax: IcHome },
      { name: "メニュー", lucide: Menu, iconsax: IcMenu },
      { name: "閉じる", lucide: X, iconsax: IcX },
      { name: "ChevronRight", lucide: ChevronRight, iconsax: IcChevronRight },
      { name: "ArrowRight", lucide: ArrowRight, iconsax: IcArrowRight },
      { name: "外部リンク", lucide: ExternalLink, iconsax: IcExternalLink },
    ],
  },
  {
    label: "ステータス・フィードバック",
    icons: [
      { name: "チェック", lucide: Check, iconsax: IcCheck },
      { name: "成功", lucide: CheckCircle2, iconsax: IcCheckCircle },
      { name: "エラー", lucide: XCircle, iconsax: IcXCircle },
      { name: "警告", lucide: AlertTriangle, iconsax: IcAlertTriangle },
      { name: "危険", lucide: AlertCircle, iconsax: IcAlertCircle },
      { name: "情報", lucide: Info, iconsax: IcInfo },
      { name: "ヘルプ", lucide: HelpCircle, iconsax: IcHelpCircle },
    ],
  },
  {
    label: "その他",
    icons: [
      { name: "時計", lucide: Clock, iconsax: IcClock },
      { name: "カレンダー", lucide: Calendar, iconsax: IcCalendar },
      { name: "メール", lucide: Mail, iconsax: IcMail },
      { name: "ロック", lucide: Lock, iconsax: IcLock },
      { name: "アンロック", lucide: Unlock, iconsax: IcUnlock },
      { name: "通知", lucide: Bell, iconsax: IcBell },
      { name: "プラス", lucide: Plus, iconsax: IcPlus },
      { name: "マイナス", lucide: Minus, iconsax: IcMinus },
      { name: "目", lucide: Eye, iconsax: IcEye },
      { name: "ダウンロード", lucide: Download, iconsax: IcDownload },
      { name: "アップロード", lucide: Upload, iconsax: IcUpload },
      { name: "画像", lucide: Image, iconsax: IcImage },
      { name: "動画", lucide: Video, iconsax: IcVideo },
      { name: "ファイル", lucide: File, iconsax: IcFile },
      { name: "フォルダ", lucide: Folder, iconsax: IcFolder },
    ],
  },
];

type IconVariant = "Linear" | "Outline" | "Broken" | "Bold" | "Bulk" | "TwoTone";

const IconComparison = () => {
  const [size, setSize] = useState(20);
  const [strokeWidth, setStrokeWidth] = useState(1.5);
  const [iconsaxVariant, setIconsaxVariant] = useState<IconVariant>("Linear");
  const [bgColor, setBgColor] = useState("white");

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Icon Comparison: Lucide vs Iconsax
          </h1>
          <p className="text-gray-600">
            グローバルナビゲーションや各コンポーネントで使用するアイコンの比較
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">表示設定</h2>
          <div className="flex flex-wrap gap-6">
            {/* Size */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">サイズ:</label>
              <input
                type="range"
                min="14"
                max="32"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-gray-500 w-12">{size}px</span>
            </div>

            {/* Stroke Width (Lucide) */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">線の太さ (Lucide):</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.5"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-gray-500 w-8">{strokeWidth}</span>
            </div>

            {/* Iconsax Variant */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Iconsax スタイル:</label>
              <select
                value={iconsaxVariant}
                onChange={(e) => setIconsaxVariant(e.target.value as IconVariant)}
                className="border rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="Linear">Linear (線)</option>
                <option value="Outline">Outline</option>
                <option value="Bold">Bold (塗り)</option>
                <option value="Bulk">Bulk</option>
                <option value="TwoTone">Two Tone</option>
              </select>
            </div>

            {/* Background */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">背景:</label>
              <select
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="white">White</option>
                <option value="#F5F6FA">Light Gray</option>
                <option value="#1F2937">Dark</option>
              </select>
            </div>
          </div>
        </div>

        {/* Icon Groups */}
        {iconGroups.map((group) => (
          <div key={group.label} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{group.label}</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 p-4 border-b bg-gray-50 text-sm font-medium text-gray-600">
                <div>アイコン名</div>
                <div className="text-center">Lucide</div>
                <div className="text-center">Iconsax</div>
                <div className="text-center">プレビュー (実際の使用例)</div>
              </div>

              {/* Icon Rows */}
              {group.icons.map((icon) => {
                const LucideIcon = icon.lucide;
                const IconsaxIcon = icon.iconsax;

                return (
                  <div
                    key={icon.name}
                    className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0 items-center"
                  >
                    {/* Name */}
                    <div className="text-sm text-gray-700 font-medium">{icon.name}</div>

                    {/* Lucide */}
                    <div className="flex justify-center">
                      <div
                        className={cn(
                          "p-3 rounded-lg flex items-center justify-center",
                          bgColor === "#1F2937" ? "text-white" : "text-gray-700"
                        )}
                        style={{ backgroundColor: bgColor }}
                      >
                        <LucideIcon size={size} strokeWidth={strokeWidth} />
                      </div>
                    </div>

                    {/* Iconsax */}
                    <div className="flex justify-center">
                      <div
                        className={cn(
                          "p-3 rounded-lg flex items-center justify-center",
                          bgColor === "#1F2937" ? "text-white" : "text-gray-700"
                        )}
                        style={{ backgroundColor: bgColor }}
                      >
                        <IconsaxIcon size={size} variant={iconsaxVariant} />
                      </div>
                    </div>

                    {/* Preview - Sidebar style */}
                    <div className="flex justify-center gap-4">
                      {/* Lucide Preview */}
                      <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white shadow-sm">
                        <LucideIcon size={16} strokeWidth={strokeWidth} className="text-gray-500" />
                        <span className="text-xs text-gray-500 font-medium">{icon.name}</span>
                      </div>

                      {/* Iconsax Preview */}
                      <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white shadow-sm">
                        <IconsaxIcon size={16} variant={iconsaxVariant} className="text-gray-500" />
                        <span className="text-xs text-gray-500 font-medium">{icon.name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">比較まとめ</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-blue-600 mb-2">Lucide</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>- シンプルで統一感のあるデザイン</li>
                <li>- strokeWidth でカスタマイズ可能</li>
                <li>- 軽量（tree-shaking対応）</li>
                <li>- 既にプロジェクトで使用中</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-purple-600 mb-2">Iconsax</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>- 6種類のバリエーション（Linear, Bold, etc.）</li>
                <li>- よりモダンで立体的なデザイン</li>
                <li>- Figmaプラグインあり</li>
                <li>- 1,000+のアイコン</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconComparison;
