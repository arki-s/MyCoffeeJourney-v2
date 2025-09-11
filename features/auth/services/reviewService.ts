import { CoffeeReviewItem } from './../../../type';
import { supabase } from "../../../lib/supabase";
import { Review, ReviewWithContext } from "../../../type";
import { requireUser } from "../session";

export async function listReviews(): Promise<ReviewWithContext[]> {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("reviews")
    .select("*, record:record_id (start_date, end_date, coffee:coffee_id (name, brand:brand_id (name)))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []);
}

export async function createReview(
  score: number,
  comments: string | null,
  record_id: string,
): Promise<Review> {
  const user = await requireUser();

  const { data, error } = await supabase.from("reviews").insert({
    user_id: user.id,
    score: score,
    comments: comments,
    record_id: record_id,
  }).select().single();
  if (error) throw error;
  if (!data) throw new Error("Failed to create review");
  return data;
}

export async function updateReview(
  id: string,
  score: number,
  comments: string | null,
): Promise<Review> {
  const user = await requireUser();

  const { data, error } = await supabase.from("reviews").update({
    score: score,
    comments: comments,
  }).eq("id", id).eq("user_id", user.id).select().single();
  if (error) throw error;
  if (!data) throw new Error("Failed to update review");
  return data;
}

export async function deleteReview(id: string): Promise<void> {
  const user = await requireUser();

  const { error } = await supabase.from("reviews").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw error;
}

export async function listReviewsForCoffee (coffeeId:string): Promise<CoffeeReviewItem[]>{
  const user = await requireUser();

  const { data: records , error: recordError } = await supabase
    .from("drinking_records")
    .select("id, start_date, end_date")
    .eq("user_id", user.id)
    .eq("coffee_id", coffeeId);
  if(recordError) throw recordError;

  const recordMap = new Map((records ?? []).map(r => [r.id, { start_date: r.start_date, end_date: r.end_date }]));
  const recordIds = Array.from(recordMap.keys());
  if (recordIds.length === 0) return [];

  const { data: reviews, error: reviewError } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', user.id)
    .in('record_id', recordIds)
    .order('created_at', { ascending: false });
  if (reviewError) throw reviewError;

  return (reviews ?? []).map( r => {
    const record = recordMap.get(r.record_id);
    return {
      record_id: r.record_id,
      score: r.score,
      comments: r.comments,
      created_at: r.created_at,
      start_date: record?.start_date ?? null,
      end_date: record?.end_date ?? null,
    };
  });

}
