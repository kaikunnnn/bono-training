# labs/ui-fundamentals — UI基礎ラボ

AIでUIの基礎知識（配色・余白・ナビゲーション・モーダル/モードなど）を調べてまとめ、記事やDailyUI教材を作る実験場。元は独立フォルダ `bono-fable` で、2026-10-16 にここへ移した。

## 構成

- `docs/` — 計画・台帳・リサーチ・評価ログ（非公開の作業場所）
  - `00-roadmap.md` フェーズ計画 / `10-ledger/` リファレンス台帳（出典ID付き）/ `50-knowledge/` 記事の計画と評価ログ
- `knowledge/` — 知識記事のプロトタイプ（静的HTML。`tokens.css` が唯一のトークン源、`checks/` で機械チェック）
- `prototype/` — ステップ型DailyUIトレーニングのプロトタイプ（静的HTML）

## ルール

- **bono-training 本体（`src/` など）には触らない。** このディレクトリ内で完結させる。
- **公開はまだしない。** `public/` に置かない。確認はローカルサーバー・`/dev`・Claude artifact で行う。
- **台帳が先、記事が後。** 主張はまず `docs/10-ledger/` に一次ソース（HIG / Material / GOV.UK / WCAG / NN/g など）付きで記録し、そのあとで記事に使う。バズ目的の記事は信頼度を下げる。
- **断定しない。** 事実と解釈を分け、反例があれば書く。
- **記事の各項目は「①具体的なHOW TO → ②理由・出典 → ③背景」の順に書く。**
- **数値（コントラスト・余白など）はスクリプトで計算する。** 目視で判断しない。

## 確認方法

```sh
cd labs/ui-fundamentals && python3 -m http.server 4650
# 記事:         http://localhost:4650/knowledge/
# DailyUI:      http://localhost:4650/prototype/
node knowledge/checks/run-all.mjs   # 機械チェック
```
