-- NeedGO — İlan silme yetkisi (RLS) + bağlı kayıtların temizlenmesi
-- Bu dosyayı Supabase → SQL Editor içinde bir kez çalıştır.
--
-- Sorun: "İlanlarım" sayfasında Sil'e basınca kart ekrandan kayboluyor ama
-- ilan veritabanından silinmiyor; ana sayfa yenilenince ilan geri geliyor.
-- Sebep: ilanlar tablosunda RLS açık ama DELETE için bir politika yok →
-- tarayıcıdan gelen delete isteği sessizce 0 satır siliyor (hata da dönmüyor).
--
-- Not: moderasyon.sql zaten çalıştırıldıysa bu politikayı admin destekli
-- haliyle o dosya da kuruyor. Bu dosya tek başına da güvenle çalışır.

-- 1) RLS açık olsun
alter table public.ilanlar enable row level security;

-- 2) İlan sahibi (ve varsa admin) kendi ilanını silebilir
drop policy if exists "ilan silme" on public.ilanlar;
do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'admin_mi'
  ) then
    execute $p$
      create policy "ilan silme" on public.ilanlar
        for delete
        using (auth.uid() = user_id or public.admin_mi())
    $p$;
  else
    execute $p$
      create policy "ilan silme" on public.ilanlar
        for delete
        using (auth.uid() = user_id)
    $p$;
  end if;
end $$;

-- 3) Bağlı kayıtlar: ilan silinince ona ait konuşmalar (ve cascade ile mesajlar)
--    ile şikayetler de silinsin. Kolon üzerindeki mevcut FK adı ne olursa olsun
--    kaldırılıp on delete cascade ile yeniden kurulur.
do $$
declare
  t text;
  con_ad text;
begin
  foreach t in array array['konusmalar', 'sikayetler', 'favoriler']
  loop
    -- tablo yoksa atla (ör. moderasyon.sql çalıştırılmadıysa sikayetler olmaz)
    if to_regclass('public.' || t) is null then
      continue;
    end if;
    -- ilan_id kolonu yoksa atla
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = t and column_name = 'ilan_id'
    ) then
      continue;
    end if;

    for con_ad in
      select con.conname
      from pg_constraint con
      join pg_class rel on rel.oid = con.conrelid
      join pg_namespace nsp on nsp.oid = rel.relnamespace
      where nsp.nspname = 'public'
        and rel.relname = t
        and con.contype = 'f'
        and (
          select attname from pg_attribute
          where attrelid = con.conrelid and attnum = con.conkey[1]
        ) = 'ilan_id'
    loop
      execute format('alter table public.%I drop constraint %I', t, con_ad);
    end loop;

    execute format(
      'alter table public.%I add constraint %I foreign key (ilan_id)
         references public.ilanlar(id) on delete cascade',
      t, t || '_ilan_id_fkey'
    );
  end loop;
end $$;
