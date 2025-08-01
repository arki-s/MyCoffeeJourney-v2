import { useCallback, useState } from "react";
import { supabase } from "../../../lib/supabase";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithEmail = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
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
