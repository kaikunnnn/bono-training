
# 統合開発計画 - Training コンテンツ管理・表示システム

**（統合 Phase 3 & Phase 4 - Supabase Storage 一元化版）**

## ✅ 実装完了 - 全システム稼働中

---

## 📑 統合プラン概要

**キー方針**
1. **ローカル Markdown 執筆は従来どおり** - 開発体験を維持 ✅
2. **git push すると GitHub Actions がバケットへ自動同期** - ヒューマンエラー防止 ✅
3. **フロント／Edge Function は常に Storage だけを見る** - 分岐ゼロ、テスト・本番で経路が変わらない ✅

**変更背景（旧案 → 新案）**

| 旧案 | 新案（採用） | 理由 | 状況 |
|------|-------------|------|------|
| 無料: ローカル読込<br>有料: Storage | 無料も有料も Storage | コード分岐をなくしバグ要因を削減。CI が「同期 → ビルド」で一貫。 | ✅ 完了 |
| 手動アップロード or 部分同期 | GitHub Actions で全 Markdown をワンクリック同期 | 執筆フローは git push だけ。ヒューマンエラー防止。 | ✅ 完了 |
| Edge Function が複雑（分岐＋正規化） | 単一 API・単一パスですべて取得 | テスト・監視・キャッシュ戦略をシンプルに。 | ✅ 完了 |

---

## ✅ Phase 3 – プラン判定ロジック完成（完了）

### ゴール ✅
- ✅ free/standard/growth/community の各プランを正しく判定
- ✅ 「hasMemberAccess」「hasLearningAccess」などのメソッド名で必要な Boolean フラグを返す
- ✅ Guard コンポーネントが「Member 権限」ベースで正しく制御できる

### 実装タスク ✅

| #   | 作業 | 主要ファイル | 完了状況 |
|-----|------|-------------|----------|
| 3-1 | subscriptionPlans.ts 仕上げ<br>`learning: ['standard','growth']`<br>`member: ['standard','growth','community']` | `src/utils/subscriptionPlans.ts` | ✅ 完了 |
| 3-2 | useSubscription.ts リファクタ<br>返却値：`hasMemberAccess` / `hasLearningAccess` | `src/hooks/useSubscription.ts` | ✅ 完了 |
| 3-3 | Guard 置換<br>`planMembers` → `hasMemberAccess` | `TrainingGuard.tsx` など | ✅ 完了 |
| 3-4 | Edge Function check-subscription ミニマム化<br>`{ subscribed, planType }` のみ返す | `supabase/functions/check-subscription/...` | ✅ 完了 |

### テストゲート（Phase 3 完了チェック） ✅

1. **✅ プラン定義の検証**
   - ✅ `?plan=free` → hasMemberAccess: false
   - ✅ `?plan=standard` → hasMemberAccess: true  
   - ✅ `?plan=growth` → hasMemberAccess: true
   - ✅ `?plan=community` → hasMemberAccess: true

2. **✅ 権限判定フックの動作確認**
   - ✅ `useSubscriptionContext()` で正しい Boolean 値が返る

3. **✅ Guard コンポーネントの動作確認**
   - ✅ 無料ユーザーが有料コンテンツにアクセス → 適切にブロック
   - ✅ 有料ユーザーが有料コンテンツにアクセス → 正常表示

4. **✅ 全体ビルド確認**
   - ✅ `pnpm typecheck && pnpm test && pnpm build` 成功

---

## ✅ Phase 4 – コンテンツ同期 & PREMIUM 出し分け（完了）

### ゴール ✅
- ✅ すべての Markdown（無料・有料）を Supabase Storage に同期
- ✅ `<!-- PREMIUM_ONLY -->` マーカーでコンテンツを出し分け
- ✅ 無料ユーザーと有料ユーザーで適切な表示制御

### フェーズ別実装状況

| フェーズ | 目的 | 実装状況 |
|---------|------|----------|
| 4-1 | Storage 自動同期セットアップ | ✅ 完了 |
| 4-2 | get-training-content Edge Function | ✅ 完了 |
| 4-3 | サービス層 & 型統一 | ✅ 完了 |
| 4-4 | MdxPreview + TaskHeader 出し分け | ✅ 完了 |
| 4-5 | クリーンアップ & 総合テスト | ✅ 完了 |

---

### ✅ Phase 4-1: Storage 自動同期セットアップ（完了）

#### ✅ 1. バケット作成
- ✅ プライベートバケット `training-content` 作成済み

#### ✅ 2. RLS ポリシー設定
- ✅ 匿名ユーザーの無料ファイル読み込み権限設定済み
- ✅ 認証ユーザーの全ファイル読み込み権限設定済み

#### ✅ 3. GitHub Actions 設定
- ✅ `.github/workflows/sync-training-content.yml` 設定済み
- ✅ content/training/ の変更時に自動同期実行

---

### ✅ Phase 4-2: Edge Function 実装（完了）

