-- =============================================================================
-- 327-D「はじめの案内」（入会2日後の朝）の文面を会員メールに登録する
--
-- ★本番への登録はオーナーの判断で行う（このファイルはマイグレーションではない。supabase db push では当たらない）
-- 前提: supabase/migrations/20261125090715_member_mail_standing_campaigns.sql を当てたあと
--       20261127010837_member_mail_standing_mode.sql を当てたあと（文面ごとのスイッチ standing_mode）
--       20261127084404_member_mail_consult_bookings.sql を当てたあと（30分相談を予約した人を外す。当てる前は書き出さない・送らない）
--
-- このSQLがすること:
--   - 文面を1行入れる（kind=signup / standing_key=onboarding_day2）。すでにあれば何もしない
--   - scheduled_at（仕組みを有効にした時刻）は NULL のまま。NULL のあいだは誰にも何もしない
--   - 承認はしない（入れた時点では未承認。トリガーが承認を外す）
--
-- このあとの手順（本番に出すとき。1つずつ・前の段の合格条件を満たしてから次へ）:
--   ★スイッチ: 効くのは「全体（member_mail_settings.mode）・種類（member_mail_kind_settings の signup）・
--     文面の行の standing_mode（off / count / owner / all）」のいちばん弱いもの。
--     - 文面ごとに上げ下げするのは standing_mode。全体と signup は「上限」で、4. で一度 all にしたら、ふだんは触らない
--     - 327-D・E・F は種類（signup）が同じ。signup を off にすると3つともまとめて止まる（非常停止）
--     - 行は入れた時点で standing_mode = 'count'（20261127010837_member_mail_standing_mode.sql の既定。マイグレーション前からある行も count）
--     - standing_mode を下げると、書き出し済みの行は送る直前に止まり、翌日まで待つ。送る日の範囲を過ぎた行は送らずに終わる
--   ※ 入会日は「今の Stripe 契約の最初の課金日」（public.subscriptions の min(start_timestamp)）。
--      user_subscriptions.created_at（アカウントを作った日）ではない
--
--   1. 文面を確かめて承認する
--        SELECT public.member_mail_approve_campaign(id, content_version)
--          FROM public.member_mail_campaigns WHERE standing_key = 'onboarding_day2';
--   2. テスト用アカウントの頭を入れる（値はリポジトリに書かない）
--        UPDATE public.member_mail_settings SET test_email_prefixes = '{...}' WHERE id = 1;
--   3. 人数だけ出す（送らない）。全体・signup が count 以上であること（off だと何も出ない）。
--      scheduled_at は過去にして、今日の対象がいる状態で数える
--        UPDATE public.member_mail_campaigns SET standing_mode = 'count', scheduled_at = now() - interval '30 days'
--          WHERE standing_key = 'onboarding_day2';
--      → 毎朝 8:00 JST に、その日の対象の人数が運用 Slack に出る（last_count にも残る）
--      ★合格条件（必須）: 同じ日の対象（最初の課金日がその日の2〜3日前の人）を手で数え、
--        candidates・will_send・excluded_learned（学んだので外した人） が手で数えた人数と合うこと。
--        対象がいるのに excluded_learned がずっと0なら「学んだ」の判定が効いていない疑いがあるので、all に上げない
--   ★4. に進む前に（必須・327-F）: 30分相談を予約した人を外す準備を終える。
--      - 20261127084404_member_mail_consult_bookings.sql を当て、Vercel に CALCOM_WEBHOOK_SECRET を入れ、
--        Cal.com の webhook を登録して試しの予約で行が入ることを確かめる（鍵が無いと count より上では書き出さない）
--      - scripts/member-mail/import-calcom-bookings.sql で webhook を作る前の予約を入れる
--   4. オーナーだけに送って見た目を確かめる
--      全体・signup がまだ all でなければ、上限として一度だけ all にする（このときほかの常設の文面の standing_mode が
--      off / count のままであることを先に確かめる。全体を上げると weekly など他の種類にも効くので、他の種類のスイッチも先に確かめる）:
--        UPDATE public.member_mail_settings SET mode = 'all' WHERE id = 1;
--        UPDATE public.member_mail_kind_settings SET mode = 'all' WHERE kind = 'signup';
--      そのうえでこの文面だけを owner にする:
--        UPDATE public.member_mail_campaigns SET standing_mode = 'owner' WHERE standing_key = 'onboarding_day2';
--      → member_mail_settings.owner_user_ids の人に、版ごとに1通
--      ★必ず見ること: 届いたメールの元のソース（ヘッダー全体）を開き、Resend のタグ（kind=signup など）や
--        種類・カテゴリの名前（signup / comeback / onboarding など）がヘッダー・URL に出ていないこと。出ていたら all に上げない
--   5. 全員に送る。scheduled_at の入れ直しと standing_mode = 'all' を1つのトランザクションでまとめる
--      （scheduled_at を入れ直さずに all にすると、3. の過去の時刻より後に課金した2〜3日目の人に届く）
--        BEGIN;
--        UPDATE public.member_mail_campaigns SET scheduled_at = now(), standing_mode = 'all'
--          WHERE standing_key = 'onboarding_day2';
--        COMMIT;
--   止めるとき:
--        -- この文面だけ止める（書き出し済みの行も送る直前に止まる）
--        UPDATE public.member_mail_campaigns SET standing_mode = 'off' WHERE standing_key = 'onboarding_day2';
--        -- 327-D・E・F をまとめてすぐ止める（非常停止。signup の種類のメールが全部止まる）
--        UPDATE public.member_mail_kind_settings SET mode = 'off' WHERE kind = 'signup';
-- =============================================================================

INSERT INTO public.member_mail_campaigns (kind, label, subject, preheader, body, standing_key, scheduled_at)
VALUES (
  'signup',
  'はじめの案内（入会2日後の朝）',
  'デザインについて相談できます',
  '30分、オンラインで相談できます（無料）。会員どうしのSlackもあります',
  $body$カイクンです。BONOに入ってくださって、ありがとうございます。

BONOでは、レッスンで学ぶだけでなく、作っている途中のものを人に見てもらったり、進め方を一緒に考えたりできます。「これで合ってるのかな」と思ったときの聞き先を、2つお伝えします。

## デザインについて、30分相談できます

何から始めるか、何を作るかを、30分で一緒に決められます。たとえば、こんなことを聞けます。

- 「仕事をしながら、どのくらいのペースで進めればいい？」
- 「自分の目的だと、どのレッスンから見るのがいい？」
- 「作りかけのものを見てほしい。どこを直せばいい？」

オンラインで、無料です。話したいことがまとまっていなくても大丈夫です。下のリンクから予約サイト（Cal.com）に移り、空いている日時を選ぶだけです。

[30分の相談を予約する](https://cal.com/takumikai/30min)

## 会員どうしのコミュニティもあります

Slack（チャットのアプリ）で、ほかの会員が作ったものや、質問のやりとりを見られます。のぞくだけでも大丈夫です。

[コミュニティの参加方法を見る](https://www.bo-no.design/how-to/community)

相談もコミュニティも、使いたくなったときにいつでもどうぞ。

BONO　カイクン$body$,
  'onboarding_day2',
  NULL
)
ON CONFLICT DO NOTHING;
