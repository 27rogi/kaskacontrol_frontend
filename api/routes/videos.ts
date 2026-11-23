import { Elysia, t } from "elysia"
import { authToken, proxyJson, pythonApi, requireAuth } from "../lib/auth"
import { ErrorSchema } from "../schemas/common"
import { VideoJobSchema } from "../schemas/video"

export default new Elysia()
  .post(
    "/videos",
    async ({ body, request, set }) => {
      const error = requireAuth(request, set)
      if (error)
        return error
      const form = new FormData()
      form.append("file", body.file)
      const result = await proxyJson(`${pythonApi}/videos`, {
        body: form,
        headers: { authorization: `Bearer ${authToken(request)}` },
        method: "POST",
      })
      set.status = result.status
      return { progress: 0, status: "queued", ...result.body }
    },
    {
      body: t.Object({ file: t.File() }),
      response: { 202: VideoJobSchema, 413: ErrorSchema, 502: ErrorSchema },
    },
  )
  .get(
    "/videos/:id",
    async ({ params, request, set }) => {
      const error = requireAuth(request, set)
      if (error)
        return error
      const result = await proxyJson(
        `${pythonApi}/videos/${encodeURIComponent(params.id)}`,
        { headers: { authorization: `Bearer ${authToken(request)}` } },
      )
      set.status = result.status
      return result.body
    },
    { response: { 200: VideoJobSchema, 404: ErrorSchema, 502: ErrorSchema } },
  )
  .get("/videos/:id/result", async ({ params, request, set }) => {
    const error = requireAuth(request, set)
    if (error)
      return error
    const incoming = new URL(request.url)
    const headers = new Headers({
      authorization: `Bearer ${authToken(request)}`,
    })
    const range = request.headers.get("range")
    if (range)
      headers.set("range", range)
    try {
      return await fetch(
        `${pythonApi}/videos/${encodeURIComponent(params.id)}/result${incoming.search}`,
        { headers },
      )
    }
    catch {
      return new Response(
        JSON.stringify({ detail: "Python inference API is unavailable" }),
        { headers: { "content-type": "application/json" }, status: 502 },
      )
    }
  })
