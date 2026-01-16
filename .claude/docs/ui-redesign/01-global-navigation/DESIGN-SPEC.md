# グローバルナビゲーション - デザイン仕様

**ステータス**: ✅ 仕様確定・実装待ち
**優先度**: 1（最初に着手）

---

## 現状

### ファイル構成

```
src/components/layout/
├── Layout.tsx              # 全体レイアウト
├── Sidebar/
│   ├── index.tsx           # サイドバー本体
│   ├── SidebarLogo.tsx     # ロゴ
│   ├── SidebarSearch.tsx   # 検索フィールド
│   ├── SidebarMenuItem.tsx # メニュー項目
│   ├── SidebarMenuGroup.tsx# メニューグループ
│   ├── SidebarGroupLabel.tsx# グループラベル
│   └── icons.tsx           # アイコン定義
└── Footer.tsx
```

### 現在の構造

- **デスクトップ**: 左固定サイドバー（240px）
- **モバイル**: ハンバーガーメニュー → Sheet で開閉
- **メニュー項目**: マイページ、ロードマップ、レッスン、ガイド、トレーニング、設定、ログアウト

---

## やりたいこと（あなたが記入）

<!--
以下に自由に記入してください。
例：
- デザインの方向性
- 変更したい要素
- 追加したい機能
- 参考にしたいサイトやデザイン
- Figmaのスクリーンショットや説明
-->

### デザインの方向性

以下のようなコンポーネントと構成の新しいグローバルナビゲーションです。
既存のグローバルナビゲーションからスタイルを変更します。
以下がすべての仕様内容、です。

```# GlobalNavigation サイドナビゲーション設計仕様書

## サマリー
BONOのデスクトップ向けサイドナビゲーション。幅192px（w-48）、縦方向Flexレイアウト。

---

## 1. コンポーネント構造

```

GlobalNavigation (w-48)
├── LogoSection
│ └── Logo (現行サイトのグロナビと同じ SVG ロゴを使用)
├── NavSection (メインナビ)
│ ├── NavItem (ナビ項目) ← Active 状態
│ ├── NavItem (ロードマップ)
│ ├── NavItem (レッスン)
│ ├── NavItem (ガイド)
│ └── NavItem (トレーニング)
└── NavSection (その他)
├── SectionLabel (その他)
├── NavItem (設定)
└── NavItem (ログアウト)

````

---

## 2. コンポーネント分割

### 2.1 GlobalNavigation（親コンテナ）
```tsx
// 全体コンテナ
className="w-48 inline-flex flex-col justify-start items-start"

// 内部ラッパー
className="self-stretch h-96 flex flex-col justify-start items-start"
````

### 2.2 LogoSection

```tsx
className = "self-stretch pt-2 flex flex-col justify-start items-start";

// Logo内部
className =
  "self-stretch px-6 pt-7 pb-8 flex flex-col justify-start items-start";

// ※ロゴは現行サイトのグロナビと同じSVGを使用
```

### 2.3 NavSection（ナビセクション）

```tsx
// セクションコンテナ
className = "self-stretch flex flex-col justify-start items-start gap-4";

// NavItemリストラッパー
className = "self-stretch px-2 flex flex-col justify-start items-start";
```

### 2.4 NavItem（ナビ項目）⭐ 再利用コンポーネント

```tsx
// 3つの状態: Default / Hover / Active

interface NavItemProps {
  icon: ReactNode; // アイコン（SVG）
  label: string; // テキストラベル
  href: string; // リンク先
  isActive?: boolean; // Active状態
}
```

### 2.5 SectionLabel（セクションラベル）

```tsx
className =
  "self-stretch h-8 px-4 rounded-lg inline-flex justify-start items-center";

// テキスト
className = "text-black/70 text-xs font-medium font-['Inter'] leading-4";
```

---

## 3. NavItem 詳細仕様

### 3.1 共通スタイル

```tsx
// コンテナ
className =
  "self-stretch px-4 py-2.5 rounded-lg inline-flex justify-start items-center gap-1.5";

// アイコンラッパー
className =
  "w-4 h-4 inline-flex flex-col justify-center items-center overflow-hidden";

