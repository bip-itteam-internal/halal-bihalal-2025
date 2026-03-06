import { createClient } from "@supabase/supabase-js";
import { Event, Guest, Checkin } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getEvents = async () => {
  return await supabase.from('events').select('*').order('created_at', { ascending: false });
};

export const getEventById = async (id: string) => {
  return await supabase.from('events').select('*, event_themes(*)').eq('id', id).single();
};

export const getGuestById = async (id: string) => {
  return await supabase.from('guests').select('*, events(*)').eq('id', id).single();
};

export const recordCheckin = async (checkin: Partial<Checkin>) => {
  return await supabase.from('checkins').insert(checkin).select().single();
};
