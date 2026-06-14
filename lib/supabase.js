import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ajxgygczirwdgrycgcbf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeGd5Z2N6aXJ3ZGdyeWNnY2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NjU2MTcsImV4cCI6MjA5NjI0MTYxN30.qC0IigOc55KZjzUK8PWNj1bkXt-bTuLQJfYWaMhoosA'

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
