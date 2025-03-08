import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string || ""
const KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY as string || ""

export const supabase = createClient(URL, KEY)

export async function get_data() {
  const { data, error } = await supabase
    .from('participant')
    .select()

  return { data, error }
}

interface IGetParticipantPaging {
  page: number;
  page_size?: number;
  debouncedSearchTerm?: string;
}

export async function get_participant_paging(
  { page,
    page_size = 10,
    debouncedSearchTerm
  }: IGetParticipantPaging) {
  const from = (page - 1) * page_size;
  const to = from + page_size - 1;

  let query = supabase.from("participant").select("*", { count: "exact" });

  // Apply search filter if there's a search term
  if (debouncedSearchTerm) {
    query = query.ilike("name", `%${debouncedSearchTerm}%`); // Change "name" to the correct column
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error(error);
    return
  }

  let totalPages = 0
  if (count) {
    totalPages = Math.ceil(count / page_size)
  }

  return { data, count, totalPages }
}