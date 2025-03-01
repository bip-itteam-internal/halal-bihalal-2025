import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string || ""
const KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY as string || ""

export const supabase = createClient(URL, KEY)

export async function get_data() {
  const { data, error } = await supabase
    .from('participant')
    .select()

  console.log({ data, error })

  return { data, error }
}