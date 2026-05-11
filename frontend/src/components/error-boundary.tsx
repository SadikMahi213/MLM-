"use client"
import { Component } from "react"

export class ErrorBoundary extends Component<{ children: React.ReactNode; fallback?: React.ReactNode }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center py-20 text-destructive">
          <p className="font-semibold">Something went wrong</p>
          <p className="text-sm text-muted-foreground mt-1">{this.state.error.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}
