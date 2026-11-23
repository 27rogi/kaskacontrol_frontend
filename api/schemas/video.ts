import { t } from "elysia"

export const VideoJobSchema = t.Object({
  error: t.Optional(t.String()),
  filename: t.Optional(t.String()),
  id: t.String(),
  processed_frames: t.Optional(t.Number()),
  progress: t.Number(),
  report: t.Optional(t.Any()),
  result_url: t.Optional(t.String()),
  status: t.String(),
  status_url: t.Optional(t.String()),
})
