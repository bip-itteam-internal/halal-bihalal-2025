import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabaseAdmin';
import { verifyAdmin } from '../../../utils/verifyAdmin';
import bcrypt from 'bcrypt';

type Data = {
  status: boolean;
  message: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: false, message: 'Email and password are required' });
  }

  const { data: existingAdmin } = await supabase
    .from('admin')
    .select('email')
    .eq('email', email)
    .single();

  if (existingAdmin) {
    return res.status(400).json({ status: false, message: 'Admin already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (userError) {
    return res.status(500).json({ status: false, message: userError.message });
  }

  const { error: insertError } = await supabase.from('admin').insert([
    { email, password: hashedPassword }
  ]);

  if (insertError) {
    return res.status(500).json({ status: false, message: insertError.message });
  }

  res.status(201).json({ status: true, message: 'Admin registered successfully' });
}

export default verifyAdmin(handler);
