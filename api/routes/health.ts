import { Elysia, t } from "elysia"

export const HealthResponse = t.Object({
  model: t.Optional(t.Union([t.String(), t.Null()])),
  ok: t.Boolean(),
  python: t.Boolean(),
  status: t.Optional(t.String()),
})

const pythonApi = (
  process.env.PYTHON_API_BASE_URL || "http://localhost:8000/api"
).replace(/\/$/, "")

export default new Elysia({ prefix: "/health" }).get(
  "",
  async () => {
    try {
      const response = await fetch(`${pythonApi}/health`, {
        signal: AbortSignal.timeout(2500),
      })
      const body = (await response.json().catch(() => ({}))) as {
        status?: string
        model?: string | null
      }
      return {
        model: body.model,
        ok: response.ok && body.status === "ok",
        python: response.ok && body.status === "ok",
        status: body.status,
      }
    }
    catch {
      return { model: null, ok: false, python: false, status: "unavailable" }
    }
  },
  {
    response: HealthResponse,
  },
)
