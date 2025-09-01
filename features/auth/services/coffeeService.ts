import { supabase } from "../../../lib/supabase";
import { Coffee } from "../../../type";

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

// 同じユーザーが同じブランドで同じ名前のコーヒーを登録できないようにする
async function ensureNoDuplicateCoffee(
  userId: string,
  brandId: string,
  name: string,
  excludeId?: string
) {
  let query = supabase
    .from("coffee")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("brand_id", brandId)
    .eq("name", name);

  // Update時に自分自身を除外するための処理（変更前と同じ名前でも許可）
  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { error, count } = await query;
  if (error) throw error;
  if ((count ?? 0) > 0) throw new Error("coffee with this name already exists");
}

export async function listCoffees(): Promise<Coffee[]> {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("coffee")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createCoffee(
  name: string,
  brandId: string,
  comments?: string,
  photo_url?: string,
  roast_level?: number,
  body?: number,
  sweetness?: number,
  fruity?: number,
  bitter?: number,
  aroma?: number
): Promise<Coffee> {
  const user = await requireUser();

  const trimmed = validateName(name);

  await ensureNoDuplicateCoffee(user.id, brandId, trimmed);

  const { data, error } = await supabase
    .from("coffee")
    .insert({
      name: trimmed,
      brand_id: brandId,
      comments: comments ?? null,
      photo_url: photo_url ?? null,
      roast_level: roast_level ?? null,
      body: body ?? null,
      sweetness: sweetness ?? null,
      fruity: fruity ?? null,
      bitter: bitter ?? null,
      aroma: aroma ?? null,
      user_id: user.id,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Coffee;

};

export async function createCoffeeInclusion(
  coffeeId: string,
  beanId: string
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("coffee_bean_inclusions")
    .insert({
      coffee_id: coffeeId,
      bean_id: beanId,
      user_id: user.id,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCoffee(
  id: string,
  name: string,
  brandId: string,
  comments?: string,
  photo_url?: string,
  roast_level?: number,
  body?: number,
  sweetness?: number,
  fruity?: number,
  bitter?: number,
  aroma?: number
): Promise<Coffee> {
  const user = await requireUser();

  const trimmed = validateName(name);

  await ensureNoDuplicateCoffee(user.id, brandId, trimmed, id);

  const { data, error } = await supabase
    .from("coffee")
    .update({
      name: trimmed,
      brand_id: brandId,
      comments: comments ?? null,
      photo_url: photo_url ?? null,
      roast_level: roast_level ?? null,
      body: body ?? null,
      sweetness: sweetness ?? null,
      fruity: fruity ?? null,
      bitter: bitter ?? null,
      aroma: aroma ?? null,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) throw error;
  return data as Coffee;
}

export async function updateCoffeeInclusion(
  id: string,
  coffeeId: string,
  beanId: string
) {
  const user = await requireUser();

  const duplicateCheck = await supabase
    .from("coffee_bean_inclusions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("coffee_id", coffeeId)
    .eq("bean_id", beanId)
    .neq("id", id); // 自分自身を除外

  if (duplicateCheck.error) throw duplicateCheck.error;
  if ((duplicateCheck.count ?? 0) > 0)
    throw new Error("This coffee already has this bean included.");

  const { data, error } = await supabase
    .from("coffee_bean_inclusions")
    .update({
      coffee_id: coffeeId,
      bean_id: beanId,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCoffee(id: string) {
  const user = await requireUser();

  // まず関連するinclusionsを削除
  const { error: delInclusionError } = await supabase
    .from("coffee_bean_inclusions")
    .delete()
    .eq("coffee_id", id)
    .eq("user_id", user.id);
  if (delInclusionError) throw delInclusionError;

  // 次にcoffee自体を削除
  const { data, error } = await supabase
    .from("coffee")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCoffeeInclusion(id: string) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("coffee_bean_inclusions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
