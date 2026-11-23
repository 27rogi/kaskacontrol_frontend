<script setup lang="ts">
const headers = useRequestHeaders(["cookie"])
const zones = ref<any[]>([])
const selected = ref<any>(null)
const counts = ref({ closed: 0, open: 0 })
const analysis = ref<any>(null)
const connected = ref(false)
const status = ref("stopped")
const state = reactive({
  eventsUnavailable: false,
  streamUnavailable: false,
  zonesUnavailable: false,
})
const socket = shallowRef<any>(null)
const wsApi = useHelmetWs()
const auth = useAuth()
let statusTimer: ReturnType<typeof setInterval> | undefined
const statusLabel = computed(
  () =>
    (
      ({
        error: "Ошибка",
        reconnecting: "Переподключение",
        running: "Подключено",
        starting: "Запуск",
        stopped: "Остановлено",
      }) as Record<string, string>
    )[status.value] || status.value,
)
async function loadCounts() {
  state.eventsUnavailable = false
  if (!selected.value) {
    counts.value = { closed: 0, open: 0 }
    return
  }
  try {
    const loaded = await $fetch<any>("/_api/events", {
      headers,
      query: { limit: 500, zone_id: selected.value.id },
    })
    const events = Array.isArray(loaded) ? loaded : []
    counts.value = {
      closed: events.filter(e => e.status === "closed").length,
      open: events.filter(e => e.status === "open").length,
    }
  }
  catch {
    state.eventsUnavailable = true
  }
}
async function refreshStatus() {
  if (!selected.value)
    return
  try {
    const monitors = await $fetch<any[]>("/_api/rtsp/monitors", { headers })
    const monitor = monitors.find(item => item.zone_id === selected.value.id)
    status.value = monitor?.status || "stopped"
  }
  catch {
    status.value = "error"
  }
}
async function loadZones() {
  state.zonesUnavailable = false
  try {
    const loaded = await $fetch<any>("/_api/zones", { headers })
    zones.value = Array.isArray(loaded) ? loaded : []
    selected.value = zones.value[0] || null
    await Promise.all([loadCounts(), refreshStatus()])
  }
  catch {
    zones.value = []
    selected.value = null
    state.zonesUnavailable = true
  }
}
function closeViewer() {
  socket.value?.close()
  socket.value = null
  connected.value = false
  analysis.value = null
}
async function select(zone: any) {
  closeViewer()
  selected.value = zone
  await loadCounts()
  await refreshStatus()
}
async function startViewing() {
  if (!selected.value?.source_uri)
    return
  state.streamUnavailable = false
  try {
    await $fetch(`/_api/rtsp/monitors/${selected.value.id}/start`, {
      headers,
      method: "POST",
    })
    await refreshStatus()
    socket.value = wsApi.rtsp.subscribe({
      query: {
        source: selected.value.source_uri,
        token: auth.token.value || "",
        zone_id: String(selected.value.id),
      },
    })
    socket.value.subscribe((event: any) => {
      const data = event.data
      if (data?.status === "connected")
        connected.value = true
      else if (data?.annotated_image)
        analysis.value = data
    })
    socket.value.on("close", () => {
      connected.value = false
    })
  }
  catch {
    state.streamUnavailable = true
  }
}
function stopViewing() {
  closeViewer()
}
async function stopMonitoring() {
  closeViewer()
  await $fetch(`/_api/rtsp/monitors/${selected.value.id}/stop`, {
    headers,
    method: "POST",
  }).catch(() => {})
  await refreshStatus()
}
async function refreshDashboard() {
  await Promise.all([loadCounts(), refreshStatus()])
}
await loadZones()
onMounted(() => {
  statusTimer = setInterval(refreshDashboard, 4000)
})
onBeforeUnmount(() => {
  closeViewer()
  if (statusTimer)
    clearInterval(statusTimer)
})
</script>

<template>
  <div>
    <div class="mb-7">
      <h1 class="text-3xl font-bold m-0">
        Видеоаналитика зон предприятия
      </h1>
    </div>
    <div class="gap-5 grid xl:grid-cols-[18rem_1fr]">
      <DataUnavailable
        v-if="state.zonesUnavailable"
        class="xl:col-span-2"
        @retry="loadZones"
      />
      <USidebar
        v-else
        collapsible="none"
        variant="floating"
        class="p-0 h-fit w-full relative"
      >
        <template #header>
          <span class="font-semibold">Зоны</span>
        </template>
        <UButton
          v-for="zone in zones"
          :key="zone.id"
          block
          :variant="selected?.id === zone.id ? 'soft' : 'ghost'"
          class="justify-start"
          @click="select(zone)"
        >
          <span class="truncate">{{ zone.name }}</span><span class="text-muted text-xs ml-auto">{{
            zone.source_type.toUpperCase()
          }}</span>
        </UButton>
        <p v-if="!zones.length" class="text-muted text-sm p-3">
          Добавьте первую зону в разделе «Зоны».
        </p>
      </USidebar>
      <section v-if="selected" class="space-y-4">
        <DataUnavailable v-if="state.eventsUnavailable" @retry="loadCounts" />
        <div class="gap-3 grid sm:grid-cols-4">
          <UCard>
            <span class="text-muted text-xs">Открытые нарушения</span><b class="text-error text-3xl mt-1 block">
              {{ counts.open }}
            </b>
          </UCard>
          <UCard>
            <span class="text-muted text-xs">Закрытые нарушения</span><b class="text-success text-3xl mt-1 block">
              {{ counts.closed }}
            </b>
          </UCard>
          <UCard>
            <span class="text-muted text-xs">Статус RTSP</span><b class="text-sm mt-1 block">
              {{ statusLabel }}
            </b>
          </UCard>
          <UCard>
            <span class="text-muted text-xs">Источник</span><b class="text-sm mt-1 block truncate">{{
              selected.source_uri || "Веб-камера"
            }}</b>
          </UCard>
        </div>
        <UCard>
          <template #header>
            <div class="flex flex-wrap gap-3 items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold m-0">
                  Трансляция
                </h2>
                <p class="text-muted text-xs mt-1">{{ selected.name }}</p>
              </div>
              <div class="flex gap-2">
                <UButton
                  v-if="selected.source_type === 'rtsp'"
                  :color="connected ? 'neutral' : 'primary'"
                  @click="connected ? stopViewing() : startViewing()"
                >
                  {{ connected ? "Отключить просмотр" : "Подключить просмотр" }}
                </UButton>
                <UButton
                  v-if="selected.source_type === 'rtsp' && status !== 'stopped'"
                  color="error"
                  variant="outline"
                  @click="stopMonitoring"
                >
                  Остановить мониторинг
                </UButton>
              </div>
            </div>
          </template>
          <DataUnavailable
            v-if="state.streamUnavailable"
            class="mb-4"
            @retry="startViewing"
          />
          <div class="rounded bg-black min-h-64 overflow-hidden">
            <img
              v-if="analysis?.annotated_image"
              :src="analysis.annotated_image"
              class="max-h-[34rem] w-full block object-contain"
            >
            <div
              v-else
              class="text-muted text-sm grid min-h-64 place-items-center"
            >
              Изображение отсутствует
            </div>
          </div>
        </UCard>
      </section>
    </div>
  </div>
</template>
