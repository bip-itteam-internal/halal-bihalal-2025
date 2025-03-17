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

  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ status: false, message: 'Nomor telepon wajib diisi' });
  }

  const { data: participant, error: queryError } = await supabase
    .from('participant')
    .select('id')
    .eq('phone', phone)
    .maybeSingle();

  if (queryError || !participant) {
    return res.status(401).json({ status: false, message: 'Nomor telepon tidak terdaftar' });
  }

  const userEmail = `${phone}@example.com`;
  const { data: existingUser } = await supabase.auth.admin.listUsers();

  let user = existingUser?.users.find((u) => u.email === userEmail);

  if (!user) {
    const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
      phone,
      email: userEmail,
      password: 'defaultPassword123',
      email_confirm: true,
      phone_confirm: true,
    });

    if (userError) {
      return res.status(500).json({ status: false, message: userError.message });
    }

    user = newUser.user;
  }

  const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
    email: userEmail,
    password: 'defaultPassword123',
  });

  if (loginError) {
    return res.status(500).json({ status: false, message: loginError.message });
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
    console.log('Session insert error:', sessionInsertError);
    return res.status(500).json({ status: false, message: 'Gagal menyimpan sesi: ' + sessionInsertError.message });
  }

  res.status(200).json({
    status: true,
    message: 'Login berhasil',
    token: sessionData.session?.access_token,
  });
}