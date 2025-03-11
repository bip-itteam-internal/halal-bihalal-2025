import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabaseAdmin';
import bcrypt from 'bcrypt';

type Data = {
  status: boolean;
  message: string;
  data?: {
    email: string | undefined
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST')
    return res.status(405).json({ status: false, message: 'Method not allowed' });

  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ status: false, message: 'Email and password are required' });


  const { data: existingUser, error: userError } = await supabase.auth.admin.listUsers();
  if (userError)
    return res.status(500).json({ status: false, message: userError.message });


  const userExists = existingUser?.users.find((u) => u.email === email);
  if (userExists)
    return res.status(400).json({ status: false, message: 'Admin already exists' });


  const hashedPassword = await bcrypt.hash(password, 10);
  const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError)
    return res.status(500).json({ status: false, message: authError.message });


  const { error: insertError } = await supabase.from('admin').insert([
    { email, password: hashedPassword }
  ]);

  if (insertError)
    return res.status(500).json({ status: false, message: insertError.message });


  return res.status(201).json({
    status: true,
    message: 'Admin account created successfully',
    data: { email: newUser.user.email },
  });
}
