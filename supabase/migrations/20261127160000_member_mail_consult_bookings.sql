-- =============================================================================
-- 会員メール: 30分相談（Cal.com）を予約した人を、相談に誘う常設の文面から外すための表（#327-F）
-- 作成日: 2026-11-27
-- 関連: rebono/issues/327-F_30分相談の案内_入会7〜11日目.md
--       土台: 20261123000000_create_member_mail.sql（RLS・権限の決まりを同じにする）
--       アプリ: src/app/api/webhooks/calcom/route.ts（予約・取り消し・日時の変更を記録する）
--               src/lib/member-mail/targets.ts の excludeConsultBooked（はじめの案内・30分相談の案内で外す）
--
-- 変えること（足すだけ）:
--   member_mail_consult_bookings … Cal.com の予約1件につき1行（booking_uid が一意）
--     attendee_email は小文字で持つ（予約した本人＝attendees[0]。主催者のアドレスは入れない）
--     user_id は auth.users の同じアドレス（小文字）の人。いなければ NULL（あとで会員になっても、読むときにアドレスで突き合わせる）
--     status: booked / cancelled。一度 cancelled になった予約は booked に戻さない（届く順番が前後しても取り消しが勝つ）
--   member_mail_record_consult_booking(...) … 1件を記録する関数（service_role だけ）
--   member_mail_consult_booked_user_ids(uuid[]) … 渡した会員のうち、取り消していない予約がある人（user_id かアドレスで突き合わせる）
--     アドレスは DB の中だけで突き合わせ、アプリには user_id だけを返す
--
-- 権限・RLS: 他の member_mail の表と同じ。RLS を有効にし、ポリシーは作らない。anon / authenticated からは取り上げる。
-- ★このファイルは当てない（本番への適用はオーナーの判断）。当てる前は、アプリは相談の予約を読めないので、
--   はじめの案内・30分相談の案内は書き出さない・送らない（consult_bookings_unavailable。送らない側に倒す）
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.member_mail_consult_bookings (
  booking_uid text PRIMARY KEY CHECK (char_length(booking_uid) BETWEEN 1 AND 200),
  attendee_email text NOT NULL CHECK (attendee_email = lower(attendee_email) AND attendee_email LIKE '%@%'),
  user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('booked', 'cancelled')),
  start_time timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS member_mail_consult_bookings_user_idx
  ON public.member_mail_consult_bookings (user_id) WHERE status = 'booked';
CREATE INDEX IF NOT EXISTS member_mail_consult_bookings_email_idx
  ON public.member_mail_consult_bookings (attendee_email) WHERE status = 'booked';

COMMENT ON TABLE public.member_mail_consult_bookings IS
  '30分相談（Cal.com）の予約。取り消していない予約がある会員には、相談に誘う常設の文面（onboarding_day2 / day9）を送らない。service_role だけが読み書き';

-- 1件を記録する。p_status は booked / cancelled。返り値は記録後の status
CREATE OR REPLACE FUNCTION public.member_mail_record_consult_booking(
  p_booking_uid text,
  p_attendee_email text,
  p_status text,
  p_start_time timestamptz
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_email text := lower(trim(p_attendee_email));
  v_user uuid;
  v_result text;
BEGIN
  IF p_status NOT IN ('booked', 'cancelled') THEN
    RAISE EXCEPTION 'invalid status';
  END IF;
  SELECT u.id INTO v_user FROM auth.users u WHERE lower(u.email) = v_email ORDER BY u.created_at LIMIT 1;

  INSERT INTO public.member_mail_consult_bookings AS b (booking_uid, attendee_email, user_id, status, start_time)
  VALUES (p_booking_uid, v_email, v_user, p_status, p_start_time)
  ON CONFLICT (booking_uid) DO UPDATE SET
    -- 取り消しは戻さない（同じ予約の BOOKING_CREATED が二度・遅れて届いても cancelled のまま）
    status = CASE WHEN b.status = 'cancelled' OR excluded.status = 'cancelled' THEN 'cancelled' ELSE 'booked' END,
    start_time = COALESCE(b.start_time, excluded.start_time),
    user_id = COALESCE(b.user_id, excluded.user_id),
    updated_at = now()
  RETURNING b.status INTO v_result;
  RETURN v_result;
END;
$$;

-- 渡した会員のうち、取り消していない予約がある人（user_id か、アカウントのアドレス（小文字）で突き合わせる）
CREATE OR REPLACE FUNCTION public.member_mail_consult_booked_user_ids(p_user_ids uuid[])
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT u.id
    FROM auth.users u
   WHERE u.id = ANY(p_user_ids)
     AND EXISTS (
       SELECT 1 FROM public.member_mail_consult_bookings b
        WHERE b.status = 'booked'
          AND (b.user_id = u.id OR (u.email IS NOT NULL AND b.attendee_email = lower(u.email)))
     );
$$;

ALTER TABLE public.member_mail_consult_bookings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.member_mail_consult_bookings FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.member_mail_record_consult_booking(text, text, text, timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.member_mail_consult_booked_user_ids(uuid[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.member_mail_record_consult_booking(text, text, text, timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.member_mail_consult_booked_user_ids(uuid[]) TO service_role;
