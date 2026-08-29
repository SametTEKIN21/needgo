// Moderasyon — paylaşılan sabitler ve istemci yardımcıları

export type ModerasyonDurumu = 'onaylandi' | 'beklemede' | 'reddedildi'

export const SIKAYET_SEBEPLERI = [
  'Müstehcen / uygunsuz görsel',
  'Yiyecek / yenilebilir ürün',
  'Tehlikeli / yasadışı ürün',
  'Kırık / kullanılamaz / çöp',
  'Yanıltıcı ilan veya spam',
  'Diğer',
] as const

// İstemci tarafında admin arayüzünü göstermek için (asıl yetki kontrolü RLS'te).
export function adminMi(email: string | null | undefined): boolean {
  if (!email) return false
  const liste = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return liste.includes(email.toLowerCase())
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
