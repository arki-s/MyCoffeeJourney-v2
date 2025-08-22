import { useEffect, useRef } from "react";
import { useUserStore } from "../../../stores/useUserStore";
import { supabase } from "../../../lib/supabase";
import * as Linking from "expo-linking";

export const useSessionWatcher = () => {
  const setUser = useUserStore((s) => s.setUser);
  const resetUser = useUserStore((s) => s.resetUser);
  const setInitializing = useUserStore(s => s.setInitializing);
  const didSetSessionFromLink = useRef(false);

  useEffect(() => {
    let mounted = true;

    // 初回セッション確認、保持されたセッションがあるかどうか
    // IIFEで即時に処理を実行している
    (async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("getSession result:", session);
        if (!mounted) return;
        if (error) {
          console.error("Error getting session:", error);
          return;
        }
        if (session?.user) {
          setUser(session.user)
        } else {
          resetUser();
        }

      } finally {
        if (mounted) setInitializing(false);
      }
    })();

    // Auth状態変化のサブクスライブ、今後も追加修正する可能性あり
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      switch (event) {
        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
        case "INITIAL_SESSION":
        case "USER_UPDATED":
          if (session?.user) setUser(session.user);
          break;
        case "SIGNED_OUT":
          resetUser();
          break;
      }
    });

    // アプリがすでに起動している状態で、リンクからのトークンを取得
    const subLink = Linking.addEventListener("url", async ({ url }) => {
      if (didSetSessionFromLink.current) return;
      const { access_token, refresh_token } = parseTokensFromUrl(url);
      if (access_token && refresh_token) {
        didSetSessionFromLink.current = true;
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) console.warn("setSession (runtime) error:", error);
      }
    });

    //アプリがまだ起動していない状態で、リンクからのトークンを取得
    (async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (!initialUrl || didSetSessionFromLink.current) return;
        const { access_token, refresh_token } = parseTokensFromUrl(initialUrl);
        if (access_token && refresh_token) {
          didSetSessionFromLink.current = true;
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) console.warn("setSession (initial) error:", error);
        }
      } catch (e) {
        console.warn("getInitialURL error:", e);
      }
    })();

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe?.();
      subLink?.remove?.();
    };
  }, [setUser, resetUser, setInitializing]);
};

// トークンをURLから解析する
function parseTokensFromUrl(url: string): { access_token?: string; refresh_token?: string } {
  try {
    const parsed = new URL(url);
    const hash = parsed.hash.startsWith("#") ? parsed.hash.slice(1) : "";
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token") ?? undefined;
    const refresh_token = params.get("refresh_token") ?? undefined;
    return {
      access_token: typeof access_token === "string" ? access_token : undefined,
      refresh_token: typeof refresh_token === "string" ? refresh_token : undefined,
    };
  } catch {
    return {};
  }
}
