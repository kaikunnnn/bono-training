import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DescriptionBadge from "@/components/common/DescriptionBadge";
import SectionHeading from "@/components/common/SectionHeading";
import CategoryNav from "@/components/common/CategoryNav";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

/**
 * 背景色トークン プレビューページ
 *
 * 確認用: http://localhost:5173/dev/bg-token
 */

// Figma定義の背景色トークン（2026-03-19更新）
const BG_TOKENS = {
  // 基本レイヤー
  base: { value: "#F9F9F7", dark: "#0a0a0a", label: "bg-base", tailwind: "bg-base", usage: "ページ全体の背景" },
  surface: { value: "#FFFFFF", dark: "#1a1a1a", label: "bg-surface", tailwind: "bg-surface", usage: "カード・パネルの背景" },
  surfaceRaised: { value: "#FFFFFF", dark: "#252525", label: "bg-surface-raised", tailwind: "bg-surface-raised", usage: "モーダル・ドロップダウン" },
  overlay: { value: "rgba(5,16,12,0.72)", dark: "rgba(0,0,0,0.7)", label: "bg-overlay", tailwind: "bg-overlay", usage: "オーバーレイ背景" },

  // インタラクティブ
  muted: { value: "#F2F3F0", dark: "#2a2a2a", label: "bg-muted", tailwind: "bg-muted", usage: "バッジ・タグ・控えめな背景" },
  mutedStrong: { value: "#E9EAE6", dark: "#3a3a3a", label: "bg-muted-strong", tailwind: "bg-muted-strong", usage: "DescriptionBadge等の濃い背景" },
  hover: { value: "#F2F3F0", dark: "#2a2a2a", label: "bg-hover", tailwind: "bg-hover", usage: "ホバー状態" },
  active: { value: "#E0E1DC", dark: "#333333", label: "bg-active", tailwind: "bg-active", usage: "アクティブ・選択状態" },
  disabled: { value: "#F9FAFB", dark: "#1f1f1f", label: "bg-disabled", tailwind: "bg-disabled", usage: "無効状態" },

  // セマンティック（Tailwindクラスは -feedback サフィックス）
  success: { value: "rgba(138,204,161,0.12)", dark: "#052e16", label: "bg-success", tailwind: "bg-success-feedback", usage: "成功メッセージ" },
  warning: { value: "rgba(255,183,33,0.12)", dark: "#422006", label: "bg-warning", tailwind: "bg-warning-feedback", usage: "警告メッセージ" },
  error: { value: "#FDEFF2", dark: "#450a0a", label: "bg-error", tailwind: "bg-error-feedback", usage: "エラーメッセージ" },
  info: { value: "#FFFFFF", dark: "#1e3a5f", label: "bg-info", tailwind: "bg-info-feedback", usage: "情報メッセージ（ボーダー付き）" },
};

const NAV_ITEMS = [
  { label: "すべて", href: "/dev/bg-token" },
  { label: "カテゴリ1", href: "/dev/bg-token/cat1", count: 3 },
  { label: "カテゴリ2", href: "/dev/bg-token/cat2", count: 5 },
];

