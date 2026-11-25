-- =============================================================================
-- 327-D「はじめの案内」（入会2日後の朝）の文面を会員メールに登録する
--
-- ★本番への登録はオーナーの判断で行う（このファイルはマイグレーションではない。supabase db push では当たらない）
-- 前提: supabase/migrations/20261125000000_member_mail_standing_campaigns.sql を当てたあと
--
-- このSQLがすること:
--   - 文面を1行入れる（kind=signup / standing_key=onboarding_day2）。すでにあれば何もしない
--   - scheduled_at（仕組みを有効にした時刻）は NULL のまま。NULL のあいだは誰にも何もしない
--   - 承認はしない（入れた時点では未承認。トリガーが承認を外す）
--
-- このあとの手順（本番に出すとき。1つずつ）:
--   1. 文面を確かめて承認する
--        SELECT public.member_mail_approve_campaign(id, content_version)
--          FROM public.member_mail_campaigns WHERE standing_key = 'onboarding_day2';
--   2. テスト用アカウントの頭を入れる（値はリポジトリに書かない）
--        UPDATE public.member_mail_settings SET test_email_prefixes = '{...}' WHERE id = 1;
--   3. 種類のスイッチを count（人数だけ）にし、有効にする時刻を入れる
--        UPDATE public.member_mail_kind_settings SET mode = 'count' WHERE kind = 'signup';
--        UPDATE public.member_mail_campaigns SET scheduled_at = now() WHERE standing_key = 'onboarding_day2';
--      → 毎朝 8:00 JST に、その日の対象の人数が運用 Slack に出る（送らない）
--   4. オーナーだけに送って見た目を確かめる: mode = 'owner'（owner_user_ids の人に版ごとに1通）
--   5. 全員に送る: mode = 'all' にし、そのとき scheduled_at = now() に入れ直す
--      （「切り替えたあとに入会した人から」にするため。入れ直さないと 3. の時刻より後の入会者が対象になる）
--   止めるとき: kind_settings の signup を 'off'、または scheduled_at を NULL に戻す
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

オンラインで、無料です。話したいことがまとまっていなくても大丈夫です。下のボタンから予約サイト（Cal.com）に移り、空いている日時を選ぶだけです。

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
