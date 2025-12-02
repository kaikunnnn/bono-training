# サブスクリプション機能

**このフォルダには、サブスクリプション機能に関するすべての情報があります。**

**最終更新**: 2025-12-02

---

## 🎉 現在のステータス

### サブスクリプション再構築プロジェクト ✅ 完了

**期間**: 2025-11-30 〜 2025-12-02
**ステータス**: ✅ Phase 5 本番デプロイ完了

```
Phase 0: 緊急現状精査     ✅ 完了
Phase 1.5: 緊急修正       ✅ 完了
Phase 1: 動作テスト       ✅ 完了
Phase 2: 問題の修正       ✅ 完了
Phase 3: 全体動作確認     ✅ 完了
Phase 4: ドキュメント更新 ✅ 完了
Phase 5: 本番デプロイ     ✅ 完了
```

**主要ドキュメント**:
- 📋 **全体計画**: `redesign/MASTER-PLAN.md`
- 🔍 **環境問題対応**: `redesign/investigations/2025-12-02-environment-issues.md`
- 🧪 **本番検証計画**: `redesign/testing/2025-12-02-production-verification.md`

---

## 📂 フォルダ構成

### user-experience/ （UX定義）
**誰が使う**: Takumiさん（UX専門家）

**何を書く**:
- ✅ flows.md - ユーザーフロー
- ✅ requirements.md - 「こうあるべき」定義
- ✅ edge-cases.md - 想定外の操作
- ✅ issues.md - UX問題トラッカー
- ❌ 技術的な実装詳細は書かない

**目的**:
技術的な実装の前に「ユーザーにとってどうあるべきか」を定義する場所。

---

### implementation/ （技術実装）
**誰が使う**: Claude Code（開発者）

**何を書く**:
- ✅ plans/ - 実装計画（TEMPLATE.mdを使用）
- ✅ specifications/ - 技術仕様書
- ✅ decisions/ - 実装決定ログ

**目的**:
UX要件を満たすための技術的な実装方法を記録する場所。

---

### troubleshooting/ （エラー・問題対応）
**誰が使う**: 両方

**何を書く**:
- ✅ error-database.md - エラーデータベース
- ✅ solutions.md - 解決策ログ

**目的**:
発生したエラーと解決策を蓄積する場所。

---

## 🔄 使い方

### Takumiさんが新しいUX要件を追加したい時

1. `user-experience/flows.md` を開く
2. 新しいフローを追加
3. `user-experience/requirements.md` に要件を追加
4. Claude Codeに実装を依頼

---

### Claude Codeが実装を開始する時

**必須手順**:

1. **UX要件を読む**（絶対に飛ばさない）
   - [ ] `user-experience/flows.md` を確認
   - [ ] `user-experience/requirements.md` を確認
   - [ ] `user-experience/edge-cases.md` を確認

2. **実装計画を作成**
   - [ ] `implementation/plans/TEMPLATE.md` をコピー
   - [ ] UX要件を満たすための技術方針を記述

3. **実装**
   - [ ] 計画に従って実装
   - [ ] UX要件が満たされているか検証

4. **ドキュメント更新**
   - [ ] エラーが発生したら `troubleshooting/error-database.md` に記録
   - [ ] 重要な決定をしたら `implementation/decisions/decisions.md` に記録

---

## 🎯 このフォルダの目的

### 1. UXと技術の分離

**UX定義**（user-experience/）:
「ユーザーにとってどうあるべきか」

**技術実装**（implementation/）:
「それをどう実現するか」

この分離により：
- UX専門家が技術を気にせずUXを定義できる
- 開発者がUX要件を明確に理解して実装できる
- UXと技術の整合性を保てる

---

### 2. 機能の完全集約

サブスクリプション機能に関する**すべての情報**がこのフォルダにある：
- ユーザーフロー
- UX要件
- 実装計画
- 技術仕様
- エラー情報
- 実装決定の理由

---

## 📝 重要なルール

### Claude Code（開発者）へのルール

1. **実装前に必ずUX定義を読む**
   - user-experience/ の内容を確認せずに実装開始してはいけない

2. **UX要件が未定義の場合は質問する**
   - 不明な点があれば Takumiさんに確認

3. **実装計画を作成せずに実装開始してはいけない**
   - implementation/plans/TEMPLATE.md を必ず使用

---

### Takumiさん（UX専門家）へのルール

1. **技術的な実装詳細は書かない**
   - 「Stripeを使う」「データベースに保存する」などは書かない
   - 「決済完了後、即座に新プランが使える」など、UX要件を書く

2. **ユーザー視点で書く**
   - システム視点ではなく、ユーザー視点で記述

3. **「なぜそうあるべきか」を書く**
   - 単なる仕様ではなく、理由も記載

---

## 🚀 クイックスタート

### 新しい機能を追加したい時

1. Takumiさんが `user-experience/flows.md` に追加
2. Claude Codeが `implementation/plans/` に実装計画作成
3. 実装
4. テスト
5. 完了

---

### UX問題を報告したい時

1. `user-experience/issues.md` に追加
2. 深刻度を記載
3. Claude Codeが対応

---

**「ユーザーにとってどうあるべきか」を定義してから、「それをどう実現するか」を考える。**
**この順序を守ることで、ユーザー中心の開発が実現できます。**
