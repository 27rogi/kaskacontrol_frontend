<script setup lang="ts">
import type { Static } from "elysia"
import type { AnalysisSchema } from "~~/api/schemas/common"

type Analysis = Static<typeof AnalysisSchema>
const wsApi = useHelmetWs()
const auth = useAuth()
const state = reactive({
  analysis: null as Analysis | null,
  connected: false,
  error: "",
  source: "rtsp://localhost:8554/live",
})
const socket = shallowRef<ReturnType<typeof wsApi.rtsp.subscribe> | null>(null)
function connect() {
  state.error = ""
  state.analysis = null
  socket.value = wsApi.rtsp.subscribe({
    query: { source: state.source, token: auth.token.value || "" },
  })
  socket.value.subscribe((event) => {
    const data = event.data as
      Analysis | { status: string } | { error: string }
    if ("error" in data)
      state.error = data.error
    else if ("status" in data && data.status === "connected")
      state.connected = true
    else state.analysis = data as Analysis
  })
  socket.value.on("error", () => {
    state.error = "Не удалось подключиться к RTSP-потоку"
    disconnect()
  })
  socket.value.on("close", () => {
    state.connected = false
  })
}
function disconnect() {
  socket.value?.close()
  socket.value = null
  state.connected = false
}
onBeforeUnmount(disconnect)
</script>

<template>
  <div>
    <section class="mb-8">
      <h1 class="text-4xl font-bold m-0">
        Просмотр RTSP-потока (PyAV)
      </h1>
    </section>
    <div class="gap-4 grid lg:grid-cols-[.8fr_1.2fr]">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold m-0">
            Источник
          </h2>
        </template><UFormField label="RTSP URL">
          <UInput
            v-model="state.source"
            placeholder="rtsp://localhost:554/live"
            class="w-full"
          />
        </UFormField><UButton
          class="mt-4 w-full"
          :color="state.connected ? 'error' : 'primary'"
          @click="state.connected ? disconnect() : connect()"
        >
          {{
            state.connected ? "Отключить поток" : "Подключить RTSP"
          }}
        </UButton><UAlert
          v-if="state.error"
          color="error"
          variant="soft"
          class="mt-3"
          :description="state.error"
        />
      </UCard>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold m-0">
              Результат детекции
            </h2>
            <UBadge v-if="state.analysis" color="neutral">
              {{ state.analysis.processing_time_ms }} мс
            </UBadge>
          </div>
        </template><DetectionSummary
          :analysis="state.analysis"
          :placeholder="
            state.connected ? 'Ожидание кадра...' : 'Подключитесь к RTSP-потоку'
          "
        />
      </UCard>
    </div>
  </div>
</template>
