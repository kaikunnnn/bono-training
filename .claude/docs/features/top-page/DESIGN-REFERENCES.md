# デザインリファレンス

**作成日**: 2025-02-25
**目的**: トップページ3パターンのスタイリング参考

---

## 1. リファレンスサイト一覧

### 学習プラットフォーム系

| サイト | 特徴 | URL |
|-------|------|-----|
| **Codecademy** | 紫ベース、大型CTA、4カラムグリッド | codecademy.com |
| **Skillshare** | クリエイティブ、コミュニティ感、短いレッスン | skillshare.com |
| **MasterClass** | シネマティック、フルスクリーン動画、プレミアム感 | masterclass.com |
| **Duolingo** | ゲーミフィケーション、明るいカラー | duolingo.com |

### SaaS / ツール系

| サイト | 特徴 | URL |
|-------|------|-----|
| **Linear** | ダークモード、グリッドアニメーション、ミニマル | linear.app |
| **Vercel** | 白黒コントラスト、青アクセント、クリーン | vercel.com |
| **Notion** | Bentoグリッド、カラフルカード、playful | notion.com |
| **Stripe** | グラデーション、統計表示、信頼感 | stripe.com |
| **Ramp** | ダーク、青アクセント、タイムライン表示 | ramp.com |

---

## 2. デザイン分析詳細

### Cash App（ネオン・大胆）⭐ メインリファレンス

```
カラーパレット:
- プライマリ: #00D533（Cash App Green / ネオンライムグリーン）
- ダーク: #000000（黒）
- ライト: #FFFFFF（白）
- 3色のみのミニマルパレット

タイポグラフィ:
- プライマリ: Cash Sans（カスタムフォント）
- セカンダリ: Agrandir Wide（プロモーション用）
- 太いウェイト、大きなサイズ

ボタン:
- 背景: #00D533（ネオングリーン）
- テキスト: #000000（黒）
- 角丸フィルドスタイル

セクション構成:
1. ヒーロー「The way money should work」+ 動画背景
2. 機能プロモ（左テキスト、右画像）
3. カード機能（アイコン + テキストリスト）
4. アクセス・借入セクション
5. 新機能セクション
6. 貯蓄・成長セクション
7. 送金セクション
8. セキュリティセクション
9. ソーシャルプルーフ（57M+ users、5★評価）
10. フッター

特徴的なUI:
- 黒→グリーンのグラデーション背景
- 左右交互レイアウト
- 大きな数字で信頼感（57 million+、$2 billion+）
- シンプルなアイコンリスト
- ゆったりした余白（呼吸感）
```

