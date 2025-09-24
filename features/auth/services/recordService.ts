import { addDays, formatLocalYYYYMMDD, isSameDay, maxDate, minDate, parseDate, today } from './../../../utils/date';
import { RecordCalendarEvent } from './../../../type';
import { supabase } from "../../../lib/supabase";
import { CalendarMarkedDates, DrinkingRecord, FinishedWithReview, RecordDetail, UnfinishedWithName } from "../../../type";
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

  // 関連するgrind sizesを削除
  const { error: delGrindError } = await supabase
    .from("drinking_grind_sizes")
    .delete()
    .eq("record_id", id)
    .eq("user_id", user.id);
  if (delGrindError) throw delGrindError;

  // 関連するreviewsを削除
  const { error: delReviewError } = await supabase
    .from("reviews")
    .delete()
    .eq("record_id", id)
    .eq("user_id", user.id);
  if (delReviewError) throw delReviewError;

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

export async function getDrinkingGrindSizes(id:string): Promise<string[]> {
  const user = await requireUser();

  const { data:grindSizeRows, error: grindSizeError } = await supabase
    .from("drinking_grind_sizes")
    .select("grind_size_id")
    .eq("record_id", id)
    .eq("user_id", user.id);
  if (grindSizeError) throw grindSizeError;

  const grindSizeIds = Array.from(new Set(grindSizeRows ?? [])).map(r => r.grind_size_id);
  let grindSizes: string[] = [];
  if(grindSizeIds.length > 0) {
    const { data:grindSizeRows, error:grindSizesError } = await supabase
      .from("grind_sizes")
      .select("id")
      .in("id", grindSizeIds)
      .eq("user_id", user.id)
    if (grindSizesError) throw grindSizesError;
    grindSizes = grindSizeRows.map(r => r.id) ?? [];
  }

  return grindSizes;

}

// 期間を月範囲にクリップしつつ日付を展開する helpers
function expandEventIntoDays(
  event: RecordCalendarEvent,
  monthStart: string,
  monthEnd: string
): { date: string; isStart: boolean; isEnd: boolean; color: string }[] {

  // 1. 文字列の日付を Date 型に変換
  const start = parseDate(event.startDate);                        // 記録の開始日
  const end = event.endDate ? parseDate(event.endDate) : today();  // 進行中は今日まで塗る
  const monthStartDate = parseDate(monthStart);                     // 月の先頭 (1日)
  const monthEndDate = addDays(parseDate(monthEnd), -1);            // 月末（翌月1日から1日戻す）

  // 2. 進行中 (endDate === null) の場合は今日の日付を終了とみなす
  // 3. 月の先頭 (monthStart) と月末 (monthEndの1日前) を Date 型に変換
  // 4. 期間の交差を判定し、月の範囲にクリップ:
  //    effectiveStart = max(event.startDate, monthStartDate)
  //    effectiveEnd = min(eventEnd, monthEndDate)
  //    もし effectiveStart > effectiveEnd ならこの月に塗る日が無いので []

  const effectiveStart = maxDate(start, monthStartDate); // 開始は「イベント開始 or 月初」の遅い方
  const effectiveEnd = minDate(end, monthEndDate);       // 終了は「イベント終了 or 月末」の早い方
  if (effectiveStart > effectiveEnd) {
    // 月内に１日も被らない場合は何も塗らない
    return [];
  }

  // 5. effectiveStart .. effectiveEnd を1日ずつループして
  //    - YYYY-MM-DD 文字列を作る (formatLocalYYYYMMDD)
  //    - isStart / isEnd を判定 (isSameDay)
  //    - 配列に push({ date, isStart, isEnd, color: event.color })

  const results: { date: string; isStart: boolean; isEnd: boolean; color: string }[] = [];
  let cursor = new Date(effectiveStart);
  while (cursor <= effectiveEnd) {
    const iso = formatLocalYYYYMMDD(cursor);        // カレンダーのキーになる “YYYY-MM-DD”
    const isStart = isSameDay(cursor, effectiveStart);
    const isEnd = isSameDay(cursor, effectiveEnd);
    results.push({
      date: iso,
      isStart,
      isEnd,
      color: event.color ?? "#FFA500",              // 事前に決めた色（進行中用/完了用など）
    });
    cursor = addDays(cursor, 1);                    // 1日進める（utilsに置いた addDays を利用）
  }

  // 6. 出来上がった配列を返す

  return results;
}

// expandEventIntoDays が作った日別エントリを marked にマージする。
// 同じ日付キーが既にあれば periods に追加するだけ。
function mergeIntoMarkedDates(
  marked: CalendarMarkedDates,
  entries: { date: string; isStart: boolean; isEnd: boolean; color: string }[]
) {
  for (const entry of entries) {
    if (!marked[entry.date]) {
      marked[entry.date] = { periods: [] };
    }
    marked[entry.date].periods.push({
      color: entry.color,
      startingDay: entry.isStart || undefined,
      endingDay: entry.isEnd || undefined,
      textColor: '#fff',
    });
  }
}

export async function getMonthlyDrinkingRecords(year: number, month: number): Promise<CalendarMarkedDates>{
  const user = await requireUser();

  // カレンダー描画専用のデータ管制塔にするため、処理工程をTODOで可視化しておく
  // year/monthから対象月の開始日と終了日（ISO文字列）を算出し、タイムゾーン方針も決める
  // supabase.drinking_recordsをuser.idで絞り、開始日〜終了日が期間と交差するレコードを取得
  // コーヒー名やブランド名が必要なら、ここでjoin（select内）するか別クエリで補完する

  const monthStart = formatLocalYYYYMMDD(new Date(year, month - 1, 1));
  const monthEnd = formatLocalYYYYMMDD(new Date(year, month, 1));

  const { data: recordRows, error: recordError } = await supabase
    .from("drinking_records")
    .select("*, coffee:coffee_id (name, brand:brand_id(name))")
    .eq("user_id", user.id)
    .gte("start_date", monthStart)
    .lt("start_date", monthEnd)
    .or(`end_date.gte.${monthStart},end_date.is.null`) // 終了日が月初以降 or まだ終わっていない
    .order("start_date", { ascending: true });
  if (recordError) throw recordError;
  if (!recordRows || recordRows.length === 0) return {};

  // 取得結果をRecordCalendarEvent[]に変換し、statusやcolorの決定ルールを関数化して分岐
  const ongoingColor = "#FFA500"; // オレンジ
  const finishedColor = "#32CD32"; // ライムグリーン

  const RecordCalendarEvents: RecordCalendarEvent[] = recordRows.map((record) => ({
    id: record.id,
    startDate: record.start_date,
    endDate: record.end_date,
    coffeeName: record.coffee?.name ?? "Unknown Coffee",
    brandName: record.coffee?.brand?.name ?? "Unknown Brand",
    status: record.end_date ? "finished" : "ongoing",
    color: record.end_date ? finishedColor : ongoingColor, // finishedは緑、ongoingはオレンジ(仮)
  }));

  const markedDates: CalendarMarkedDates = {};

  for (const event of RecordCalendarEvents) {
    const dayEntries = expandEventIntoDays(event, monthStart, monthEnd);
    mergeIntoMarkedDates(markedDates, dayEntries);
  }

  return markedDates;

}
