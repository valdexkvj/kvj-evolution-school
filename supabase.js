import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://supabase.com/dashboard/project/lymlldhfgzetxmagsnhm.supabase.co/'
const supabaseKey = 'sb_publishable_S6YpTQGj0pVfa_jnGj3mrQ_YbKHzndq'

export const supabase = createClient(supabaseUrl, supabaseKey)
