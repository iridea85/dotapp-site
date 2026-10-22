-- dōtapp: aggregate counts ONLY, no identifiers or raw visit events.
-- Run only when the private preview is approved for end-to-end testing.
create table if not exists public.sd_anon_daily (
  day date primary key,
  opens bigint not null default 0 check (opens >= 0),
  sessions bigint not null default 0 check (sessions >= 0)
);
alter table public.sd_anon_daily enable row level security;
revoke all on table public.sd_anon_daily from public, anon, authenticated;
grant select on table public.sd_anon_daily to authenticated;
create policy sd_anon_daily_admin_read on public.sd_anon_daily
  for select to authenticated using (sd_private.is_admin());

create schema if not exists sd_metrics_private;
revoke all on schema sd_metrics_private from public;
grant usage on schema sd_metrics_private to anon, authenticated;

create or replace function sd_metrics_private.increment_day(p_first_session boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.sd_anon_daily (day, opens, sessions)
  values ((now() at time zone 'Europe/Rome')::date, 1, case when coalesce(p_first_session, false) then 1 else 0 end)
  on conflict (day) do update
    set opens = public.sd_anon_daily.opens + 1,
        sessions = public.sd_anon_daily.sessions + excluded.sessions;
end;
$$;
revoke all on function sd_metrics_private.increment_day(boolean) from public;
grant execute on function sd_metrics_private.increment_day(boolean) to anon, authenticated;

-- Public entrypoint is invoker rights; the definer function stays in a NON exposed schema.
create or replace function public.sd_anon_hit(p_first_session boolean default false)
returns void language sql security invoker set search_path = '' as $$
  select sd_metrics_private.increment_day(p_first_session);
$$;
revoke all on function public.sd_anon_hit(boolean) from public;
grant execute on function public.sd_anon_hit(boolean) to anon, authenticated;
comment on table public.sd_anon_daily is
  'Anonymous daily aggregate; opens=loaded app pages, sessions=first page load per tab/day. Neither represents distinct people.';
