import type { User } from '@supabase/supabase-js'

export const PROFIL_ALANLARI = ['ad', 'soyad', 'telefon', 'adres', 'iletisim_eposta'] as const

/** Kullanıcının zorunlu profil alanları (ad, soyad, telefon, adres, e-posta) dolu mu? */
export function profilTamMi(user: User | null | undefined): boolean {
  if (!user) return false
  const m = (user.user_metadata ?? {}) as Record<string, unknown>
  return PROFIL_ALANLARI.every(
    (alan) => typeof m[alan] === 'string' && (m[alan] as string).trim().length > 0
  )
}
