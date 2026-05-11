"use client"
import { useState, useEffect } from "react"
import { api } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"
import { motion } from "framer-motion"
import { Search, ShoppingBag, Package, Plus, Minus, ShoppingCart } from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: number
  name: string
  description: string
  price: number
  compare_price: number
  category: string
  stock: number
  is_active: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<any>("/products")
        setProducts(res.data || res || [])
      } catch {
        // Placeholder
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Shop</h2>
            <p className="text-sm text-muted-foreground/80">Browse products and accessories</p>
          </div>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </motion.div>

      {loading ? (
        <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="premium-shadow">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">Coming Soon</p>
              <p className="text-sm text-muted-foreground">Our shop is being stocked with products. Check back later!</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => (
            <Card key={product.id} className="overflow-hidden premium-shadow transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="aspect-square bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
                <Package className="h-16 w-16 text-muted-foreground/40" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    {product.category && (
                      <Badge variant="secondary" className="mt-1">{product.category}</Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
                    {product.compare_price > product.price && (
                      <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.compare_price)}</span>
                    )}
                  </div>
                  <Button size="sm" variant="premium">
                    <ShoppingCart className="h-4 w-4 mr-1" /> Buy
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
