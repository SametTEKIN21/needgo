-- NeedGO — Fotoğraf & ilan moderasyonu
-- Bu dosyayı Supabase → SQL Editor içinde bir kez çalıştır.
--
-- Akış: yeni ilan her zaman 'beklemede' oluşturulur (RLS zorlar). Sunucudaki
-- /api/moderasyon route'u (service role) fotoğrafları tarar ve sonucu yazar:
--   onaylandi  → yayında
--   beklemede  → admin onayına düşer
--   reddedildi → gizli, fotoğraflar silinir
-- Ayrıca kullanıcılar ilanları 'sikayetler' tablosuna raporlayabilir.

-- 1) İlana moderasyon alanları
alter table public.ilanlar
  add column if not exists moderasyon_durumu text not null default 'beklemede',
  add column if not exists moderasyon_notu text,
  add column if not exists moderasyon_tarihi timestamptz;

-- Mevcut (bu göç öncesi) ilanlar görünmeye devam etsin
update public.ilanlar
  set moderasyon_durumu = 'onaylandi'
  where moderasyon_tarihi is null and moderasyon_durumu = 'beklemede';

-- 2) Admin listesi + kontrol fonksiyonu
create table if not exists public.adminler (
  email text primary key,
  eklenme timestamptz not null default now()
);
alter table public.adminler enable row level security;
-- (adminler tablosu yalnızca SQL Editor'dan yönetilir; RLS politikası yok = kimse okuyamaz/yazamaz)

-- BURAYA KENDİ E-POSTANI EKLE:
insert into public.adminler (email) values ('a.smttkn@gmail.com')
  on conflict (email) do nothing;

create or replace function public.admin_mi()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(auth.role() = 'service_role', false)
    or exists (
      select 1 from public.adminler
      where email = coalesce(auth.jwt() ->> 'email', '')
    );
$$;
grant execute on function public.admin_mi() to anon, authenticated, service_role;

-- 3) ilanlar RLS — görünürlük ve moderasyon alanlarının korunması
alter table public.ilanlar enable row level security;

-- Eski/çakışan SELECT politikalarını temizle (isimler projeden projeye değişebilir;
-- kendi panelinde farklı bir isim varsa onu da drop et)
drop policy if exists "Herkes aktif ilanları görebilir" on public.ilanlar;
drop policy if exists "ilanlar_select" on public.ilanlar;
drop policy if exists "Enable read access for all users" on public.ilanlar;
drop policy if exists "public read" on public.ilanlar;
drop policy if exists "ilan gorunurlugu" on public.ilanlar;

create policy "ilan gorunurlugu"
  on public.ilanlar
  for select
  using (
    moderasyon_durumu = 'onaylandi'
    or auth.uid() = user_id
    or public.admin_mi()
  );

-- Yeni ilan yalnızca 'beklemede' olarak eklenebilir
drop policy if exists "ilan ekleme" on public.ilanlar;
create policy "ilan ekleme"
  on public.ilanlar
  for insert
  with check (
    auth.uid() = user_id
    and moderasyon_durumu = 'beklemede'
  );

-- Güncelleme: sahibi kendi ilanını güncelleyebilir, admin her şeyi
drop policy if exists "ilan guncelleme" on public.ilanlar;
create policy "ilan guncelleme"
  on public.ilanlar
  for update
  using (auth.uid() = user_id or public.admin_mi())
  with check (auth.uid() = user_id or public.admin_mi());

-- Silme: sahibi veya admin
drop policy if exists "ilan silme" on public.ilanlar;
create policy "ilan silme"
  on public.ilanlar
  for delete
  using (auth.uid() = user_id or public.admin_mi());

-- Moderasyon alanlarını yalnızca admin/servis değiştirebilir (sahibi ilan metnini
-- güncellerken moderasyon_durumu'nu kurcalayamaz)
create or replace function public.moderasyon_alanlarini_koru()
returns trigger
language plpgsql
as $$
begin
  if (new.moderasyon_durumu is distinct from old.moderasyon_durumu
      or new.moderasyon_notu is distinct from old.moderasyon_notu)
     and not public.admin_mi()
  then
    new.moderasyon_durumu := old.moderasyon_durumu;
    new.moderasyon_notu := old.moderasyon_notu;
    new.moderasyon_tarihi := old.moderasyon_tarihi;
  end if;
  return new;
end;
$$;
drop trigger if exists trg_moderasyon_koru on public.ilanlar;
create trigger trg_moderasyon_koru
  before update on public.ilanlar
  for each row execute function public.moderasyon_alanlarini_koru();

-- 4) Şikayetler
create table if not exists public.sikayetler (
  id uuid primary key default gen_random_uuid(),
  ilan_id uuid not null references public.ilanlar(id) on delete cascade,
  sikayet_eden_id uuid references auth.users(id),
  sikayet_eden_email text,
  sebep text not null,
  aciklama text,
  durum text not null default 'yeni',
  olusturulma_tarihi timestamptz not null default now()
);
alter table public.sikayetler enable row level security;

drop policy if exists "sikayet olustur" on public.sikayetler;
create policy "sikayet olustur"
  on public.sikayetler
  for insert
  with check (auth.uid() = sikayet_eden_id);

drop policy if exists "sikayet oku" on public.sikayetler;
create policy "sikayet oku"
  on public.sikayetler
  for select
  using (public.admin_mi());

drop policy if exists "sikayet guncelle" on public.sikayetler;
create policy "sikayet guncelle"
  on public.sikayetler
  for update
  using (public.admin_mi())
  with check (public.admin_mi());

-- İlan sahiplerinin adaylara ulaşabilmesi için storage'daki fotoğrafları
-- service role sildiğinden ekstra politika gerekmez.
