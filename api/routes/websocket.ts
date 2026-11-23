import { Elysia, t } from "elysia"
import type { ElysiaWS } from "elysia/ws"
import { pythonWs } from "../lib/auth"

function relay(
  path: "/ws/camera" | "/ws/rtsp",
  initialize = false,
  upstreams = new Map<string, WebSocket>(),
) {
  return {
    close(client: ElysiaWS<any, any>) {
      const upstream = upstreams.get(client.id)
      if (
        upstream?.readyState === WebSocket.OPEN
        || upstream?.readyState === WebSocket.CONNECTING
      ) {
        upstream.close()
      }
      upstreams.delete(client.id)
    },
    message(client: ElysiaWS<any, any>, message: any) {
      const upstream = upstreams.get(client.id)
      if (upstream?.readyState === WebSocket.OPEN)
        upstream.send(message)
    },
    open(client: ElysiaWS<any, any>) {
      const query = client.data.query || {}
      const upstream = new WebSocket(
        `${pythonWs}${path}?token=${encodeURIComponent(query.token || "")}`,
      )
      upstreams.set(client.id, upstream)
      if (initialize) {
        upstream.onopen = () =>
          upstream.send(
            JSON.stringify({ source: query.source, zone_id: query.zone_id }),
          )
      }
      upstream.onmessage = (event) => {
        if (client.readyState === WebSocket.OPEN)
          client.send(event.data)
      }
      upstream.onerror = () => client.close(1011, "Python WebSocket failed")
      upstream.onclose = () => {
        if (client.readyState === WebSocket.OPEN)
          client.close(1011, "Python WebSocket closed")
      }
    },
    response: t.Any(),
  }
}

export const websocketRoutes = new Elysia()
  .ws("/ws/camera", {
    ...relay("/ws/camera"),
    query: t.Object({ token: t.String() }),
  })
  .ws("/ws/rtsp", {
    ...relay("/ws/rtsp", true),
    query: t.Object({
      source: t.String(),
      token: t.String(),
      zone_id: t.Optional(t.String()),
    }),
  })

export default websocketRoutes
