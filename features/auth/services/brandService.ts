import { supabase } from "../../../lib/supabase";
import { Brand } from "../../../type";
import { requireUser } from "../session";

function validateName(raw: string): string {
  const trimmed = raw?.trim();
  if (!trimmed) throw new Error("name is required");
  if (trimmed.length > 100) throw new Error("name is too long");
  return trimmed;
}

async function ensureNoDuplicateBrand(
  userId: string,
  name: string,
  excludeId?: string
) {
  let query = supabase
    .from("coffee_brands")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("name", name);

  // Update時に自分自身を除外するための処理（変更前と同じ名前でも許可）
  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { error, count } = await query;
  if (error) throw error;
  if ((count ?? 0) > 0) throw new Error("brand with this name already exists");
}

export async function listBrands(): Promise<Brand[]> {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("coffee_brands")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Brand[];
}

export async function createBrand(name: string, userId: string): Promise<Brand> {
  const user = await requireUser();

  const trimmed = validateName(name);

  // Defensive check: caller-provided userId must match the session user.
  if (userId !== user.id) throw new Error("user mismatch");

  await ensureNoDuplicateBrand(userId, trimmed);

  const { data, error } = await supabase
    .from("coffee_brands")
    .insert({ name: trimmed, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data as Brand;
}

export async function updateBrand(id: string, name: string): Promise<Brand> {
  const user = await requireUser();

  const trimmed = validateName(name);

  // Exclude the current record so unchanged name doesn't false-positive.
  await ensureNoDuplicateBrand(user.id, trimmed, id);

  const { data, error } = await supabase
    .from("coffee_brands")
    .update({ name: trimmed })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) throw error;
  return data as Brand;
}

export async function deleteBrand(id: string): Promise<void> {
  const user = await requireUser();

  const { error } = await supabase
  .from("coffee_brands")
  .delete()
  .eq("id", id)
  .eq("user_id", user.id);
  if (error) throw error;
}
