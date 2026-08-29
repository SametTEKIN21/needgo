-- NeedGO — İş bittikten sonra konuşma & mesajları silme
-- Bu dosyayı Supabase → SQL Editor içinde bir kez çalıştır.
-- Amaç: gereksiz veri depolamamak. Konuşmanın taraflarından biri
-- konuşmayı silebilir; konuşma silinince mesajları da otomatik silinir.

-- 1) Mesajlar konuşmaya cascade bağlansın (silinen konuşmanın mesajları da gitsin)
--    Kolon üzerindeki mevcut FK'nin adı ne olursa olsun kaldırılır.
do $$
declare
  con_ad text;
begin
  for con_ad in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'mesajlar'
      and con.contype = 'f'
      and (
        select attname from pg_attribute
        where attrelid = con.conrelid and attnum = con.conkey[1]
      ) = 'konusma_id'
  loop
    execute format('alter table public.mesajlar drop constraint %I', con_ad);
  end loop;
end $$;

alter table public.mesajlar
  add constraint mesajlar_konusma_id_fkey
  foreign key (konusma_id) references public.konusmalar(id) on delete cascade;

-- 2) RLS: konuşmanın tarafları konuşmayı silebilir
alter table public.konusmalar enable row level security;

drop policy if exists "taraflar konusmayi silebilir" on public.konusmalar;
create policy "taraflar konusmayi silebilir"
  on public.konusmalar
  for delete
  using (auth.uid() = gonderen_id or auth.uid() = alici_id);

-- 3) RLS: konuşmanın tarafları o konuşmadaki mesajları silebilir
alter table public.mesajlar enable row level security;

drop policy if exists "taraflar mesajlari silebilir" on public.mesajlar;
create policy "taraflar mesajlari silebilir"
  on public.mesajlar
  for delete
  using (
    exists (
      select 1 from public.konusmalar k
      where k.id = mesajlar.konusma_id
        and (auth.uid() = k.gonderen_id or auth.uid() = k.alici_id)
    )
  );
