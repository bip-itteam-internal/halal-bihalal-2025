import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { supabase } from './supabaseAdmin';

interface AuthenticatedRequest extends NextApiRequest {
  user?: any;
}

export function verifyAdmin(handler: NextApiHandler) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const { data: user, error } = await supabase.auth.getUser(token);

    if (error || !user?.user) {
      return res.status(401).json({ status: false, message: 'Invalid or expired token' });
    }

    const { data: admin, error: adminError } = await supabase
      .from('admin')
      .select('email')
      .eq('email', user.user.email)
      .single();

    if (adminError || !admin) {
      return res.status(403).json({ status: false, message: 'Forbidden: Not an admin' });
    }

    req.user = user.user;
    return handler(req, res);
  };
}
