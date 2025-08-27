import { supabase } from "../../../lib/supabase";
import { Bean } from "../../../type";

export async function listBeans(): Promise<Bean[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");

  const { data, error } = await supabase
    .from("coffee_beans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Bean[];
}

export async function createBean(name: string, userId: string): Promise<Bean> {
  const { data, error } = await supabase
    .from("coffee_beans")
    .insert({ name, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data as Bean;
}

export async function updateBean(id: string, name: string): Promise<Bean> {
  const { data, error } = await supabase
    .from("coffee_beans")
    .update({ name })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Bean;
}

export async function deleteBean(id: string): Promise<void> {
  const { error } = await supabase.from("coffee_beans").delete().eq("id", id);
  if (error) throw error;
}