**参考リンク**:
- [Cash App Brand Guidelines](https://www.awwwards.com/sites/cash-app-brand-guidelines) - Awwwards SOTD
- [Cash App Design System](https://designsystems.surf/design-systems/cashapp) - UI Guidelines
- [Cash App Brand Colors](https://mobbin.com/colors/brand/cash-app) - HEX, RGB

---

### Linear（ダークモード・ミニマル）

```
カラー:
- 背景: ダークネイビー
- テキスト: 白/グレー階層
- アクセント: 緑、赤（状態表示）

タイポグラフィ:
- 階層的サイズシステム（title-1〜title-9）
- light, medium, semibold のウェイト
- モノスペースフォント統合

特徴的UI:
- グリッドアニメーション（5x5、ステップ型）
- 円形アバター
- 回転インジケーター
```

### Vercel（白黒・クリーン）

```
カラー:
- 背景: 白/黒のコントラスト
- アクセント: 青系
- ライト/ダークテーマ対応

レイアウト:
- Flexboxベース
- @container クエリ対応
- グローバルノード表示（地球儀）

特徴的UI:
- Deploy / Get a Demo のCTA
- 機能別セクション（Agents, AI Apps, Web Apps）
- ネストナビゲーション
```

### Notion（カラフル・Playful）

```
カラー:
- 白背景 + グレー
- 機能別カラー（青、赤、黄、青緑）

レイアウト:
- Bentoスタイルグリッド
- 水平スクロール
- マルチサイズカード（wide/standard）

特徴的UI:
- "One workspace. Zero busywork." 大型ヘッド
- キャロセル
- 企業ロゴセクション
- 動画埋め込み
```

### Stripe（グラデーション・信頼感）

```
カラー:
- ダークネイビー背景
- ティール/シアンのアクセント
- 白スペース活用

カード:
- 影による浮き上がり（borderなし）
- 角丸 8-12px
- ガラスモーフィズム

特徴的UI:
- アニメーション統計カウンター
- Bento Grid
- アイコンベースのフィーチャーカード
```

### Codecademy（学習特化）

```
カラー:
- プライマリ: #3A10E5（ハイパーパープル）
- アクセント: #FFD300（イエロー）
- 背景: ダークネイビー

タイポグラフィ:
- Apercu + Suisse Mono
- 見出し最大4rem
- font-weight: 700 強調

ボタン:
- 高さ56px大型CTA
- ホバーで色変化
- フォーカスリング

カード:
- 最小高さ250px
- 角丸16px
- border 1px
```

### Ramp（ダーク・信頼感）

```
カラー:
- ベース: #010518（濃紺）
- アクセント: #0066FF（青）
- CTA: 白背景

特徴的UI:
- "Time is money. Save both." 大型コピー
- 顧客ロゴの動的表示
- 5つ星レビュー（2,000+）
- タイムライン表示（Day 5, Day 30）
```

---

## 3. BONOへの適用案

### 案A: Cash App風（悩みグリッド型）

```
採用要素:
- ネオングリーン + 黒 + 白
- 大胆なコントラスト
- ゆったりした余白
- シンプルなカード
- 動画/アニメーション背景
```

### 案B: Notion風（悩みタブ型）

```
採用要素:
- 白背景 + 機能別カラー
- Bentoスタイルカード
- タブで切り替え
- playfulなアイコン
- 大型見出し
```

### 案C: Linear風（悩みフロー型）

```
採用要素:
- ダークモード
- ステップインジケーター
- ミニマルなUI
- グリッドアニメーション
- 階層的タイポグラフィ
```

---

## 4. デザイントレンド 2025

### 共通要素

1. **大型タイポグラフィ** - 4rem以上の見出し
2. **余白の活用** - 密集を避け、呼吸感
3. **カード中心レイアウト** - 角丸、影、ホバー
4. **アニメーション** - 控えめだが効果的
5. **ダーク/ライト対応** - テーマ切り替え

### カラートレンド

```
プライマリカラー候補:
- パープル系: #3A10E5（Codecademy）
- ブルー系: #0066FF（Ramp）
- ティール系: Stripe風
- グリーン系: 教育・成長感

アクセント:
- イエロー: #FFD300（活気）
- オレンジ: 行動促進
- グリーン: 成功・完了
```

### ボタンスタイル

```
プライマリCTA:
- 高さ: 48-56px
- パディング: 24-32px
- 角丸: 8-12px
- フォント: Bold / Semibold

セカンダリ:
- アウトライン or ゴースト
- ホバーで塗り
```

---

## 5. インスピレーションギャラリー

- [SaaS Landing Page](https://saaslandingpage.com/) - SaaS LPコレクション
- [Landingfolio](https://www.landingfolio.com/inspiration/landing-page/saas) - 341+ SaaS LP
- [Saaspo](https://saaspo.com/) - 1220+ SaaS LP
- [Dribbble Learning Platform](https://dribbble.com/tags/learning-platform) - 2500+ デザイン
- [Behance E-learning](https://www.behance.net/search/projects/e-learning%20platform%20ui) - UI/UXケーススタディ

---

## 6. 次のアクション

1. [ ] 3パターンそれぞれにスタイル方向性を決定
2. [ ] カラーパレットを定義
3. [ ] タイポグラフィスケールを定義
4. [ ] コンポーネントスタイルを実装
