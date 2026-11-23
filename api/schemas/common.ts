import { t } from "elysia"

export const ErrorSchema = t.Object({ detail: t.String() })

export const DetectionSchema = t.Object({
  box: t.Tuple([t.Number(), t.Number(), t.Number(), t.Number()]),
  class: t.String(),
  color: t.Optional(t.String()),
  confidence: t.Number(),
  hsv: t.Optional(t.Union([t.Null(), t.Object({ h: t.Union([t.Number(), t.Null()]), s: t.Number(), v: t.Number() })])),
  role: t.Optional(t.String()),
})

export const AnalysisSchema = t.Object({
  annotated_image: t.Optional(t.String()),
  counts: t.Object({
    helmet_colors: t.Record(t.String(), t.Number()),
    helmet_roles: t.Optional(t.Record(t.String(), t.String())),
    helmets: t.Number(),
    people: t.Number(),
    people_with_helmet: t.Number(),
    people_without_helmet: t.Number(),
  }),
  detections: t.Array(DetectionSchema),
  model: t.String(),
  processing_time_ms: t.Number(),
})
