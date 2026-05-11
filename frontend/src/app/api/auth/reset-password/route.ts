import { NextRequest } from "next/server"
import { successResponse, errorResponse } from "@/lib/api-helpers"

export async function POST(request: NextRequest) {
  return errorResponse("Password reset not available in demo", 501)
}
