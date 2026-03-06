import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabaseAdmin';

type Data = {
  status: boolean;
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: false, message: 'Unauthorized: No token provided' });
  }

  const { error } = await supabase.auth.admin.signOut(token);

  if (error) {
    return res.status(500).json({ status: false, message: 'Logout failed' });
  }

  res.status(200).json({ status: true, message: 'Logout successful' });
}
