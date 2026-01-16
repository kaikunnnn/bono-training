# 未完了コンポーネント 現状まとめ

**最終更新**: 2025-01-15

---

## 概要

記事詳細ページで、Figmaデザインへの調整が未完了のコンポーネント一覧。
現在の実装は動作するが、デザイン仕様との差異がある可能性。

---

## 1. TodoSection

**ファイル**: `src/components/article/TodoSection.tsx`
**用途**: 「身につけること」リスト表示

### 現状の実装

```tsx
interface TodoSectionProps {
  items?: string[];
}
```

**機能**:
- `learningObjectives`がある場合のみ表示（条件付きレンダリング）
- カード形式で項目をリスト表示

**現在のスタイル**:
| 要素 | 現在値 |
|------|--------|
| カード | `bg-white rounded-xl` + `boxShadow: 1px 1px 4px rgba(0,0,0,0.08)` |
| ヘッダー | `bg-[#F5F5F5]` + `borderRadius: 10px 10px 0 0` |
| タイトル | `text-xs font-bold text-[#656668]` Noto Sans JP |
| マーカー | 6x6px 円 `rgba(23, 23, 23, 0.64)` |
| 項目テキスト | `text-sm font-bold text-[#171717]` Noto Sans JP |

### 確認事項
- [ ] Figmaとスタイル比較
- [ ] 他ブロック（HeadingSection等）との統一性確認

---

## 2. TableOfContents

**ファイル**: `src/components/article/TableOfContents.tsx`
**用途**: 記事内の見出しから自動生成する目次

### 現状の実装

```tsx
interface TableOfContentsProps {
  content: PortableTextBlock[];
  title?: string;  // デフォルト: '目次'
}
```

**機能**:
- H2, H3, H4 を自動抽出
- アンカーリンクでページ内ナビゲーション
- 階層インデント（H2: 0, H3: ml-4, H4: ml-8）

**現在のスタイル**:
| 要素 | 現在値 |
|------|--------|
| コンテナ | `bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]` |
| タイトル | `text-[16px] md:text-[18px] font-semibold text-[#101828]` M PLUS Rounded 1c |
| リンク | `text-[14px] md:text-[16px] text-[#3B82F6]` Noto Sans JP |

### 確認事項
- [ ] 現在ArticleDetailで使用されているか確認
- [ ] Figmaにデザイン仕様があるか確認
- [ ] 他ブロックとのスタイル統一（白背景 + shadow）

---

## 3. MobileMenuButton

**ファイル**: `src/components/article/MobileMenuButton.tsx`
**用途**: スマホ表示時のハンバーガーメニューボタン

### 現状の実装

```tsx
interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}
```

**機能**:
- Menu/X アイコン切り替え（lucide-react）
- 「一覧」テキスト表示
- `md:hidden` で PC では非表示（ArticleDetail.tsx側で制御）

**現在のスタイル**:
| 要素 | 現在値 |
|------|--------|
| ボタン | `bg-white border border-gray-200 rounded-lg shadow-sm` |
| アイコン | `w-5 h-5 text-gray-600` |
| テキスト | `text-sm font-medium text-gray-700` |

### 確認事項
- [ ] Figmaにデザイン仕様があるか確認
- [ ] 位置・z-index の調整が必要か

---

## 次のアクション

1. Figmaデザインを確認し、各コンポーネントの仕様を取得
2. 他の完了済みブロック（HeadingSection, RichTextSection等）とのスタイル統一
3. 必要に応じて調整実装

---

## 関連ファイル

- 進捗管理: `README.md`
- Figma仕様: `FIGMA-SPEC.md`
- 完了コンポーネント: `components/sidebar/SIDEBAR-SPEC.md`
