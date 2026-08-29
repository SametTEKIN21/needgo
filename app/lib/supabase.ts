import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// İstemci yalnızca ilk kullanımda (tarayıcıda) oluşturulur. Böylece build/prerender
// sırasında env değişkenleri okunmaya çalışılmaz ve "supabaseUrl is required" hatası
// build'i çökertmez.
let client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Supabase env değişkenleri eksik: NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı olmalı.'
    )
  }

  client = createClient(url, anonKey)
  return client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getClient(), prop, receiver)
    return typeof value === 'function' ? value.bind(getClient()) : value
  },
})
