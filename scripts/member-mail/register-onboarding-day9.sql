-- =============================================================================
-- 327-F「30分相談の案内」（入会9日後の朝）の文面を会員メールに登録する
--
-- ★本番への登録はオーナーの判断で行う（このファイルはマイグレーションではない。supabase db push では当たらない）
-- 前提: supabase/migrations/20261125090715_member_mail_standing_campaigns.sql を当てたあと
--       （新しいマイグレーションは要らない。standing_key の値は ^[a-z][a-z0-9_]{0,39}$ を満たす）
--       アプリ側（STANDING_KEYS に onboarding_day9 がある版）を本番に出したあと
--
-- 対象（src/lib/member-mail/targets.ts の ONBOARDING_DAY9_TARGET が正）:
--   - 入会（今の Stripe 契約の最初の課金日）の9日後の朝。取りこぼし・その朝に条件に合った人は11日後の朝まで
--   - 入会7日目の0時（日本時間）から今までに「学んだ」が無い人。最初の1週間に学んだかは見ない
--   - 配信停止・届かない・テスト用アカウント・14日で3通の上限は 327-D と同じ
--   - イベントの案内は入れない（毎回の承認が要るため）
--
-- このSQLがすること:
--   - 文面を1行入れる（kind=signup / standing_key=onboarding_day9）。すでにあれば何もしない
--   - scheduled_at（仕組みを有効にした時刻）は NULL のまま。NULL のあいだは誰にも何もしない
--   - 承認はしない（入れた時点では未承認。トリガーが承認を外す）
--
-- このあとの手順（本番に出すとき。1つずつ・前の段の合格条件を満たしてから次へ）:
--   ★注意: 327-D・E・F は同じ種類（signup）なので、種類のスイッチ（member_mail_kind_settings の signup）は3つで1つ。
--     327-D・E がすでに全員に送っている（signup = all）ときに signup を count / owner に下げると、
--     327-D・E の送信も止まる（送る日の範囲を過ぎた人には、その文面は届かない）。
--     また signup = all のままだと、未承認のこの文面は「承認されていない」で止まり、人数も出ない（人数だけ出す段が無い）。
--     → 人数・見た目の確認は、327-D・E をまだ all にしていないうちにまとめて行うか、
--       止めてよい日を選んで短く行う。どちらにするかはオーナーが決める
--   ※ 入会日は「今の Stripe 契約の最初の課金日」（public.subscriptions の min(start_timestamp)）。
--      user_subscriptions.created_at（アカウントを作った日）ではない
--
--   1. 文面を確かめて承認する
--        SELECT public.member_mail_approve_campaign(id, content_version)
--          FROM public.member_mail_campaigns WHERE standing_key = 'onboarding_day9';
--   2. テスト用アカウントの頭が入っているか確かめる（327-D で入れたもの。値はリポジトリに書かない）
--        SELECT cardinality(test_email_prefixes) FROM public.member_mail_settings WHERE id = 1;
--   3. 人数だけ出す（送らない。上の★を読んでから）。scheduled_at は過去にして、今日の対象がいる状態で数える
--        UPDATE public.member_mail_kind_settings SET mode = 'count' WHERE kind = 'signup';
--        UPDATE public.member_mail_campaigns SET scheduled_at = now() - interval '30 days' WHERE standing_key = 'onboarding_day9';
--      → 毎朝 8:00 JST に、その日の対象の人数が運用 Slack に出る（last_count にも残る）
--      ★合格条件（必須）: 同じ日の対象（最初の課金日がその日の9〜11日前の人）を手で数え、
--        candidates・will_send・excluded_learned が手で数えた人数と合うこと。
--        とくに excluded_learned（入会7日目以降に学んだので外した人）が手の数と合うこと。
--        対象がいるのに excluded_learned がずっと0なら「学んだ」の判定が効いていない疑いがあるので、all に上げない
--   4. オーナーだけに送って見た目を確かめる
--        UPDATE public.member_mail_kind_settings SET mode = 'owner' WHERE kind = 'signup';
--      → member_mail_settings.owner_user_ids の人に、版ごとに1通
--      ★必ず見ること: 届いたメールの元のソース（ヘッダー全体）を開き、Resend のタグ（kind=signup など）や
--        種類・カテゴリの名前（signup / comeback / onboarding など）がヘッダー・URL に出ていないこと。出ていたら all に上げない
--   5. 全員に送る。scheduled_at を先に書き、スイッチと1つのトランザクションでまとめる
--      （scheduled_at を入れ直さずに all にすると、3. の過去の時刻より後に課金した9〜11日目の人に届く）
--        BEGIN;
--        UPDATE public.member_mail_campaigns SET scheduled_at = now() WHERE standing_key = 'onboarding_day9';
--        UPDATE public.member_mail_kind_settings SET mode = 'all' WHERE kind = 'signup';
--        COMMIT;
--   止めるとき（この文面だけ止めるなら scheduled_at を NULL にする。種類のスイッチを止めると 327-D・E も止まる）:
--        UPDATE public.member_mail_campaigns SET scheduled_at = NULL WHERE standing_key = 'onboarding_day9';
--        -- すぐに全部止めるなら: UPDATE public.member_mail_kind_settings SET mode = 'off' WHERE kind = 'signup';
-- =============================================================================

INSERT INTO public.member_mail_campaigns (kind, label, subject, preheader, body, standing_key, scheduled_at)
VALUES (
  'signup',
  '30分相談の案内（入会9日後の朝）',
  '何を作るか、30分で一緒に決めませんか',
  'オンラインで30分、無料で相談できます。会員どうしのSlackもあります',
  $body$カイクンです。

デザインの勉強は「何を作るか」が決まると、ぐっと進めやすくなります。作るものが決まれば、どのレッスンから見ればいいかも自然に決まってきます。

## 30分、一緒に考えましょう

オンラインで30分、わたしと話しながら、これから作るものや進め方を一緒に決められます。たとえば、こんなことを話せます。

- 「今の自分に合う、最初に作るものは何がいい？」
- 「仕事と並べて、1週間にどのくらい進めればいい？」
- 「作りかけのものを見てほしい。どこから直せばいい？」

無料です。話したいことがまとまっていなくても大丈夫です。下のリンクから予約サイト（Cal.com）に移り、空いている日時を選ぶだけです。

[30分の相談を予約する](https://cal.com/takumikai/30min)

## 会員どうしのコミュニティもあります

Slack（チャットのアプリ）で、ほかの会員が作ったものや、質問のやりとりを見られます。のぞくだけでも大丈夫です。

[コミュニティの参加方法を見る](https://www.bo-no.design/how-to/community)

話してみたくなったら、いつでもどうぞ。

BONO　カイクン$body$,
  'onboarding_day9',
  NULL
)
ON CONFLICT DO NOTHING;
