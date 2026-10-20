-- Migrasi US-18: Dukungan beberapa foto per produk
-- Menambahkan kolom foto_tambahan pada tabel produk
--
-- Cara menjalankan:
-- 1. Buka Supabase Dashboard > SQL Editor > New query
-- 2. Tempel skrip ini lalu klik Run

alter table public.produk
  add column if not exists foto_tambahan text[] default '{}';

-- Komentar kolom
comment on column public.produk.foto_tambahan is 'Daftar URL foto tambahan untuk galeri foto produk';

-- Contoh data foto tambahan untuk produk contoh pertama (Kopi Robusta) untuk keperluan pengujian galeri
update public.produk
set foto_tambahan = array['/produk/keripik.svg', '/produk/sambal.svg', '/produk/nastar.svg']
where nama ilike '%kopi bubuk robusta%'
  and (foto_tambahan is null or cardinality(foto_tambahan) = 0);

