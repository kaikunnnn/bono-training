# 閲覧履歴機能

## ステータス: ✅ 実装完了

## 概要

ユーザーが閲覧した記事の履歴を自動記録し、マイページで確認できる機能。

## 設計方針

- **DB保存**: 最大50件（古いものは自動削除）
- **表示**: 最新20件（マイページ「すべて」タブでは4件）
- **重複**: 同じ記事は1件のみ（再閲覧時は日時更新）

## ドキュメント

| ファイル | 内容 | ステータス |
|---------|------|-----------|
| specification.md | 機能仕様・DB設計 | ✅ 完了 |

## 実装ファイル

| ファイル | 役割 |
|---------|------|
| `src/services/viewHistory.ts` | 履歴の記録・取得・削除サービス |
| `src/components/ui/history-list.tsx` | 履歴一覧UIコンポーネント |
| `src/pages/ArticleDetail.tsx` | 記事閲覧時に履歴記録 |
| `src/pages/MyPage.tsx` | 履歴一覧の表示 |

## 実装タスク

1. [x] DBマイグレーション作成・適用
2. [x] サービス層実装 (`src/services/viewHistory.ts`)
3. [x] 記事詳細ページに記録処理追加
4. [x] マイページに履歴一覧表示 (`src/components/ui/history-list.tsx`)
5. [x] デバッグ・バグ修正（cleanupOldHistory関数）
