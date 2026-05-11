const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api"

interface ApiOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
  cache?: RequestCache
  signal?: AbortSignal
}

class ApiClient {
  private token: string | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem("auth_token", token)
    } else {
      localStorage.removeItem("auth_token")
    }
  }

  getToken() {
    return this.token
  }

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    // Only set Content-Type for non-FormData requests
    const isFormData = options.body instanceof FormData
    if (!isFormData) {
      headers["Content-Type"] = "application/json"
    }

    const { signal } = options
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: options.method || "GET",
      headers,
      body: isFormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined),
      cache: options.cache || "no-store",
      credentials: "same-origin",
      signal,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "An error occurred" }))
      throw new ApiError(error.message || "An error occurred", response.status, error)
    }

    return response.json()
  }

  get<T>(endpoint: string, options?: ApiOptions) {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  post<T>(endpoint: string, body?: any, options?: ApiOptions) {
    return this.request<T>(endpoint, { ...options, method: "POST", body })
  }

  put<T>(endpoint: string, body?: any, options?: ApiOptions) {
    return this.request<T>(endpoint, { ...options, method: "PUT", body })
  }

  delete<T>(endpoint: string, options?: ApiOptions) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public data: any) {
    super(message)
    this.name = "ApiError"
  }
}

export const api = new ApiClient()
export default api
