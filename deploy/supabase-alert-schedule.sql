-- Run as the project owner after enabling Supabase Cron and adding
-- SIYAJ_JOB_SECRET to Render and the same value to Vault under siyaj_alert_job_secret.
-- The secret itself is never included in this file or an HTTP request.
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.siyaj_run_alert_job()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  job_secret text;
  job_timestamp text := floor(extract(epoch FROM clock_timestamp()))::bigint::text;
  job_nonce text := gen_random_uuid()::text;
  job_message text;
  job_signature text;
  request_id bigint;
BEGIN
  SELECT decrypted_secret INTO job_secret
  FROM vault.decrypted_secrets
  WHERE name = 'siyaj_alert_job_secret'
  LIMIT 1;
  IF job_secret IS NULL OR length(job_secret) < 32 THEN
    RAISE EXCEPTION 'Siyaj alert scheduler secret is missing';
  END IF;
  job_message := job_timestamp || E'\n' || job_nonce || E'\nPOST\n/api/jobs/daily-alerts';
  job_signature := encode(extensions.hmac(job_message, job_secret, 'sha256'), 'hex');
  SELECT net.http_post(
    url := 'https://siyaj.onrender.com/api/jobs/daily-alerts',
    body := '{}'::jsonb,
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-siyaj-timestamp', job_timestamp, 'x-siyaj-nonce', job_nonce,
      'x-siyaj-signature', job_signature),
    timeout_milliseconds := 120000
  ) INTO request_id;
  RETURN request_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.siyaj_run_alert_job() FROM PUBLIC, anon, authenticated;

-- An hourly trigger permits retries while Render sleeps between real jobs.
-- The app checks each panel's weather once per local day, retries failures,
-- sends no dust alert more often than every 14 days, and has no independent heat job.
SELECT cron.schedule('siyaj-daily-alerts', '0 * * * *',
  $$SELECT public.siyaj_run_alert_job();$$);
