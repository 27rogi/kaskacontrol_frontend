import { Elysia, t } from "elysia"
import { proxyJson, pythonApi } from "../lib/auth"

export default new Elysia().post(
  "/auth/login",
  async ({ body, set }) => {
    const result = await proxyJson(`${pythonApi}/auth/login`, {
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
      method: "POST",
    })
    set.status = result.status
    return result.body
  },
  {
    body: t.Object({ password: t.String(), username: t.String() }),
    response: t.Any(),
  },
)
