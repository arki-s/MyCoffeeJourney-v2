import { supabase } from "../../lib/supabase";

export async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("not authenticated");
  return user;
}
