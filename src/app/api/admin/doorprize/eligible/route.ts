import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // 1. Fetch Guest who are internal and have a checkin for the 'malam' session
    const { data: guests, error } = await supabase
      .from('guests')
      .select('id, full_name, department, checkins!inner(session_type)')
      .eq('guest_type', 'internal')
      .eq('checkins.session_type', 'malam');

    if (error) throw error;

    return NextResponse.json({
      status: "success",
      count: guests?.length || 0,
      candidates: guests
    });

  } catch (error: unknown) {
    console.error("Doorprize API Error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data peserta doorprize." },
      { status: 500 }
    );
  }
}
