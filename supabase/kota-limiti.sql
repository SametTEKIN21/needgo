-- NeedGO — Eşya alma kotası (30 günde 3 eşya)
-- Bu dosyayı Supabase → SQL Editor içinde bir kez çalıştır.

-- 1) İlana alıcı + bağış tarihi
alter table public.ilanlar
  add column if not exists alici_id uuid references auth.users(id),
  add column if not exists bagis_tarihi timestamptz;

-- 2) Konuşmada istek yapanın e-postası (bağış alıcı listesi için)
alter table public.konusmalar
  add column if not exists gonderen_email text;

-- 3) Son 30 günde alınan eşya sayısı
create or replace function public.alinan_esya_sayisi(kisi uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.ilanlar
  where alici_id = kisi
    and durum = 'bagislandi'
    and bagis_tarihi >= now() - interval '30 days';
$$;

-- 4) Kotası dolu kişinin hakkının yenilenmeye başlayacağı tarih
create or replace function public.kota_yenilenme_tarihi(kisi uuid)
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select min(bagis_tarihi) + interval '30 days'
  from public.ilanlar
  where alici_id = kisi
    and durum = 'bagislandi'
    and bagis_tarihi >= now() - interval '30 days';
$$;

grant execute on function public.alinan_esya_sayisi(uuid)    to anon, authenticated;
grant execute on function public.kota_yenilenme_tarihi(uuid) to anon, authenticated;

-- 5) DB seviyesinde zorlama: kotası dolu alıcıya bağış engellenir
create or replace function public.bagis_kota_kontrol()
returns trigger
language plpgsql
as $$
begin
  if new.alici_id is not null
     and new.durum = 'bagislandi'
     and (old.alici_id is distinct from new.alici_id or old.durum is distinct from new.durum)
  then
    if public.alinan_esya_sayisi(new.alici_id) >= 3 then
      raise exception 'KOTA_DOLU';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_bagis_kota on public.ilanlar;
create trigger trg_bagis_kota
  before update on public.ilanlar
  for each row execute function public.bagis_kota_kontrol();
