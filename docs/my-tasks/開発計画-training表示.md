実装計画：サブスクリプションサービス ナビゲーション仕様
Phase 1: ナビゲーション構成の更新
1.1 TrainingHeaderの更新

対象ファイル: src/components/training/TrainingHeader.tsx
変更内容:

「はじめる」ボタンの遷移先を /training/signup に変更
「プラン」ボタンを追加（遷移先: /training/plan）
未ログインユーザー向けボタン配置: [遊び方] [ログイン] [プラン] [はじめる]



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