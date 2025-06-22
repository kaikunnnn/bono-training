# 実装計画

既存のコードを確認しました。my-tasksの開発計画に基づいて、エラーなく実装するための詳細な実装計画を立てます。

分析結果
現在の状況：

TrainingHeader: 現在「はじめる」ボタンが /training/plan になっている → /training/signup に変更が必要
App.tsx: /training/signup ルートが存在しない → 追加が必要
AuthContext: 既に実装済みで利用可能
Training/Login.tsx: 既存のタブ形式の実装あり → 参考にできる
Training/Plan.tsx: セッション管理機能が未実装 → 追加が必要
エラーなく実装するための詳細計画
Phase 1: プラン選択セッション管理ユーティリティ作成
ファイル: src/utils/planSession.ts

プラン情報構造: { planType: 'community', duration: 1 | 3, price: string, selectedAt: timestamp }
sessionStorage + cookie バックアップによる24時間保持
Base64エンコード実装
型安全性を保つためのインターフェース定義
Phase 2: TrainingHeader更新
ファイル: src/components/training/TrainingHeader.tsx

未ログインユーザー向けボタン配置変更
「はじめる」リンクを /training/plan → /training/signup に変更
「プラン」ボタンを追加（/training/planへのリンク）
Phase 3: ルーティング追加
ファイル: src/App.tsx

/training/signup ルートを追加
既存のルート構造を保持
Phase 4: TrainingSignup ページ作成
ファイル: src/pages/Training/Signup.tsx

既存の Login.tsx をベースにした独立ページ
プラン選択情報表示エリアの実装
セッションからプラン情報取得・表示
アカウント作成成功時の決済フロー連携
エラーハンドリング（既存のAuthContextパターンに従う）
Phase 5: Plan ページにセッション管理機能追加
ファイル: src/pages/Training/Plan.tsx

プラン選択時のセッション保存処理
未ログインユーザーの /training/signup リダイレクト
ログイン済みユーザーは既存の決済フロー維持
Phase 6: エラーハンドリング実装
セッション消失時の /training/plan リダイレクト
toast通知: "セッションが消失しました"
決済完了後の /training リダイレクト
実装順序とエラー回避のポイント
セッション管理から開始: 他のコンポーネントが依存するため最初に実装
型定義の一貫性: 既存の PlanType 型と整合性を保つ
既存AuthContextの活用: 新しい認証ロジックを作らず既存を利用
段階的テスト: 各Phase完了後に動作確認
リダイレクトロジック: 無限ループを避けるため条件分岐を慎重に実装
この計画により、既存機能を破壊せず、エラーなく段階的に実装できます。

# 実装計画：サブスクリプションサービス ナビゲーション仕様
Phase 1: ナビゲーション構成の更新
1.1 TrainingHeaderの更新

対象ファイル: src/components/training/TrainingHeader.tsx
変更内容:

「はじめる」ボタンの遷移先を /training/signup に変更
「プラン」ボタンを追加（遷移先: /training/plan）
未ログインユーザー向けボタン配置: 左＝[遊び方] [プラン]  右＝　[ログイン] [はじめる]



1.2 ルーティングの追加

対象ファイル: src/App.tsx
変更内容:

/training/signup ルートを追加



Phase 2: アカウント作成ページの作成
2.1 TrainingSignupページの作成

新規ファイル: src/pages/Training/Signup.tsx
機能:

/training/login と同様のデザイン
アカウント作成フォーム（メール、パスワード）
プラン選択情報の表示エリア
既存の AuthContext を利用した認証処理



2.2 プラン情報表示の実装

表示場所: "BONOトレーニングの全コンテンツ..." の直下
表示内容: 選択されたプラン名（例：「コミュニティプランで登録」）
データソース: URLパラメータまたはsessionStorage

Phase 3: プラン選択セッション管理
3.1 セッション管理ユーティリティの作成

新規ファイル: src/utils/planSession.ts
機能:

プラン情報の保存/取得（sessionStorage + cookie バックアップ）
24時間の保持期間管理
基本的な暗号化（Base64エンコード）



3.2 /training/planページの更新

対象ファイル: src/pages/Training/Plan.tsx
変更内容:

プラン選択時にセッション保存処理を追加
未ログインユーザーの場合 /training/signup にリダイレクト
ログイン済みユーザーは既存の決済フローを維持



Phase 4: アカウント作成後のフロー実装
4.1 アカウント作成完了処理

対象ファイル: src/pages/Training/Signup.tsx
機能:

アカウント作成成功時にセッションからプラン情報を取得
プラン情報がある場合: 既存の決済画面に遷移
プラン情報がない場合: マイページに遷移



4.2 決済画面への遷移処理

既存機能活用: src/services/stripe.ts の createCheckoutSession
連携方法: セッションから取得したプラン情報を使用

Phase 5: エラーハンドリングの実装
5.1 セッション情報消失時の処理

対象: アカウント作成完了後
動作:

プラン情報が見つからない場合 /training/plan にリダイレクト
既存のtoastシステムでメッセージ表示: "アカウント作成が完了しました。プランを選択してください"



5.2 アカウント作成エラー時の処理

動作:

エラーメッセージ表示（既存UIスタイル）
プラン情報は保持したまま再試行可能
"プランを変更する" リンクで /training/plan に戻る機能



開発順序

Phase 1 → TrainingHeaderの更新（基本ナビゲーション）
Phase 3 → セッション管理の実装（基盤機能）
Phase 2 → Signupページの作成
Phase 3.2 → Planページの更新（セッション連携）
Phase 4 → アカウント作成後フローの実装
Phase 5 → エラーハンドリングの追加

技術仕様

セッション管理: sessionStorage + cookie（24時間）
暗号化: Base64エンコード（シンプルな実装）
認証: 既存の AuthContext 活用
決済: 既存の Stripe 連携機能活用
エラー通知: 既存の toast システム活用