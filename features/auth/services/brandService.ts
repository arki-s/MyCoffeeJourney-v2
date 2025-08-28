import { supabase } from "../../../lib/supabase";
import { Brand } from "../../../type";

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("not authenticated");
  return user;
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

  const trimmed = name?.trim();
  if (!trimmed) throw new Error("name is required");
  if (trimmed.length > 100) throw new Error("name is too long");

  // Defensive check: caller-provided userId must match the session user.
  if (userId !== user.id) throw new Error("user mismatch");

  const { data, error } = await supabase
    .from("coffee_brands")
    .insert({ name, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data as Brand;
}

export async function updateBrand(id: string, name: string): Promise<Brand> {
  const user = await requireUser();

  const trimmed = name?.trim();
  if (!trimmed) throw new Error("name is required");
  if (trimmed.length > 100) throw new Error("name is too long");

  const { data, error } = await supabase
    .from("coffee_brands")
    .update({ name })
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
