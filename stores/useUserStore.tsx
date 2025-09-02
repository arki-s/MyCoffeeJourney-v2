import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

type UserStore = {
  user: User | null
  setUser: (user: User) => void
  resetUser: () => void
  initializing: boolean
  setInitializing: (initializing: boolean) => void
}

export const useUserStore = create<UserStore>((set) => ({
  initializing: true,
  user: null,
  setUser: (user) => {
    // console.log("setUser called:", user);
    set({ user });
  },
  // setUser: (user) => set({ user }),
  resetUser: () => set({ user: null }),
  setInitializing: (initializing) => {
    // console.log("setInitializing called:", initializing);
    set({ initializing });
  },
}))
