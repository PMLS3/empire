export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth()
  const publicRoutes = ['/', '/auth/login', '/auth/signup', '/auth/recover']

  // Allow access to public routes
  if (publicRoutes.includes(to.path)) {
    return
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated.value) {
    return navigateTo('/auth/login')
  }
}) 