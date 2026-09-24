# 2026年9月のサイト移行後: /guide の重複とインデックス登録

## 対応方針

- 同じ本文を持つ `/guide/{slug}` と `/contents/{slug}` は `/guide` を検索上の正規 URL にする。
- `/contents` はレッスンの動画、進捗、前後移動に使うため残す。本文を照合できた6組のみ canonical を変更する。
- サイトマップには正規 URL の `/guide` のみ掲載し、該当する `/contents` は除外する。
- 重複する `/contents` の Article 構造化データは出さず、正規の `/guide` 側だけで出す。
- 既存の5件の `/contents` → `/guide` 恒久リダイレクトは維持する。本文が異なる同名ページは対象にしない。

対象6件: `portfolio-01`、`rdm-howtostart-roadmap`、`beginner-to-uiux-designer-examples`、`become-uiux-designer-beginner-guide`、`how-to-find-jobs-for-beginner-designers`、`uiux-interview-tips-and-checkpoints`。

## 移行直後の基準値

Search Console の `https://www.bo-no.design/` プロパティ。2026-09-24に確認した、集計反映済みデータ。

| 指標 | 移行前 9/8–14 | 移行後 9/15–21 |
| --- | ---: | ---: |
| Google検索クリック | 188 | 161 |
| 表示回数 | 6,244 | 4,581 |
| CTR | 3.0% | 3.5% |

サイトマップ `/sitemap.xml` は9/23に正常読み込み。9/21更新の「送信済みページ」レポートでは192件中162件登録、30件未登録。そのうち24件が「検出 - インデックス未登録」（未クロール）。確認できた `/guide` の例は次の4件。

- `/guide/beginner-to-uiux-designer-examples`
- `/guide/portfolio-01`
- `/guide/rdm-howtostart-roadmap`
- `/guide/uiux-interview-tips-and-checkpoints`

この4件は「検出 - インデックス未登録」の**例**であり、24件すべてが `/guide` という意味ではない。

## 次回以降の確認

最初の再確認を9/28に行い、その後はデプロイから約1週・2週・4週を目安に、Search Console のレポート更新日を添えて同じ条件で記録する。公開・デプロイ前後のデータを混同しない。

1. 「インデックス作成 → ページ」で**送信済みページ**に絞り、登録済み・未登録・「検出 - インデックス未登録」の件数を記録する。
2. 上記4件と今回の正規化対象の `/guide` 6件をURL検査し、「Google が選択した正規URL」「最終クロール日」「登録状態」を記録する。自サイト指定の canonical だけで成功と判定しない。
3. 「検索パフォーマンス」で各7日間を比較する。サイト全体に加え、ページを `/guide/` と `/contents/` で絞り、クリック・表示回数・CTRを記録する。旧URLから新URLへの表示移動も見る。
4. デプロイ後に、6件の `/contents` がHTTP 200を保ち、canonical が対応する `/guide`、`/guide` 側は自己 canonical、サイトマップに旧URLがないことを確認する。

| 確認日 | GSC更新日 | 送信済み | 登録済み | 未登録 | 検出・未クロール | /guideの登録状態・正規URL | 7日間クリック/表示回数 | メモ |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| 2026-09-24 | 2026-09-21 | 192 | 162 | 30 | 24 | 上記4件は未クロール | 161 / 4,581 (9/15–21) | 移行後の基準値。修正前 |

未クロール件数が残っても、公開から数週間は再クロール待ちの可能性がある。登録済み件数とGoogle選択の正規URLを合わせて判断する。
