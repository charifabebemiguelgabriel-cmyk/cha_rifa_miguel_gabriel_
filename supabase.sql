
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null
);
create table if not exists numbers (
  id bigint generated always as identity primary key,
  event_id uuid references events(id),
  number int not null,
  status text not null default 'available',
  taken_by_name text,
  taken_by_whatsapp text,
  payment_type text,
  payment_confirmed boolean default false,
  taken_at timestamptz,
  confirmed_at timestamptz
);
create or replace function claim_number(
  p_event_id uuid,
  p_number int,
  p_name text,
  p_whatsapp text,
  p_payment_type text
) returns table(ok boolean, message text) language plpgsql as $$
begin
  update numbers
  set status='chosen',
      taken_by_name=p_name,
      taken_by_whatsapp=p_whatsapp,
      payment_type=p_payment_type,
      taken_at=now()
  where event_id=p_event_id and number=p_number and status='available';
  if found then return query select true, 'Reservado';
  else return query select false, 'Indisponível';
  end if;
end; $$;
insert into events (title) values ('Chá rifa do bebê Miguel Gabriel') on conflict do nothing;
insert into numbers (event_id, number)
select (select id from events limit 1), g from generate_series(1,100) g on conflict do nothing;
