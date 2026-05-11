import { NextResponse } from "next/server"

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message, message }, { status })
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized", message: "Unauthorized" }, { status: 401 })
}

export function notFoundResponse(resource = "Resource") {
  return NextResponse.json({ error: `${resource} not found`, message: `${resource} not found` }, { status: 404 })
}
