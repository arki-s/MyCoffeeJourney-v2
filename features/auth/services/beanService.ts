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

function validateName(raw: string): string {
  const trimmed = raw?.trim();
  if (!trimmed) throw new Error("name is required");
  if (trimmed.length > 100) throw new Error("name is too long");
  return trimmed;
}

async function ensureNoDuplicateBean(
  userId: string,
  name: string,
  excludeId?: string
) {
  let query = supabase
    .from("coffee_beans")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("name", name);

  // Update時に自分自身を除外するための処理（変更前と同じ名前でも許可）
  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { error, count } = await query;
  if (error) throw error;
  if ((count ?? 0) > 0) throw new Error("bean with this name already exists");
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

  const trimmed = validateName(name);

  // Defensive check: caller-provided userId must match the session user.
  if (userId !== user.id) throw new Error("user mismatch");

  await ensureNoDuplicateBean(userId, trimmed);

  const duplicateCheck = await supabase
    .from("coffee_beans")
    .select("id")
    .eq("name", trimmed)
    .eq("user_id", userId)
    .single();
  if (duplicateCheck.data) throw new Error("bean with this name already exists");

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

  const trimmed = validateName(name);

  // Exclude the current record so unchanged name doesn't false-positive.
  await ensureNoDuplicateBean(user.id, trimmed, id);

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
