import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { successResponse } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") || ""

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
  })

  return successResponse({
    data: products.map((p) => ({
      id: p.id, name: p.name, description: p.description, price: Number(p.price),
      compare_price: Number(p.comparePrice), category: p.category, stock: p.stock, is_active: p.isActive,
    })),
  })
}
