import { createHmac } from "node:crypto"

export const pythonApi = (process.env.PYTHON_API_BASE_URL || "http://localhost:8000/api").replace(/\/$/, "")
export const pythonWs = pythonApi.replace(/^http/, "ws")

const username = process.env.ADMIN_USERNAME || "admin"
const password = process.env.ADMIN_PASSWORD || "admin"
const token = createHmac("sha256", "ryzhenkov_igor_ybvt2304").update(`${username}:${password}`).digest("hex")

export function authToken(request: Request) {
  const header = request.headers.get("authorization") || ""
  if (header.startsWith("Bearer "))
    return header.slice(7)
  return request.headers.get("cookie")?.match(/(?:^|;\s*)kaskacontrol_admin_token=([^;]+)/)?.[1] || ""
}

export function requireAuth(request: Request, set: { status?: number | string }) {
  if (authToken(request) !== token) {
    set.status = 401
    return { detail: "Authentication required" }
  }
  return null
}

export async function proxyJson(url: string, init?: RequestInit) {
  try {
    const response = await fetch(url, init)
    const text = await response.text()
    return { body: text ? JSON.parse(text) : null, status: response.status }
  }
  catch {
    return { body: { detail: "Python inference API is unavailable" }, status: 502 }
  }
}

export async function proxy(url: string, request: Request, init?: RequestInit) {
  const headers = new Headers(init?.headers)
  headers.set("authorization", `Bearer ${authToken(request)}`)
  return proxyJson(url, { ...init, headers })
}