export default function BgTokenPreview() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16 h-fit">
        <div>
          <h1 className="text-3xl font-bold mb-2">Background Token Preview</h1>
          <p className="text-gray-600">
            背景色トークンの提案値と使用UIの一覧
          </p>
        </div>

        {/* ========== 基本レイヤー ========== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold border-b pb-2">1. 基本レイヤー</h2>

          {/* bg-base */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded border shadow-sm"
                style={{ backgroundColor: BG_TOKENS.base.value }}
              />
              <div>
                <p className="font-mono font-bold">{BG_TOKENS.base.label}</p>
                <p className="text-sm text-gray-500">{BG_TOKENS.base.value} → {BG_TOKENS.base.usage}</p>
              </div>
            </div>
            <div
              className="p-6 rounded-lg border"
              style={{ backgroundColor: BG_TOKENS.base.value }}
            >
              <p className="text-sm text-gray-500 mb-2">使用例: ページ背景</p>
              <div className="bg-white p-4 rounded shadow-sm">
                <p>この外側が <code>bg-base</code></p>
              </div>
            </div>
          </div>

          {/* bg-surface */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded border shadow-sm"
                style={{ backgroundColor: BG_TOKENS.surface.value }}
              />
              <div>
                <p className="font-mono font-bold">{BG_TOKENS.surface.label}</p>
                <p className="text-sm text-gray-500">{BG_TOKENS.surface.value} → {BG_TOKENS.surface.usage}</p>
              </div>
            </div>
            <div className="p-6 rounded-lg" style={{ backgroundColor: BG_TOKENS.base.value }}>
              <p className="text-sm text-gray-500 mb-2">使用例: カード</p>
              <div className="grid grid-cols-2 gap-4">
                <Card style={{ backgroundColor: BG_TOKENS.surface.value }}>
                  <CardHeader>
                    <CardTitle className="text-base">カード1</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">bg-surface適用</p>
                  </CardContent>
                </Card>
                <Card style={{ backgroundColor: BG_TOKENS.surface.value }}>
                  <CardHeader>
                    <CardTitle className="text-base">カード2</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">bg-surface適用</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* bg-surface-raised */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded border shadow-lg"
                style={{ backgroundColor: BG_TOKENS.surfaceRaised.value }}
              />
              <div>
                <p className="font-mono font-bold">{BG_TOKENS.surfaceRaised.label}</p>
                <p className="text-sm text-gray-500">{BG_TOKENS.surfaceRaised.value} → {BG_TOKENS.surfaceRaised.usage}</p>
              </div>
            </div>
            <div className="p-6 rounded-lg relative" style={{ backgroundColor: BG_TOKENS.base.value }}>
              <p className="text-sm text-gray-500 mb-2">使用例: モーダル・ドロップダウン</p>
              <div
                className="p-6 rounded-lg shadow-xl border max-w-sm mx-auto"
                style={{ backgroundColor: BG_TOKENS.surfaceRaised.value }}
              >
                <p className="font-bold mb-2">モーダル例</p>
                <p className="text-sm text-gray-600 mb-4">このダイアログはbg-surface-raisedを使用</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">キャンセル</Button>
                  <Button size="sm">確認</Button>
                </div>
              </div>
            </div>
          </div>

          {/* bg-overlay */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded border"
                style={{ backgroundColor: BG_TOKENS.overlay.value }}
              />
              <div>
                <p className="font-mono font-bold">{BG_TOKENS.overlay.label}</p>
                <p className="text-sm text-gray-500">{BG_TOKENS.overlay.value} → {BG_TOKENS.overlay.usage}</p>
              </div>
            </div>
            <div className="p-6 rounded-lg border bg-gray-100 relative h-40 flex items-center justify-center">
              <p className="z-10 text-white font-bold">背景コンテンツ</p>
              <div
                className="absolute inset-0 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: BG_TOKENS.overlay.value }}
              >
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <p className="text-sm">オーバーレイの上のモーダル</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== インタラクティブ ========== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold border-b pb-2">2. インタラクティブ</h2>

          {/* bg-muted / bg-muted-strong */}
          <div className="space-y-3">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded border"
                  style={{ backgroundColor: BG_TOKENS.muted.value }}
                />
                <div>
                  <p className="font-mono font-bold">{BG_TOKENS.muted.label}</p>
                  <p className="text-sm text-gray-500">{BG_TOKENS.muted.value}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded border"
                  style={{ backgroundColor: BG_TOKENS.mutedStrong.value }}
                />
                <div>
                  <p className="font-mono font-bold">{BG_TOKENS.mutedStrong.label}</p>
                  <p className="text-sm text-gray-500">{BG_TOKENS.mutedStrong.value}</p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-lg border bg-white space-y-4">
              <p className="text-sm text-gray-500">使用例: バッジ・タグ・入力背景</p>

              {/* 現在のDescriptionBadge */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-400">DescriptionBadge（現在bg-gray-100）</p>
                <DescriptionBadge emoji="🚀">
                  未経験からデザイナーへ、キャリアアップを目指したい方向けの地図
                </DescriptionBadge>
              </div>

              {/* bg-mutedを適用した場合 */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-400">bg-muted適用（薄い方: <code className="text-blue-600">bg-muted</code>）</p>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-muted">
                  <span className="text-sm text-text-secondary">bg-mutedを適用したバッジ</span>
                  <span>🚀</span>
                </div>
              </div>

              {/* bg-muted-strongを適用した場合 */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-400">bg-muted-strong適用（濃い方: <code className="text-blue-600">bg-muted-strong</code>）※DescriptionBadge用</p>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-muted-strong">
                  <span className="text-sm text-text-secondary">bg-muted-strongを適用したバッジ</span>
                  <span>🚀</span>
                </div>
              </div>

              {/* タグ */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-400">タグ（bg-muted使用）</p>
                <div className="flex gap-2">
                  <span
                    className="px-2 py-1 rounded text-sm"
                    style={{ backgroundColor: BG_TOKENS.muted.value }}
                  >UIデザイン</span>
                  <span
                    className="px-2 py-1 rounded text-sm"
                    style={{ backgroundColor: BG_TOKENS.muted.value }}
                  >初心者向け</span>
                  <span
                    className="px-2 py-1 rounded text-sm"
                    style={{ backgroundColor: BG_TOKENS.muted.value }}
                  >Figma</span>
                </div>
              </div>
            </div>
          </div>

          {/* bg-hover / bg-active */}
          <div className="space-y-3">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded border"
                  style={{ backgroundColor: BG_TOKENS.hover.value }}
                />
                <div>
                  <p className="font-mono font-bold">{BG_TOKENS.hover.label}</p>
                  <p className="text-sm text-gray-500">{BG_TOKENS.hover.value}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded border"
                  style={{ backgroundColor: BG_TOKENS.active.value }}
                />
                <div>
                  <p className="font-mono font-bold">{BG_TOKENS.active.label}</p>
                  <p className="text-sm text-gray-500">{BG_TOKENS.active.value}</p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-lg border bg-white space-y-4">
              <p className="text-sm text-gray-500">使用例: ナビゲーション・リスト項目</p>

              {/* CategoryNav */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-400">CategoryNav（ホバー/アクティブ状態）</p>
                <CategoryNav items={NAV_ITEMS} />
              </div>

              {/* リスト */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-400">リスト項目</p>
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-3 border-b">通常状態</div>
                  <div
                    className="p-3 border-b"
                    style={{ backgroundColor: BG_TOKENS.hover.value }}
                  >ホバー状態 (bg-hover)</div>
                  <div
                    className="p-3"
                    style={{ backgroundColor: BG_TOKENS.active.value }}
                  >選択状態 (bg-active)</div>
                </div>
              </div>
            </div>
          </div>

          {/* bg-disabled */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded border"
                style={{ backgroundColor: BG_TOKENS.disabled.value }}
              />
              <div>
                <p className="font-mono font-bold">{BG_TOKENS.disabled.label}</p>
                <p className="text-sm text-gray-500">{BG_TOKENS.disabled.value} → {BG_TOKENS.disabled.usage}</p>
              </div>
            </div>
            <div className="p-6 rounded-lg border bg-white space-y-4">
              <p className="text-sm text-gray-500">使用例: 無効なボタン・入力</p>
              <div className="flex gap-4 items-center">
                <Button disabled>無効なボタン</Button>
                <Input disabled placeholder="無効な入力欄" className="max-w-xs" />
              </div>
            </div>
          </div>
        </section>

        {/* ========== セマンティック ========== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold border-b pb-2">3. セマンティック（フィードバック）</h2>

          <div className="grid grid-cols-2 gap-6">
            {/* Success */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded border"
                  style={{ backgroundColor: BG_TOKENS.success.value }}
                />
                <div>
                  <p className="font-mono font-bold">{BG_TOKENS.success.label}</p>
                  <p className="text-sm text-gray-500">{BG_TOKENS.success.value}</p>
                </div>
              </div>
              <div
                className="p-4 rounded-lg border flex items-start gap-3"
                style={{ backgroundColor: BG_TOKENS.success.value }}
              >
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">保存しました</p>
                  <p className="text-sm text-green-700">変更が正常に保存されました。</p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded border"
                  style={{ backgroundColor: BG_TOKENS.warning.value }}
                />
                <div>
                  <p className="font-mono font-bold">{BG_TOKENS.warning.label}</p>
                  <p className="text-sm text-gray-500">{BG_TOKENS.warning.value}</p>
                </div>
              </div>
              <div
                className="p-4 rounded-lg border flex items-start gap-3"
                style={{ backgroundColor: BG_TOKENS.warning.value }}
              >
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">注意</p>
                  <p className="text-sm text-yellow-700">入力内容を確認してください。</p>
                </div>
              </div>
            </div>

            {/* Error */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded border"
                  style={{ backgroundColor: BG_TOKENS.error.value }}
                />
                <div>
                  <p className="font-mono font-bold">{BG_TOKENS.error.label}</p>
                  <p className="text-sm text-gray-500">{BG_TOKENS.error.value}</p>
                </div>
              </div>
              <div
                className="p-4 rounded-lg border flex items-start gap-3"
                style={{ backgroundColor: BG_TOKENS.error.value }}
              >
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">エラー</p>
                  <p className="text-sm text-red-700">処理に失敗しました。</p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded border-2 border-blue-200"
                  style={{ backgroundColor: BG_TOKENS.info.value }}
                />
                <div>
                  <p className="font-mono font-bold">{BG_TOKENS.info.label}</p>
                  <p className="text-sm text-gray-500">{BG_TOKENS.info.value}（ボーダー付き）</p>
                </div>
              </div>
              <div
                className="p-4 rounded-lg border-2 border-blue-200 flex items-start gap-3"
                style={{ backgroundColor: BG_TOKENS.info.value }}
              >
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">お知らせ</p>
                  <p className="text-sm text-blue-700">新機能が追加されました。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== ダークモード比較 ========== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold border-b pb-2">4. ダークモード比較</h2>
          <p className="text-sm text-gray-500">左: ライトモード / 右: ダークモード（将来対応時のイメージ）</p>

          <div className="grid grid-cols-2 gap-4">
            {/* ライトモード */}
            <div
              className="p-6 rounded-lg"
              style={{ backgroundColor: BG_TOKENS.base.value }}
            >
              <p className="text-xs text-gray-400 mb-4">ライトモード</p>
              <div
                className="p-4 rounded-lg shadow-sm mb-4"
                style={{ backgroundColor: BG_TOKENS.surface.value }}
              >
                <p className="font-bold mb-2" style={{ color: "#021710" }}>カードタイトル</p>
                <p className="text-sm" style={{ color: "#354540" }}>説明テキスト</p>
                <div
                  className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1"
                  style={{ backgroundColor: BG_TOKENS.muted.value }}
                >
                  <span className="text-sm" style={{ color: "#354540" }}>バッジ</span>
                </div>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: BG_TOKENS.success.value }}
              >
                <p className="text-sm text-green-800">成功メッセージ</p>
              </div>
            </div>

            {/* ダークモード */}
            <div
              className="p-6 rounded-lg"
              style={{ backgroundColor: BG_TOKENS.base.dark }}
            >
              <p className="text-xs text-gray-500 mb-4">ダークモード</p>
              <div
                className="p-4 rounded-lg shadow-sm mb-4"
                style={{ backgroundColor: BG_TOKENS.surface.dark }}
              >
                <p className="font-bold mb-2 text-white">カードタイトル</p>
                <p className="text-sm text-gray-300">説明テキスト</p>
                <div
                  className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1"
                  style={{ backgroundColor: BG_TOKENS.muted.dark }}
                >
                  <span className="text-sm text-gray-300">バッジ</span>
                </div>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: BG_TOKENS.success.dark }}
              >
                <p className="text-sm text-green-300">成功メッセージ</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== トークン一覧 ========== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold border-b pb-2">5. トークン一覧</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">CSS変数</th>
                  <th className="text-left py-2">Tailwindクラス</th>
                  <th className="text-left py-2">ライト</th>
                  <th className="text-left py-2">ダーク</th>
                  <th className="text-left py-2">用途</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(BG_TOKENS).map(([key, token]) => (
                  <tr key={key} className="border-b">
                    <td className="py-2 font-mono text-xs">--{token.label.replace('bg-', 'bg-')}</td>
                    <td className="py-2 font-mono text-xs text-blue-600">{token.tailwind}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: token.value }}
                        />
                        <span className="text-xs text-gray-500">{token.value}</span>
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: token.dark }}
                        />
                        <span className="text-xs text-gray-500">{token.dark}</span>
                      </div>
                    </td>
                    <td className="py-2 text-gray-600">{token.usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}
