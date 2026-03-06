import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { guest_id, session_type, bracelet_given, checkin_by } = await req.json();

    if (!guest_id || !session_type) {
      return NextResponse.json(
        { message: "Guest ID and Session Type are required." },
        { status: 400 }
      );
    }

    // 1. Verify Guest exists
    const { data: guest, error: guestErr } = await supabase
      .from('guests')
      .select('id, full_name, guest_type')
      .eq('id', guest_id)
      .single();

    if (guestErr || !guest) {
      return NextResponse.json({ message: "Tamu tidak terdaftar." }, { status: 404 });
    }

    // 2. Check for existing check-in for this session
    const { data: existingCheckin } = await supabase
      .from('checkins')
      .select('id')
      .eq('guest_id', guest_id)
      .eq('session_type', session_type)
      .maybeSingle();

    if (existingCheckin) {
      return NextResponse.json(
        { message: `Tamu sudah check-in untuk sesi ${session_type}.` },
        { status: 409 }
      );
    }

    // 3. Record Check-in
    const { data: newCheckin, error: regErr } = await supabase
      .from('checkins')
      .insert({
        guest_id,
        session_type,
        bracelet_given: !!bracelet_given,
        checkin_by
      })
      .select()
      .single();

    if (regErr) throw regErr;

    return NextResponse.json({
      status: "success",
      message: `Check-in ${session_type} berhasil untuk ${guest.full_name}.`,
      guest: guest,
      checkin: newCheckin
    }, { status: 201 });

  } catch (error: unknown) {
    console.error("Check-in Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan sistem.", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
