import {supabase} from '../../supabaseClient'

export default async function handler(req, res) {
    supabase.auth.api.setAuthCookie(req, res)
}