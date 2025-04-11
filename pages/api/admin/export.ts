import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseAdmin';
import { verifyAdmin } from '@/utils/verifyAdmin';
import { createObjectCsvStringifier } from 'csv-writer';

interface Event {
  id: string;
  name: string;
}

interface Attendance {
  id: string;
  status: string;
  event_id: string;
  participant_id: string;
}

interface Participant {
  id: string;
  name: string;
  phone: string;
  shirt_size: string;
  attendance: Attendance[] | null;
}

type Data = {
  status: boolean;
  message: string;
};

async function exportAllParticipantsToCSV(req: NextApiRequest, res: NextApiResponse<Data | Buffer>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }

  try {
    const { data: events, error: eventsError } = await supabase
      .from('event')
      .select('id, name')
      .order('id', { ascending: true })
      .returns<Event[]>();

    if (eventsError) {
      throw new Error(`Failed to fetch events: ${eventsError.message}`);
    }

    if (!events || events.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'No events found',
      });
    }

    const { data: participants, error: participantsError } = await supabase
      .from('participant')
      .select(
        `
        id,
        name,
        phone,
        shirt_size,
        attendance:attendance!left (
          id,
          status,
          event_id,
          participant_id
        )
      `
      )
      .returns<Participant[]>();

    if (participantsError) {
      throw new Error(`Failed to fetch participants: ${participantsError.message}`);
    }

    if (!participants || participants.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'No participants found',
      });
    }

    const csvData = participants.map((participant, index) => {
      const row: Record<string, string> = {
        no: (index + 1).toString(),
        name: participant.name,
        phone: `="+${participant.phone}"`,
        shirt_size: participant.shirt_size,
      };

      events.forEach(event => {
        const isPresent = participant.attendance?.some(
          attendance => attendance.event_id === event.id && attendance.status === 'Present'
        );
        row[event.name] = isPresent ? 'Present' : '-';
      });

      return row;
    });

    const csvHeader = [
      { id: 'no', title: 'NO' },
      { id: 'name', title: 'NAME' },
      { id: 'phone', title: 'PHONE' },
      { id: 'shirt_size', title: 'SHIRT SIZE' },
      ...events.map(event => ({ id: event.name, title: event.name })),
    ];

    const csvStringifier = createObjectCsvStringifier({
      header: csvHeader,
    });

    const csvContent = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(csvData);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="participants_export.csv"');

    return res.status(200).send(Buffer.from(csvContent, 'utf-8'));
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

export default verifyAdmin(exportAllParticipantsToCSV);