import { Elysia, t } from "elysia"
import health from "./routes/health"
import auth from "./routes/auth"
import analytics from "./routes/analytics"
import image from "./routes/image"
import rtsp from "./routes/rtsp"
import videos from "./routes/videos"
import { websocketRoutes } from "./routes/websocket"
import zones from "./routes/zones"

let websocketServerStarted = false

export const IndexSchema = t.Object({
  runtime: t.Object({
    bun: t.Nullable(t.String()),
    os: t.String(),
  }),
  status: t.String(),
})

export default () => {
  if (typeof Bun !== "undefined" && !websocketServerStarted) {
    websocketServerStarted = true
    new Elysia().use(websocketRoutes).listen(Number(process.env.ELYSIA_WS_PORT || 3001))
  }

  return new Elysia()
    .use(health)
    .use(auth)
    .use(analytics)
    .use(image)
    .use(rtsp)
    .use(videos)
    .use(zones)
    .get("/", () => {
      const isBun = typeof Bun !== "undefined"
      if (!isBun) {
        console.warn(`Elysia server was started outside of Bun environment, some features may not work as expected!!!`)
      }

      const bunVersion = isBun ? `${Bun.version}` : null
      return {
        runtime: {
          bun: bunVersion,
          // eslint-disable-next-line node/prefer-global/process
          os: typeof process !== "undefined" ? process.platform : "unknown",
        },
        status: "ok",
      }
    }, {
      response: IndexSchema,
    })
}
