-- =============================================================================
-- 30分相談（Cal.com）の「webhook を作る前の予約」を、あとから手で入れる（#327-F・必須）
--
-- ★必須: はじめの案内（onboarding_day2）・30分相談の案内（onboarding_day9）の standing_mode を
--   count より上（owner / all）に上げる前に、必ずこれで過去の予約を入れる（入れないと、もう予約した人にも誘いが届く）。
--   入れる予約が1件も無いと確かめた場合も、「確かめる」の結果（rows_to_import = 0）を残してから上げる。
-- ★これはマイグレーションではない（supabase db push では当たらない）。実行するのはオーナー。
-- ★AI・自動の処理からは実行しない。会員のアドレスをこのファイルに書いてコミットしない（貼るのは SQL エディタの上だけ）。
--
-- なぜ要るか:
--   src/app/api/webhooks/calcom が記録するのは、webhook を作ったあとの予約だけ。
--   それより前に予約した人は member_mail_consult_bookings に入っていないので、
--   はじめの案内（onboarding_day2）・30分相談の案内（onboarding_day9）が届いてしまう。
--
-- 前提:
--   supabase/migrations/20261127160000_member_mail_consult_bookings.sql を当てたあと
--   （member_mail_record_consult_booking 関数がある。service_role の権限で動く SQL エディタから実行する）
--
-- 手順:
--   1. Cal.com の「Bookings」で 30min の予約（過去・これからの両方。取り消したものは除く）を開き、
--      予約した人のアドレスと予約の uid（予約の詳細 URL の末尾 /booking/<uid>）を控える。
--      uid が分からないときは 'backfill-' に通し番号を付けた値でよい（同じ値を2回入れても1行のまま）。
--   2. 下の VALUES に1行ずつ貼る（アドレスは大文字・小文字どちらでもよい。小文字にして入れる）。
--   3. まず「確かめる」だけを実行し、件数と会員に結びついた数を見る。
--   4. 問題なければ「入れる」を実行する。もう一度実行しても増えない（uid ごとに1行。取り消し済みは戻らない）。
--   5. 終わったら、SQL エディタに貼ったアドレスを消す。
-- =============================================================================

-- 確かめる（書き込まない）: 貼った件数と、そのうち会員のアカウントに結びつく数
WITH input(booking_uid, attendee_email, start_time) AS (
  VALUES
    -- ('backfill-001', 'someone@example.invalid', '2026-11-01T10:00:00+09:00'::timestamptz),
    (NULL::text, NULL::text, NULL::timestamptz)
)
SELECT count(*) AS rows_to_import,
       count(u.id) AS matched_to_accounts
  FROM input i
  LEFT JOIN auth.users u ON lower(u.email) = lower(trim(i.attendee_email))
 WHERE i.booking_uid IS NOT NULL;

-- 入れる（確かめたあとに、上と同じ VALUES を貼って実行する）
-- WITH input(booking_uid, attendee_email, start_time) AS (
--   VALUES
--     ('backfill-001', 'someone@example.invalid', '2026-11-01T10:00:00+09:00'::timestamptz)
-- )
-- SELECT public.member_mail_record_consult_booking(booking_uid, attendee_email, 'booked', start_time)
--   FROM input
--  WHERE booking_uid IS NOT NULL;
