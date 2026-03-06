import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = await params;
    const { full_name, phone, company } = await req.json();

    if (!full_name || !phone) {
      return NextResponse.json(
        { message: "Nama dan nomor WhatsApp wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Get Event Quota and Current External Count
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('external_quota, public_reg_status')
      .eq('id', eventId)
      .single();

    if (eventErr || !event) {
      return NextResponse.json({ message: "Event tidak ditemukan." }, { status: 404 });
    }

    if (event.public_reg_status === 'closed') {
      return NextResponse.json({ message: "Registrasi publik sudah ditutup." }, { status: 403 });
    }

    // 2. Count current external guests
    const { count, error: countErr } = await supabase
      .from('guests')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('guest_type', 'external');

    if (countErr) throw countErr;

    if (count !== null && count >= event.external_quota) {
      return NextResponse.json(
        { message: "Mohon maaf, kuota undangan eksternal sudah penuh." },
        { status: 403 }
      );
    }

    // 3. Register Guest
    const { data: guest, error: regErr } = await supabase
      .from('guests')
      .insert({
        event_id: eventId,
        full_name,
        phone,
        company: company || 'Personal',
        guest_type: 'external',
        registration_source: 'public_registration',
        rsvp_status: 'confirmed'
      })
      .select()
      .single();

    if (regErr) throw regErr;

    return NextResponse.json({
      status: "success",
      guest_id: guest.id,
      qr_payload: guest.id
    }, { status: 201 });

  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan sistem.", detail: error.message },
      { status: 500 }
    );
  }
}
