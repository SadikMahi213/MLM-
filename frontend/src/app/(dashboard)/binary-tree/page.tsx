"use client"
import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api-client"
import { formatCurrency } from "@/lib/utils"
import { Search, ZoomIn, ZoomOut, RotateCcw, GitBranch, RefreshCw, User } from "lucide-react"
import { getInitials } from "@/lib/utils"

interface TreeNode {
  id: number
  name: string
  username: string
  avatar: string | null
  position: string | null
  level: number
  left_bv: number
  right_bv: number
  total_left: number
  total_right: number
  left: TreeNode | null
  right: TreeNode | null
}

function TreeNodeComponent({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const hasChildren = node.left || node.right
  const positionLabel = node.position || "Root"

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative rounded-xl border-2 p-3 text-center transition-all hover:shadow-lg hover:-translate-y-0.5 duration-200 min-w-[160px]"
        style={{
          borderColor: positionLabel === "A" ? "hsl(217.2 91.2% 59.8% / 0.4)" : positionLabel === "B" ? "hsl(262.1 83.3% 57.8% / 0.4)" : "hsl(38 92% 50% / 0.4)",
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className={`text-xs ${positionLabel === "A" ? "bg-blue-500/10 text-blue-500" : positionLabel === "B" ? "bg-purple-500/10 text-purple-500" : "bg-amber-500/10 text-amber-500"}`}>
              {getInitials(node.name)}
            </AvatarFallback>
          </Avatar>
        </div>
        <p className="text-sm font-semibold truncate">{node.name}</p>
        <p className="text-xs text-muted-foreground truncate">@{node.username}</p>
        <div className="flex items-center justify-center gap-1 mt-2">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">Lvl {node.level}</Badge>
          <Badge variant={positionLabel === "A" ? "info" : positionLabel === "B" ? "premium" : "warning"} className="text-[10px] px-1.5 py-0">
            {positionLabel}
          </Badge>
        </div>
        {(node.left_bv > 0 || node.right_bv > 0) && (
          <div className="flex justify-center gap-2 mt-1">
            <span className="text-[10px] text-blue-500 font-medium">L: {formatCurrency(node.left_bv)}</span>
            <span className="text-[10px] text-purple-500 font-medium">R: {formatCurrency(node.right_bv)}</span>
          </div>
        )}
        <div className={`absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white`}
          style={{ background: positionLabel === "A" ? "#3b82f6" : positionLabel === "B" ? "#a855f7" : "#f59e0b" }}>
          {positionLabel === "A" ? "A" : positionLabel === "B" ? "B" : "R"}
        </div>
      </div>

      {hasChildren && (
        <>
          <div className="h-6 w-px bg-gradient-to-b from-border to-transparent" />
          <div className="relative">
            <div className="absolute top-0 left-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="flex gap-8">
              {node.left && (
                <div className="flex flex-col items-center">
                  <div className="h-6 w-px bg-gradient-to-b from-border to-transparent" />
                  <TreeNodeComponent node={node.left} depth={depth + 1} />
                </div>
              )}
              {node.right && (
                <div className="flex flex-col items-center">
                  <div className="h-6 w-px bg-gradient-to-b from-border to-transparent" />
                  <TreeNodeComponent node={node.right} depth={depth + 1} />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

export default function BinaryTreePage() {
  const [search, setSearch] = useState("")
  const [zoom, setZoom] = useState(1)
  const [tree, setTree] = useState<TreeNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res: any = await api.get("/binary/tree?depth=5")
      setTree(res.tree || res.data?.tree || null)
    } catch (err: any) {
      setError(err?.message || "Failed to load binary tree")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-1">
          <Skeleton className="h-8 w-1 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-40 mt-2" />
          </div>
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <GitBranch className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Failed to load binary tree</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Binary Tree</h2>
            <p className="text-sm text-muted-foreground/80">Visualize your downline structure</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="premium-shadow overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or username..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3 text-sm mr-4">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-muted-foreground">Left (A)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-purple-500" />
                    <span className="text-muted-foreground">Right (B)</span>
                  </div>
                </div>
                <Button variant="glass" size="icon" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground w-12 text-center font-medium">{Math.round(zoom * 100)}%</span>
                <Button variant="glass" size="icon" onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="glass" size="icon" onClick={() => setZoom(1)}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="glass" size="icon" onClick={fetchData} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!tree ? (
              <div className="flex flex-col items-center py-10">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <GitBranch className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No binary tree data available yet</p>
              </div>
            ) : (
              <div
                className="overflow-auto py-8"
                style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
              >
                <div className="flex justify-center min-w-max">
                  <TreeNodeComponent node={tree} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
