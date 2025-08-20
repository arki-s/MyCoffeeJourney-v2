import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

type UserStore = {
  user: User | null
  setUser: (user: User) => void
  resetUser: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => {
    console.log("setUser called:", user);
    set({ user });
  },
  // setUser: (user) => set({ user }),
  resetUser: () => set({ user: null }),
}))
