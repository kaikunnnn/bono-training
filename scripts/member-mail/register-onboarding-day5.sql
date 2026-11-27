-- =============================================================================
-- 327-E「続きをデザインしよう」（入会5日後の朝）の文面を会員メールに登録する
--
-- ★本番への登録はオーナーの判断で行う（このファイルはマイグレーションではない。supabase db push では当たらない）
-- 前提: supabase/migrations/20261125090715_member_mail_standing_campaigns.sql を当てたあと
--       （新しいマイグレーションは要らない。standing_key の値は ^[a-z][a-z0-9_]{0,39}$ を満たす）
--       アプリ側（STANDING_KEYS に onboarding_day5 がある版）を本番に出したあと
--
-- 対象（src/lib/member-mail/targets.ts の ONBOARDING_DAY5_TARGET が正）:
--   - 入会（今の Stripe 契約の最初の課金日）の5日後の朝。取りこぼし・その朝に条件に合った人は6日後の朝まで
--   - 入会してから1回は「学んだ」人のうち、日本時間の「今日の0時の3日前」から今までに学んでいない人
--   - まだ一度も学んでいない人は外す（2日後・9日後の案内で扱う）
--   - 配信停止・届かない・テスト用アカウント・14日で3通の上限は 327-D と同じ
--
-- このSQLがすること:
--   - 文面を1行入れる（kind=signup / standing_key=onboarding_day5）。すでにあれば何もしない
--   - scheduled_at（仕組みを有効にした時刻）は NULL のまま。NULL のあいだは誰にも何もしない
--   - 承認はしない（入れた時点では未承認。トリガーが承認を外す）
--
-- このあとの手順（本番に出すとき。1つずつ・前の段の合格条件を満たしてから次へ）:
--   ★注意: 327-D・E・F は同じ種類（signup）なので、種類のスイッチ（member_mail_kind_settings の signup）は3つで1つ。
--     327-D がすでに全員に送っている（signup = all）ときに signup を count / owner に下げると、
--     327-D の送信も止まる（2日後の朝の人が取りこぼしの3日後を過ぎると、その人には届かない）。
--     また signup = all のままだと、未承認のこの文面は「承認されていない」で止まり、人数も出ない（人数だけ出す段が無い）。
--     → 人数・見た目の確認は、327-D をまだ all にしていないうちにまとめて行うか、
--       327-D を止めてよい日（例: その週に入会2〜3日目の人がいない日）を選んで短く行う。どちらにするかはオーナーが決める
--   ※ 入会日は「今の Stripe 契約の最初の課金日」（public.subscriptions の min(start_timestamp)）。
--      user_subscriptions.created_at（アカウントを作った日）ではない
--
--   1. 文面を確かめて承認する
--        SELECT public.member_mail_approve_campaign(id, content_version)
--          FROM public.member_mail_campaigns WHERE standing_key = 'onboarding_day5';
--   2. テスト用アカウントの頭が入っているか確かめる（327-D で入れたもの。値はリポジトリに書かない）
--        SELECT cardinality(test_email_prefixes) FROM public.member_mail_settings WHERE id = 1;
--   3. 人数だけ出す（送らない。上の★を読んでから）。scheduled_at は過去にして、今日の対象がいる状態で数える
--        UPDATE public.member_mail_kind_settings SET mode = 'count' WHERE kind = 'signup';
--        UPDATE public.member_mail_campaigns SET scheduled_at = now() - interval '30 days' WHERE standing_key = 'onboarding_day5';
--      → 毎朝 8:00 JST に、その日の対象の人数が運用 Slack に出る（last_count にも残る）
--      ★合格条件（必須）: 同じ日の対象（最初の課金日がその日の5〜6日前の人）を手で数え、
--        candidates・will_send・excluded_not_learned・excluded_learned_recently が手で数えた人数と合うこと。
--        対象がいるのに excluded_not_learned と excluded_learned_recently がずっと0なら、学習の判定が効いていない疑いがあるので all に上げない
--   4. オーナーだけに送って見た目を確かめる
--        UPDATE public.member_mail_kind_settings SET mode = 'owner' WHERE kind = 'signup';
--      → member_mail_settings.owner_user_ids の人に、版ごとに1通
--      ★必ず見ること: 届いたメールの元のソース（ヘッダー全体）を開き、Resend のタグ（kind=signup など）や
--        種類・カテゴリの名前（signup / comeback / onboarding など）がヘッダー・URL に出ていないこと。出ていたら all に上げない
--   5. 全員に送る。scheduled_at を先に書き、スイッチと1つのトランザクションでまとめる
--      （scheduled_at を入れ直さずに all にすると、3. の過去の時刻より後に課金した5〜6日目の人に届く）
--        BEGIN;
--        UPDATE public.member_mail_campaigns SET scheduled_at = now() WHERE standing_key = 'onboarding_day5';
--        UPDATE public.member_mail_kind_settings SET mode = 'all' WHERE kind = 'signup';
--        COMMIT;
--   止めるとき（この文面だけ止めるなら scheduled_at を NULL にする。種類のスイッチを止めると 327-D・F も止まる）:
--        UPDATE public.member_mail_campaigns SET scheduled_at = NULL WHERE standing_key = 'onboarding_day5';
--        -- すぐに全部止めるなら: UPDATE public.member_mail_kind_settings SET mode = 'off' WHERE kind = 'signup';
-- =============================================================================

INSERT INTO public.member_mail_campaigns (kind, label, subject, preheader, body, standing_key, scheduled_at)
VALUES (
  'signup',
  '続きをデザインしよう（入会5日後の朝）',
  '今日、少しだけデザインしてみませんか',
  '5分でも大丈夫です。手を動かすと、次に学ぶことが見えてきます',
  $body$カイクンです。今日は、少しだけデザインの話をさせてください。

デザインは、見て覚えるより、手を動かした分だけ身につきます。うまく作れなくても大丈夫です。少し作ってみると「ここはどうするんだろう」が見えてきて、次に学ぶことがはっきりします。

## 今日は、ひとつだけ作ってみよう

たとえば、こんな小さなことからで十分です。

- レッスンで見た画面を、まねして作ってみる
- 作りかけのものを開いて、1か所だけ直してみる
- ふだん使っているアプリの画面を1つ選んで、なぜこの形なのかを考えてみる

時間は5分でも10分でもかまいません。下のリンクからマイページに移ると、レッスンの続きを開けます。

[マイページを開く](https://www.bo-no.design/mypage)

うまくできたかどうかより、作ってみたこと自体が次につながります。今日もたのしくデザインしていきましょう。

BONO　カイクン$body$,
  'onboarding_day5',
  NULL
)
ON CONFLICT DO NOTHING;
