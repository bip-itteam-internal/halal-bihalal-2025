import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabaseAdmin';

type Data = {
  status: boolean;
  message: string;
  token?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: false, message: 'Email dan kata sandi wajib diisi' });
  }

  const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError || !sessionData.session) {
    return res.status(401).json({ status: false, message: 'Email atau kata sandi salah' });
  }

  const user = sessionData.user;

  const { data: adminData, error: adminError } = await supabase
    .from('admin')
    .select('email')
    .eq('email', email)
    .single();
    
  if (adminError || !adminData) {
    await supabase.auth.signOut();
    return res.status(403).json({ status: false, message: 'Anda bukan admin' });
  }

  const { data: existingSession } = await supabase
    .from('sessions')
    .select('id, refresh_token')
    .eq('user_id', user.id)
    .single();

  if (existingSession) {
    await supabase.auth.admin.signOut(user.id);
    await supabase.from('sessions').delete().eq('id', existingSession.id);
  }

  const sessionDataToInsert = {
    user_id: user.id,
    refresh_token: sessionData.session.refresh_token,
    created_at: new Date().toISOString(),
  };

  const { error: sessionInsertError } = await supabase.from('sessions').insert(sessionDataToInsert);

  if (sessionInsertError) {
    return res.status(500).json({ status: false, message: 'Gagal menyimpan sesi: ' + sessionInsertError.message });
  }

  res.status(200).json({
    status: true,
    message: 'Login berhasil',
    token: sessionData.session.access_token,
  });
}