// テキストラッパー
className = "inline-flex flex-col justify-start items-start overflow-hidden";
```

### 3.2 状態別スタイル

| 状態        | 背景                 | Shadow                                    | フォント  | テキスト色              |
| ----------- | -------------------- | ----------------------------------------- | --------- | ----------------------- |
| **Default** | なし                 | なし                                      | Medium    | text-gray-500 (#666E7B) |
| **Hover**   | bg-white             | shadow-[0px_1px_1px_0px_rgba(0,0,0,0.04)] | Medium    | text-gray-500 (#666E7B) |
| **Active**  | bg-gray-100 (要確認) | なし                                      | ExtraBold | text-gray-800 (#2F3038) |

### 3.3 Default 状態

```tsx
<div className="self-stretch px-4 py-2.5 rounded-lg inline-flex justify-start items-center gap-1.5">
  <div className="w-4 h-4 inline-flex flex-col justify-center items-center overflow-hidden">
    {/* アイコン (SVG) */}
  </div>
  <div className="inline-flex flex-col justify-start items-start overflow-hidden">
    <div className="text-gray-500 text-xs font-medium font-['Mplus_1p'] leading-5">
      {label}
    </div>
  </div>
</div>
```

### 3.4 Hover 状態

```tsx
<div className="self-stretch px-4 py-2.5 rounded-lg inline-flex justify-start items-center gap-1.5 bg-white shadow-[0px_1px_1px_0px_rgba(0,0,0,0.04)]">
  {/* 内部は同じ、テキスト色も同じ */}
</div>
```

### 3.5 Active 状態

```tsx
<div className="self-stretch px-4 py-2.5 rounded-lg inline-flex justify-start items-center gap-1.5 bg-gray-100">
  <div className="w-4 h-4 inline-flex flex-col justify-center items-center overflow-hidden">
    {/* アイコン (SVG) - 色変更の可能性あり */}
  </div>
  <div className="inline-flex flex-col justify-start items-start overflow-hidden">
    <div className="text-gray-800 text-xs font-extrabold font-['Mplus_1p'] leading-5">
      {label}
    </div>
  </div>
</div>
```

---

## 4. SectionLabel 詳細仕様

```tsx
interface SectionLabelProps {
  label: string;
}

// 実装
<div className="self-stretch h-8 px-4 rounded-lg inline-flex justify-start items-center">
  <div className="text-black/70 text-xs font-medium font-['Inter'] leading-4">
    {label}
  </div>
</div>;
```

---

## 5. カラーパレット

| 用途                | Tailwind      | HEX             |
| ------------------- | ------------- | --------------- |
| テキスト（Default） | text-gray-500 | #666E7B         |
| テキスト（Active）  | text-gray-800 | #2F3038         |
| ラベル              | text-black/70 | rgba(0,0,0,0.7) |
| ロゴ                | bg-slate-900  | #151834         |
| Hover 背景          | bg-white      | #FFFFFF         |
| Active 背景         | bg-gray-100   | (要確認)        |

---

## 6. タイポグラフィ

| 要素              | フォント  | Weight          | サイズ | 行高 |
| ----------------- | --------- | --------------- | ------ | ---- |
| NavItem (Default) | M PLUS 1p | Medium (500)    | 12px   | 20px |
| NavItem (Active)  | M PLUS 1p | ExtraBold (800) | 12px   | 20px |
| SectionLabel      | Inter     | Medium (500)    | 12px   | 16px |

---

## 7. スペーシング

| 要素              | 値                        |
| ----------------- | ------------------------- |
| GlobalNav 幅      | 192px (w-48)              |
| Logo padding      | px-6 pt-7 pb-8            |
| NavSection gap    | 16px (gap-4)              |
| NavItem padding   | px-4 py-2.5 (16px / 10px) |
| NavItem gap       | 6px (gap-1.5)             |
| アイコンサイズ    | 16x16px (w-4 h-4)         |
| SectionLabel 高さ | 32px (h-8)                |

---

## 8. React 実装例

```tsx
// types.ts
interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

// GlobalNavigation.tsx
interface GlobalNavigationProps {
  sections: NavSection[];
  activeItemId?: string;
}

