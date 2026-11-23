<script setup lang="ts">
import type { Static } from "elysia"
import type { VideoJobSchema } from "~~/api/schemas/video"

type VideoJob = Static<typeof VideoJobSchema>
const { $api } = useNuxtApp()
function videoResultUrl(id: string, preview = false) {
  return `/_api/videos/${encodeURIComponent(id)}/result${preview ? "?preview=true" : ""}`
}
const state = reactive<{
  file: File | null
  job: VideoJob | null
  busy: boolean
  error: string
}>({ busy: false, error: "", file: null, job: null })
let poll: ReturnType<typeof setInterval> | undefined
function selectFile(value?: File) {
  state.file = value || null
  state.job = null
  state.error = ""
}
async function refresh() {
  if (!state.job)
    return
  try {
    const response = await $api.videos({ id: state.job.id }).get()
    if (response.error)
      throw new Error("Не удалось получить статус")
    state.job = response.data as VideoJob
    if (["completed", "failed"].includes(state.job.status)) {
      if (poll)
        clearInterval(poll)
      if (state.job.error)
        state.error = state.job.error
    }
  }
  catch (e: any) {
    state.error = e?.message || "Не удалось получить статус задачи"
    if (poll)
      clearInterval(poll)
  }
}
async function start() {
  if (!state.file)
    return
  state.busy = true
  state.error = ""
  try {
    const response = await $api.videos.post({ file: state.file })
    if (response.error)
      throw new Error("Не удалось загрузить видео")
    state.job = response.data as VideoJob
    poll = setInterval(refresh, 1000)
  }
  catch (e: any) {
    state.error = e?.message || "Не удалось загрузить видео"
  }
  finally {
    state.busy = false
  }
}
onBeforeUnmount(() => {
  if (poll)
    clearInterval(poll)
})
</script>

<template>
  <div>
    <section class="mb-8">
      <h1 class="text-4xl font-bold m-0">
        Проверка видео
      </h1>
    </section>
    <div class="gap-4 grid lg:grid-cols-[.8fr_1.2fr]">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold m-0">
            Видеозапись
          </h2>
        </template><FilePicker
          accept="video/*"
          formats="MP4, AVI, MOV"
          :file="state.file"
          @select="selectFile"
        /><UButton
          class="mt-4 w-full"
          :loading="state.busy"
          :disabled="!state.file"
          @click="start"
        >
          <UIcon name="i-lucide-play" />{{
            state.busy ? "Загрузка..." : "Запустить обработку"
          }}
        </UButton>
        <div v-if="state.job" class="mt-5">
          <div class="text-sm mb-2 flex justify-between">
            <span>{{
              state.job.status === "completed"
                ? "Готово"
                : state.job.status === "failed"
                  ? "Ошибка"
                  : "Обработка видео"
            }}</span><b>{{ Math.round((state.job.progress || 0) * 100) }}%</b>
          </div>
          <UProgress :model-value="(state.job.progress || 0) * 100" />
        </div>
        <UAlert
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
              Просмотр обработки
            </h2>
            <UButton
              v-if="state.job?.status === 'completed'"
              :href="videoResultUrl(state.job.id)"
              download
              variant="link"
            >
              <UIcon name="i-lucide-download" />Скачать
            </UButton>
          </div>
        </template><video
          v-if="state.job?.status === 'completed'"
          controls
          preload="metadata"
          class="rounded bg-black max-h-[70vh] w-full"
          :src="videoResultUrl(state.job.id, true)"
        />
        <div
          v-else
          class="bg-muted text-muted text-sm rounded flex min-h-64 items-center justify-center"
        >
          {{
            state.job
              ? "Видео появится после обработки"
              : "Загрузите видео для начала"
          }}
        </div>
      </UCard>
    </div>
  </div>
</template>
