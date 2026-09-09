import { supabase } from './supabase'

/** Varsayılan/yedek değer. Asıl kaynak: DB `uygulama_ayarlari` → `aylik_alma_hakki`. */
export const AYLIK_ALMA_HAKKI = 3

export type KotaDurumu = {
  alinan: number
  kalan: number
  limit: number
  yenilenmeTarihi: Date | null
}

/** Aylık alma hakkı — `uygulama_ayarlari()` RPC'den (fallback: AYLIK_ALMA_HAKKI). */
export async function aylikAlmaHakki(): Promise<number> {
  try {
    const { data } = await supabase.rpc('uygulama_ayarlari')
    const v = (data as { aylik_alma_hakki?: unknown } | null)?.aylik_alma_hakki
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) && n > 0 ? n : AYLIK_ALMA_HAKKI
  } catch {
    return AYLIK_ALMA_HAKKI
  }
}

/** Bir hesabın son 30 gündeki eşya alma kotası durumu. */
export async function kotaDurumu(uid: string): Promise<KotaDurumu> {
  const [{ data: sayi }, limit] = await Promise.all([
    supabase.rpc('alinan_esya_sayisi', { kisi: uid }),
    aylikAlmaHakki(),
  ])
  const alinan = typeof sayi === 'number' ? sayi : 0
  const kalan = Math.max(0, limit - alinan)

  let yenilenmeTarihi: Date | null = null
  if (kalan === 0) {
    const { data: tarih } = await supabase.rpc('kota_yenilenme_tarihi', { kisi: uid })
    yenilenmeTarihi = tarih ? new Date(tarih as string) : null
  }

  return { alinan, kalan, limit, yenilenmeTarihi }
}

/** Belirli bir kişinin son 30 günde aldığı eşya sayısı (bağış alıcı listesi için). */
export async function alinanEsyaSayisi(uid: string): Promise<number> {
  const { data } = await supabase.rpc('alinan_esya_sayisi', { kisi: uid })
  return typeof data === 'number' ? data : 0
}

export function tarihMetni(tarih: Date | null): string {
  if (!tarih) return ''
  return tarih.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
