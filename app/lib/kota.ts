import { supabase } from './supabase'

export const AYLIK_ALMA_HAKKI = 3

export type KotaDurumu = {
  alinan: number
  kalan: number
  yenilenmeTarihi: Date | null
}

/** Bir hesabın son 30 gündeki eşya alma kotası durumu. */
export async function kotaDurumu(uid: string): Promise<KotaDurumu> {
  const { data: sayi } = await supabase.rpc('alinan_esya_sayisi', { kisi: uid })
  const alinan = typeof sayi === 'number' ? sayi : 0
  const kalan = Math.max(0, AYLIK_ALMA_HAKKI - alinan)

  let yenilenmeTarihi: Date | null = null
  if (kalan === 0) {
    const { data: tarih } = await supabase.rpc('kota_yenilenme_tarihi', { kisi: uid })
    yenilenmeTarihi = tarih ? new Date(tarih as string) : null
  }

  return { alinan, kalan, yenilenmeTarihi }
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
