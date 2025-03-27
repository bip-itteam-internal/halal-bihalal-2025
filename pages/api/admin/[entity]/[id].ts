import {NextApiRequest, NextApiResponse} from 'next';
import {supabase} from '@/utils/supabaseAdmin';
import {verifyAdmin} from '@/utils/verifyAdmin';
import QRCode from 'qrcode';

type Data = {
    status: boolean;
    message?: string;
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    data?: any;
};

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    const {entity, id} = req.query;

    if (!id || !entity) {
        return res.status(400).json({status: false, message: 'Entity and ID are required'});
    }

    if (!['event', 'participant', 'attendance'].includes(entity as string)) {
        return res.status(400).json({status: false, message: 'Invalid entity'});
    }

    if (req.method === 'GET') {
        const {data, error} = await supabase
            .from(entity as string)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(500).json({status: false, message: error.message});
        }

        if (entity === 'event') {
            const DOMAIN = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
            const qrUrl = `${DOMAIN}/api/user/attendance/?event=${id}`;
            const qrCodeImage = await QRCode.toDataURL(qrUrl);

            return res.status(200).json({
                status: true,
                data: {...data, qrCode: qrCodeImage},
            });
        }

        return res.status(200).json({status: true, data});
    }

    if (req.method === 'PUT') {
        const body = req.body;

        const {data, error} = await supabase
            .from(entity as string)
            .update(body)
            .eq('id', id)
            .select('*');

        if (error) {
            return res.status(500).json({status: false, message: error.message});
        }

        return res.status(200).json({
            status: true,
            message: `${entity} updated successfully`,
            data,
        });
    }

    if (req.method === 'DELETE') {
        const {error} = await supabase.from(entity as string).delete().eq('id', id);

        if (error) {
            return res.status(500).json({status: false, message: error.message});
        }

        return res.status(200).json({
            status: true,
            message: `${entity} deleted successfully`,
        });
    }

    return res.status(405).json({status: false, message: 'Method not allowed'});
}

export default verifyAdmin(handler);