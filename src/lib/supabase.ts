import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabaseAdmin: SupabaseClient | null = null
let _supabase: SupabaseClient | null = null

function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  }
  return _supabaseAdmin
}

function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
  }
  return _supabase
}

export { getSupabase as supabase, getSupabaseAdmin as supabaseAdmin }

export async function uploadResume(file: Buffer, fileName: string, contentType: string): Promise<string> {
  const admin = getSupabaseAdmin()
  const uniqueFileName = `resumes/${Date.now()}-${fileName}`
  const { data, error } = await admin.storage
    .from('resumes')
    .upload(uniqueFileName, file, {
      contentType,
      upsert: false,
    })
  if (error) throw new Error(`Upload failed: ${error.message}`)
  const { data: publicUrl } = admin.storage.from('resumes').getPublicUrl(data.path)
  return publicUrl.publicUrl
}

export async function deleteResume(filePath: string): Promise<void> {
  const admin = getSupabaseAdmin()
  const path = filePath.split('/resumes/')[1]
  if (!path) return
  await admin.storage.from('resumes').remove([`resumes/${path}`])
}
