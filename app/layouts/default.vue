<script setup lang="ts">
const auth = useAuth()
function logout() {
  auth.logout()
  navigateTo("/login")
}
</script>

<template>
  <div class="min-h-screen">
    <AppSidebar />
    <header class="border-default bg-default border-b lg:ml-64">
      <div class="px-5 py-5 flex items-center justify-between">
        <NuxtLink
          to="/"
          class="text-highlighted no-underline flex gap-3 items-center lg:hidden"
        >
          <span
            class="bg-primary text-inverted rounded grid size-9 place-items-center"
          >
            <UIcon name="i-lucide-hard-hat" />
          </span>
        </NuxtLink>
        <div class="text-sm text-zinc-600 font-semibold hidden lg:block">
          Административная панель
        </div>
        <div class="ml-auto flex gap-4 items-center">
          <ApiStatus />
          <UButton
            color="error"
            variant="subtle"
            size="sm"
            title="Выйти"
            @click="logout"
          >
            <UIcon name="i-lucide-log-out" />Выйти
          </UButton>
        </div>
      </div>
    </header>
    <div class="lg:ml-64">
      <div class="mx-auto px-5 py-8 max-w-7xl">
        <main>
          <slot />
        </main>
        <AppFooter />
      </div>
    </div>
  </div>
</template>
