import { Elysia, t } from "elysia"
import { authToken, proxyJson, pythonApi, requireAuth } from "../lib/auth"
import { AnalysisSchema, ErrorSchema } from "../schemas/common"

export default new Elysia().post(
  "/image",
  async ({ body, request, set }) => {
    const error = requireAuth(request, set)
    if (error)
      return error
    const form = new FormData()
    form.append("file", body.file)
    const result = await proxyJson(`${pythonApi}/image`, {
      body: form,
      headers: { authorization: `Bearer ${authToken(request)}` },
      method: "POST",
    })
    set.status = result.status
    return result.body
  },
  {
    body: t.Object({ file: t.File() }),
    response: {
      200: AnalysisSchema,
      400: ErrorSchema,
      413: ErrorSchema,
      502: ErrorSchema,
    },
  },
)
