import { supabase } from "../../../lib/supabase";
import { Coffee, CoffeeDetail, CoffeeWithBrand } from "../../../type";
import { requireUser } from "../session";

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

export async function listCoffees(): Promise<CoffeeWithBrand[]> {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("coffee")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });
  if (error) throw error;
  const coffeeIds = (data ?? []).map((coffee) => coffee.id);
  if (coffeeIds.length === 0) return [];

  // ブランド名を一括で取得
  const { data: brandsData, error: brandsError } = await supabase
    .from("coffee_brands")
    .select("id, name")
    .in("id", Array.from(new Set((data ?? []).map((c) => c.brand_id))));
  if (brandsError) throw brandsError;
  const brandMap = new Map((brandsData ?? []).map((b) => [b.id, b.name]));

  return (data ?? []).map((coffee) => ({
    ...coffee,
    brandName: brandMap.get(coffee.brand_id) ?? "Unknown Brand",
  }));
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

export async function setCoffeeBeanInclusions(
  coffeeId: string,
  beanIds: string[],
): Promise<void> {
  const user = await requireUser();

  // 入力の正規化: falsy を除去し、重複を排除（UI から重複が来ても安全に）
  const desired = Array.from(
    new Set((beanIds ?? []).filter((x): x is string => Boolean(x)))
  );

  // 現在の関連を取得（この時点では user_id も持っている前提）
  const { data: existingData, error: existingErr } = await supabase
    .from("coffee_bean_inclusions")
    .select("id, bean_id")
    .eq("user_id", user.id)
    .eq("coffee_id", coffeeId);
  if (existingErr) throw existingErr;

  // Set を使って差分を計算
  const currentSet = new Set<string>((existingData ?? []).map((d) => d.bean_id));
  const desiredSet = new Set<string>(desired);

  // 削除対象: 現在あるが、望ましい集合に含まれないもの
  const idsToDelete = (existingData ?? [])
    .filter((d) => !desiredSet.has(d.bean_id))
    .map((d) => d.id);

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("coffee_bean_inclusions")
      .delete()
      .in("id", idsToDelete)
      .eq("user_id", user.id)
      .eq("coffee_id", coffeeId);
    if (deleteError) throw deleteError;
  }
  // 追加対象: 望ましい集合にあるが、現在存在しないもの
  const toInsert = desired
    .filter((bean) => !currentSet.has(bean))
    .map((bean) => ({ coffeeId, bean_id: bean, user_id: user.id }));

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("coffee_bean_inclusions")
      .insert(toInsert);
    if (insertError) throw insertError;
  }
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

export async function getCoffeeDetail(id:string): Promise<CoffeeDetail> {
  const user = await requireUser();

  const { data: coffee, error: coffeeError } = await supabase
    .from("coffee")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (coffeeError) throw coffeeError;
  if (!coffee) throw new Error("coffee not found");

  const { data: brand, error:brandError } = await supabase
    .from("coffee_brands")
    .select("*")
    .eq("id", coffee.brand_id)
    .eq("user_id", user.id)
    .single();
  if (brandError) throw brandError;
  if (!brand) throw new Error("brand not found");

  const { data:inclusionRows, error: inclusionError } = await supabase
    .from("coffee_bean_inclusions")
    .select("bean_id")
    .eq("coffee_id", id)
    .eq("user_id", user.id);
  if (inclusionError) throw inclusionError;

  const beanIds = Array.from(new Set(inclusionRows ?? [])).map(r => r.bean_id);
  let beans: { id:string, name:string }[] = [];
  if(beanIds.length > 0) {
    const { data:beanRows, error:beansError } = await supabase
      .from("coffee_beans")
      .select("id, name")
      .in("id", beanIds)
      .eq("user_id", user.id)
    if (beansError) throw beansError;
    beans = beanRows ?? [];
  }

  const { data: records, error: recordsError } = await supabase
    .from("drinking_records")
    .select("id, weight_grams, price_yen")
    .eq("coffee_id", id)
    .eq("user_id", user.id)
    .not("end_date", "is", null)
  if (recordsError) throw recordsError;

  const recordIds = (records ?? []).map(r=> r.id);
  const recordCount = records?.length ?? 0;
  const totalWeight = (records ?? []).reduce((s, r) => s + (r.weight_grams ?? 0), 0);

  // コーヒー100gあたりの金額を計算する
  function computePricePer100g(recs: { weight_grams: number; price_yen: number }[]): number | null {
    const valid = recs.filter(r => r.weight_grams > 0 && r.price_yen >= 0);
    if (valid.length === 0) return null;
    const totalWeight = valid.reduce((s, r) => s + r.weight_grams, 0);
    const totalPrice  = valid.reduce((s, r) => s + r.price_yen, 0);
    if (totalWeight === 0) return null;
    const per100 = (totalPrice / totalWeight) * 100;
    return Math.round(per100);
  }

  const pricePer100g = computePricePer100g(records);

  let avgScore: number | null = null;
  if (recordIds.length > 0) {
    const {data: reviews, error: reviewError } = await supabase
      .from("reviews")
      .select("score")
      .in("record_id", recordIds)
      .eq("user_id", user.id);
    if (reviewError) throw reviewError;

    const scores = (reviews ?? []).map(r => r.score).filter(s => typeof s === "number");
    if (scores.length > 0) {
      avgScore = scores.reduce((s, v) => s + v, 0) / scores.length;
    }
  }

  return {
    ...(coffee as Coffee),
    brand,
    beans,
    stats:{
      recordCount,
      totalWeight,
      pricePer100g,
      avgScore
    }
  }

}
