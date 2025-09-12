import { supabase } from "../../../lib/supabase";
import { DrinkingRecord, FinishedWithReview, RecordDetail, UnfinishedWithName } from "../../../type";
import { requireUser } from "../session";

export async function listUnfinishedDrinkingRecords(): Promise<UnfinishedWithName[]> {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("drinking_records")
    .select("*, coffee:coffee_id (name, brand:brand_id(name))")
    .eq("user_id", user.id)
    .is("end_date", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []);
}

export async function listFinishedDrinkingRecords(): Promise<FinishedWithReview[]> {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("drinking_records")
    .select("*, coffee:coffee_id (name, brand:brand_id(name))")
    .eq("user_id", user.id)
    .not("end_date", "is", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const recordIds = (data ?? []).map((record) => record.id);
  if (recordIds.length === 0) return [];

  // レビューの有無を一括で取得
  const { data: reviewsData, error: reviewsError } = await supabase
    .from("reviews")
    .select("record_id")
    .in("record_id", recordIds)
    .eq("user_id", user.id);
  if (reviewsError) throw reviewsError;
  const reviewedRecordIds = new Set((reviewsData ?? []).map((r) => r.record_id));

  return (data ?? []).map((record)=>({...record, hasReview: reviewedRecordIds.has(record.id)}));
}

export async function createDrinkingRecord(
  weight_grams: number,
  price_yen: number,
  purchase_date: string,
  coffee_id: string,
  start_date: string,
): Promise<DrinkingRecord> {
  const user = await requireUser();

  console.log("Creating drinking record with:", {
    user_id: user.id,
    weight_grams,
    price_yen,
    purchase_date,
    coffee_id,
    start_date,
  });

  const { data, error } = await supabase.from("drinking_records").insert({
    user_id: user.id,
    weight_grams: weight_grams,
    price_yen: price_yen,
    purchase_date: purchase_date,
    coffee_id: coffee_id,
    start_date: start_date,
  }).select().single();
  if (error) throw error;
  if (!data) throw new Error("Failed to create drinking record");
  return data;
}

export async function setDrinkingGrindSizes(
  recordId: string,
  grindSizeIds: string[],
): Promise<void> {
  const user = await requireUser();

  // 入力の正規化: falsy を除去し、重複を排除（UI から重複が来ても安全に）
  const desired = Array.from(
    new Set((grindSizeIds ?? []).filter((x): x is string => Boolean(x)))
  );

  // 所有権の厳密チェックを行いたい場合は、以下のように親テーブルで確認する。
  // （RLSが担保しているならスキップ可）
  // const { data: ownerCheck, error: ownerErr } = await supabase
  //   .from("drinking_records")
  //   .select("id")
  //   .eq("id", record_id)
  //   .eq("user_id", user.id)
  //   .single();
  // if (ownerErr) throw ownerErr;
  // if (!ownerCheck) throw new Error("record not found or not owned by user");

  // 現在の関連を取得（この時点では user_id も持っている前提）
  const { data: existingData, error: existingErr } = await supabase
    .from("drinking_grind_sizes")
    .select("id, grind_size_id")
    .eq("user_id", user.id)
    .eq("record_id", recordId);
  if (existingErr) throw existingErr;

  // Set を使って差分を計算
  const currentSet = new Set<string>((existingData ?? []).map((d) => d.grind_size_id));
  const desiredSet = new Set<string>(desired);

  // 削除対象: 現在あるが、望ましい集合に含まれないもの
  const idsToDelete = (existingData ?? [])
    .filter((d) => !desiredSet.has(d.grind_size_id))
    .map((d) => d.id);

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("drinking_grind_sizes")
      .delete()
      .in("id", idsToDelete)
      .eq("user_id", user.id)
      .eq("record_id", recordId);
    if (deleteError) throw deleteError;
  }

  // 追加対象: 望ましい集合にあるが、現在存在しないもの
  const toInsert = desired
    .filter((gid) => !currentSet.has(gid))
    .map((gid) => ({ record_id: recordId, grind_size_id: gid, user_id: user.id }));

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("drinking_grind_sizes")
      .insert(toInsert);
    if (insertError) throw insertError;
  }
}

// 飲み終えていないレコードの修正（終了日入力は許可しない）
export async function updateUnfinishedDrinkingRecord(
  id: string,
  weight_grams: number,
  price_yen: number,
  purchase_date: string,
  coffee_id: string,
  start_date: string,
): Promise<DrinkingRecord> {
  const user = await requireUser();

  const { data, error } = await supabase.from("drinking_records").update({
    weight_grams: weight_grams,
    price_yen: price_yen,
    purchase_date: purchase_date,
    coffee_id: coffee_id,
    start_date: start_date,
  })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("end_date", null)
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error("Failed to update drinking record");
  return data;
}

// 飲み終えたレコードの登録（UIではその後レビュー登録も同時に実施）
export async function finishDrinkingRecord(
  id: string,
  end_date: string,
): Promise<DrinkingRecord> {
  const user = await requireUser();

  const { data, error } = await supabase.from("drinking_records").update({
    end_date: end_date,
  })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("end_date", null)
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error("Failed to finish drinking record");
  return data;
}

// 飲み終えたレコードの修正（終了日の変更を許可）
export async function updateFinishedDrinkingRecord(
  id: string,
  weight_grams: number,
  price_yen: number,
  purchase_date: string,
  coffee_id: string,
  start_date: string,
  end_date: string,
): Promise<DrinkingRecord> {
  const user = await requireUser();

  const { data, error } = await supabase.from("drinking_records").update({
    weight_grams: weight_grams,
    price_yen: price_yen,
    purchase_date: purchase_date,
    coffee_id: coffee_id,
    start_date: start_date,
    end_date: end_date,
  })
    .eq("id", id)
    .eq("user_id", user.id)
    .not("end_date", "is", null)
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error("Failed to update drinking record");
  return data;
}

export async function deleteDrinkingRecord(id: string): Promise<DrinkingRecord> {
  const user = await requireUser();

  // まず関連するgrind sizesを削除
  const { error: delGrindError } = await supabase
    .from("drinking_grind_sizes")
    .delete()
    .eq("record_id", id)
    .eq("user_id", user.id);
  if (delGrindError) throw delGrindError;

  // 次にrecord自体を削除
  const { data, error } = await supabase.from("drinking_records").delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error("Failed to delete drinking record");
  return data;
}

export async function getRecordDetail(id:string): Promise<RecordDetail>{
  const user = await requireUser();

  const { data, error } = await supabase
    .from("drinking_records")
    .select("*, coffee:coffee_id (name, brand:brand_id(name)), reviews (score, comments)")
    .eq("user_id", user.id)
    .eq("id", id)
    .order("created_at", {ascending:false})
    .single();
   if (error) throw error;
   return data;

}
