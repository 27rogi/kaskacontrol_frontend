export function useAuth() {
  const token = useCookie<string | null>("kaskacontrol_admin_token", { path: "/", sameSite: "lax" })
  const username = useCookie<string | null>("kaskacontrol_admin_user", { path: "/", sameSite: "lax" })

  function load() {}

  async function login(user: string, password: string) {
    const response = await $fetch<{ token: string, username: string }>("/_api/auth/login", {
      body: { password, username: user },
      method: "POST",
    })
    token.value = response.token
    username.value = response.username
  }

  function logout() {
    token.value = null
    username.value = null
    token.value = null
    username.value = null
  }

  function authHeaders() {
    return token.value ? { authorization: `Bearer ${token.value}` } : {}
  }

  return { authHeaders, isAuthenticated: computed(() => Boolean(token.value)), load, login, logout, token, username }
}