// 使用例
const navData: NavSection[] = [
  {
    items: [
      { id: "nav", label: "ナビ項目", icon: <NavIcon />, href: "/nav" },
      {
        id: "roadmap",
        label: "ロードマップ",
        icon: <MapIcon />,
        href: "/roadmap",
      },
      {
        id: "lesson",
        label: "レッスン",
        icon: <LessonIcon />,
        href: "/lesson",
      },
      { id: "guide", label: "ガイド", icon: <GuideIcon />, href: "/guide" },
      {
        id: "training",
        label: "トレーニング",
        icon: <TrainingIcon />,
        href: "/training",
      },
    ],
  },
  {
    label: "その他",
    items: [
      {
        id: "settings",
        label: "設定",
        icon: <SettingsIcon />,
        href: "/settings",
      },
      {
        id: "logout",
        label: "ログアウト",
        icon: <LogoutIcon />,
        href: "/logout",
      },
    ],
  },
];
```

---

## 9. アクセシビリティ

- `<nav>` タグでラップ
- `aria-label="メインナビゲーション"`
- アクティブ項目に `aria-current="page"`
- キーボード操作対応 (Tab, Enter)
- フォーカス時のアウトライン表示

---

## 10. 注意事項

1. **ロゴ**: 現行サイトのグロナビと同じ SVG ロゴを使用
2. **アイコン**: 実装時に SVG アイコンを props で渡す（絵文字は仮）
3. **Active 背景色**: Figma で正確な色を確認してください
4. **レスポンシブ**: NavItem の width は `self-stretch` でレスポンシブ対応```

### 変更したい要素

- ナビゲーションのスタイル
- 検索バー廃止（必要無い）
- 変更したくない：アルファ版の表記。ロゴの横にある
- ナビゲーションの並び順

### モバイル対応について

- これから考えたいです。
- 相談したい

### その他

---

## 実装チェック（Claude 記入欄）

### 実現可能性

✅ **実現可能** - 既存コンポーネントのスタイル変更で対応可能

### 確定仕様（ユーザー確認済み）

| 項目 | 値 |
|------|-----|
| ナビゲーション幅 | **200px** (w-[200px]) |
| フォント | **M PLUS Rounded 1c**（現在と同じ） |
| モバイル対応 | **現状維持**（別途相談） |
| ログイン切り替え | **現状と同じ挙動を維持** |
| 検索バー | **削除** |
| α版バッジ | **維持** |

### 変更が必要なファイル

| ファイル | 変更内容 |
|----------|----------|
| `src/components/layout/Layout.tsx` | `lg:ml-60` → `lg:ml-[200px]` |
| `src/components/layout/Sidebar/index.tsx` | 幅200px、検索バー削除、スタイル変更 |
| `src/components/layout/Sidebar/SidebarMenuItem.tsx` | NavItem 3状態スタイル（Default/Hover/Active） |
| `src/components/layout/Sidebar/SidebarMenuGroup.tsx` | セクションスタイル変更 |
| `src/components/layout/Sidebar/SidebarGroupLabel.tsx` | ラベルスタイル変更 |
| `src/components/layout/Sidebar/SidebarLogo.tsx` | ロゴpadding変更（px-6 pt-7 pb-8） |

### 削除するファイル

| ファイル | 理由 |
|----------|------|
| `src/components/layout/Sidebar/SidebarSearch.tsx` | 検索バー廃止 |

### 新規作成が必要なコンポーネント

なし（既存コンポーネントのスタイル変更で対応）

### 影響範囲

| 影響 | 詳細 |
|------|------|
| 低 | メインコンテンツ領域が40px広がる（240px→200px） |
| なし | モバイルは現状維持 |
| なし | ログイン/ログアウト機能は変更なし |

### 注意点・リスク

1. **低リスク**: 幅変更によりメインコンテンツ領域が広がるが、今後デザイン実装予定のため許容
2. **確認済み**: フォントは `M PLUS Rounded 1c` を継続使用（新規読み込み不要）

---

## タスクリスト（実装時に使用）

- [ ] Layout.tsx: メインコンテンツのmargin-leftを200pxに変更
- [ ] Sidebar/index.tsx: 幅200px、検索バー削除、構造整理
- [ ] SidebarLogo.tsx: padding変更（px-6 pt-7 pb-8）
- [ ] SidebarMenuItem.tsx: 3状態スタイル実装（Default/Hover/Active）
- [ ] SidebarMenuGroup.tsx: セクションスタイル変更
- [ ] SidebarGroupLabel.tsx: ラベルスタイル変更
- [ ] SidebarSearch.tsx: ファイル削除
- [ ] 動作確認: デスクトップ表示
- [ ] 動作確認: モバイル表示（現状維持確認）
- [ ] 動作確認: ログイン/ログアウト切り替え

---

## 更新履歴

| 日付       | 更新者 | 内容     |
| ---------- | ------ | -------- |
| 2026-01-14 | Claude | 仕様確定、実装チェック記入、タスクリスト作成 |
| 2026-01-13 | Claude | 初版作成 |
