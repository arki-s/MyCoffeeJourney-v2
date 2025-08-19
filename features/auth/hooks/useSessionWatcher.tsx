import { useEffect } from "react";
import { useUserStore } from "../../../stores/userStore";
import { supabase } from "../../../lib/supabase";
import * as Linking from "expo-linking";

export const useSessionWatcher = () => {
  const setUser = useUserStore((s) => s.setUser);
  const resetUser = useUserStore((s) => s.resetUser);

  useEffect(() => {
    // 初回セッション取得
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      console.log("📦 getUser result:", user);
      if (user) setUser(user);
      else resetUser();
    });

    // Auth状態変化のサブクスライブ
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("📡 Auth event:", _event, session);
      const user = session?.user ?? null;
      if (user) setUser(user);
      else resetUser();
    });

    const subLink = Linking.addEventListener("url", async ({ url }) => {
      console.log("📨 Linking received:", url);

      function parseTokensFromUrl(url: string): { access_token?: string; refresh_token?: string } {
        const parsed = new URL(url);
        const hash = parsed.hash.startsWith("#") ? parsed.hash.slice(1) : "";
        const params = new URLSearchParams(hash);
        return {
          access_token: typeof params.get("access_token") === "string" ? params.get("access_token") ?? undefined : undefined,
          refresh_token: typeof params.get("refresh_token") === "string" ? params.get("refresh_token") ?? undefined : undefined,
        };
      }

      const { access_token, refresh_token } = parseTokensFromUrl(url);
      console.log("🧪 Tokens parsed:", access_token, refresh_token);

      if (access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
        console.log("📦 setSession result:", data, error);
      } else {
        console.warn("❌ No tokens found in URL");
      }
    });

    return () => {
      subscription?.subscription?.unsubscribe?.();
      subLink?.remove?.();
    };
  }, [setUser, resetUser]);
};
