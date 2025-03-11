import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseWithBearer } from '../../../utils/supabaseClientWithBearer';
import { verifyUser } from '../../../utils/verifyUser';

type Data = {
  status: boolean;
  message: string;
  data?: {
    status: string;
    id: string;
    name: string;
    date: string;
    location: string;
  }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ status: false, message: 'Unauthorized' });
  }

  const participant = await verifyUser(token);
  if (!participant) {
    return res.status(401).json({ status: false, message: 'Invalid token' });
  }

  const participant_id = participant.id;
  const supabase = getSupabaseWithBearer(token);

  const { data: events, error } = await supabase
    .from('event')
    .select('id, name, date, location');

  if (error) {
    return res.status(500).json({ status: false, message: error.message });
  }

  const eventsWithStatus = await Promise.all(
    events.map(async (event) => {
      const { data: attendance } = await supabase
        .from('attendance')
        .select('status')
        .eq('event_id', event.id)
        .eq('participant_id', participant_id);

      return {
        ...event,
        status: attendance && attendance.length > 0 ? 'Present' : 'Absent',
      };
    })
  );

  return res.status(200).json({
    status: true,
    message: 'Events retrieved successfully',
    data: eventsWithStatus,
  });
}
