import { supabase } from "../../../lib/supabase";
import { Bean } from "../../../type";

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("not authenticated");
  return user;
}

export async function listBeans(): Promise<Bean[]> {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("coffee_beans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Bean[];
}

export async function createBean(name: string, userId: string): Promise<Bean> {
  const user = await requireUser();

  const trimmed = name?.trim();
  if (!trimmed) throw new Error("name is required");
  if (trimmed.length > 100) throw new Error("name is too long");

  // Defensive check: caller-provided userId must match the session user.
  if (userId !== user.id) throw new Error("user mismatch");

  const { data, error } = await supabase
    .from("coffee_beans")
    .insert({ name: trimmed, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data as Bean;
}

export async function updateBean(id: string, name: string): Promise<Bean> {
  const user = await requireUser();

  const trimmed = name?.trim();
  if (!trimmed) throw new Error("name is required");
  if (trimmed.length > 100) throw new Error("name is too long");

  const { data, error } = await supabase
    .from("coffee_beans")
    .update({ name: trimmed })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) throw error;
  return data as Bean;
}

export async function deleteBean(id: string): Promise<void> {
  const user = await requireUser();

  const { error } = await supabase
    .from("coffee_beans")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
}
