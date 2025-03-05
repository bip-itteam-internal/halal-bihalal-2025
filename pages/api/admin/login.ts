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
    return res.status(400).json({ status: false, message: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return res.status(401).json({ status: false, message: 'Invalid email or password' });
  }

  res.status(200).json({ status: true, message: 'Login successful', token: data.session.access_token });
}
