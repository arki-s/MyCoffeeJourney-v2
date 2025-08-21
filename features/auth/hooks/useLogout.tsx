import { supabase } from "../../../lib/supabase";
import { useUserStore } from "../../../stores/useUserStore";

export const useLogout = () => {
  const resetUser = useUserStore((state) => state.resetUser);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
    } else {
      resetUser();
    }
  };

  return { logout };
};
