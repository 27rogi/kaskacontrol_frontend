<script setup lang="ts">
const open = ref(false)
const openViolations = ref(0)
const knownOpenEvents = ref<Set<number>>(new Set())
const toast = useToast()
let violationsTimer: ReturnType<typeof setInterval> | undefined

const nav = [
  { icon: "i-lucide-layout-dashboard", label: "Обзор зон", to: "/" },
  { icon: "i-lucide-map", label: "Зоны", to: "/zones" },
  { icon: "i-lucide-triangle-alert", label: "Нарушения", to: "/violations" },
  { icon: "i-lucide-image", label: "Фото", to: "/photo" },
  { icon: "i-lucide-film", label: "Видео", to: "/video" },
  { icon: "i-lucide-camera", label: "Веб-камера", to: "/camera" },
  { icon: "i-lucide-radio-tower", label: "RTSP", to: "/rtsp" },
]

async function refreshViolations(showNotification = false) {
  try {
    const events = await $fetch<any[]>("/_api/events", {
      query: { limit: 500, status: "open" },
    })
    const openEvents = Array.isArray(events) ? events : []
    const currentIds = new Set<number>(
      openEvents.map(event => Number(event.id)).filter(Number.isFinite),
    )
    openViolations.value = currentIds.size
    if (showNotification) {
      const newEvents = openEvents.filter(event => !knownOpenEvents.value.has(Number(event.id)))
      for (const event of newEvents.slice(0, 3)) {
        toast.add({
          title: "Новое нарушение",
          description: `${event.zone_name || "Без зоны"} · человек без каски`,
          color: "error",
        })
      }
    }
    knownOpenEvents.value = currentIds
  }
  catch {
    openViolations.value = 0
  }
}

onMounted(() => {
  refreshViolations()
  violationsTimer = setInterval(() => refreshViolations(true), 4000)
})

onBeforeUnmount(() => {
  if (violationsTimer)
    clearInterval(violationsTimer)
})
</script>

<template>
  <USidebar
    class="hidden inset-y-px left-0 fixed z-20 lg:flex"
    collapsible="none"
    variant="sidebar"
  >
    <template #header>
      <NuxtLink
        to="/"
        class="text-highlighted no-underline flex gap-3 items-center"
      >
        <span
          class="bg-primary text-inverted rounded grid size-9 place-items-center"
        ><UIcon name="i-lucide-hard-hat" /></span><strong>КаскаКонтроль</strong>
      </NuxtLink>
    </template>
    <nav class="text-sm p-3 space-y-1">
      <NuxtLink
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        class="hover:bg-elevated px-3 py-2.5 rounded no-underline flex gap-3 items-center hover:text-white"
        active-class="bg-primary text-inverted font-semibold"
      >
        <UIcon :name="item.icon" />
        <span>{{ item.label }}</span>
        <span
          v-if="item.to === '/violations' && openViolations"
          class="bg-error rounded-full animate-pulse ml-auto size-2"
          :title="`Открытых нарушений: ${openViolations}`"
        />
      </NuxtLink>
    </nav>
  </USidebar>
  <div class="left-4 top-4 fixed z-30 lg:hidden">
    <UButton
      icon="i-lucide-menu"
      color="neutral"
      variant="solid"
      aria-label="Открыть меню"
      @click="open = true"
    />
  </div>
  <USlideover v-model:open="open" side="left" title="КаскаКонтроль">
    <template #body>
      <nav class="text-sm p-3 space-y-1">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="hover:bg-elevated px-3 py-2.5 rounded no-underline flex gap-3 items-center hover:text-white"
          active-class="bg-primary text-inverted font-semibold"
          @click="open = false"
        >
          <UIcon :name="item.icon" />
          <span>{{ item.label }}</span>
          <span
            v-if="item.to === '/violations' && openViolations"
            class="bg-error rounded-full animate-pulse ml-auto size-2"
            :title="`Открытых нарушений: ${openViolations}`"
          />
        </NuxtLink>
      </nav>
    </template>
  </USlideover>
</template>
