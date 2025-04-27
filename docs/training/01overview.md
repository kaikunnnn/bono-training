```markdown
# プロダクト概要 ── BONO **Training** ページ群

## 1. 目的とポジショニング

- **目的**  
  UI/UX デザイン学習プラットフォーム **BONO** に、 “ハンズオン特化” の **筋トレ型トレーニング** コンテンツを提供する。

  - 小粒かつ実践的なチャレンジ（例: 「ToDo サービスを作ろう」）を繰り返し、**アウトプット量とフィードバック速度を最大化**
  - サイト外の SNS やポートフォリオで成果物を公開 → キャリア支援やコミュニティ活性へつなげる

- **バリュー差別化**  
  | 視点 | 既存 Courses / Series | 新 Training |
  | ---------------------- | --------------------- | ----------- |
  | 学習スタイル | “体系的ロードマップ” | “短期集中・実践演習” |
  | コンテンツ粒度 | 10–20 本 / Course | 1–3 本 / Challenge |
  | UI トーン & ブランディング | 落ち着いた教育サイト | 軽快・ゲーミフィケーション（例: レベルバッジ） |
  | ユースケース | 体系的に学びたい | 毎日 30 分のデザイン筋トレ |
  | KPI | Course 完走率, 課金率 | Challenge 完遂率, SNS 共有件数 |

## 2. 既存 BONO との関係性

- **ドメイン & URL**

  - 既存サイト: `https://bono.design`
  - Training: `https://bono.design/training/*` （同ドメイン配下・サブディレクトリ）

- **共有レイヤー**  
  | レイヤー | 共有方法 |
  | ------------------ | -------- |
  | **認証** | Supabase AuthContext を最上位で共通提供 |
  | **課金/プラン** | Stripe → Supabase `subscriptions` テーブル。`plan.training=true` で権限制御 |
  | **ユーザープロフィール** | `public.users` テーブルを共用（アバター, DisplayName） |
  | **Notification** | 共通 Slack / Mailgun キュー |

- **独立レイヤー**  
  | レイヤー | 実装方針 |
  | ----------------- | -------- |
  | **ルック & Feel** | `<TrainingLayout>` で Tailwind テーマを拡張 (`brand-orange`, `rounded-3xl`, `shadow-lg`) |
  | **ファイル構造** | `apps/training/*` をモノレポ分割、`remoteEntry.js` で遅延ロード |
  | **SEO メタ** | Training 専用 `title`, `description`, Open Graph 画像 |

## 3. スコープ／非スコープ

| 項目  | 含む (Scope)                                                                                   | 含まない (Out-of-Scope)        |
| ----- | ---------------------------------------------------------------------------------------------- | ------------------------------ |
| UI/UX | 新ブランドテーマ、独自ナビ、ゲーミフィケーションバッジ                                         | 既存サイト全体のリデザイン     |
| 機能  | Challenge 一覧・詳細、進捗スタンプ、SNS シェアボタン                                           | フォーラム、リアルタイムコラボ |
| 課金  | 既存サブスクプランと共通料金で開放 →members 権限を使用して有料トレーニングコンテンツの出しわけ | Training 専用課金プラン        |
| CMS   | Markdown ベース (`content/training/*`)                                                         | ヘッドレス CMS 導入            |

## 4. 成功指標 (Primary KPIs)

1. **Challenge 完遂率**: preview → 完走したユーザー割合 ≥ 60 %
2. **SNS シェア数**: `share_on_twitter` イベント / MAU ≥ 20 %
3. **Pro へのアップグレード率**: 無料 → Pro conversion ≥ 5 %（Training 流入経由）
```
