<script setup lang="ts">
import type { Static } from "elysia"
import type { AnalysisSchema } from "~~/api/schemas/common"

type Analysis = Static<typeof AnalysisSchema>
const wsApi = useHelmetWs()
const auth = useAuth()
const video = ref<HTMLVideoElement | null>(null)
const inputCanvas = ref<HTMLCanvasElement | null>(null)
const resultCanvas = ref<HTMLCanvasElement | null>(null)
const stream = ref<MediaStream | null>(null)
const socket = shallowRef<ReturnType<typeof wsApi.camera.subscribe> | null>(
  null,
)
const analysis = ref<Analysis | null>(null)
const live = ref(false)
const error = ref("")
let timer: ReturnType<typeof setTimeout> | undefined
function draw(data: Analysis | null) {
  if (!video.value || !resultCanvas.value || !video.value.videoWidth)
    return
  const canvas = resultCanvas.value
  canvas.width = video.value.videoWidth
  canvas.height = video.value.videoHeight
  const context = canvas.getContext("2d")!
  context.drawImage(video.value, 0, 0, canvas.width, canvas.height)
  for (const item of data?.detections || []) {
    const [x1, y1, x2, y2] = item.box
    const color
      = item.class === "person"
        ? "#4bd27a"
        : {
            orange: "#ee9c45",
            red: "#ed6257",
            unknown: "#aeb8b1",
            white: "#fff",
            yellow: "#f2dc55",
          }[item.color || "unknown"] || "#aeb8b1"
    const roleNames: Record<string, string> = {
      orange: "worker",
      red: "foreman/master",
      unknown: "unknown role",
      white: "management",
      yellow: "worker",
    }
    const label
      = item.class === "helmet"
        ? `helmet (${item.color || "unknown"}) ${item.confidence.toFixed(2)}`
        : `person ${item.confidence.toFixed(2)}`
    context.lineWidth = Math.max(2, canvas.width / 480)
    context.strokeStyle = color
    context.strokeRect(x1, y1, x2 - x1, y2 - y1)
    if (item.class === "person") {
      const headZoneY = y1 + (y2 - y1) / 3
      context.strokeStyle = "#38bdf8"
      context.lineWidth = Math.max(1, canvas.width / 900)
      context.beginPath()
      context.moveTo(x1, headZoneY)
      context.lineTo(x2, headZoneY)
      context.stroke()
      context.font = `${Math.max(12, canvas.width / 110)}px sans-serif`
      const zoneLabel = "head_zone"
      const zoneWidth = context.measureText(zoneLabel).width + 8
      context.fillStyle = "#38bdf8"
      context.fillRect(x1, headZoneY + 2, zoneWidth, 18)
      context.fillStyle = "#17211b"
      context.fillText(zoneLabel, x1 + 4, headZoneY + 15)
    }
    context.font = `${Math.max(14, canvas.width / 85)}px sans-serif`
    const labelY = Math.max(22, y1 - 7)
    const textWidth = context.measureText(label).width + 12
    context.fillStyle = color
    context.fillRect(x1, labelY - 20, textWidth, 23)
    context.fillStyle = "#17211b"
    context.fillText(label, x1 + 6, labelY - 4)
    if (item.class === "helmet") {
      const role = roleNames[item.color || "unknown"] || "unknown role"
      context.fillStyle = "#17211b"
      context.fillRect(
        x1,
        labelY + 3,
        context.measureText(role).width + 12,
        23,
      )
      context.fillStyle = color
      context.fillText(role, x1 + 6, labelY + 19)
    }
  }
}
function sendFrame() {
  if (!live.value || socket.value?.ws.readyState !== WebSocket.OPEN)
    return
  if (video.value && inputCanvas.value && video.value.videoWidth) {
    inputCanvas.value.width = video.value.videoWidth
    inputCanvas.value.height = video.value.videoHeight
    inputCanvas.value.getContext("2d")!.drawImage(video.value, 0, 0)
    inputCanvas.value.toBlob(
      async (blob) => {
        if (blob && socket.value?.ws.readyState === WebSocket.OPEN)
          socket.value.ws.send(await blob.arrayBuffer())
      },
      "image/jpeg",
      0.75,
    )
    draw(analysis.value)
  }
  timer = setTimeout(sendFrame, 220)
}
async function start() {
  error.value = ""
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { width: 960 },
    })
    if (video.value) {
      video.value.srcObject = stream.value
      await video.value.play()
    }
    socket.value = wsApi.camera.subscribe({
      query: { token: auth.token.value || "" },
    })
    socket.value.on("open", () => {
      live.value = true
      sendFrame()
    })
    socket.value.subscribe((event) => {
      const data = event.data as Analysis
      analysis.value = data
      draw(data)
    })
    socket.value.on("error", () => {
      error.value = "WebSocket-соединение прервано"
      stop()
    })
  }
  catch (e: any) {
    error.value = e?.message || "Не удалось запустить камеру"
    stop()
  }
}
function stop() {
  live.value = false
  if (timer)
    clearTimeout(timer)
  socket.value?.close()
  socket.value = null
  stream.value?.getTracks().forEach(track => track.stop())
  stream.value = null
  analysis.value = null
}
onBeforeUnmount(stop)
</script>