#### ✅ get-training-content Edge Function
- ✅ `supabase/functions/get-training-content/index.ts` 実装完了
- ✅ Storage からファイル取得
- ✅ Front-matter パース（強化版）
- ✅ アクセス権判定（JWT + サブスクリプション確認）
- ✅ コンテンツ分割（`<!-- PREMIUM_ONLY -->` マーカー対応）
- ✅ エラーハンドリング強化

---

### ✅ Phase 4-3: フロントエンド統合（完了）

#### ✅ サービス層統一
- ✅ `src/services/training/task-detail.ts` 実装完了
- ✅ `src/services/training/error-handlers.ts` エラーハンドリング強化

#### ✅ 型定義統一
- ✅ `src/types/training.ts` で統一された型定義

#### ✅ 後方互換性維持
- ✅ 既存機能を破綻させることなく新システムに移行完了

---

### ✅ Phase 4-4: 表示コンポーネント調整（完了）

#### ✅ MarkdownRenderer 更新
- ✅ `src/components/training/MarkdownRenderer.tsx` 強化完了
- ✅ プレミアムコンテンツ分割処理実装
- ✅ `PremiumBanner` 表示制御

#### ✅ コンテンツ分割ライブラリ
- ✅ `src/lib/content-splitter.ts` 実装完了
- ✅ 安全なコンテンツ分割処理とエラーハンドリング

---

### ✅ Phase 4-5: クリーンアップ & 総合テスト（完了）

#### ✅ 1. GitHub Actions 同期テスト
- ✅ 新しい Markdown ファイル追加テスト完了
- ✅ バケット同期動作確認済み

#### ✅ 2. ブラウザテスト（プラン別）
- ✅ **free**: バナー表示＆preview 動画表示確認
- ✅ **community**: 全文表示、preview 動画表示確認  
- ✅ **standard/growth**: 全文表示、full 動画表示確認

#### ✅ 3. ビルドテスト
- ✅ `pnpm typecheck && pnpm build && pnpm preview` エラー0件確認

#### ✅ 4. 不要コード削除
- ✅ ローカルファイル読み込み関数の整理完了
- ✅ 分岐処理のクリーンアップ完了
- ✅ 未使用import整理完了

---

## 🎯 最終成果物（実装完了）

### ✅ 1. ファイル構造
```
content/training/           # ローカル執筆環境（従来通り）
├── todo-app/
│   ├── index.md           # Training 概要
│   └── tasks/
│       ├── introduction/
│       │   └── content.md  # 無料タスク ✅
│       └── ui-layout-basic01/
│           └── content.md  # 有料タスク（<!-- PREMIUM_ONLY -->マーカー付き） ✅

# GitHub Actions で自動同期済み ✅

Supabase Storage training-content/ # 本番配信環境 ✅
├── training/
│   └── todo-app/          # 同じ構造で同期済み ✅
```

### ✅ 2. データフロー（稼働中）
```
ローカル執筆 → git push → GitHub Actions → Supabase Storage ✅
                                              ↓
ユーザーアクセス → Edge Function → 権限チェック → コンテンツ分割 → フロントエンド表示 ✅
```

### ✅ 3. セキュリティ（実装済み）
- ✅ **Storage**: プライベートバケット + RLS
- ✅ **Edge Function**: JWT 検証 + サブスクリプション確認
- ✅ **フロント**: クライアント側バリデーション

---

## 🚀 運用フロー（稼働中）

### ✅ 日常運用
1. **✅ 新コンテンツ作成**: ローカルで Markdown 執筆
2. **✅ デプロイ**: `git push` のみ（Actions が自動同期）
3. **✅ 確認**: ブラウザでプレビュー、権限テスト自動実行
4. **✅ 公開**: 自動的に本番反映

### ✅ 運用ルール
- ✅ **無料コンテンツ**: `is_premium: false` に `<!-- PREMIUM_ONLY -->` マーカーは使用しない
- ✅ **有料コンテンツ**: `is_premium: true` で適切にマーカーを配置
- ✅ **プラン権限**: members権限（standard/growth/community）でアクセス制御

---

## 🎉 プロジェクト完了！

**実装期間**: Phase 3 & 4 統合実装  
**システム状態**: ✅ **全機能稼働中**  
**テスト状況**: ✅ **全項目パス**  
**デプロイ状況**: ✅ **本番環境稼働**

### 達成した目標
- ✅ **ローカル Markdown 執筆の快適さ** と **本番での安全なプレミアム出し分け** の両立
- ✅ GitHub Actions による完全自動化されたコンテンツ同期
- ✅ 統一されたEdge Function APIによるシンプルなアーキテクチャ
- ✅ 堅牢なエラーハンドリングとセキュリティ実装
- ✅ プラン別アクセス制御の完全実装

**このシステムにより、BONOのTrainingコンテンツ管理・表示システムが完成し、安定稼働中です。** 🎊
