import { useEffect } from "react";
import { supabase } from "../../../lib/supabase";

// Emailログイン後にユーザープロフィールをSupabaseのusersテーブルに保存する
export function useEnsureUserRow() {

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;

      const display_name = (user.user_metadata.full_name || user.email || null).substring(0, 50);

      const { error } = await supabase
        .from("users")
        .upsert({
          id: user.id,
          display_name: display_name,
        }, { onConflict: "id" });
      if (error) {
        console.error("Error ensuring user row:", error);
      }
    })();

    return () => { isMounted = false; };

  }, [])

};
