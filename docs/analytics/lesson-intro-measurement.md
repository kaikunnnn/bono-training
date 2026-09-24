# レッスン紹介ページの計測（2026-09-24）

対象・通常ページに共通の controller を配置。GA4 `352670009 / G-T8RTCENVBF`、本番2ホストだけで動く。

- `lesson_intro_view`: 表示の分母。1ページ滞在・会員区分につき1回。ストリームの判定前はunknown、判定後はその区分の分母も送る。UUはAPIで期間・条件を指定して直接取得する。イベント回数はPVと呼ばない。
- `lesson_intro_click`: article_open / chapter_expand / chapter_collapse / slide_select / curriculum_jump / overview_jump / tab_select / navigation。初期自動展開・同じスライドの再選択をクリックとして送らない。
- `lesson_section_view`: 見出し/先頭・操作部品が画面内に入ったとき。同じ区分・部品で1回。クリックは露出の証拠として分母を補う。単なるスクロール90%と分ける。
- 共通: lesson_id（Sanity）、intro_version、member_status。追加: button_id（安定した部品ID）、intro_action、article_id、content_access、click_url（CMSのパスのみ）。個人情報や任意クエリは追加しない。
- ゲスト/無料/有料はページの購読判定時点。判定未到着はunknown。既存の購読判定関数の結果を利用し、新しい認証要求を増やさない。
- 計測イベントは紹介ページのpage_locationに固定。GAの初期化前の短いSPAクリックは最大10秒だけ待ち、元ページ/区分を保って送る。広告遮断等で計測できない人は含まれない。
- PVとエンゲージメント時間は既存のGA4自動計測を利用する。追加page_viewや合成の滞在時間は送らない。
- デザイン変更時は `INTRO_VERSIONS` を上げ、非公開analytics側の比較開始日/版履歴も更新する。複数版を1つの成績に合算しない。

GA4イベント分類は管理画面で登録済み（lesson_id, intro_version, member_status, intro_action, article_id, content_access）。button_id/click_urlは既存定義を利用。Data API metadataでも9定義を確認した。管理APIの有効化・権限拡張は行っていない。

## 評価→改善→再評価

1. 初版: ビルド、意味の違うイベント、PC/スマホ、ページ移動を検査。
2. 改善: GA初期化前の高速クリックを保持。カリキュラムのスケルトンでは到達を記録しない。通常CTAの有料記事を会員区分でopen/lockedに解決。サイトナビ移動を補助操作に分離。
3. 再評価: 追加イベントの単体試験、既存性能回帰、本番ビルド、実ブラウザでの通信・記事遷移・戻る・開発環境の除外を確認する。

試験アクセスのGA送信は遮断する。実ユーザーの集計反映（通常24〜48時間）、丸30日の結果評価は公開検証後の別の確認事項。非公開analyticsリポジトリの計画・評価記録に追跡する。
