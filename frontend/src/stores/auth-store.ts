import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: number
  name: string
  email: string
  phone: string
  username: string
  avatar: string | null
  profile_photo: string | null
  profile_photo_url: string | null
  country: string | null
  city: string | null
  telecom_code: string | null
  team: string | null
  is_active: boolean
  is_verified: boolean
  two_factor_enabled: boolean
  package?: {
    id: number
    name: string
  }
  wallet?: {
    balance: number
    income_balance: number
    withdrawable_balance: number
    total_income: number
  }
  created_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: "auth-storage",
    }
  )
)
