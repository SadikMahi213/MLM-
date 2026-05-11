import { create } from "zustand"
import { api } from "@/lib/api-client"

interface Settings {
  [key: string]: string | number | boolean | null
}

interface SettingsState {
  settings: Settings
  loaded: boolean
  loading: boolean
  error: string | null
  load: () => Promise<void>
  refresh: () => Promise<void>
  get: (key: string, defaultValue?: any) => any
  getBool: (key: string, defaultValue?: boolean) => boolean
  getNumber: (key: string, defaultValue?: number) => number
  getString: (key: string, defaultValue?: string) => string
}

export const useSettingsStore = create<SettingsState>()(
  (set, get) => ({
    settings: {},
    loaded: false,
    loading: false,
    error: null,

    load: async () => {
      if (get().loaded || get().loading) return
      set({ loading: true, error: null })
      try {
        const res: any = await api.get("/settings")
        set({ settings: res.data || {}, loaded: true, loading: false })
      } catch (err: any) {
        set({ error: err?.message || "Failed to load settings", loading: false })
      }
    },

    refresh: async () => {
      set({ loading: true, error: null, loaded: false })
      try {
        const res: any = await api.get("/settings")
        set({ settings: res.data || {}, loaded: true, loading: false })
      } catch (err: any) {
        set({ error: err?.message || "Failed to load settings", loading: false })
      }
    },

    get: (key: string, defaultValue?: any) => {
      const val = get().settings[key]
      return val !== undefined && val !== null ? val : defaultValue
    },

    getBool: (key: string, defaultValue = false) => {
      const val = get().settings[key]
      if (typeof val === "boolean") return val
      if (typeof val === "string") return val === "true" || val === "1"
      if (typeof val === "number") return val === 1
      return defaultValue
    },

    getNumber: (key: string, defaultValue = 0) => {
      const val = get().settings[key]
      if (typeof val === "number") return val
      if (typeof val === "string") {
        const n = parseFloat(val)
        return isNaN(n) ? defaultValue : n
      }
      return defaultValue
    },

    getString: (key: string, defaultValue = "") => {
      const val = get().settings[key]
      return val !== undefined && val !== null ? String(val) : defaultValue
    },
  })
)
