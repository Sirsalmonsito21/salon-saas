import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://alzcnpfdhjidfuxjumim.supabase.co',
  'sb_publishable_i13ry-cmmlgqFUEFST5e0g_7PtJop_p'
)

export async function getPerfil() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return data
}