import { supabase } from '../../lib/supabase'

export async function adminSignIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function adminSignOut() {
  await supabase.auth.signOut()
}

export async function getOrders() {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateOrderStatus(id, status) {
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function getMessages() {
  const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function markMessageRead(id) {
  const { data, error } = await supabase.from('messages').update({ read: true }).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function sendReply(clientId, message) {
  const { error } = await supabase.from('replies').insert({ client_id: clientId, message })
  if (error) throw error
}

export async function getStats() {
  const [{ count: totalOrders }, { count: newOrders }, { count: totalMessages }, { count: unreadMessages }] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('messages').select('*', { count: 'exact', head: true }),
    supabase.from('messages').select('*', { count: 'exact', head: true }).eq('read', false),
  ])
  return { totalOrders, newOrders, totalMessages, unreadMessages }
}
