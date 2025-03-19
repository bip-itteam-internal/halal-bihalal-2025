import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../utils/supabaseAdmin';
import { verifyAdmin } from '../../../../utils/verifyAdmin';
import QRCode from 'qrcode';

type Data = {
  status: boolean;
  message: string;
  data?: any;
};

interface IGetParticipantPaging {
  page: number;
  page_size?: number;
  debouncedSearchTerm?: string;
}

async function getParticipantPaging({
  page,
  page_size = 10,
  debouncedSearchTerm,
}: IGetParticipantPaging) {
  if (page < 1 || page_size < 1) {
    throw new Error('Page dan page_size harus lebih besar dari 0');
  }

  let query = supabase
    .from('participant')
    .select(
      `
      id,
      name,
      phone,
      email,
      shirt_size,
      attendance!left (
        id,
        status,
        check_in_at,
        event_id,
        participant_id
      )
    `,
      { count: 'exact' }
    );

  if (debouncedSearchTerm) {
    query = query.ilike('name', `%${debouncedSearchTerm}%`);
  }

  const { data: participants, count, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch participants: ${error.message}`);
  }

  if (!participants || participants.length === 0) {
    return { data: [], count: 0, totalPages: 0 };
  }

  const participantIds = participants.map((p) => p.id);

  const { data: attendanceData, error: attendanceError } = await supabase
    .from('attendance')
    .select('participant_id')
    .in('participant_id', participantIds)
    .eq('status', 'Present');

  if (attendanceError) {
    throw new Error(`Failed to fetch attendance data: ${attendanceError.message}`);
  }

  const attendanceCounts = attendanceData?.reduce((acc, { participant_id }) => {
    acc[participant_id] = (acc[participant_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const data = participants.map((participant) => {
    const presentCount = attendanceCounts[participant.id] || 0;
    const latestCheckIn = participant.attendance?.reduce((max, att) => {
      const checkInTime = att.check_in_at ? new Date(att.check_in_at).getTime() : 0;
      return checkInTime > max ? checkInTime : max;
    }, 0) || 0;

    return {
      ...participant,
      present_count: presentCount,
      latest_check_in: latestCheckIn,
    };
  });

  data.sort((a, b) => {
    if (b.present_count !== a.present_count) {
      return b.present_count - a.present_count;
    }
    return b.latest_check_in - a.latest_check_in;
  });

  const from = (page - 1) * page_size;
  const to = from + page_size;
  const paginatedData = data.slice(from, to);
  const totalPages = Math.ceil(data.length / page_size);

  return { data: paginatedData, count: data.length, totalPages };
}

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { entity } = req.query;

  if (typeof entity !== 'string' || !['event', 'participant', 'attendance'].includes(entity)) {
    return res.status(400).json({ status: false, message: 'Invalid entity' });
  }

  if (req.method === 'GET') {
    try {
      if (entity === 'participant') {
        const page = parseInt(req.query.page as string) || 1;
        const page_size = parseInt(req.query.page_size as string) || 10;
        const debouncedSearchTerm = req.query.search as string | undefined;

        const { data, count, totalPages } = await getParticipantPaging({
          page,
          page_size,
          debouncedSearchTerm,
        });

        return res.status(200).json({
          status: true,
          message: 'Participants retrieved successfully',
          data: {
            participants: data,
            total: count,
            totalPages,
            currentPage: page,
            pageSize: page_size,
          },
        });
      }

      const { data, error } = await supabase.from(entity).select('*');

      if (error) {
        throw new Error(error.message);
      }

      if (entity === 'event') {
        const DOMAIN = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
        const eventsWithQR = await Promise.all(
          data.map(async (event) => {
            const qrUrl = `${DOMAIN}/api/user/attendance/?event=${event.id}`;
            const qrCodeImage = await QRCode.toDataURL(qrUrl);
            return { ...event, qrCode: qrCodeImage };
          })
        );
        return res.status(200).json({
          status: true,
          message: 'Events retrieved successfully',
          data: eventsWithQR,
        });
      }

      return res.status(200).json({
        status: true,
        message: `${entity} retrieved successfully`,
        data,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  if (req.method === 'POST') {
    const data = req.body[entity];

    if (!data) {
      return res.status(400).json({ status: false, message: `Invalid ${entity} data` });
    }

    if (entity === 'attendance') {
      const { participant_id, event_id } = data;

      if (!participant_id || !event_id) {
        return res.status(400).json({
          status: false,
          message: 'Missing participant_id or event_id',
        });
      }

      const { data: existingAttendance, error: checkError } = await supabase
        .from('attendance')
        .select('id')
        .eq('participant_id', participant_id)
        .eq('event_id', event_id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(checkError.message);
      }

      if (existingAttendance) {
        return res.status(400).json({
          status: false,
          message: 'Participant already checked in',
        });
      }
    }

    const dataToInsert = Array.isArray(data) ? data : [data];
    const { error } = await supabase.from(entity).insert(dataToInsert);

    if (error) {
      throw new Error(error.message);
    }

    return res.status(201).json({
      status: true,
      message: `${entity}(s) inserted successfully`,
    });
  }

  return res.status(405).json({ status: false, message: 'Method not allowed' });
}

export default verifyAdmin(handler);