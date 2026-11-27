-- =============================================================================
-- 327-F「30分相談の案内」（入会9日後の朝）の文面を会員メールに登録する
--
-- ★本番への登録はオーナーの判断で行う（このファイルはマイグレーションではない。supabase db push では当たらない）
-- 前提: supabase/migrations/20261125090715_member_mail_standing_campaigns.sql を当てたあと
--       （standing_key の値は ^[a-z][a-z0-9_]{0,39}$ を満たす）
--       20261127010837_member_mail_standing_mode.sql を当てたあと（文面ごとのスイッチ standing_mode）
--       20261127160000_member_mail_consult_bookings.sql を当てたあと（30分相談を予約した人を外す。当てる前は書き出さない・送らない）
--       アプリ側（STANDING_KEYS に onboarding_day9 がある版）を本番に出したあと
--
-- 対象（src/lib/member-mail/targets.ts の ONBOARDING_DAY9_TARGET が正）:
--   - 入会（今の Stripe 契約の最初の課金日）の9日後の朝。取りこぼし・その朝に条件に合った人は11日後の朝まで
--   - 入会7日目の0時（日本時間）から今までに「学んだ」が無い人。最初の1週間に学んだかは見ない
--   - 配信停止・届かない・テスト用アカウント・14日で3通の上限は 327-D と同じ
--   - イベントの案内・コミュニティの案内は入れない（イベントは毎回の承認が要るため。コミュニティは 327-D で案内済み）
--
-- このSQLがすること:
--   - 文面を1行入れる（kind=signup / standing_key=onboarding_day9）。すでにあれば何もしない
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
--          FROM public.member_mail_campaigns WHERE standing_key = 'onboarding_day9';
--   2. テスト用アカウントの頭が入っているか確かめる（327-D で入れたもの。値はリポジトリに書かない）
--        SELECT cardinality(test_email_prefixes) FROM public.member_mail_settings WHERE id = 1;
--   3. 人数だけ出す（送らない）。全体・signup が count 以上であること（off だと何も出ない）。
--      scheduled_at は過去にして、今日の対象がいる状態で数える
--        UPDATE public.member_mail_campaigns SET standing_mode = 'count', scheduled_at = now() - interval '30 days'
--          WHERE standing_key = 'onboarding_day9';
--      → 毎朝 8:00 JST に、その日の対象の人数が運用 Slack に出る（last_count にも残る）
--      ★合格条件（必須）: 同じ日の対象（最初の課金日がその日の9〜11日前の人）を手で数え、
--        candidates・will_send・excluded_learned（入会7日目以降に学んだので外した人） が手で数えた人数と合うこと。
--        対象がいるのに excluded_learned がずっと0なら「学んだ」の判定が効いていない疑いがあるので、all に上げない
--   ★4. と 5. の前に必ず確かめる（上限が all だと、327-D の行は自分の standing_mode のとおりに動く）:
--        SELECT standing_mode, scheduled_at, approved_version = content_version AS approved
--          FROM public.member_mail_campaigns WHERE standing_key = 'onboarding_day2';
--      → 327-D をまだ出していないなら standing_mode は off か count（owner・all になっていない）。
--        327-D を出しているなら standing_mode = all で、scheduled_at は出した時刻（3. で30日前に戻したままではない）。
--        どちらでもなければ先に 327-D の行を直す（例: UPDATE ... SET standing_mode = 'count' WHERE standing_key = 'onboarding_day2';）
--   ★4. に進む前に（必須・327-F）: 30分相談を予約した人を外す準備を終える。
--      - 20261127160000_member_mail_consult_bookings.sql を当て、Vercel に CALCOM_WEBHOOK_SECRET を入れ、
--        Cal.com の webhook を登録して試しの予約で行が入ることを確かめる（鍵が無いと count より上では書き出さない）
--      - scripts/member-mail/import-calcom-bookings.sql で webhook を作る前の予約を入れる
--   4. オーナーだけに送って見た目を確かめる
--      全体・signup がまだ all でなければ、上限として一度だけ all にする（このときほかの常設の文面の standing_mode が
--      off / count のままであることを先に確かめる。全体を上げると weekly など他の種類にも効くので、他の種類のスイッチも先に確かめる）:
--        UPDATE public.member_mail_settings SET mode = 'all' WHERE id = 1;
--        UPDATE public.member_mail_kind_settings SET mode = 'all' WHERE kind = 'signup';
--      そのうえでこの文面だけを owner にする:
--        UPDATE public.member_mail_campaigns SET standing_mode = 'owner' WHERE standing_key = 'onboarding_day9';
--      → member_mail_settings.owner_user_ids の人に、版ごとに1通
--      ★必ず見ること: 届いたメールの元のソース（ヘッダー全体）を開き、Resend のタグ（kind=signup など）や
--        種類・カテゴリの名前（signup / comeback / onboarding など）がヘッダー・URL に出ていないこと。出ていたら all に上げない
--   5. 全員に送る。scheduled_at の入れ直しと standing_mode = 'all' を1つのトランザクションでまとめる
--      （scheduled_at を入れ直さずに all にすると、3. の過去の時刻より後に課金した9〜11日目の人に届く）
--        BEGIN;
--        UPDATE public.member_mail_campaigns SET scheduled_at = now(), standing_mode = 'all'
--          WHERE standing_key = 'onboarding_day9';
--        COMMIT;
--   止めるとき:
--        -- この文面だけ止める（書き出し済みの行も送る直前に止まる）
--        UPDATE public.member_mail_campaigns SET standing_mode = 'off' WHERE standing_key = 'onboarding_day9';
--        -- 327-D・E・F をまとめてすぐ止める（非常停止。signup の種類のメールが全部止まる）
--        UPDATE public.member_mail_kind_settings SET mode = 'off' WHERE kind = 'signup';
-- =============================================================================

INSERT INTO public.member_mail_campaigns (kind, label, subject, preheader, body, standing_key, scheduled_at)
VALUES (
  'signup',
  '30分相談の案内（入会9日後の朝）',
  'ここまでやってみて、迷っていることはありますか',
  '進め方でも目指す先でも、30分話しながら一緒に整理します（無料）',
  $body$カイクンです。BONOに入って、1週間ほどたちました。

始めてみると、最初に思っていたのとは違う迷いが出てくることがあります。「この進め方でいいのかな」「自分はどこを目指せばいいんだろう」。ひとりで考えていると、なかなか決めきれないものです。

## 迷っていることを、30分で一緒に整理しませんか

オンラインで30分、わたしと話しながら、いま迷っていることを一緒に整理できます。たとえば、こんな話でも大丈夫です。

- 「転職・副業・今の仕事に活かす、のどれを目指すか、まだ決めきれていない」
- 「デザインの良し悪しを、自分ではまだうまく判断できない」
- 「ポートフォリオには、何をどのくらい入れればいい？」

無料です。うまく言葉にできていなくても大丈夫です。下のリンクから予約サイト（Cal.com）に移り、空いている日時を選ぶだけです。

[30分の相談を予約する](https://cal.com/takumikai/30min)

迷っていることは、人に話してみるだけで整理できることも多いです。話してみたくなったら、いつでもどうぞ。

BONO　カイクン$body$,
  'onboarding_day9',
  NULL
)
ON CONFLICT DO NOTHING;
