"use client"
import { useAuthStore } from "@/stores/auth-store"
import { api } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const COOKIE_NAME = "auth_token"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function removeCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`
}

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout: storeLogout, updateUser } = useAuthStore()
  const router = useRouter()

  const login = async (email: string, password: string) => {
    try {
      const response: any = await api.post("/auth/login", { login: email, password })
      setAuth(response.user, response.token)
      api.setToken(response.token)
      setCookie(COOKIE_NAME, response.token, COOKIE_MAX_AGE)
      toast.success("Welcome back!")
      router.push("/dashboard")
      return response
    } catch (error: any) {
      toast.error(error.message || "Login failed")
      throw error
    }
  }

  const register = async (payload: any) => {
    try {
      const isFormData = payload instanceof FormData
      const response: any = await api.post("/auth/register", payload, {
        headers: isFormData ? {} : undefined,
      })
      setAuth(response.user, response.token)
      api.setToken(response.token)
      setCookie(COOKIE_NAME, response.token, COOKIE_MAX_AGE)
      toast.success("Registration successful!")
      router.push("/dashboard")
      return response
    } catch (error: any) {
      toast.error(error.message || "Registration failed")
      throw error
    }
  }

  const logout = async () => {
    try {
      await api.post("/auth/logout")
    } catch {}
    api.setToken(null)
    storeLogout()
    removeCookie(COOKIE_NAME)
    router.push("/login")
    toast.success("Logged out successfully")
  }

  const fetchUser = async () => {
    try {
      const response: any = await api.get("/auth/me")
      updateUser(response.data || response)
      return response
    } catch {
      logout()
    }
  }

  return { user, token, isAuthenticated, login, register, logout, fetchUser, updateUser }
}