<template>
  <div>
    <section class="mb-8">
      <h1 class="text-4xl font-bold m-0">
        Веб-камера
      </h1>
    </section>
    <div class="gap-4 grid lg:grid-cols-2">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold m-0">
            Камера
          </h2>
        </template>
        <div class="rounded bg-zinc-950 min-h-64 overflow-hidden">
          <video ref="video" muted playsinline class="w-full block" />
        </div>
        <canvas ref="inputCanvas" class="hidden" />
        <UButton
          class="mt-4 w-full"
          :color="live ? 'error' : 'primary'"
          @click="live ? stop() : start()"
        >
          {{ live ? "Остановить камеру" : "Включить камеру" }}
        </UButton>
      </UCard>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold m-0">
              Результат детекции
            </h2>
            <UBadge v-if="analysis" color="neutral">
              {{ analysis.processing_time_ms }} мс
            </UBadge>
          </div>
        </template><canvas
          v-if="live"
          ref="resultCanvas"
          class="bg-muted rounded min-h-64 w-full block"
        />
        <div
          v-else
          class="bg-muted text-muted text-sm rounded flex min-h-64 items-center justify-center"
        >
          Включите веб-камеру
        </div>
        <div
          v-if="analysis"
          class="border-default bg-muted mt-4 border gap-px grid grid-cols-2 sm:grid-cols-4"
        >
          <div class="bg-default p-3">
            <b class="text-2xl block">
              {{ analysis.counts.people }} </b><span class="text-muted text-xs">Людей</span>
          </div>
          <div class="bg-default p-3">
            <b class="text-2xl block">
              {{ analysis.counts.helmets }} </b><span class="text-muted text-xs">Касок</span>
          </div>
          <div class="bg-default p-3">
            <b class="text-success text-2xl block">
              {{ analysis.counts.people_with_helmet }} </b><span class="text-muted text-xs">С касками</span>
          </div>
          <div class="bg-default p-3">
            <b class="text-error text-2xl block">
              {{ analysis.counts.people_without_helmet }} </b><span class="text-muted text-xs">Без каски</span>
          </div>
        </div>
        <div
          v-if="analysis?.counts.helmet_roles"
          class="mt-4 flex flex-wrap gap-2"
        >
          <UBadge
            v-for="(role, color) in analysis.counts.helmet_roles"
            :key="color"
            color="neutral"
          >
            {{ color }}: {{ role }}
          </UBadge>
        </div>
        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          class="mt-3"
          :description="error"
        />
      </UCard>
    </div>
  </div>
</template>
