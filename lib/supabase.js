import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ajxgygczirwdgrycgcbf.supabase.co'
const supabaseAnonKey = 'YOUR_ANON_KEY_HERE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserRole(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}
