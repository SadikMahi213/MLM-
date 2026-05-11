"use client"
import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api-client"
import { Search, ChevronRight, ChevronDown, User, RefreshCw } from "lucide-react"
import { getInitials } from "@/lib/utils"

interface GenealogyUser {
  id: number
  name: string
  username: string
  avatar: string | null
}

interface GenealogyNode {
  user: GenealogyUser
  position: string | null
  level: number
  children: Record<string, GenealogyNode>
}

function flattenTree(node: GenealogyNode, depth = 0): GenealogyNode & { childrenArray: GenealogyNode[]; depth: number } {
  const childrenArray = Object.values(node.children || {})
  return {
    ...node,
    depth,
    childrenArray,
  }
}

function MemberNode({ node, search }: { node: ReturnType<typeof flattenTree>; search: string }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.childrenArray.length > 0
  const matchesSearch = search === "" || node.user.name.toLowerCase().includes(search.toLowerCase()) || node.user.username.toLowerCase().includes(search.toLowerCase())

  if (!matchesSearch && !hasChildren) return null

  const childrenMatch = hasChildren && node.childrenArray.some((child) => {
    const flat = flattenTree(child, node.depth + 1)
    return search === "" || flat.user.name.toLowerCase().includes(search.toLowerCase()) || flat.user.username.toLowerCase().includes(search.toLowerCase()) || childContainsSearch(flat, search)
  })

  if (!matchesSearch && !childrenMatch && hasChildren) return null

  return (
    <div>
      <div
        className="flex items-center gap-3 rounded-xl p-3 hover:bg-accent hover:border-primary/20 transition-all duration-200 cursor-pointer border border-border/50"
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          <button className="shrink-0 text-muted-foreground">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <div className="w-4" />
        )}
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className={`text-xs ${node.position === "A" ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"}`}>
            {getInitials(node.user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{node.user.name}</p>
          <p className="text-xs text-muted-foreground">@{node.user.username}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">Level {node.level}</Badge>
          {node.position && (
            <Badge variant={node.position === "A" ? "info" : "premium"} className="text-[10px] px-1.5">
              {node.position}
            </Badge>
          )}
        </div>
      </div>
      {expanded && hasChildren && (
        <div className="ml-6 mt-1 space-y-1 border-l-2 border-border/30 pl-4">
          {node.childrenArray.map((child) => (
            <MemberNode key={child.user.id} node={flattenTree(child, node.depth + 1)} search={search} />
          ))}
        </div>
      )}
    </div>
  )
}

function childContainsSearch(node: ReturnType<typeof flattenTree>, search: string): boolean {
  return node.childrenArray.some((child) => {
    const flat = flattenTree(child, node.depth + 1)
    return flat.user.name.toLowerCase().includes(search.toLowerCase()) || flat.user.username.toLowerCase().includes(search.toLowerCase()) || childContainsSearch(flat, search)
  })
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

export default function GenealogyPage() {
  const [search, setSearch] = useState("")
  const [tree, setTree] = useState<Record<string, GenealogyNode>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res: any = await api.get("/binary/genealogy?max_depth=10")
      setTree(res.genealogy || res.data?.genealogy || {})
    } catch (err: any) {
      setError(err?.message || "Failed to load genealogy")
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
            <Skeleton className="h-8 w-52" />
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
          <User className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Failed to load genealogy</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    )
  }

  const rootNodes = Object.values(tree)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Genealogy Tree</h2>
            <p className="text-sm text-muted-foreground/80">View your entire team hierarchy</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="premium-shadow">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="glass" size="sm" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
              {rootNodes.length === 0 ? (
                <div className="flex flex-col items-center py-10">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No team members yet. Start building your team!</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-2">
                    {rootNodes.map((node) => (
                      <MemberNode key={node.user.id} node={flattenTree(node)} search={search} />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
