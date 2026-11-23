import { Elysia } from "elysia"
import { proxy, pythonApi, requireAuth } from "../lib/auth"

export default new Elysia()
  .get("/rtsp/monitors", async ({ request, set }) => {
    const error = requireAuth(request, set)
    if (error)
      return error
    const result = await proxy(`${pythonApi}/rtsp/monitors`, request)
    set.status = result.status
    return result.body
  })
  .post("/rtsp/monitors/:id/start", async ({ params, request, set }) => {
    const error = requireAuth(request, set)
    if (error)
      return error
    const result = await proxy(
      `${pythonApi}/rtsp/monitors/${params.id}/start`,
      request,
      { method: "POST" },
    )
    set.status = result.status
    return result.body
  })
  .post("/rtsp/monitors/:id/stop", async ({ params, request, set }) => {
    const error = requireAuth(request, set)
    if (error)
      return error
    const result = await proxy(
      `${pythonApi}/rtsp/monitors/${params.id}/stop`,
      request,
      { method: "POST" },
    )
    set.status = result.status
    return result.body
  })
