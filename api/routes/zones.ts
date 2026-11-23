import { Elysia, t } from "elysia"
import { proxy, pythonApi, requireAuth } from "../lib/auth"

export default new Elysia()
  .get("/zones", async ({ request, set }) => {
    const error = requireAuth(request, set)
    if (error)
      return error
    const result = await proxy(`${pythonApi}/zones`, request)
    set.status = result.status
    return result.body
  })
  .get("/zones/:id", async ({ params, request, set }) => {
    const error = requireAuth(request, set)
    if (error)
      return error
    const result = await proxy(`${pythonApi}/zones/${params.id}`, request)
    set.status = result.status
    return result.body
  })
  .post(
    "/zones",
    async ({ body, request, set }) => {
      const error = requireAuth(request, set)
      if (error)
        return error
      const result = await proxy(`${pythonApi}/zones`, request, {
        body: JSON.stringify(body),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
      set.status = result.status
      return result.body
    },
    { body: t.Any(), response: t.Any() },
  )
  .patch(
    "/zones/:id",
    async ({ body, params, request, set }) => {
      const error = requireAuth(request, set)
      if (error)
        return error
      const result = await proxy(`${pythonApi}/zones/${params.id}`, request, {
        body: JSON.stringify(body),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      })
      set.status = result.status
      return result.body
    },
    { body: t.Any(), response: t.Any() },
  )
  .delete(
    "/zones/:id",
    async ({ params, request, set }) => {
      const error = requireAuth(request, set)
      if (error)
        return error
      const result = await proxy(`${pythonApi}/zones/${params.id}`, request, {
        method: "DELETE",
      })
      set.status = result.status
      return result.body
    },
    { response: t.Any() },
  )
