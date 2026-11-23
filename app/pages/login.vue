<script setup lang="ts">
definePageMeta({ layout: false })
const auth = useAuth()
const state = reactive({ busy: false, error: "", password: "", username: "" })
async function submit() {
  state.busy = true
  state.error = ""
  try {
    await auth.login(state.username, state.password)
    await navigateTo("/photo")
  }
  catch (e: any) {
    state.error = e?.data?.detail || "Неверный логин или пароль"
  }
  finally {
    state.busy = false
  }
}
</script>

<template>
  <main class="bg-muted px-5 grid min-h-screen place-items-center">
    <UForm :state="state" class="max-w-sm w-full" @submit="submit">
      <UCard class="p-2">
        <div class="mb-7 flex gap-3 items-center">
          <span
            class="bg-primary text-xl rounded-md grid h-10 w-10 place-items-center"
          ><UIcon name="i-lucide-hard-hat" /></span>
          <div>
            <h1 class="text-xl font-bold m-0">
              Kaska Control
            </h1>
            <p class="text-xs text-zinc-500 m-0">Вход в админ-панель</p>
          </div>
        </div>
        <UFormField label="Логин" required class="mb-4">
          <UInput
            v-model="state.username"
            autocomplete="username"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Пароль" required class="mb-5">
          <UInput
            v-model="state.password"
            type="password"
            autocomplete="current-password"
            class="w-full"
          />
        </UFormField>
        <UButton type="submit" block :loading="state.busy">
          {{ state.busy ? "Проверка..." : "Войти" }}
        </UButton>
        <UAlert
          v-if="state.error"
          color="error"
          variant="soft"
          class="mt-4"
          :description="state.error"
        />
      </UCard>
    </UForm>
  </main>
</template>
