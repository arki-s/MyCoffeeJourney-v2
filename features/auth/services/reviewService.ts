import { supabase } from "../../../lib/supabase";
import { Review } from "../../../type";

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("not authenticated");
  return user;
}

export async function listReviews(): Promise<Review[]> {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
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
