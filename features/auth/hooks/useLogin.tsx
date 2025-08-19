import { useCallback, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { makeRedirectUri } from "expo-auth-session";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithEmail = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    const redirectTo = makeRedirectUri({ path: "auth-callback" });
    console.log("📨 redirectTo:", redirectTo);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectTo,
      }
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return false;
    }
    return true;
  }, []);

  return {
    loginWithEmail,
    loading,
    error,
  };
};
