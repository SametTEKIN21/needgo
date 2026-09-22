// Moderasyon — paylaşılan sabitler ve istemci yardımcıları

import { supabase } from './supabase'

export type ModerasyonDurumu = 'onaylandi' | 'beklemede' | 'reddedildi'

export const SIKAYET_SEBEPLERI = [
  'Müstehcen / uygunsuz görsel',
  'Yiyecek / yenilebilir ürün',
  'Tehlikeli / yasadışı ürün',
  'Kırık / kullanılamaz / çöp',
  'Yanıltıcı ilan veya spam',
  'Diğer',
] as const

/**
 * Giriş yapan kullanıcı admin mi? Tek kaynak: DB'deki `adminler` tablosu,
 * `admin_mi()` RPC'si üzerinden okunur (RLS'i zorlayan fonksiyonla aynı).
 * Eskiden `NEXT_PUBLIC_ADMIN_EMAILS` ortam değişkenine bakıyordu — o, DB'deki
 * `adminler` tablosundan bağımsız ikinci bir kaynaktı, kaldırıldı.
 */
export async function adminMi(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('admin_mi')
    if (error) return false
    return Boolean(data)
  } catch {
    return false
  }
}

export function moderasyonEtiketi(durum: string | null | undefined): {
  metin: string
  sinif: string
} {
  switch (durum) {
    case 'onaylandi':
      return { metin: 'Yayında', sinif: 'bg-[var(--renk-orman)]/10 text-[var(--renk-orman)]' }
    case 'reddedildi':
      return { metin: 'Reddedildi', sinif: 'bg-[#B5533C]/10 text-[#B5533C]' }
    default:
      return { metin: 'İnceleniyor', sinif: 'bg-amber-500/15 text-amber-700' }
  }
}
