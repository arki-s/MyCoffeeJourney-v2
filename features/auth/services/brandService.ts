import { supabase } from "../../../lib/supabase";
import { Brand } from "../../../type";


export async function listBrands(): Promise<Brand[]> {

  const { data, error } = await supabase
    .from("coffee_brands")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Brand[];
}

export async function createBrand(name: string, userId: string): Promise<Brand> {
  const { data, error } = await supabase
    .from("coffee_brands")
    .insert({ name, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data as Brand;
}

export async function updateBrand(id: string, name: string): Promise<Brand> {
  const { data, error } = await supabase
    .from("coffee_brands")
    .update({ name })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Brand;
}

export async function deleteBrand(id: string): Promise<void> {
  const { error } = await supabase.from("coffee_brands").delete().eq("id", id);
  if (error) throw error;
}
