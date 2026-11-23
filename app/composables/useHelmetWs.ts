import { treaty } from "@elysia/eden"
import type { websocketRoutes } from "~~/api/routes/websocket"

export function useHelmetWs() {
  const scheme = import.meta.client && window.location.protocol === "https:" ? "wss:" : "ws:"
  const host = import.meta.client ? window.location.hostname : "localhost"
  const api = treaty<typeof websocketRoutes>(`${scheme}//${host}:${useRuntimeConfig().public.elysiaWsPort || 3001}`)
  return api.ws
}
