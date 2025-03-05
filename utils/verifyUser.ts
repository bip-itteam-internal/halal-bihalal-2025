import { supabase } from './supabaseClient';

export async function verifyUser(token: string) {
  if (!token) {
    return null;
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !authData?.user) {
    return null;
  }

  const { phone } = authData.user;

  const { data: participantData, error: participantError } = await supabase
    .from('participant')
    .select('*')
    .eq('phone', phone)
    .single();

  if (participantError || !participantData) {
    return null;
  }

  return {
    id: authData.user.id,
    email: authData.user.email,
    phone: authData.user.phone,
    auth_created_at: authData.user.created_at,
    ...participantData,
  };
}
