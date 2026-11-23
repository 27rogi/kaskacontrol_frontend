export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuth()
  auth.load()
  if (to.path === "/login") {
    if (auth.isAuthenticated.value)
      return navigateTo("/photo")
    return
  }
  if (!auth.isAuthenticated.value)
    return navigateTo("/login")
})
