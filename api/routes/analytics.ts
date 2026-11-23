import { Elysia, t } from "elysia"
import { proxy, pythonApi, requireAuth } from "../lib/auth"

export default new Elysia()
  .get(
    "/events",
    async ({ request, set }) => {
      const error = requireAuth(request, set)
      if (error)
        return error
      const search = new URL(request.url).search
      const result = await proxy(
        `${pythonApi}/analytics/events${search}`,
        request,
      )
      set.status = result.status
      return result.body
    },
    { response: t.Any() },
  )
  .get("/events/:id", async ({ params, request, set }) => {
    const error = requireAuth(request, set)
    if (error)
      return error
    const result = await proxy(
      `${pythonApi}/analytics/events/${params.id}`,
      request,
    )
    set.status = result.status
    return result.body
  })
  .patch(
    "/events/:id",
    async ({ body, params, request, set }) => {
      const error = requireAuth(request, set)
      if (error)
        return error
      const result = await proxy(
        `${pythonApi}/analytics/events/${params.id}`,
        request,
        {
          body: JSON.stringify(body),
          headers: { "content-type": "application/json" },
          method: "PATCH",
        },
      )
      set.status = result.status
      return result.body
    },
    { body: t.Any(), response: t.Any() },
  )
  .get("/summary", async ({ request, set }) => {
    const error = requireAuth(request, set)
    if (error)
      return error
    const result = await proxy(`${pythonApi}/analytics/summary`, request)
    set.status = result.status
    return result.body
  })
  .get("/helmet-colors", async ({ request, set }) => {
    const error = requireAuth(request, set)
    if (error)
      return error
    const result = await proxy(`${pythonApi}/analytics/helmet-colors`, request)
    set.status = result.status
    return result.body
  })
