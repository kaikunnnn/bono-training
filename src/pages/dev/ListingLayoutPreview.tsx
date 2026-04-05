/**
 * ListingHeaderLayout プレビューページ
 *
 * 各種 props（variant, navSpacing）の見え方を確認するためのページ
 */

import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import {
  ListingHeaderLayout,
  type ListingSpacing,
  type ListingVariant,
} from "@/components/layout/ListingHeaderLayout";
import PageHeader from "@/components/common/PageHeader";
import CategoryNav from "@/components/common/CategoryNav";
import SectionHeading from "@/components/common/SectionHeading";
import DottedDivider from "@/components/common/DottedDivider";

// ダミーのナビゲーションアイテム
const DUMMY_NAV_ITEMS = [
  { label: "すべて", href: "#" },
  { label: "カテゴリA", href: "#" },
  { label: "カテゴリB", href: "#" },
  { label: "カテゴリC", href: "#" },
];

// ダミーのカードコンポーネント
const DummyCard = ({ index }: { index: number }) => (
  <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 h-40 flex items-center justify-center">
    <span className="text-gray-500 font-medium">Card {index + 1}</span>
  </div>
);

// プレビューセクション
const PreviewSection = ({
  variant,
  headerNavSpacing,
  navSpacing,
  label,
}: {
  variant: ListingVariant;
  headerNavSpacing: ListingSpacing;
  navSpacing: ListingSpacing;
  label: string;
}) => (
  <div className="border-2 border-dashed border-blue-300 rounded-lg overflow-hidden">
    {/* ラベル */}
    <div className="bg-blue-100 px-4 py-2 text-sm font-mono text-blue-700">
      {label} — variant="{variant}" headerNavSpacing="{headerNavSpacing}" navSpacing="{navSpacing}"
    </div>

    <ListingHeaderLayout
      variant={variant}
      headerNavSpacing={headerNavSpacing}
      navSpacing={navSpacing}
      header={
        <PageHeader
          label="Preview"
          title="Listing Layout"
          description="これはプレビュー用のダミー説明文です。余白の確認にご利用ください。"
        />
      }
      nav={<CategoryNav items={DUMMY_NAV_ITEMS} align="center" />}
    >
      {/* セクション1 */}
      <section className="flex flex-col gap-8">
        <SectionHeading
          title="セクション1"
          description="カテゴリナビからの余白を確認"
          descriptionStyle="badge"
          showUnderline={false}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <DummyCard key={i} index={i} />
          ))}
        </div>
      </section>

      <DottedDivider className="my-12" />

      {/* セクション2 */}
      <section className="flex flex-col gap-8">
        <SectionHeading
          title="セクション2"
          description="セクション間の余白を確認"
          descriptionStyle="badge"
          showUnderline={false}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[3, 4, 5].map((i) => (
            <DummyCard key={i} index={i} />
          ))}
        </div>
      </section>
    </ListingHeaderLayout>
  </div>
);

export default function ListingLayoutPreview() {
  const [selectedVariant, setSelectedVariant] = useState<ListingVariant>("narrow");
  const [selectedHeaderNavSpacing, setSelectedHeaderNavSpacing] = useState<ListingSpacing>("normal");
  const [selectedNavSpacing, setSelectedNavSpacing] = useState<ListingSpacing>("normal");

  const variants: ListingVariant[] = ["narrow", "wide"];
  const spacings: ListingSpacing[] = ["tight", "normal", "relaxed"];

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">ListingHeaderLayout Preview</h1>
        <p className="text-gray-600 mb-8">
          各種 props の組み合わせによる見え方を確認できます。
        </p>

        {/* コントロールパネル */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Props Controls</h2>
          <div className="flex flex-wrap gap-6">
            {/* Variant選択 */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                variant
              </label>
              <div className="flex gap-2">
                {variants.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      selectedVariant === v
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* HeaderNavSpacing選択 */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                headerNavSpacing
              </label>
              <div className="flex gap-2">
                {spacings.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedHeaderNavSpacing(s)}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      selectedHeaderNavSpacing === s
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* NavSpacing選択 */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                navSpacing
              </label>
              <div className="flex gap-2">
                {spacings.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedNavSpacing(s)}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      selectedNavSpacing === s
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 選択されたプレビュー */}
        <div className="mb-12">
          <h2 className="text-lg font-bold mb-4">Current Selection</h2>
          <PreviewSection
            variant={selectedVariant}
            headerNavSpacing={selectedHeaderNavSpacing}
            navSpacing={selectedNavSpacing}
            label="Selected"
          />
        </div>

        {/* バランスの取れた余白パターン */}
        <div className="mb-12">
          <h2 className="text-lg font-bold mb-4">
            推奨: バランスの取れた余白パターン
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            カテゴリタブとタイトルブロックの間の余白バランスを考慮したパターン
          </p>
          <div className="space-y-8">
            {/* パターン1: 均等 */}
            <PreviewSection
              variant="narrow"
              headerNavSpacing="normal"
              navSpacing="normal"
              label="パターン1: 均等 (両方normal)"
            />

            {/* パターン2: ヘッダーとナビをグループ化 */}
            <PreviewSection
              variant="narrow"
              headerNavSpacing="tight"
              navSpacing="normal"
              label="パターン2: ヘッダーとナビをグループ化 (tight + normal)"
            />

            {/* パターン3: ナビとコンテンツをグループ化 */}
            <PreviewSection
              variant="narrow"
              headerNavSpacing="normal"
              navSpacing="tight"
              label="パターン3: ナビとコンテンツをグループ化 (normal + tight)"
            />

            {/* パターン4: ゆったり */}
            <PreviewSection
              variant="narrow"
              headerNavSpacing="relaxed"
              navSpacing="relaxed"
              label="パターン4: ゆったり (両方relaxed)"
            />
          </div>
        </div>

        {/* 全パターン比較 */}
        <div>
          <h2 className="text-lg font-bold mb-4">全パターン比較表</h2>
          <div className="space-y-8">
            {spacings.map((headerSpacing) =>
              spacings.map((navSpacing) => (
                <PreviewSection
                  key={`${headerSpacing}-${navSpacing}`}
                  variant="narrow"
                  headerNavSpacing={headerSpacing}
                  navSpacing={navSpacing}
                  label={`headerNavSpacing="${headerSpacing}" + navSpacing="${navSpacing}"`}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
