import {NextApiRequest, NextApiResponse} from 'next';
import {getSupabaseWithBearer} from '@/utils/supabaseClientWithBearer';
import {verifyUser} from '@/utils/verifyUser';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({status: false, message: 'Method not allowed'});
    }

    const {event} = req.query;

    // after some consideration, user will only scan QR without choosing the event. Event depends on printed-QR (which is only 2 different URLs)
    // const { selected_event } = req.body;

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({status: false, message: 'Unauthorized'});
    }

    const supabase = getSupabaseWithBearer(token);
    const participant = await verifyUser(token);

    if (!participant) {
        return res.status(401).json({status: false, message: 'Invalid token'});
    }

    const participant_id = participant.id;

    // if (!event || !selected_event) {
    if (!event) {
        return res.status(400).json({status: false, message: 'Missing required fields'});
    }

    // if (Number(event) !== Number(selected_event)) {
    //   return res.status(400).json({ status: false, message: 'Event mismatch' });
    // }

    const {data: eventData, error: eventError} = await supabase
        .from('event')
        .select('id, date')
        .eq('id', event)
        .single();

    if (eventError || !eventData) {
        return res.status(404).json({status: false, message: 'Event not found'});
    }

    const {data: attendanceData} = await supabase
        .from('attendance')
        .select('*')
        .eq('event_id', event)
        .eq('participant_id', participant_id)
        .single();

    if (attendanceData) {
        return res.status(400).json({status: false, message: 'Already checked in'});
    }

    const eventTime = new Date(eventData.date);
    const currentTime = new Date().toLocaleString('en-US', {timeZone: 'Asia/Jakarta'});
    const eventTimeMs = eventTime.getTime();
    const currentTimeMs = new Date(currentTime).getTime();

    const timeDifference = (currentTimeMs - eventTimeMs) / 1000;

    const WAITING_TIME = 3600; // 1 hour
    if (timeDifference < -WAITING_TIME) {
        return res.status(400).json({
            status: false,
            message: 'Check-in not allowed more than 10 minutes before event time'
        });
    }

    if (timeDifference > WAITING_TIME) {
        return res.status(400).json({
            status: false,
            message: 'Check-in not allowed more than 10 minutes after event time'
        });
    }

    const {error: insertError} = await supabase
        .from('attendance')
        .insert([{event_id: event, participant_id, status: 'Present'}]);

    if (insertError) {
        return res.status(500).json({status: false, message: insertError.message});
    }

    return res.status(200).json({
        status: true,
        message: 'Check-in successful',
        name: participant.name,
        shirt_size: participant.shirt_size
    });
}
