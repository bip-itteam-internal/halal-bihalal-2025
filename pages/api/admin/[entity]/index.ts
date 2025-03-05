import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../utils/supabaseAdmin';
import { verifyAdmin } from '../../../../utils/verifyAdmin';
import QRCode from 'qrcode';

type Data = {
  status: boolean;
  message: string;
  data?: any;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { entity } = req.query;

  if (typeof entity !== 'string' || !['event', 'participant', 'attendance'].includes(entity)) {
    return res.status(400).json({ status: false, message: 'Invalid entity' });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase.from(entity).select('*');

    if (error) {
      return res.status(500).json({ status: false, message: error.message });
    }

    if (entity === 'event') {
      const DOMAIN = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
      const eventsWithQR = await Promise.all(
        data.map(async (event: any) => {
          const qrUrl = `${DOMAIN}/api/user/attendance/?event=${event.id}`;
          const qrCodeImage = await QRCode.toDataURL(qrUrl);
          return { ...event, qrCode: qrCodeImage };
        })
      );

      return res.status(200).json({ status: true, message: 'Events retrieved successfully', data: eventsWithQR });
    }

    return res.status(200).json({ status: true, message: `${entity} retrieved successfully`, data });
  }

  if (req.method === 'POST') {
    const data = req.body[entity];

    if (!data) {
      return res.status(400).json({ status: false, message: `Invalid ${entity} data` });
    }

    if (entity === 'attendance') {
      const { participant_id, event_id } = data;

      if (!participant_id || !event_id) {
        return res.status(400).json({ status: false, message: 'Missing participant_id or event_id' });
      }

      const { data: existingAttendance, error: checkError } = await supabase
        .from('attendance')
        .select('id')
        .eq('participant_id', participant_id)
        .eq('event_id', event_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        return res.status(500).json({ status: false, message: checkError.message });
      }

      if (existingAttendance) {
        return res.status(400).json({ status: false, message: 'Participant already checked in' });
      }
    }

    const dataToInsert = Array.isArray(data) ? data : [data];

    const { error } = await supabase.from(entity).insert(dataToInsert);

    if (error) {
      return res.status(500).json({ status: false, message: error.message });
    }

    return res.status(200).json({ status: true, message: `${entity}(s) inserted successfully` });
  }
  
  return res.status(405).json({ status: false, message: 'Method not allowed' });
}

export default verifyAdmin(handler);
