import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * カラートークン シミュレーションページ
 *
 * 確認用: http://localhost:5173/dev/color-token
 */

// 現状の色（shadcn標準）
const CURRENT_COLORS = {
  foreground: "#0a0a0f",
  mutedForeground: "#6b7280",
};

// 新しい色（Figma定義）
const NEW_COLORS = {
  textPrimary: "#021710",
  textSecondary: "#354540",
  textMuted: "#677470",
  textDisabled: "#9AA29F",
  textLink: "#0829BF",
  textLinkHover: "#3306E8",
  textSuccess: "#047A53",
  textWarning: "#9E6608",
  textError: "#C42626",
};

export default function ColorTokenPreview() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Color Token Preview</h1>
          <p className="text-gray-600">
            新旧カラートークンの比較シミュレーション（左: 現状 / 右: 新定義）
          </p>
        </div>

        {/* シミュレーション1: shadcnコンポーネント */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">
            1. shadcn/uiコンポーネントへの影響
          </h2>
          <p className="text-sm text-gray-500">
            Button、Input、Labelなどのテキスト色がどう変わるか
          </p>

          <div className="grid grid-cols-2 gap-8">
            {/* 現状 */}
            <div className="p-6 border rounded-lg bg-white">
              <h3 className="text-sm font-medium text-gray-500 mb-4">現状（shadcn標準）</h3>
              <div className="space-y-4">
                <div>
                  <Label style={{ color: CURRENT_COLORS.foreground }}>ラベル</Label>
                  <Input placeholder="入力してください" className="mt-1" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <span style={{ color: CURRENT_COLORS.foreground }}>ボタン</span>
                  </Button>
                  <Button variant="ghost">
                    <span style={{ color: CURRENT_COLORS.foreground }}>Ghost</span>
                  </Button>
                </div>
                <p style={{ color: CURRENT_COLORS.mutedForeground }} className="text-sm">
                  補助テキスト（muted-foreground）
                </p>
              </div>
            </div>

            {/* 新定義 */}
            <div className="p-6 border rounded-lg bg-white">
              <h3 className="text-sm font-medium text-gray-500 mb-4">新定義（Figma）</h3>
              <div className="space-y-4">
                <div>
                  <Label style={{ color: NEW_COLORS.textPrimary }}>ラベル</Label>
                  <Input placeholder="入力してください" className="mt-1" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <span style={{ color: NEW_COLORS.textPrimary }}>ボタン</span>
                  </Button>
                  <Button variant="ghost">
                    <span style={{ color: NEW_COLORS.textPrimary }}>Ghost</span>
                  </Button>
                </div>
                <p style={{ color: NEW_COLORS.textMuted }} className="text-sm">
                  補助テキスト（text-muted）
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* シミュレーション2: セマンティックカラーとの相性 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">
            2. セマンティックカラーとの相性
          </h2>
          <p className="text-sm text-gray-500">
            成功・警告・エラーメッセージが本文テキストと区別できるか
          </p>

          <div className="grid grid-cols-2 gap-8">
            {/* 現状 */}
            <div className="p-6 border rounded-lg bg-white">
              <h3 className="text-sm font-medium text-gray-500 mb-4">現状（ニュートラルグレー）</h3>
              <div className="space-y-3">
                <p style={{ color: CURRENT_COLORS.foreground }}>
                  これは通常の本文テキストです。
                </p>
                <p style={{ color: CURRENT_COLORS.mutedForeground }}>
                  これは補助テキストです。
                </p>
                <div className="border-t pt-3 mt-3 space-y-2">
                  <p style={{ color: NEW_COLORS.textSuccess }}>
                    ✓ 成功: 保存が完了しました
                  </p>
                  <p style={{ color: NEW_COLORS.textWarning }}>
                    ⚠ 警告: 入力内容を確認してください
                  </p>
                  <p style={{ color: NEW_COLORS.textError }}>
                    ✕ エラー: 処理に失敗しました
                  </p>
                </div>
              </div>
            </div>

            {/* 新定義 */}
            <div className="p-6 border rounded-lg bg-white">
              <h3 className="text-sm font-medium text-gray-500 mb-4">新定義（グリーン系グレー）</h3>
              <div className="space-y-3">
                <p style={{ color: NEW_COLORS.textPrimary }}>
                  これは通常の本文テキストです。
                </p>
                <p style={{ color: NEW_COLORS.textMuted }}>
                  これは補助テキストです。
                </p>
                <div className="border-t pt-3 mt-3 space-y-2">
                  <p style={{ color: NEW_COLORS.textSuccess }}>
                    ✓ 成功: 保存が完了しました
                  </p>
                  <p style={{ color: NEW_COLORS.textWarning }}>
                    ⚠ 警告: 入力内容を確認してください
                  </p>
                  <p style={{ color: NEW_COLORS.textError }}>
                    ✕ エラー: 処理に失敗しました
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* シミュレーション3: PageHeaderでの見え方 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">
            3. PageHeaderでの見え方
          </h2>

          <div className="grid grid-cols-2 gap-8">
            {/* 現状 */}
            <div className="p-6 border rounded-lg bg-[#f9f9f7]">
              <h3 className="text-sm font-medium text-gray-500 mb-4">現状</h3>
              <div className="text-center">
                <span
                  className="text-sm mb-1 block"
                  style={{ color: CURRENT_COLORS.mutedForeground }}
                >
                  変化への地図
                </span>
                <h1
                  className="text-[28px] font-bold font-rounded-mplus mb-2"
                  style={{ color: CURRENT_COLORS.foreground }}
                >
                  ロードマップ
                </h1>
                <p
                  className="text-[15px]"
                  style={{ color: CURRENT_COLORS.mutedForeground }}
                >
                  目標に合ったロードマップを選んで、デザインの探求をはじめよう！
                </p>
              </div>
            </div>

            {/* 新定義 */}
            <div className="p-6 border rounded-lg bg-[#f9f9f7]">
              <h3 className="text-sm font-medium text-gray-500 mb-4">新定義</h3>
              <div className="text-center">
                <span
                  className="text-sm mb-1 block"
                  style={{ color: NEW_COLORS.textMuted }}
                >
                  変化への地図
                </span>
                <h1
                  className="text-[28px] font-bold font-rounded-mplus mb-2"
                  style={{ color: NEW_COLORS.textPrimary }}
                >
                  ロードマップ
                </h1>
                <p
                  className="text-[15px]"
                  style={{ color: NEW_COLORS.textSecondary }}
                >
                  目標に合ったロードマップを選んで、デザインの探求をはじめよう！
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* カラーパレット一覧 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">
            カラーパレット一覧
          </h2>

          <div className="grid grid-cols-2 gap-8">
            {/* 現状 */}
            <div className="p-6 border rounded-lg bg-white">
              <h3 className="text-sm font-medium text-gray-500 mb-4">現状（shadcn標準）</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: CURRENT_COLORS.foreground }}
                  />
                  <span className="text-sm">foreground: {CURRENT_COLORS.foreground}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: CURRENT_COLORS.mutedForeground }}
                  />
                  <span className="text-sm">muted-foreground: {CURRENT_COLORS.mutedForeground}</span>
                </div>
              </div>
            </div>

            {/* 新定義 */}
            <div className="p-6 border rounded-lg bg-white">
              <h3 className="text-sm font-medium text-gray-500 mb-4">新定義（Figma）</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: NEW_COLORS.textPrimary }}
                  />
                  <span className="text-sm">text-primary: {NEW_COLORS.textPrimary}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: NEW_COLORS.textSecondary }}
                  />
                  <span className="text-sm">text-secondary: {NEW_COLORS.textSecondary}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: NEW_COLORS.textMuted }}
                  />
                  <span className="text-sm">text-muted: {NEW_COLORS.textMuted}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: NEW_COLORS.textDisabled }}
                  />
                  <span className="text-sm">text-disabled: {NEW_COLORS.textDisabled}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
